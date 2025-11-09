// Financial calculation utilities

export function calculateROI(property) {
  if (!property.estimatedRent || !property.price) return 0;
  
  const annualRent = property.estimatedRent * 12;
  const purchaseCosts = property.price * 0.1; // 10% for fees, taxes, etc.
  const totalInvestment = property.price + purchaseCosts;
  
  // Simple ROI calculation
  const roi = ((annualRent / totalInvestment) * 100);
  
  return parseFloat(roi.toFixed(2));
}

export function calculateRentalYield(annualRent, propertyPrice) {
  if (!annualRent || !propertyPrice) return 0;
  
  const rentalYield = (annualRent / propertyPrice) * 100;
  return parseFloat(rentalYield.toFixed(2));
}

export function calculatePricePerSqm(price, size) {
  if (!price || !size) return 0;
  return parseFloat((price / size).toFixed(2));
}

export function estimateRent(property) {
  // Simplified rent estimation based on location and size
  const baseRentPerSqm = {
    'Berlin': 12,
    'München': 18,
    'Hamburg': 14,
    'Frankfurt': 15,
    'Köln': 11,
    'Stuttgart': 13,
    'Düsseldorf': 12,
    'Leipzig': 8,
    'Dresden': 9,
    'Default': 10,
  };

  const rentPerSqm = baseRentPerSqm[property.city] || baseRentPerSqm['Default'];
  const estimatedMonthlyRent = property.size * rentPerSqm;
  
  return parseFloat(estimatedMonthlyRent.toFixed(2));
}

export function calculateBreakEvenYears(property) {
  if (!property.estimatedRent || !property.price) return null;
  
  const annualRent = property.estimatedRent * 12;
  const purchaseCosts = property.price * 0.1;
  const totalInvestment = property.price + purchaseCosts;
  
  const breakEvenYears = totalInvestment / annualRent;
  return parseFloat(breakEvenYears.toFixed(1));
}

