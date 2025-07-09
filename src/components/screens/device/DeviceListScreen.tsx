import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { getDevices } from "../../../api/deviceApi";
import { getLocationByDeviceId } from "../../../api/locationApi";
import { Device } from "../../../types";
import Card from "../../common/Card";
import StatusBadge from "../../common/StatusBadge";
import { colors } from "../../../constants/colors";
import Button from "../../common/Button";
import { DEVICE_ROUTES } from "../../../constants/routes";

const DeviceListScreen: React.FC = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationMap, setLocationMap] = useState<Record<string, any>>({});
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDevices();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
      
      // Load locations for devices
      const locationsData: Record<string, any> = {};
      for (const device of fetchedDevices) {
        if (device.deviceId) {
          try {
            const location = await getLocationByDeviceId(device.deviceId);
            if (location) {
              locationsData[device.deviceId] = location;
            }
          } catch (error) {
            // console.error(`Failed to load location for device ${device.deviceId}:`, error);
          }
        }
      }
      setLocationMap(locationsData);
      
    } catch (error) {
      // console.error("Failed to load devices:", error);
      Alert.alert(t("common.error"), t("water-scheduling.devices.failedToLoadDevices"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = () => {
    (navigation.navigate as any)('RegisterDevice', {
      mode: "create"
    });
  };
  
  const handleDevicePress = (deviceId: string) => {
    (navigation.navigate as any)(DEVICE_ROUTES.DEVICE_DETAILS, {
      deviceId
    });
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return "battery-dead-outline";
    if (level >= 90) return "battery-full-outline";
    if (level >= 50) return "battery-half-outline";
    if (level >= 20) return "battery-low-outline";
    return "battery-dead-outline";
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return colors.gray500;
    if (level >= 50) return colors.success;
    if (level >= 20) return colors.warning;
    return colors.error;
  };

  const getDeviceTypeIcon = (type: string): string => {
    switch (type) {
      case "soil_sensor":
        return "water-outline";
      case "weather_station":
        return "thermometer-outline";
      case "irrigation_controller":
        return "construct-outline";
      default:
        return "hardware-chip-outline";
    }
  };

  const getDeviceTypeLabel = (type: string): string => {
    switch (type) {
      case "soil_sensor":
        return t("water-scheduling.devices.soilSensor");
      case "weather_station":
        return t("water-scheduling.devices.weatherStation");
      case "irrigation_controller":
        return t("water-scheduling.devices.irrigationController");
      default:
        return type;
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => {
    const locationData = locationMap[item.deviceId];
    
    return (
      <Card
        style={styles.deviceCard}
        onPress={() => handleDevicePress(item.deviceId)}
        variant="elevated"
      >
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceId}>{item.deviceId}</Text>
            <StatusBadge
              status={item.status as any}
              size="small"
            />
          </View>
          
          {item.batteryLevel !== undefined && (
            <View style={styles.batteryContainer}>
              <Ionicons
                //name={getBatteryIcon(item.batteryLevel)}
                size={16}
                color={getBatteryColor(item.batteryLevel)}
              />
              <Text style={styles.batteryText}>{item.batteryLevel}%</Text>
            </View>
          )}
        </View>

        <View style={styles.deviceDetails}>
          <View style={styles.deviceTypeContainer}>
            <Ionicons
              //name={getDeviceTypeIcon(item.type)}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.deviceType}>
              {getDeviceTypeLabel(item.type)}
            </Text>
          </View>

          {item.lastReading && (
            <View style={styles.lastReadingContainer}>
              <Text style={styles.lastReadingLabel}>{t("water-scheduling.devices.lastReading")}:</Text>
              <Text style={styles.lastReadingTime}>
                {new Date(item.lastReading.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>
          )}
        </View>

        {locationData ? (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.gray600} />
            <Text style={styles.locationText}>
              {t("water-scheduling.devices.assignedToLocation", { location: locationData.name })}
            </Text>
          </View>
        ) : (
          <View style={styles.unassignedContainer}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.unassignedText}>{t("water-scheduling.devices.notAssignedToLocation")}</Text>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>{t("water-scheduling.devices.loadingDevices")}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="hardware-chip-outline"
          size={64}
          color={colors.gray400}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{t("water-scheduling.devices.noDevices")}</Text>
        <Text style={styles.emptyText}>
          {t("water-scheduling.devices.noDevicesDescription")}
        </Text>
        <Button
          title={t("water-scheduling.devices.addFirstDevice")}
          onPress={handleAddDevice}
          variant="primary"
          style={styles.addFirstButton}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("water-scheduling.devices.deviceList")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddDevice}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={(item) => item.deviceId}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadDevices}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    marginTop:30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  deviceCard: {
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  deviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  lastReadingContainer: {
    alignItems: 'flex-end',
  },
  lastReadingLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
  lastReadingTime: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  unassignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  unassignedText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    width: 240,
  }
});

export default DeviceListScreen;