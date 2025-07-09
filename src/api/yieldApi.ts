import api from './axios';
// const BASE_URL = 'http://192.168.1.7:7000/api/v1';
const BASE_URL = 'https://node-backend-zjnf.onrender.com/api/v1';

// 
export interface MonthlyData {
  month: number;
  sm_10: number;
  sm_20: number;
  sm_30: number;
  age: number;
  soil_type: number;
  "Temperature (°C)": number;
  "Humidity (%)": number;
  "Rainfall (mm)": number;
  "Weather Description": string;
}

export interface YieldPredictionRequest {
  year: number;
  locationId: string;
  monthly_data: MonthlyData[];
}

export interface YieldPrediction {
  year: number;
  average_prediction: number;
  monthly_predictions: {
    confidence_score: number;
    ensemble_prediction: number;
    month: number;
    month_name: string;
    seasonal_factor: number;
    seasonal_prediction: number;
    input_data: {
      humidity: number;
      plant_age: number;
      rainfall: number;
      soil_moisture_10cm: number;
      soil_moisture_20cm: number;
      soil_moisture_30cm: number;
      soil_type: number;
      temperature: number;
      weather_description: string;
    };
    weights: number[];
    _id: string;
  }[];
  status: string;
}

export interface PredictedMonth {
  month: string;
  yield: number;
}

export interface YieldPredictionResponse {
  predictedYield: number;
  confidenceScore: number;
  predictedMonths: PredictedMonth[];
}

// Update the interface to match the actual API response structure
export interface YieldPredictionHistory {
  _id: string;
  year: number;
  average_prediction: number;
  monthly_predictions: {
    confidence_score: number;
    ensemble_prediction: number;
    input_data: {
      humidity: number;
      plant_age: number;
      rainfall: number;
      soil_moisture_10cm: number;
      soil_moisture_20cm: number;
      soil_moisture_30cm: number;
      soil_type: number;
      temperature: number;
      weather_description: string;
      _id: string;
    };
    long_term_prediction: number;
    month: number;
    month_name: string;
    seasonal_factor: number;
    seasonal_prediction: number;
    weights: number[];
    year: number;
    _id: string;
  }[];
  status: string;
  user: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// First, add this interface to define the location response
export interface LocationDetails {
  location : {
    _id: string;
    name: string;
    area: number;
    soilType: string;
    totalTrees: number;
    plantationDate: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
  }
}

export const yieldApi = {
  predictYield: async (data: YieldPredictionRequest) => {
    try {
      const response = await api.post(`${BASE_URL}/yield/yield-prediction`, data);
      console.log('Raw API response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && (response.data.data || response.data)) {
        // Some APIs nest the actual data under a 'data' property
        const resultData = response.data.data || response.data;
        return resultData;
      } else {
        console.error('Unexpected API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('API Error in predictYield:', error);
      throw error;
    }
  },

  // Add this new function to get location details
  getLocationDetails: async (locationId: string): Promise<LocationDetails> => {
    try {
      const response = await api.get(`${BASE_URL}/locations/${locationId}`);
      
      if (response.data && (response.data.data || response.data)) {
        const locationData = response.data.data || response.data;
        return locationData;
      } else {
        console.error('Unexpected API response format for location details:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error(`API Error in getLocationDetails for ID ${locationId}:`, error);
      throw error;
    }
  },

  // Add this new function to get prediction history
  getPredictionHistory: async (locationId?: string) => {
    try {
      // If locationId is provided, get predictions for specific location
      const endpoint = `${BASE_URL}/yield/user/yield-predictions`;
      
      const response = await api.get(endpoint);
      console.log('Prediction history response:', response.data);
      
      if (response.data && (response.data.data || response.data)) {
        const resultData = response.data.data || response.data;
        return resultData;
      } else {
        console.error('Unexpected API response format for prediction history:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('API Error in getPredictionHistory:', error);
      throw error;
    }
  },

  // Add this new function to delete a prediction
  deletePrediction: async (predictionId: string) => {
    try {
      const response = await api.delete(`${BASE_URL}/yield/yield-prediction/${predictionId}`);
      
      if (response.data && response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to delete prediction');
      }
    } catch (error) {
      console.error(`API Error in deletePrediction for ID ${predictionId}:`, error);
      throw error;
    }
  },

  // Add this new function to submit actual yield
  submitActualYield: async (actualYieldData: {
    year: number;
    month: number;
    actual_yield: number;
    locationId: string;
    yieldPredictionId: string;
  }) => {
    const response = await api.post(`${BASE_URL}/actual-yield/actual-yield`, actualYieldData);
    return response.data;
  },

  // Add this new function to get actual yield by prediction
  getActualYieldByPrediction: async (predictionId: string) => {
    const response = await api.get(`${BASE_URL}/actual-yield/actual-yield-byPrediction/${predictionId}`);
    return response.data;
  }
};