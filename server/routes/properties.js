import express from 'express';
import { db } from '../index.js';
import { calculateROI, calculateRentalYield } from '../utils/calculations.js';
import { fetchFromImmoscout, fetchFromImmonet } from '../services/scrapers.js';

const router = express.Router();

// Get all properties
router.get('/', (req, res) => {
  try {
    const { 
      city, 
      minPrice, 
      maxPrice, 
      minSize, 
      maxSize,
      propertyType,
      minRoi 
    } = req.query;

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    if (minSize) {
      query += ' AND size >= ?';
      params.push(parseFloat(minSize));
    }
    if (maxSize) {
      query += ' AND size <= ?';
      params.push(parseFloat(maxSize));
    }
    if (propertyType) {
      query += ' AND propertyType = ?';
      params.push(propertyType);
    }
    if (minRoi) {
      query += ' AND roi >= ?';
      params.push(parseFloat(minRoi));
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = db.prepare(query);
    const properties = stmt.all(...params);

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property by ID
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
    const property = stmt.get(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new property
router.post('/', (req, res) => {
  try {
    const property = req.body;
    
    // Calculate metrics
    property.pricePerSqm = property.price / property.size;
    property.rentalYield = calculateRentalYield(property.estimatedRent * 12, property.price);
    property.roi = calculateROI(property);

    const stmt = db.prepare(`
      INSERT INTO properties (
        title, address, city, postalCode, latitude, longitude,
        price, size, rooms, propertyType, yearBuilt, condition,
        currentRent, estimatedRent, rentalYield, pricePerSqm, roi,
        imageUrl, description, source, externalId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      property.title,
      property.address,
      property.city,
      property.postalCode,
      property.latitude,
      property.longitude,
      property.price,
      property.size,
      property.rooms,
      property.propertyType,
      property.yearBuilt,
      property.condition,
      property.currentRent,
      property.estimatedRent,
      property.rentalYield,
      property.pricePerSqm,
      property.roi,
      property.imageUrl,
      property.description,
      property.source,
      property.externalId
    );

    res.json({ id: result.lastInsertRowid, ...property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch properties from external sources
router.post('/fetch', async (req, res) => {
  try {
    const { source, city } = req.body;
    
    let properties = [];
    
    if (source === 'immoscout' || source === 'all') {
      const immoscoutData = await fetchFromImmoscout(city);
      properties = properties.concat(immoscoutData);
    }
    
    if (source === 'immonet' || source === 'all') {
      const immonetData = await fetchFromImmonet(city);
      properties = properties.concat(immonetData);
    }

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO properties (
        title, address, city, postalCode, latitude, longitude,
        price, size, rooms, propertyType, yearBuilt, condition,
        estimatedRent, rentalYield, pricePerSqm, roi,
        imageUrl, description, source, externalId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let saved = 0;
    for (const property of properties) {
      try {
        stmt.run(
          property.title,
          property.address,
          property.city,
          property.postalCode,
          property.latitude,
          property.longitude,
          property.price,
          property.size,
          property.rooms,
          property.propertyType,
          property.yearBuilt,
          property.condition,
          property.estimatedRent,
          property.rentalYield,
          property.pricePerSqm,
          property.roi,
          property.imageUrl,
          property.description,
          property.source,
          property.externalId
        );
        saved++;
      } catch (err) {
        console.error('Error saving property:', err.message);
      }
    }

    res.json({ 
      message: `Fetched and saved ${saved} properties`,
      count: saved 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalProperties,
        AVG(price) as avgPrice,
        AVG(pricePerSqm) as avgPricePerSqm,
        AVG(roi) as avgRoi,
        AVG(rentalYield) as avgRentalYield
      FROM properties
    `).get();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

