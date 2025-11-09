import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Get price trends by city
router.get('/price-trends', (req, res) => {
  try {
    const { city } = req.query;

    let query = `
      SELECT 
        city,
        AVG(pricePerSqm) as avgPricePerSqm,
        AVG(price) as avgPrice,
        COUNT(*) as propertyCount
      FROM properties
    `;

    if (city) {
      query += ' WHERE city = ? GROUP BY city';
      const stmt = db.prepare(query);
      const data = stmt.all(city);
      return res.json(data);
    } else {
      query += ' GROUP BY city ORDER BY propertyCount DESC LIMIT 10';
      const stmt = db.prepare(query);
      const data = stmt.all();
      return res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ROI distribution
router.get('/roi-distribution', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        CASE 
          WHEN roi < 3 THEN '0-3%'
          WHEN roi >= 3 AND roi < 5 THEN '3-5%'
          WHEN roi >= 5 AND roi < 7 THEN '5-7%'
          WHEN roi >= 7 AND roi < 10 THEN '7-10%'
          ELSE '10%+'
        END as roiRange,
        COUNT(*) as count
      FROM properties
      WHERE roi IS NOT NULL
      GROUP BY roiRange
      ORDER BY MIN(roi)
    `).all();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property type distribution
router.get('/property-types', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        propertyType,
        COUNT(*) as count,
        AVG(price) as avgPrice,
        AVG(roi) as avgRoi
      FROM properties
      GROUP BY propertyType
      ORDER BY count DESC
    `).all();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market overview
router.get('/market-overview', (req, res) => {
  try {
    const overview = {
      totalProperties: db.prepare('SELECT COUNT(*) as count FROM properties').get().count,
      avgPrice: db.prepare('SELECT AVG(price) as avg FROM properties').get().avg,
      avgRoi: db.prepare('SELECT AVG(roi) as avg FROM properties WHERE roi IS NOT NULL').get().avg,
      avgRentalYield: db.prepare('SELECT AVG(rentalYield) as avg FROM properties WHERE rentalYield IS NOT NULL').get().avg,
      topCities: db.prepare(`
        SELECT city, COUNT(*) as count
        FROM properties
        GROUP BY city
        ORDER BY count DESC
        LIMIT 5
      `).all(),
      priceRanges: db.prepare(`
        SELECT 
          CASE 
            WHEN price < 200000 THEN 'Unter 200k'
            WHEN price >= 200000 AND price < 400000 THEN '200k-400k'
            WHEN price >= 400000 AND price < 600000 THEN '400k-600k'
            WHEN price >= 600000 AND price < 800000 THEN '600k-800k'
            ELSE 'Über 800k'
          END as priceRange,
          COUNT(*) as count
        FROM properties
        GROUP BY priceRange
        ORDER BY MIN(price)
      `).all(),
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get city comparison
router.get('/city-comparison', (req, res) => {
  try {
    const comparison = db.prepare(`
      SELECT 
        city,
        COUNT(*) as propertyCount,
        AVG(price) as avgPrice,
        AVG(pricePerSqm) as avgPricePerSqm,
        AVG(size) as avgSize,
        AVG(roi) as avgRoi,
        AVG(rentalYield) as avgRentalYield,
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM properties
      GROUP BY city
      HAVING propertyCount >= 3
      ORDER BY avgRoi DESC
    `).all();

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

