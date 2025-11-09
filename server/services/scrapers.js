// Mock data scrapers for Immoscout24, Immonet, etc.
// In production, these would use actual APIs or web scraping

import { calculateROI, calculateRentalYield, estimateRent, calculatePricePerSqm } from '../utils/calculations.js';

// Mock coordinates for German cities
const cityCoordinates = {
  'Berlin': { lat: 52.520008, lng: 13.404954 },
  'München': { lat: 48.135125, lng: 11.581981 },
  'Hamburg': { lat: 53.551086, lng: 9.993682 },
  'Frankfurt': { lat: 50.110924, lng: 8.682127 },
  'Köln': { lat: 50.937531, lng: 6.960279 },
  'Stuttgart': { lat: 48.775846, lng: 9.182932 },
  'Düsseldorf': { lat: 51.227741, lng: 6.773456 },
  'Leipzig': { lat: 51.339695, lng: 12.373075 },
  'Dresden': { lat: 51.050407, lng: 13.737262 },
  'Bonn': { lat: 50.73743, lng: 7.098207 },
};

export async function fetchFromImmoscout(city = 'Berlin') {
  // Mock data generator
  const properties = [];
  const numProperties = Math.floor(Math.random() * 5) + 3; // 3-8 properties

  const coords = cityCoordinates[city] || cityCoordinates['Berlin'];

  for (let i = 0; i < numProperties; i++) {
    const size = Math.floor(Math.random() * 100) + 40; // 40-140 sqm
    const pricePerSqm = Math.floor(Math.random() * 3000) + 2500; // 2500-5500 €/sqm
    const price = size * pricePerSqm;
    const rooms = Math.floor(size / 25) + 1;

    const property = {
      title: `${rooms}-Zimmer Wohnung in ${city}`,
      address: `${generateStreetName()} ${Math.floor(Math.random() * 100) + 1}`,
      city: city,
      postalCode: `${10000 + Math.floor(Math.random() * 90000)}`,
      latitude: coords.lat + (Math.random() - 0.5) * 0.1,
      longitude: coords.lng + (Math.random() - 0.5) * 0.1,
      price: price,
      size: size,
      rooms: rooms,
      propertyType: Math.random() > 0.7 ? 'Haus' : 'Wohnung',
      yearBuilt: Math.floor(Math.random() * 50) + 1970,
      condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      description: `Schöne ${rooms}-Zimmer Wohnung in ${city} mit ${size}m² Wohnfläche.`,
      source: 'Immoscout24',
      externalId: `IS24-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Calculate derived fields
    property.estimatedRent = estimateRent(property);
    property.pricePerSqm = calculatePricePerSqm(property.price, property.size);
    property.rentalYield = calculateRentalYield(property.estimatedRent * 12, property.price);
    property.roi = calculateROI(property);

    properties.push(property);
  }

  return properties;
}

export async function fetchFromImmonet(city = 'Berlin') {
  // Similar to Immoscout but with slightly different data
  const properties = [];
  const numProperties = Math.floor(Math.random() * 4) + 2; // 2-6 properties

  const coords = cityCoordinates[city] || cityCoordinates['Berlin'];

  for (let i = 0; i < numProperties; i++) {
    const size = Math.floor(Math.random() * 120) + 50; // 50-170 sqm
    const pricePerSqm = Math.floor(Math.random() * 2500) + 3000; // 3000-5500 €/sqm
    const price = size * pricePerSqm;
    const rooms = Math.floor(size / 30) + 1;

    const property = {
      title: `Attraktive Eigentumswohnung - ${rooms} Zimmer`,
      address: `${generateStreetName()} ${Math.floor(Math.random() * 150) + 1}`,
      city: city,
      postalCode: `${10000 + Math.floor(Math.random() * 90000)}`,
      latitude: coords.lat + (Math.random() - 0.5) * 0.1,
      longitude: coords.lng + (Math.random() - 0.5) * 0.1,
      price: price,
      size: size,
      rooms: rooms,
      propertyType: Math.random() > 0.6 ? 'Haus' : 'Wohnung',
      yearBuilt: Math.floor(Math.random() * 40) + 1980,
      condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      description: `Moderne Immobilie in gefragter Lage von ${city}.`,
      source: 'Immonet',
      externalId: `IN-${Math.random().toString(36).substr(2, 9)}`,
    };

    property.estimatedRent = estimateRent(property);
    property.pricePerSqm = calculatePricePerSqm(property.price, property.size);
    property.rentalYield = calculateRentalYield(property.estimatedRent * 12, property.price);
    property.roi = calculateROI(property);

    properties.push(property);
  }

  return properties;
}

function generateStreetName() {
  const streets = [
    'Hauptstraße', 'Bahnhofstraße', 'Gartenstraße', 'Schulstraße',
    'Kirchstraße', 'Marktplatz', 'Berliner Straße', 'Mühlenweg',
    'Alte Gasse', 'Neuer Weg', 'Lindenallee', 'Rosenweg'
  ];
  return streets[Math.floor(Math.random() * streets.length)];
}

