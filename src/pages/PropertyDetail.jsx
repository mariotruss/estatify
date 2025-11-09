import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Building2, Calendar, TrendingUp, 
  Euro, Maximize2, Home, Percent, AlertCircle, CheckCircle,
  Calculator, CreditCard, PiggyBank, LineChart
} from 'lucide-react';
import PropertyMap from '../components/PropertyMap';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [financing, setFinancing] = useState({
    downPayment: 20,
    interestRate: 3.5,
    loanTerm: 30,
  });

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  async function fetchPropertyDetail() {
    try {
      const [propertyRes, analysisRes] = await Promise.all([
        fetch(`/api/properties/${id}`),
        fetch(`/api/ai/analyze/${id}`)
      ]);

      if (propertyRes.ok) {
        const propertyData = await propertyRes.json();
        setProperty(propertyData);
      }

      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Error fetching property detail:', error);
    } finally {
      setLoading(false);
    }
  }

  // Financing calculations
  function calculateMonthlyPayment() {
    if (!property) return 0;
    const purchaseCosts = property.price * 0.1;
    const totalCost = property.price + purchaseCosts;
    const loanAmount = totalCost * (1 - financing.downPayment / 100);
    const monthlyRate = financing.interestRate / 100 / 12;
    const numberOfPayments = financing.loanTerm * 12;
    
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) 
      / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  }

  function calculateCashflow() {
    if (!property) return 0;
    const monthlyPayment = calculateMonthlyPayment();
    const monthlyExpenses = property.price * 0.002; // 0.2% monthly maintenance/costs
    return property.estimatedRent - monthlyPayment - monthlyExpenses;
  }

  function calculateTotalInvestment() {
    if (!property) return 0;
    const purchaseCosts = property.price * 0.1;
    const totalCost = property.price + purchaseCosts;
    return totalCost * (financing.downPayment / 100);
  }

  function calculateROIBreakdown() {
    if (!property) return null;
    
    const annualRent = property.estimatedRent * 12;
    const purchaseCosts = property.price * 0.1;
    const totalInvestment = property.price + purchaseCosts;
    const annualExpenses = property.price * 0.024; // 2.4% annual maintenance/costs
    const netAnnualIncome = annualRent - annualExpenses;
    const roi = (netAnnualIncome / totalInvestment) * 100;

    return {
      annualRent,
      purchaseCosts,
      totalInvestment,
      annualExpenses,
      netAnnualIncome,
      roi
    };
  }

  function getFutureProjections() {
    if (!property) return [];
    
    const breakdown = calculateROIBreakdown();
    const projections = [];
    const appreciationRate = 0.03; // 3% annual appreciation
    const rentIncreaseRate = 0.02; // 2% annual rent increase
    
    for (let year = 1; year <= 10; year++) {
      const propertyValue = property.price * Math.pow(1 + appreciationRate, year);
      const annualRent = breakdown.annualRent * Math.pow(1 + rentIncreaseRate, year);
      const equity = propertyValue - (calculateTotalInvestment() * 0.95); // simplified
      const totalReturn = (annualRent * year) + (propertyValue - property.price);
      
      projections.push({
        year,
        propertyValue,
        annualRent,
        equity,
        totalReturn
      });
    }
    
    return projections;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-400">Immobilie nicht gefunden</h2>
        <p className="text-gray-500 mt-2">Die angeforderte Immobilie existiert nicht.</p>
        <Link to="/properties" className="btn-primary mt-6 inline-block">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const roiBreakdown = calculateROIBreakdown();
  const projections = getFutureProjections();
  const monthlyPayment = calculateMonthlyPayment();
  const cashflow = calculateCashflow();
  const totalInvestment = calculateTotalInvestment();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/properties" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Overview</span>
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center text-gray-400">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.address}, {property.city} {property.postalCode}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-500">
              €{property.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              €{Math.round(property.pricePerSqm).toLocaleString()}/m²
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="card overflow-hidden">
            <img
              src={property.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'}
              alt={property.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Key Metrics */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox
                icon={Maximize2}
                label="Living Space"
                value={`${property.size} m²`}
              />
              <MetricBox
                icon={Home}
                label="Rooms"
                value={property.rooms || 'N/A'}
              />
              <MetricBox
                icon={TrendingUp}
                label="ROI"
                value={`${property.roi?.toFixed(2)}%`}
                valueColor="text-green-500"
              />
              <MetricBox
                icon={Percent}
                label="Rental Yield"
                value={`${property.rentalYield?.toFixed(2)}%`}
                valueColor="text-accent-500"
              />
              <MetricBox
                icon={Euro}
                label="Est. Rent"
                value={`€${Math.round(property.estimatedRent)}/month`}
              />
              <MetricBox
                icon={Building2}
                label="Type"
                value={property.propertyType}
              />
              <MetricBox
                icon={Calendar}
                label="Year Built"
                value={property.yearBuilt || 'N/A'}
              />
              <MetricBox
                icon={CheckCircle}
                label="Condition"
                value={property.condition || 'N/A'}
              />
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed">
              {property.description || 'No description available.'}
            </p>
          </div>

          {/* ROI Breakdown */}
          {roiBreakdown && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-primary-500" />
                ROI Berechnung erklärt
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Jährliche Mieteinnahmen</div>
                    <div className="text-2xl font-bold text-green-500">
                      €{Math.round(roiBreakdown.annualRent).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      €{Math.round(property.estimatedRent)} × 12 Monate
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Kaufnebenkosten</div>
                    <div className="text-2xl font-bold text-orange-500">
                      €{Math.round(roiBreakdown.purchaseCosts).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ~10% vom Kaufpreis
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Gesamtinvestition</div>
                    <div className="text-2xl font-bold text-white">
                      €{Math.round(roiBreakdown.totalInvestment).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Kaufpreis + Nebenkosten
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Jährliche Kosten</div>
                    <div className="text-2xl font-bold text-red-500">
                      €{Math.round(roiBreakdown.annualExpenses).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Instandhaltung, Verwaltung
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Netto-Jahresertrag:</span>
                    <span className="text-xl font-bold text-green-500">
                      €{Math.round(roiBreakdown.netAnnualIncome).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Return on Investment (ROI):</span>
                    <span className="text-2xl font-bold text-primary-500">
                      {roiBreakdown.roi.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    ROI = (Netto-Jahresertrag / Gesamtinvestition) × 100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financing Calculator */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-accent-500" />
              Finanzierungsrechner
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Eigenkapital (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={financing.downPayment}
                  onChange={(e) => setFinancing({ ...financing, downPayment: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{financing.downPayment}%</span>
                  <span>€{Math.round(totalInvestment).toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Zinssatz (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={financing.interestRate}
                  onChange={(e) => setFinancing({ ...financing, interestRate: parseFloat(e.target.value) })}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Kreditlaufzeit (Jahre)
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="40"
                  value={financing.loanTerm}
                  onChange={(e) => setFinancing({ ...financing, loanTerm: parseInt(e.target.value) })}
                  className="input w-full"
                />
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Monatliche Rate</div>
                  <div className="text-3xl font-bold text-accent-500">
                    €{Math.round(monthlyPayment).toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Monatlicher Cashflow</div>
                  <div className={`text-2xl font-bold ${cashflow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {cashflow >= 0 ? '+' : ''}€{Math.round(cashflow).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mieteinnahmen - Rate - Kosten
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-gray-400 text-xs">Kreditbetrag</div>
                    <div className="font-semibold">
                      €{Math.round((property.price + roiBreakdown.purchaseCosts) * (1 - financing.downPayment / 100)).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-gray-400 text-xs">Gesamt gezahlt</div>
                    <div className="font-semibold">
                      €{Math.round(monthlyPayment * financing.loanTerm * 12).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future Projections */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <LineChart className="h-6 w-6 mr-2 text-green-500" />
              Zukunftsprognose (10 Jahre)
            </h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-400 mb-3">
                Annahmen: 3% Wertsteigerung p.a., 2% Mietsteigerung p.a.
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {projections.map((proj) => (
                  <div key={proj.year} className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:border-primary-600 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-primary-500">Jahr {proj.year}</span>
                      <span className="text-sm text-gray-400">
                        Immobilienwert: €{Math.round(proj.propertyValue / 1000)}k
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Jahresmiete</div>
                        <div className="font-semibold">€{Math.round(proj.annualRent).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Gesamtrendite</div>
                        <div className="font-semibold text-green-500">
                          €{Math.round(proj.totalReturn / 1000)}k
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="bg-gradient-to-r from-green-900/30 to-primary-900/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Gesamtrendite nach 10 Jahren</div>
                  <div className="text-3xl font-bold text-green-500">
                    €{Math.round(projections[9]?.totalReturn / 1000)}k
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mieteinnahmen + Wertsteigerung
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <PropertyMap properties={[property]} zoom={14} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis Scores */}
          {analysis && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">AI Rating</h2>
              <div className="space-y-4">
                <ScoreBar
                  label="Investment Score"
                  score={analysis.scores.investment}
                  color="primary"
                />
                <ScoreBar
                  label="Location Score"
                  score={analysis.scores.location}
                  color="accent"
                />
                <ScoreBar
                  label="Condition Score"
                  score={analysis.scores.condition}
                  color="green"
                />
                <ScoreBar
                  label="ROI Score"
                  score={analysis.scores.roi}
                  color="purple"
                />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                Recommendations
              </h2>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {analysis?.risks && analysis.risks.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-yellow-500" />
                Risks
              </h2>
              <ul className="space-y-2">
                {analysis.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities */}
          {analysis?.opportunities && analysis.opportunities.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-primary-500" />
                Opportunities
              </h2>
              <ul className="space-y-2">
                {analysis.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <span className="text-primary-500 mr-2">↗</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value, valueColor = 'text-white' }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center space-x-2 mb-2 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, score, color }) {
  const colorClasses = {
    primary: 'bg-primary-600',
    accent: 'bg-accent-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-semibold">{score}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

