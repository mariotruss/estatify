import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import propertiesRouter from './routes/properties.js';
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
export const db = new Database(join(__dirname, '../estatify.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postalCode TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    price REAL NOT NULL,
    size REAL NOT NULL,
    rooms INTEGER,
    propertyType TEXT NOT NULL,
    yearBuilt INTEGER,
    condition TEXT,
    currentRent REAL,
    estimatedRent REAL,
    rentalYield REAL,
    pricePerSqm REAL,
    roi REAL,
    imageUrl TEXT,
    description TEXT,
    source TEXT,
    externalId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    postalCode TEXT,
    avgPricePerSqm REAL,
    avgRent REAL,
    avgRentalYield REAL,
    priceGrowth REAL,
    demandIndex REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    minPrice REAL,
    maxPrice REAL,
    minSize REAL,
    maxSize REAL,
    cities TEXT,
    propertyTypes TEXT,
    minRoi REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Estatify API is running' });
});

app.listen(PORT, () => {
  console.log(`🏢 Estatify server running on http://localhost:${PORT}`);
});

