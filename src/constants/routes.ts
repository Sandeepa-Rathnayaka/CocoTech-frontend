// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: "Login",
  SIGNUP: "Signup",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",
};

// Main Tab Routes
export const TAB_ROUTES = {
  HOME: "Home",
  WATERING: "Watering",
  LOCATIONS: "Locations",
  DEVICES: "Devices",
  PROFILE: "Profile",
};

// Watering Routes
export const WATERING_ROUTES = {
  WATERING_SCHEDULE: "WateringSchedule",
  SCHEDULE_DETAIL: "ScheduleDetail",
  CREATE_SCHEDULE: "CreateSchedule",
  SCHEDULE_HISTORY: "ScheduleHistory",
};

// Location Routes
export const LOCATION_ROUTES = {
  LOCATION_LIST: "LocationList",
  LOCATION_DETAILS: "LocationDetails",
  LOCATION_FORM: "LocationForm",
};

// Device Routes
export const DEVICE_ROUTES = {
  DEVICE_LIST: "DeviceList",
  DEVICE_DETAILS: "DeviceDetails",
  DEVICE_FORM: "DeviceForm",
  REGISTER_DEVICE: "RegisterDevice",
  EDIT_DEVICE: "EditDevice",
};

// Profile Routes
export const PROFILE_ROUTES = {
  PROFILE_OVERVIEW: "ProfileOverview",
  EDIT_PROFILE: "EditProfile",
  CHANGE_PASSWORD: "ChangePassword",
  SETTINGS: "Settings",
  NOTIFICATION_SETTINGS: "NotificationSettings",
};

// Param types for routes
export type WateringRouteParams = {
  [WATERING_ROUTES.SCHEDULE_DETAIL]: { scheduleId: string };
  [WATERING_ROUTES.CREATE_SCHEDULE]: { locationId?: string };
};

export type LocationRouteParams = {
  [LOCATION_ROUTES.LOCATION_DETAILS]: { locationId: string };
  [LOCATION_ROUTES.LOCATION_FORM]: {
    mode: "create" | "edit";
    locationId?: string;
    locationData?: any;
  };
};

export type DeviceRouteParams = {
  [DEVICE_ROUTES.DEVICE_FORM]: {
    mode: "create" | "edit";
    deviceId?: string;
    deviceData?: any;
  };
};

// Root navigation type
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
} & WateringRouteParams &
  LocationRouteParams &
  DeviceRouteParams;
