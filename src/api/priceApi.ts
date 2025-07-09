import api from './axios';
const BASE_URL = 'https://node-backend-zjnf.onrender.com/api/v1';
// const BASE_URL = 'http://192.168.1.7:7000/api/v1';


export interface PricePredictionRequest {
  yield_nuts: number;
  export_volume: number;
  domestic_consumption: number;
  inflation_rate: number;
  prediction_date: string;
  previous_prices: {
    '1': number;
    '3': number;
    '6': number;
    '12': number;
  };
}

export interface PricePredictionResponse {
  user: string;
  yield_nuts: number;
  export_volume: number;
  domestic_consumption: number;
  inflation_rate: number;
  prediction_date: string;
  previous_prices: {
    '1': number;
    '3': number;
    '6': number;
    '12': number;
  };
  predicted_price: number;
  month: string;
  year: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const priceApi = {
  predictPrice: async (data: any) => {
    try {
      const response = await api.post(`${BASE_URL}/price/price-prediction`, data);
      
      if (response.data && (response.data.data || response.data)) {
        const resultData = response.data.data || response.data;
        return resultData;
      } else {
        console.error('Unexpected API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('API Error in predictPrice:', error);
      throw error;}
    }
}
