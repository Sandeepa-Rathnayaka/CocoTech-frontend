// Auth Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// Location Types
export interface Location {
  _id: string;
  name: string;
  userId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number;
  soilType:
    | "Lateritic"
    | "Sandy Loam"
    | "Cinnamon Sand"
    | "Red Yellow Podzolic"
    | "Alluvial";
  totalTrees: number;
  deviceId?: string;
  status: "active" | "inactive";
  plantationDate: Date;
  description?: string;
}

// Device Types
export interface Device {
  assignedLocation: any;
  _id: string;
  deviceId: string;
  locationId?: string;
  userId: string;
  type: "soil_sensor" | "weather_station" | "irrigation_controller";
  status: "active" | "inactive" | "maintenance";
  lastReading?: {
    moisture10cm: number;
    moisture20cm: number;
    moisture30cm: number;
    timestamp: Date;
  };
  batteryLevel?: number;
  settings: {
    readingInterval: number;
    reportingInterval: number;
    thresholds: {
      moisture?: number;
      temperature?: number;
      humidity?: number;
    };
  };
}

// Watering Schedule Types
export interface WateringSchedule {
  _id: string;
  userId: string;
  locationId: string;
  deviceId?: string;
  date: Date;
  status: "pending" | "in_progress" | "completed" | "skipped" | "cancelled";
  recommendedAmount: number;
  actualAmount?: number;
  soilConditions: {
    moisture10cm: number;
    moisture20cm: number;
    moisture30cm: number;
    soilType: string;
  };
  weatherConditions: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  predictionConfidence: number;
}

// API Response Types
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Locations: undefined;
  LocationDetails: { locationId: string };
  Devices: undefined;
  DeviceDetails: { deviceId: string };
  Schedule: undefined;
};

export type WateringStatus = any;
