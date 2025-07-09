import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Device } from '../../types';
import { colors } from '../../constants/colors';
import { DEVICE_TYPES } from '../../constants/deviceConstants';
import { getBatteryStatus, getConnectivityStatus, getDeviceHealth } from '../../utils/deviceHelpers';
import StatusBadge from '../common/StatusBadge';

interface DeviceCardProps {
  device: Device;
  onPress: (device: Device) => void;
  onStatusToggle?: (device: Device) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  onPress,
  onStatusToggle
}) => {
  const batteryStatus = getBatteryStatus(device.batteryLevel);
  const connectivityStatus = getConnectivityStatus(device);
  const healthInfo = getDeviceHealth(device);
  
  const getDeviceIcon = () => {
    switch(device.type) {
      case 'soil_sensor':
        return 'water-outline';
      case 'weather_station':
        return 'rainy-outline';
      case 'irrigation_controller':
        return 'options-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    switch(type) {
      case DEVICE_TYPES.SOIL_SENSOR:
        return 'Soil Sensor';
      case DEVICE_TYPES.WEATHER_STATION:
        return 'Weather Station';
      case DEVICE_TYPES.IRRIGATION_CONTROLLER:
        return 'Irrigation Controller';
      default:
        return 'Unknown Device';
    }
  };

  const getConnectivityColor = () => {
    switch(connectivityStatus) {
      case 'online': return colors.success;
      case 'intermittent': return colors.warning;
      case 'offline': return colors.error;
    }
  };

  const getConnectivityLabel = () => {
    switch(connectivityStatus) {
      case 'online': return 'Online';
      case 'intermittent': return 'Intermittent';
      case 'offline': return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch(device.status) {
      case 'active': return colors.success;
      case 'inactive': return colors.gray600;
      case 'maintenance': return colors.warning;
      default: return colors.gray600;
    }
  };

  const getLastUpdateText = () => {
    if (!device.lastReading?.timestamp) return 'No data';
    
    const lastUpdate = new Date(device.lastReading.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={getDeviceIcon()} size={24} color={colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.deviceName} numberOfLines={1} ellipsizeMode="tail">
              {device.deviceId}
            </Text>
            <Text style={styles.deviceType}>
              {getDeviceTypeLabel(device.type)}
            </Text>
          </View>
          {onStatusToggle && (
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => onStatusToggle(device)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={device.status === 'active' ? 'power' : 'power-outline'} 
                size={20} 
                color={device.status === 'active' ? colors.success : colors.gray600} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.statusRow}>
          <StatusBadge 
            status={device.status}
            //color={getStatusColor()}
          />
          <View style={styles.statusIndicator}>
            <View 
              style={[
                styles.connectivityDot, 
                { backgroundColor: getConnectivityColor() }
              ]} 
            />
            <Text style={styles.connectivityLabel}>
              {getConnectivityLabel()}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.gray600} />
            <Text style={styles.infoText}>
              Last Update: {getLastUpdateText()}
            </Text>
          </View>
          
          {device.batteryLevel !== undefined && (
            <View style={styles.infoItem}>
              <Ionicons 
                name={
                  device.batteryLevel > 50 
                    ? 'battery-full-outline'
                    : device.batteryLevel > 20
                      ? 'battery-half-outline'
                      : 'battery-dead-outline'
                }
                size={16} 
                color={batteryStatus.color} 
              />
              <Text style={styles.infoText}>
                Battery: {device.batteryLevel}% ({batteryStatus.status})
              </Text>
            </View>
          )}
          
          {/* {device.lastMaintenance && (
            <View style={styles.infoItem}>
              <Ionicons name="construct-outline" size={16} color={colors.gray600} />
              <Text style={styles.infoText}>
                Maintenance: {new Date(device.lastMaintenance).toLocaleDateString()}
              </Text>
            </View>
          )} */}
        </View>

        {healthInfo.message && (
          <View style={[styles.alertContainer, { backgroundColor: `${healthInfo.color}20` }]}>
            <Ionicons 
              name={healthInfo.status === 'critical' ? 'alert-circle' : 'warning'} 
              size={18}
              color={healthInfo.color}
            />
            <Text style={[styles.alertText, { color: healthInfo.color }]}>
              {healthInfo.message}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  deviceType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleButton: {
    padding: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  connectivityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectivityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  alertText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
});

export default DeviceCard;