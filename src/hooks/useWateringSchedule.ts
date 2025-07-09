// import { useState, useEffect, useCallback } from "react";
// import {
//   getTodaySchedules,
//   getScheduleHistory,
//   getLocationSchedules,
//   updateScheduleStatus,
// } from "../api/wateringApi";
// import { WateringSchedule } from "../types";
// import { HISTORY_PERIOD } from "../constants/wateringConstants";
// import { Alert } from "react-native";

// interface UseWateringScheduleProps {
//   locationId?: string;
//   initialPeriod?: keyof typeof HISTORY_PERIOD;
// }

// const useWateringSchedule = ({
//   locationId,
//   initialPeriod = "WEEK", // Ensure initialPeriod uses a key, not a value
// }: UseWateringScheduleProps = {}) => {
//   const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [period, setPeriod] =
//     useState<keyof typeof HISTORY_PERIOD>(initialPeriod);
//   const [dateRange, setDateRange] = useState<{
//     startDate?: string;
//     endDate?: string;
//   }>({});

//   const fetchSchedules = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       let fetchedSchedules: WateringSchedule[] = [];

//       if (period === "TODAY") {
//         fetchedSchedules = await getTodaySchedules();
//       } else if (locationId) {
//         fetchedSchedules = await getLocationSchedules(locationId, dateRange);
//       } else {
//         fetchedSchedules = await getScheduleHistory(dateRange);
//       }

//       setSchedules(fetchedSchedules);
//     } catch (error) {
//       console.error("Failed to load watering schedules:", error);
//       Alert.alert(
//         "Error",
//         "Failed to load watering schedules. Please try again later."
//       );
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [locationId, period, dateRange]);

//   useEffect(() => {
//     fetchSchedules();
//   }, [fetchSchedules]);

//   useEffect(() => {
//     // Set date range based on selected period
//     const today = new Date();
//     let startDate: Date | undefined;
//     let endDate: Date | undefined = new Date();

//     switch (period) {
//       case "TODAY":
//         startDate = new Date();
//         startDate.setHours(0, 0, 0, 0);
//         break;
//       case "WEEK":
//         startDate = new Date();
//         startDate.setDate(today.getDate() - 7);
//         break;
//       case "MONTH":
//         startDate = new Date();
//         startDate.setMonth(today.getMonth() - 1);
//         break;
//       case "CUSTOM":
//         // Don't modify dateRange for custom period
//         return;
//     }

//     if (startDate) {
//       setDateRange({
//         startDate: startDate.toISOString().split("T")[0],
//         endDate: endDate.toISOString().split("T")[0],
//       });
//     }
//   }, [period]);

//   const refreshSchedules = () => {
//     setIsRefreshing(true);
//     fetchSchedules();
//   };

//   const changeScheduleStatus = async (
//     scheduleId: string,
//     status: string,
//     details?: any
//   ) => {
//     try {
//       await updateScheduleStatus(scheduleId, status, details);

//       // Update local state to reflect the change
//       setSchedules((prevSchedules) =>
//         prevSchedules.map((schedule) =>
//           schedule._id === scheduleId
//             ? {
//                 ...schedule,
//                 status,
//                 ...(details && { executionDetails: details }),
//               }
//             : schedule
//         )
//       );

//       return true;
//     } catch (error) {
//       console.error("Failed to update schedule status:", error);
//       Alert.alert(
//         "Error",
//         "Failed to update schedule status. Please try again."
//       );
//       return false;
//     }
//   };

//   const setCustomDateRange = (startDate: string, endDate: string) => {
//     setPeriod("CUSTOM"); // Now correctly using the key instead of the value
//     setDateRange({ startDate, endDate });
//   };

//   return {
//     schedules,
//     isLoading,
//     isRefreshing,
//     period,
//     dateRange,
//     refreshSchedules,
//     changeScheduleStatus,
//     setPeriod,
//     setCustomDateRange,
//   };
// };

// export default useWateringSchedule;

import { useState, useEffect, useCallback } from "react";
import {
  getTodaySchedules,
  getScheduleHistory,
  getLocationSchedules,
  updateScheduleStatus,
} from "../api/wateringApi";
import { WateringSchedule } from "../types";
import { HISTORY_PERIOD } from "../constants/wateringConstants";
import { Alert } from "react-native";

interface UseWateringScheduleProps {
  locationId?: string;
  initialPeriod?: keyof typeof HISTORY_PERIOD;
}

const useWateringSchedule = ({
  locationId,
  initialPeriod = "WEEK",
}: UseWateringScheduleProps = {}) => {
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<keyof typeof HISTORY_PERIOD>(initialPeriod);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // Recalculate date range when period changes
  useEffect(() => {
    // Set date range based on selected period
    const today = new Date();
    let startDate: Date | undefined;
    let endDate: Date = new Date();

    switch (period) {
      case "TODAY":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Add one day to include the full current day
        break;
      case "WEEK":
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        
        endDate = new Date();
        endDate.setDate(today.getDate() + 1); // Add one day to include the full current day
        break;
      case "MONTH":
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 1);
        
        endDate = new Date();
        endDate.setDate(today.getDate() + 1); // Add one day to include the full current day
        break;
      case "CUSTOM":
        // Don't modify dateRange for custom period
        return;
    }

    if (startDate) {
      setDateRange({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
    }
  }, [period]);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      let fetchedSchedules: WateringSchedule[] = [];

      if (period === "TODAY") {
        fetchedSchedules = await getTodaySchedules();
      } else if (locationId) {
        fetchedSchedules = await getLocationSchedules(locationId, dateRange);
      } else {
        // Make sure we have date range parameters for history fetching
        if (period !== "CUSTOM" || (dateRange.startDate && dateRange.endDate)) {
          fetchedSchedules = await getScheduleHistory(dateRange);
        }
      }

      setSchedules(fetchedSchedules);
    } catch (error) {
      console.error("Failed to load watering schedules:", error);
      Alert.alert(
        "Error",
        "Failed to load watering schedules. Please try again later."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [locationId, period, dateRange]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const refreshSchedules = () => {
    setIsRefreshing(true);
    fetchSchedules();
  };

  const changeScheduleStatus = async (
    scheduleId: string,
    status: string,
    details?: any
  ) => {
    try {
      await updateScheduleStatus(scheduleId, status, details);

      // Update local state to reflect the change
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule._id === scheduleId
            ? {
                ...schedule,
                status,
                ...(details && { executionDetails: details }),
              }
            : schedule
        )
      );

      return true;
    } catch (error) {
      console.error("Failed to update schedule status:", error);
      Alert.alert(
        "Error",
        "Failed to update schedule status. Please try again."
      );
      return false;
    }
  };

  const setCustomDateRange = (startDate: string, endDate: string) => {
    setPeriod("CUSTOM");
    setDateRange({ startDate, endDate });
  };

  return {
    schedules,
    isLoading,
    isRefreshing,
    period,
    dateRange,
    refreshSchedules,
    changeScheduleStatus,
    setPeriod,
    setCustomDateRange,
  };
};

export default useWateringSchedule;