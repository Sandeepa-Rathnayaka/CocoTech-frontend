// Watering schedule status options
export const SCHEDULE_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
    CANCELLED: 'cancelled',
  } as const;
  
  export type WateringStatus = typeof SCHEDULE_STATUS[keyof typeof SCHEDULE_STATUS];
  
  // Water need categories
  export const WATER_NEED_CATEGORY = {
    NONE: 'none',
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
  } as const;
  
  export type WaterNeedCategory = typeof WATER_NEED_CATEGORY[keyof typeof WATER_NEED_CATEGORY];
  
  // Water need ranges (in liters)
  export const WATER_NEED_RANGES = {
    [WATER_NEED_CATEGORY.NONE]: { min: 0, max: 0, label: '0L (None)' },
    [WATER_NEED_CATEGORY.LOW]: { min: 10, max: 30, label: '10-30L (Low)' },
    [WATER_NEED_CATEGORY.MODERATE]: { min: 30, max: 50, label: '30-50L (Moderate)' },
    [WATER_NEED_CATEGORY.HIGH]: { min: 50, max: 100, label: '50-100L (High)' },
  };
  
  // Priority levels
  export const PRIORITY_LEVEL = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;
  
  export type PriorityLevel = typeof PRIORITY_LEVEL[keyof typeof PRIORITY_LEVEL];
  
  // Time periods for history
  export const HISTORY_PERIOD = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    CUSTOM: 'custom',
  } as const;
  
  export type HistoryPeriod = typeof HISTORY_PERIOD[keyof typeof HISTORY_PERIOD];
  
  // Default values
  export const DEFAULT_VALUES = {
    READING_INTERVAL_MINUTES: 30,
    REPORTING_INTERVAL_MINUTES: 60,
    MOISTURE_THRESHOLD: 30,
    TEMPERATURE_THRESHOLD: 35,
    HUMIDITY_THRESHOLD: 70,
  };
  
  // Watering recommendation thresholds
  export const MOISTURE_THRESHOLDS = {
    VERY_DRY: 20,
    DRY: 40,
    MOIST: 60,
    VERY_MOIST: 80,
  };