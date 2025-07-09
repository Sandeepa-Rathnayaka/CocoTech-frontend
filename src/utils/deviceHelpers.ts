import { Device } from '../types';
import { 
  BATTERY_LEVEL, 
  DEVICE_MESSAGES, 
  FIRMWARE_UPDATE_INTERVAL,
  MAINTENANCE_PERIOD,
  READING_ACCURACY
} from '../constants/deviceConstants';

/**
 * Get battery status with color indicator
 */
export const getBatteryStatus = (batteryLevel?: number) => {
  if (!batteryLevel && batteryLevel !== 0) {
    return { status: 'Unknown', color: '#9E9E9E' };
  }

  if (batteryLevel <= BATTERY_LEVEL.CRITICAL) {
    return { status: 'Critical', color: '#FF3B30' };
  } else if (batteryLevel <= BATTERY_LEVEL.LOW) {
    return { status: 'Low', color: '#FF9500' };
  } else if (batteryLevel <= BATTERY_LEVEL.MEDIUM) {
    return { status: 'Medium', color: '#FFCC00' };
  } else {
    return { status: 'Good', color: '#34C759' };
  }
};

/**
 * Check if device needs maintenance
 */
// export const needsMaintenance = (device: Device): boolean => {
//   if (device.status === 'maintenance') return true;
  
//   if (device.lastMaintenance) {
//     const daysSinceLastMaintenance = Math.floor(
//       (new Date().getTime() - new Date(device.lastMaintenance).getTime()) / (1000 * 3600 * 24)
//     );
//     return daysSinceLastMaintenance >= MAINTENANCE_PERIOD;
//   }
  
//   return false;
// };

/**
 * Check if firmware needs update
 */
// export const needsFirmwareUpdate = (device: Device): boolean => {
//   if (!device.lastMaintenance) return true;
  
//   const daysSinceLastMaintenance = Math.floor(
//     (new Date().getTime() - new Date(device.lastMaintenance).getTime()) / (1000 * 3600 * 24)
//   );
  
//   return daysSinceLastMaintenance >= FIRMWARE_UPDATE_INTERVAL;
// };

/**
 * Check if readings are outdated
 */
export const areReadingsOutdated = (device: Device): boolean => {
  if (!device.lastReading?.timestamp) return true;
  
  const hoursSinceLastReading = Math.floor(
    (new Date().getTime() - new Date(device.lastReading.timestamp).getTime()) / (1000 * 3600)
  );
  
  return hoursSinceLastReading >= 24;
};

/**
 * Get connectivity status based on last reading
 */
export const getConnectivityStatus = (device: Device): 'online' | 'offline' | 'intermittent' => {
  if (!device.lastReading?.timestamp) return 'offline';
  
  const hoursSinceLastReading = Math.floor(
    (new Date().getTime() - new Date(device.lastReading.timestamp).getTime()) / (1000 * 3600)
  );
  
  if (hoursSinceLastReading < 1) {
    return 'online';
  } else if (hoursSinceLastReading < 6) {
    return 'intermittent';
  } else {
    return 'offline';
  }
};

/**
 * Get device health status
 */
export const getDeviceHealth = (device: Device): {
  status: 'good' | 'warning' | 'critical';
  color: string;
  message?: string;
} => {
  // Check battery level
  const batteryStatus = getBatteryStatus(device.batteryLevel);
  if (batteryStatus.status === 'Critical') {
    return {
      status: 'critical',
      color: '#FF3B30',
      message: DEVICE_MESSAGES.BATTERY_LOW
    };
  }
  
  // Check connectivity
  const connectivity = getConnectivityStatus(device);
  if (connectivity === 'offline') {
    return {
      status: 'critical',
      color: '#FF3B30',
      message: DEVICE_MESSAGES.CONNECTION_LOST
    };
  }
  
  // Check readings freshness
  if (areReadingsOutdated(device)) {
    return {
      status: 'warning',
      color: '#FF9500',
      message: DEVICE_MESSAGES.READINGS_OUTDATED
    };
  }
  
  // Check maintenance status
//   if (needsMaintenance(device)) {
//     return {
//       status: 'warning',
//       color: '#FF9500',
//       message: DEVICE_MESSAGES.MAINTENANCE_REQUIRED
//     };
//   }
  
  return {
    status: 'good',
    color: '#34C759'
  };
};

/**
 * Calculate reading confidence
 */
export const calculateReadingConfidence = (device: Device): number => {
  if (!device.lastReading) return 0;
  
  let confidence = READING_ACCURACY.HIGH;
  
  // Reduce confidence based on battery level
  if (device.batteryLevel && device.batteryLevel < BATTERY_LEVEL.MEDIUM) {
    confidence -= 5;
  }
  
  // Reduce confidence if maintenance is needed
//   if (needsMaintenance(device)) {
//     confidence -= 10;
//   }
  
  // Reduce confidence based on reading age
  if (device.lastReading.timestamp) {
    const hoursSinceLastReading = Math.floor(
      (new Date().getTime() - new Date(device.lastReading.timestamp).getTime()) / (1000 * 3600)
    );
    
    if (hoursSinceLastReading > 12) {
      confidence -= 20;
    } else if (hoursSinceLastReading > 6) {
      confidence -= 10;
    } else if (hoursSinceLastReading > 3) {
      confidence -= 5;
    }
  }
  
  return Math.max(confidence, READING_ACCURACY.LOW);
};

/**
 * Format device ID for display
 */
export const formatDeviceId = (deviceId: string): string => {
  if (deviceId.length <= 8) return deviceId;
  
  return `${deviceId.substring(0, 4)}...${deviceId.substring(deviceId.length - 4)}`;
};

/**
 * Calculate next maintenance date
 */
// export const getNextMaintenanceDate = (device: Device): Date => {
//   const baseDate = device.lastMaintenance 
//     ? new Date(device.lastMaintenance) 
//     : new Date();
  
//   const nextDate = new Date(baseDate);
//   nextDate.setDate(nextDate.getDate() + MAINTENANCE_PERIOD);
  
//   return nextDate;
// };