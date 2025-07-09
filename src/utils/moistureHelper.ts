// utils/moistureHelper.ts
export const getMoistureStatus = (moistureLevel: number): string => {
  if (moistureLevel > 35) {
    return 'newly_harvested';
  } else if (moistureLevel >= 10 && moistureLevel <= 35) {
    return 'Moderate_level';
  } else if (moistureLevel >= 6 && moistureLevel < 10) {
    return 'dryed';
  } else {
    return 'over_dryed';
  }
};

export const calculateOilYield = (moistureLevel: number, weight: number = 10): number => {
  // Oil yield percentages based on moisture levels
  // These are approximate values that you may want to adjust based on your specific requirements
  let yieldPercentage = 0;
  
  if (moistureLevel > 35) {
    // Too wet - lowest yield
    yieldPercentage = 40.5;
  } else if (moistureLevel >= 10 && moistureLevel <= 35) {
    // Wet - moderate yield
    yieldPercentage = 50.3;
  } else if (moistureLevel >= 6 && moistureLevel < 10) {
    // Optimal moisture - best yield
    yieldPercentage = 62.7;
  } else {
    // Too dry - slightly reduced yield
    yieldPercentage = 58.2;
  }
  
  // Calculate oil yield in kilograms
  return (weight * yieldPercentage / 100);
};