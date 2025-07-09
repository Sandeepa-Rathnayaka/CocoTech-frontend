import api from './axios';
import { WateringSchedule, WateringStatus } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScheduleResponse {
  status: string;
  data: {
    schedule: WateringSchedule;
  };
}

interface SchedulesResponse {
  status: string;
  data: {
    schedules: WateringSchedule[];
  };
}

/**
 * Helper function to get auth token and set in headers
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Get schedule by ID
 */
export const getScheduleById = async (scheduleId: string): Promise<WateringSchedule> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<ScheduleResponse>(
      `/watering/schedule/${scheduleId}`,
      headers
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error(`Error fetching schedule ${scheduleId}:`, error);
    throw error;
  }
};

/**
 * Create a new watering schedule for a location
 */
export const createSchedule = async (
  locationId: string,
  scheduleData: {
    soilConditions?: {
      moisture10cm: number;
      moisture20cm: number;
      moisture30cm: number;
    };
    date?: string;
    notes?: string;
  }
): Promise<WateringSchedule> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post<ScheduleResponse>(
      `/watering/schedule/${locationId}`,
      scheduleData,
      headers
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error('Error creating watering schedule:', error);
    throw error;
  }
};

/**
 * Get today's watering schedules
 */
export const getTodaySchedules = async (): Promise<WateringSchedule[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<SchedulesResponse>(
      '/watering/today',
      headers
    );
    return response.data.data.schedules;
  } catch (error) {
    console.error('Error fetching today\'s schedules:', error);
    throw error;
  }
};

/**
 * Get watering schedule history with optional filters
 */
export const getScheduleHistory = async (
  params?: {
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<WateringSchedule[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<SchedulesResponse>(
      '/watering/history', 
      { 
        ...headers,
        params 
      }
    );
    return response.data.data.schedules;
  } catch (error) {
    console.error('Error fetching schedule history:', error);
    throw error;
  }
};

/**
 * Get watering schedules for a specific location
 */
export const getLocationSchedules = async (
  locationId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<WateringSchedule[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<SchedulesResponse>(
      `/watering/location/${locationId}`,
      { 
        ...headers,
        params 
      }
    );
    return response.data.data.schedules;
  } catch (error) {
    console.error(`Error fetching schedules for location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Update watering schedule status
 */
export const updateScheduleStatus = async (
  scheduleId: string,
  status: WateringStatus,
  details?: {
    actualAmount?: number;
    startTime?: string;
    endTime?: string;
    executedBy?: 'automatic' | 'manual';
    notes?: string;
  }
): Promise<WateringSchedule> => {
  try {
    const headers = await getAuthHeaders();
    const response = await api.put<ScheduleResponse>(
      `/watering/schedule/${scheduleId}/status`,
      { 
        status,
        details
      },
      headers
    );
    return response.data.data.schedule;
  } catch (error) {
    console.error(`Error updating schedule status:`, error);
    throw error;
  }
};

/**
 * Delete a watering schedule
 */
export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await api.delete(
      `/watering/schedule/${scheduleId}`,
      headers
    );
  } catch (error) {
    console.error(`Error deleting schedule ${scheduleId}:`, error);
    throw error;
  }
};

/**
 * Get recommended watering amount based on conditions
 * This is a helper function that estimates water needs based on soil moisture
 * Use this when you don't have access to the ML model predictions
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
  // Calculate average soil moisture
  const avgMoisture = (soilMoisture.moisture10cm + 
                       soilMoisture.moisture20cm + 
                       soilMoisture.moisture30cm) / 3;
  
  // Basic estimation logic
  if (avgMoisture < 20) {
    return 75; // High water need (50-100L)
  } else if (avgMoisture < 35) {
    return 40; // Moderate water need (30-50L)
  } else if (avgMoisture < 50) {
    return 20; // Low water need (10-30L)
  } else {
    return 0; // No water needed
  }
};

/**
 * Get schedules for the upcoming week
 */
export const getUpcomingSchedules = async (): Promise<WateringSchedule[]> => {
  try {
    // Calculate dates for the next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 8);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];
    
    return await getScheduleHistory({
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    throw error;
  }
};