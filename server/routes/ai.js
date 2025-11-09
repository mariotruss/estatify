import express from 'express';
import OpenAI from 'openai';
import { db } from '../index.js';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo',
});

// AI Chat Agent for investment advice
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    // Get relevant property data as context
    const properties = db.prepare('SELECT * FROM properties LIMIT 10').all();
    const marketData = db.prepare('SELECT * FROM market_data LIMIT 5').all();

    const systemPrompt = `You are an AI assistant for real estate investments. You help investors make the best property investment decisions.

Context:
- Number of properties in database: ${properties.length}
- Average price: €${properties.reduce((sum, p) => sum + p.price, 0) / properties.length}
- Average ROI: ${properties.reduce((sum, p) => sum + (p.roi || 0), 0) / properties.length}%

You provide well-founded recommendations based on:
- ROI (Return on Investment)
- Rental yield
- Location analysis
- Market trends
- Risk assessment

Answer precisely, professionally, and in English.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    res.json({
      response: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    // Fallback response if OpenAI is not configured
    res.json({
      response: `As a real estate investment assistant, I can help you with various questions:

- Property valuations based on ROI and yield
- Location analyses and market trends
- Risk assessment of investments
- Comparisons of different investment opportunities

Please ask your specific question, and I will provide you with a well-founded answer based on the available data.

(Note: For full AI functionality, please configure your OpenAI API key in the .env file)`,
      fallback: true,
    });
  }
});

// AI Property Analysis
router.post('/analyze/:id', async (req, res) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const analysis = {
      propertyId: property.id,
      scores: {
        investment: calculateInvestmentScore(property),
        location: calculateLocationScore(property),
        condition: calculateConditionScore(property),
        roi: calculateRoiScore(property),
      },
      recommendations: generateRecommendations(property),
      risks: identifyRisks(property),
      opportunities: identifyOpportunities(property),
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI-powered property recommendations
router.get('/recommendations', (req, res) => {
  try {
    const { budget, riskTolerance = 'medium' } = req.query;

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (budget) {
      query += ' AND price <= ?';
      params.push(parseFloat(budget) * 1.1); // 10% buffer
    }

    // Order by ROI and rental yield
    query += ' ORDER BY roi DESC, rentalYield DESC LIMIT 5';

    const stmt = db.prepare(query);
    const recommendations = stmt.all(...params);

    const enrichedRecommendations = recommendations.map(property => ({
      ...property,
      score: calculateInvestmentScore(property),
      reasoning: generateReasoningForRecommendation(property, riskTolerance),
    }));

    res.json(enrichedRecommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function calculateInvestmentScore(property) {
  let score = 0;
  
  // ROI weight: 35%
  if (property.roi > 8) score += 35;
  else if (property.roi > 5) score += 25;
  else if (property.roi > 3) score += 15;
  
  // Rental yield weight: 30%
  if (property.rentalYield > 5) score += 30;
  else if (property.rentalYield > 4) score += 20;
  else if (property.rentalYield > 3) score += 10;
  
  // Price per sqm weight: 20%
  if (property.pricePerSqm < 3000) score += 20;
  else if (property.pricePerSqm < 4000) score += 15;
  else if (property.pricePerSqm < 5000) score += 10;
  
  // Condition weight: 15%
  if (property.condition === 'excellent') score += 15;
  else if (property.condition === 'good') score += 10;
  else if (property.condition === 'fair') score += 5;
  
  return Math.round(score);
}

function calculateLocationScore(property) {
  // Simplified location scoring based on city tier
  const tier1Cities = ['Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln'];
  const tier2Cities = ['Stuttgart', 'Düsseldorf', 'Dortmund', 'Leipzig', 'Dresden'];
  
  if (tier1Cities.includes(property.city)) return 90;
  if (tier2Cities.includes(property.city)) return 75;
  return 60;
}

function calculateConditionScore(property) {
  const conditionScores = {
    'excellent': 95,
    'good': 80,
    'fair': 60,
    'poor': 40,
  };
  return conditionScores[property.condition] || 50;
}

function calculateRoiScore(property) {
  if (property.roi > 8) return 95;
  if (property.roi > 6) return 80;
  if (property.roi > 4) return 65;
  if (property.roi > 2) return 50;
  return 30;
}

function generateRecommendations(property) {
  const recommendations = [];
  
  if (property.roi > 6) {
    recommendations.push('Excellent investment opportunity with high ROI');
  }
  if (property.rentalYield > 4.5) {
    recommendations.push('Attractive rental yield for long-term cash flow generation');
  }
  if (property.pricePerSqm < 3500) {
    recommendations.push('Favorable price per square meter with appreciation potential');
  }
  if (property.condition === 'excellent' || property.condition === 'good') {
    recommendations.push('Good condition reduces renovation costs');
  }
  
  return recommendations;
}

function identifyRisks(property) {
  const risks = [];
  
  if (property.roi < 3) {
    risks.push('Low ROI could indicate overpriced property');
  }
  if (property.rentalYield < 3) {
    risks.push('Low rental yield - long-term cash flow at risk');
  }
  if (property.pricePerSqm > 6000) {
    risks.push('High price per sqm limits appreciation potential');
  }
  if (property.yearBuilt && property.yearBuilt < 1970) {
    risks.push('Older building - potential renovation and energy costs');
  }
  
  return risks;
}

function identifyOpportunities(property) {
  const opportunities = [];
  
  if (property.condition === 'fair' || property.condition === 'poor') {
    opportunities.push('Renovation potential for value appreciation');
  }
  if (property.pricePerSqm < 3000) {
    opportunities.push('Undervalued property with upward potential');
  }
  if (property.size > 100) {
    opportunities.push('Large living space enables flexible usage concepts');
  }
  
  return opportunities;
}

function generateReasoningForRecommendation(property, riskTolerance) {
  const reasons = [];
  
  reasons.push(`ROI of ${property.roi?.toFixed(2)}% offers attractive returns`);
  reasons.push(`Rental yield of ${property.rentalYield?.toFixed(2)}% generates stable cash flow`);
  reasons.push(`Location in ${property.city} with good infrastructure`);
  
  if (riskTolerance === 'low' && property.condition === 'excellent') {
    reasons.push('Excellent condition minimizes investment risk');
  }
  
  return reasons.join('. ');
}

export default router;
