import { WATER_NEED_CATEGORY, WATER_NEED_RANGES, MOISTURE_THRESHOLDS } from '../constants/wateringConstants';
import { colors } from '../constants/colors';

/**
 * Calculate water need category based on amount
 */
export const getWaterNeedCategory = (amount: number) => {
  if (amount >= WATER_NEED_RANGES[WATER_NEED_CATEGORY.HIGH].min) {
    return WATER_NEED_CATEGORY.HIGH;
  } else if (amount >= WATER_NEED_RANGES[WATER_NEED_CATEGORY.MODERATE].min) {
    return WATER_NEED_CATEGORY.MODERATE;
  } else if (amount > WATER_NEED_RANGES[WATER_NEED_CATEGORY.NONE].max) {
    return WATER_NEED_CATEGORY.LOW;
  } 
  return WATER_NEED_CATEGORY.NONE;
};

/**
 * Get color scheme for water need category
 */
export const getWaterNeedColors = (amount: number) => {
  const category = getWaterNeedCategory(amount);
  
  switch (category) {
    case WATER_NEED_CATEGORY.HIGH:
      return {
        bg: colors.highWater + '20',
        text: colors.highWater,
        main: colors.highWater,
      };
    case WATER_NEED_CATEGORY.MODERATE:
      return {
        bg: colors.moderateWater + '20',
        text: colors.moderateWater,
        main: colors.moderateWater,
      };
    case WATER_NEED_CATEGORY.LOW:
      return {
        bg: colors.lowWater + '20',
        text: colors.lowWater,
        main: colors.lowWater,
      };
    default:
      return {
        bg: colors.noWater + '20',
        text: colors.noWater,
        main: colors.noWater,
      };
  }
};

/**
 * Get water need label based on amount
 */
export const getWaterNeedLabel = (amount: number) => {
  const category = getWaterNeedCategory(amount);
  return WATER_NEED_RANGES[category].label;
};

/**
 * Calculate moisture status based on multiple depths
 */
export const calculateMoistureStatus = (
  moisture10cm: number,
  moisture20cm: number,
  moisture30cm: number
) => {
  // Calculate weighted average (deeper sensors have higher weight)
  const avgMoisture = (
    moisture10cm * 0.3 +
    moisture20cm * 0.3 +
    moisture30cm * 0.4
  );
  
  if (avgMoisture < MOISTURE_THRESHOLDS.VERY_DRY) {
    return {
      status: 'Very Dry',
      color: colors.error,
      needsWatering: true,
      priority: 'high'
    };
  } else if (avgMoisture < MOISTURE_THRESHOLDS.DRY) {
    return {
      status: 'Dry',
      color: colors.warning,
      needsWatering: true,
      priority: 'medium'
    };
  } else if (avgMoisture < MOISTURE_THRESHOLDS.MOIST) {
    return {
      status: 'Adequate',
      color: colors.success,
      needsWatering: false,
      priority: 'low'
    };
  } else {
    return {
      status: 'Well Watered',
      color: colors.info,
      needsWatering: false,
      priority: 'none'
    };
  }
};

/**
 * Estimate water need without ML model
 * Simple calculation based on soil moisture
 */
export const estimateWaterNeed = (
  soilMoisture: {
    moisture10cm: number;
    moisture20cm: number;
    moisture30cm: number;
  },
  temperature: number,
  rainfall: number
): number => {
  // Calculate weighted average soil moisture
  const avgMoisture = (
    soilMoisture.moisture10cm * 0.3 +
    soilMoisture.moisture20cm * 0.3 +
    soilMoisture.moisture30cm * 0.4
  );
  
  // Adjust based on temperature and rainfall
  let baseAmount = 0;
  
  // Basic moisture-based calculation
  if (avgMoisture < 20) {
    baseAmount = 75; // High water need (50-100L)
  } else if (avgMoisture < 35) {
    baseAmount = 40; // Moderate water need (30-50L)
  } else if (avgMoisture < 50) {
    baseAmount = 20; // Low water need (10-30L)
  } else {
    baseAmount = 0; // No water needed
  }
  
  // Apply temperature adjustment
  if (temperature > 30) {
    baseAmount *= 1.2; // Increase by 20% for high temperatures
  } else if (temperature < 20) {
    baseAmount *= 0.8; // Decrease by 20% for low temperatures
  }
  
  // Apply rainfall adjustment
  if (rainfall > 0) {
    const rainfallReduction = Math.min(rainfall * 5, baseAmount); // Each mm reduces by 5L, up to max
    baseAmount = Math.max(0, baseAmount - rainfallReduction);
  }
  
  return Math.round(baseAmount);
};

/**
 * Format date for display in various formats
 */
export const formatScheduleDate = (dateString: string | Date, format: 'full' | 'short' | 'time' = 'full') => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    case 'full':
    default:
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
  }
};

/**
 * Group schedules by date for calendar view
 */
export const groupSchedulesByDate = (schedules: any[]) => {
  const grouped: {[key: string]: any[]} = {};
  
  schedules.forEach(schedule => {
    const dateKey = new Date(schedule.date).toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(schedule);
  });
  
  return grouped;
};

/**
 * Calculate watering efficiency
 */
export const calculateWateringEfficiency = (
  recommendedAmount: number,
  actualAmount: number | undefined
) => {
  if (!actualAmount || recommendedAmount === 0) {
    return { percentage: 100, status: 'optimal' };
  }
  
  const efficiency = (recommendedAmount / actualAmount) * 100;
  
  if (efficiency > 110) {
    return { percentage: efficiency, status: 'underwatered' };
  } else if (efficiency < 90) {
    return { percentage: efficiency, status: 'overwatered' };
  } else {
    return { percentage: efficiency, status: 'optimal' };
  }
};