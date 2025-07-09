export const config = {
    // API Configuration
    api: {
      baseURL: 'http://192.168.1.100:5000/api/v1',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  
    // Authentication
    auth: {
      tokenKey: 'auth_token',
      refreshTokenKey: 'refresh_token',
      userKey: 'user',
      tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    },
  
    // Storage Keys
    storage: {
      theme: 'app_theme',
      language: 'app_language',
      settings: 'app_settings',
    },
  
    // App Settings
    settings: {
      defaultLanguage: 'en',
      defaultTheme: 'light',
      version: '1.0.0',
      buildNumber: '1',
      minPasswordLength: 8,
    },
  
    // Soil Types
    soilTypes: [
      'Lateritic',
      'Sandy Loam',
      'Cinnamon Sand',
      'Red Yellow Podzolic',
      'Alluvial',
    ] as const,
  
    // Device Types
    deviceTypes: [
      'soil_sensor',
      'weather_station',
      'irrigation_controller',
    ] as const,
  
    // Schedule Status
    scheduleStatus: [
      'pending',
      'in_progress',
      'completed',
      'skipped',
      'cancelled',
    ] as const,
  
    // Weather Refresh Interval (in milliseconds)
    weatherRefreshInterval: 1800000, // 30 minutes
  
    // Pagination
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 50,
    },
  
    // Data Refresh Intervals (in milliseconds)
    refreshIntervals: {
      deviceReadings: 300000, // 5 minutes
      weatherData: 1800000,   // 30 minutes
      schedules: 3600000,     // 1 hour
    },
  
    // Error Messages
    errorMessages: {
      default: 'An error occurred. Please try again.',
      network: 'Network error. Please check your connection.',
      unauthorized: 'Session expired. Please login again.',
      validation: 'Please check your input and try again.',
      notFound: 'The requested resource was not found.',
    },
  
    // Date Formats
    dateFormats: {
      display: 'MMM DD, YYYY',
      api: 'YYYY-MM-DD',
      time: 'HH:mm',
      full: 'MMM DD, YYYY HH:mm',
    },
  
    // Units
    units: {
      area: 'hectares',
      moisture: '%',
      temperature: '°C',
      rainfall: 'mm',
      waterAmount: 'L',
    },
  
    // Feature Flags
    features: {
      enableNotifications: true,
      enableOfflineMode: true,
      enableDeviceSharing: false,
      enableAutoScheduling: true,
    },
  
    // Validation Rules
    validation: {
      name: {
        minLength: 2,
        maxLength: 50,
      },
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
      },
      area: {
        min: 0.1,
        max: 1000,
      },
      trees: {
        min: 1,
        max: 10000,
      },
    },
  
    // App Routes
    routes: {
      auth: {
        login: '/login',
        register: '/register',
        forgotPassword: '/forgot-password',
      },
      app: {
        home: '/home',
        locations: '/locations',
        devices: '/devices',
        schedule: '/schedule',
        profile: '/profile',
      },
    },
  } as const;
  
  // Export individual constants for convenience
  export const {
    api,
    auth,
    storage,
    settings,
    soilTypes,
    deviceTypes,
    scheduleStatus,
    pagination,
    refreshIntervals,
    errorMessages,
    dateFormats,
    units,
    features,
    validation,
    routes,
  } = config;