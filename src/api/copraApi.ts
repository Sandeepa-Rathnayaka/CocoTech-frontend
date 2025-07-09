import api from './axios';

export interface CreateReadingParams {
  batchId: string;
  deviceId?: string;
  moistureLevel: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startTime: Date;
  status: string;
  notes?: string;
}

export interface BatchInfo {
  batchId: string;
  readingsCount: number;
  lastUpdated: string;
}

export const copraApi = {
  createReading: async (params: CreateReadingParams) => {
    const response = await api.post('/copra/readings', params);
    return response.data;
  },

  getBatchHistory: async (batchId: string) => {
    try {
      const response = await api.get(`/copra/batch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('API Error in getBatchHistory:', error);
      throw error;
    }
  },

  getAllBatches: async () => {
    try {
      const response = await api.get('/copra/batches');
      return response.data;
    } catch (error) {
      console.error('API Error in getAllBatches:', error);
      throw error;
    }
  },

  deleteSingleReading: async (batchId: string, readingId: string) => {
    try {
      const response = await api.delete(`/copra/batch/${batchId}/${readingId}`);
      return response.data;
    } catch (error) {
      console.error('API Error in deleteSingleReading:', error);
      throw error;
    }
  },

  updateSingleNote: async (batchId: string, readingId: string, note: string) => {
    try {
      const response = await api.put(`/copra/batch/${batchId}/${readingId}`, { note });
      return response.data;
    } catch (error) {
      console.error('API Error in updateSingleNote:', error);
      throw error;
    }
  },

  deleteBatchReadings: async (batchId: string) => {
    try {
      const response = await api.delete(`/copra/batch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('API Error in deleteBatchReadings:', error);
      throw error;
    }
  },

  getMoistureLevel: async (deviceId:string) => {
    try {
      const response = await api.post(`/copra/getMoisturelevel/${deviceId}`);
      return response;
    } catch (error) {
      console.error('API Error in getAllBatches:', error);
      throw error;
    }
  },
};