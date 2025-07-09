import api from './axios';
import { Device } from '../types';

interface DeviceResponse {
  status: string;
  data: {
    device: Device;
  };
}

interface DevicesResponse {
  status: string;
  data: {
    devices: Device[];
  };
}

/**
 * Register a new device
 */
export const registerDevice = async (deviceData: {
  deviceId: string;
  type: 'soil_sensor' | 'weather_station' | 'irrigation_controller';
  firmware: string;
  settings: {
    readingInterval: number;
    reportingInterval: number;
    thresholds?: {
      moisture?: number;
      temperature?: number;
      humidity?: number;
    };
  };
}): Promise<Device> => {
  try {
    const response = await api.post<DeviceResponse>(
      '/devices/register',
      deviceData
    );
    return response.data.data.device;
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
};

/**
 * Get all devices for the current user
 */
export const getDevices = async (): Promise<Device[]> => {
  try {
    const response = await api.get<DevicesResponse>('/devices');
    return response.data.data.devices;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

/**
 * Get a specific device by ID
 */
export const getDeviceById = async (deviceId: string): Promise<Device> => {
  try {
    const response = await api.get<DeviceResponse>(`/devices/${deviceId}`);
    return response.data.data.device;
  } catch (error) {
    console.error(`Error fetching device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Update device settings
 */
export const updateDevice = async (
  deviceId: string,
  updateData: Partial<{
    status: 'active' | 'inactive' | 'maintenance';
    settings: {
      readingInterval?: number;
      reportingInterval?: number;
      thresholds?: {
        moisture?: number;
        temperature?: number;
        humidity?: number;
      };
    };
    firmware?: string;
  }>
): Promise<Device> => {
  try {
    const response = await api.put<DeviceResponse>(
      `/devices/${deviceId}`,
      updateData
    );
    return response.data.data.device;
  } catch (error) {
    console.error(`Error updating device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Delete a device
 */
export const deleteDevice = async (deviceId: string): Promise<void> => {
  try {
    await api.delete(`/devices/${deviceId}`);
  } catch (error) {
    console.error(`Error deleting device ${deviceId}:`, error);
    throw error;
  }
};

/**
 * Update device readings
 */
export const updateDeviceReading = async (
  deviceId: string,
  readingData: {
    moisture10cm: number;
    moisture20cm: number;
    moisture30cm: number;
    batteryLevel?: number;
  }
): Promise<Device> => {
  try {
    const response = await api.post<DeviceResponse>(
      `/devices/${deviceId}/readings`,
      readingData
    );
    return response.data.data.device;
  } catch (error) {
    console.error(`Error updating device readings:`, error);
    throw error;
  }
};

/**
 * Get unassigned devices
 * Helper function to get devices that are not assigned to any location
 */
export const getUnassignedDevices = async (): Promise<Device[]> => {
  try {
    const devices = await getDevices();
    return devices.filter(device => !device.locationId);
  } catch (error) {
    console.error('Error fetching unassigned devices:', error);
    throw error;
  }
};

/**
 * Get device readings history
 * Note: This depends on your API implementation, adjust accordingly
 */
export const getDeviceReadingHistory = async (
  deviceId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<any[]> => {
  try {
    const response = await api.get(`/devices/${deviceId}/history`, { params });
    return response.data.data.readings;
  } catch (error) {
    console.error(`Error fetching device reading history:`, error);
    throw error;
  }
};