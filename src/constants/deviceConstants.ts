// Device types
export const DEVICE_TYPES = {
    SOIL_SENSOR: 'soil_sensor',
    WEATHER_STATION: 'weather_station',
    IRRIGATION_CONTROLLER: 'irrigation_controller',
  } as const;
  
  export type DeviceType = keyof typeof DEVICE_TYPES;
  
  // Device status
  export const DEVICE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
  } as const;
  
  export type DeviceStatus = keyof typeof DEVICE_STATUS;
  
  // Device settings defaults
  export const DEFAULT_SETTINGS = {
    readingInterval: 30, // minutes
    reportingInterval: 60, // minutes
    thresholds: {
      moisture: 30, // percentage
      temperature: 35, // celsius
      humidity: 70, // percentage
    },
  };
  
  // Battery level indicators
  export const BATTERY_LEVEL = {
    CRITICAL: 10,
    LOW: 20,
    MEDIUM: 50,
    HIGH: 80,
  };
  
  // Device related messages
  export const DEVICE_MESSAGES = {
    BATTERY_LOW: 'Battery level is low. Please replace batteries soon.',
    CONNECTION_LOST: 'Connection to device lost. Please check device connectivity.',
    READINGS_OUTDATED: 'Readings may be outdated. Last update was more than 24 hours ago.',
    MAINTENANCE_REQUIRED: 'Device requires maintenance. Please check device status.',
    CALIBRATION_REQUIRED: 'Sensor calibration recommended. Readings may be inaccurate.',
  };
  
  // Device firmware update intervals (in days)
  export const FIRMWARE_UPDATE_INTERVAL = 90;
  
  // Connectivity status
  export const CONNECTIVITY_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    INTERMITTENT: 'intermittent',
  } as const;
  
  // Sensor depth labels
  export const SENSOR_DEPTHS = {
    DEPTH_10CM: 'Surface (10cm)',
    DEPTH_20CM: 'Mid-level (20cm)',
    DEPTH_30CM: 'Deep (30cm)',
  };
  
  // Supported sensor types
  export const SENSOR_TYPES = {
    MOISTURE: 'moisture',
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    LIGHT: 'light',
    PH: 'ph',
  };
  
  // Reading accuracy levels (percentage of confidence)
  export const READING_ACCURACY = {
    HIGH: 95,
    MEDIUM: 85,
    LOW: 70,
  };
  
  // Maintenance period (in days)
  export const MAINTENANCE_PERIOD = 180;
  
  // Maximum number of devices per user
  export const MAX_DEVICES_PER_USER = 10;
  
  // Maximum number of devices per location
  export const MAX_DEVICES_PER_LOCATION = 3;