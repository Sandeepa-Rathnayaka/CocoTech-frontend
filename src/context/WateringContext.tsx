import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { 
  getTodaySchedules, 
  getUpcomingSchedules, 
  updateScheduleStatus 
} from '../api/wateringApi';
import { WateringSchedule } from '../types';
import { HISTORY_PERIOD } from '../constants/wateringConstants';

interface WateringContextType {
  todaySchedules: WateringSchedule[];
  upcomingSchedules: WateringSchedule[];
  isLoading: boolean;
  refreshWateringData: () => Promise<void>;
  updateSchedule: (scheduleId: string, status: string, details?: any) => Promise<boolean>;
  wateringStats: {
    pendingCount: number;
    completedCount: number;
    totalWaterUsed: number;
  };
}

const WateringContext = createContext<WateringContextType | undefined>(undefined);

export const WateringProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [todaySchedules, setTodaySchedules] = useState<WateringSchedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<WateringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wateringStats, setWateringStats] = useState({
    pendingCount: 0,
    completedCount: 0,
    totalWaterUsed: 0
  });

  useEffect(() => {
    loadWateringData();
  }, []);

  useEffect(() => {
    // Calculate stats whenever schedules change
    calculateWateringStats();
  }, [todaySchedules]);

  const loadWateringData = async () => {
    try {
      setIsLoading(true);
      const [today, upcoming] = await Promise.all([
        getTodaySchedules(),
        getUpcomingSchedules()
      ]);
      
      setTodaySchedules(today);
      setUpcomingSchedules(upcoming);
    } catch (error) {
      console.error('Failed to load watering data:', error);
      Alert.alert(
        'Error',
        'Failed to load watering schedules. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWateringData = async () => {
    await loadWateringData();
  };

  const calculateWateringStats = () => {
    const pendingCount = todaySchedules.filter(s => s.status === 'pending').length;
    const completedCount = todaySchedules.filter(s => s.status === 'completed').length;
    
    // Calculate total water used today
    const totalWaterUsed = todaySchedules.reduce((sum, schedule) => {
      if (schedule.status === 'completed' && schedule.actualAmount) {
        return sum + schedule.actualAmount;
      }
      return sum;
    }, 0);
    
    setWateringStats({
      pendingCount,
      completedCount,
      totalWaterUsed
    });
  };

  const updateSchedule = async (
    scheduleId: string,
    status: string,
    details?: any
  ): Promise<boolean> => {
    try {
      await updateScheduleStatus(scheduleId, status, details);
      
      // Update local state with the new status
      setTodaySchedules(prev => 
        prev.map(schedule => 
          schedule._id === scheduleId 
            ? { ...schedule, status, ...(details && { executionDetails: details }) } 
            : schedule
        )
      );
      
      setUpcomingSchedules(prev => 
        prev.map(schedule => 
          schedule._id === scheduleId 
            ? { ...schedule, status, ...(details && { executionDetails: details }) } 
            : schedule
        )
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      Alert.alert(
        'Error',
        'Failed to update watering schedule. Please try again.'
      );
      return false;
    }
  };

  return (
    <WateringContext.Provider 
      value={{
        todaySchedules,
        upcomingSchedules,
        isLoading,
        refreshWateringData,
        updateSchedule,
        wateringStats
      }}
    >
      {children}
    </WateringContext.Provider>
  );
};

export const useWatering = () => {
  const context = useContext(WateringContext);
  if (context === undefined) {
    throw new Error('useWatering must be used within a WateringProvider');
  }
  return context;
};