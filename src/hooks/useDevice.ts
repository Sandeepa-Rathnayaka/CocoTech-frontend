import { useState, useCallback, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

import { useDevice as useDeviceContext } from "../context/DeviceContext";
import { Device } from "../types";
import { DEVICE_ROUTES } from "../constants/routes";
import {
  getDeviceHealth,
  getBatteryStatus,
  //needsMaintenance,
  areReadingsOutdated,
  calculateReadingConfidence,
} from "../utils/deviceHelpers";

export const useDevice = (deviceId?: string) => {
  const navigation:any = useNavigation();
  const {
    devices,
    isLoading: isContextLoading,
    error: contextError,
    refreshDevices,
    getDeviceById,
    updateDevice,
    deleteDevice,
    updateDeviceReading,
  } = useDeviceContext();

  const [device, setDevice] = useState<Device | undefined>(
    deviceId ? getDeviceById(deviceId) : undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(isContextLoading);
  const [error, setError] = useState<string | null>(contextError);

  // Update local state when context changes
  useEffect(() => {
    if (deviceId) {
      const foundDevice = getDeviceById(deviceId);
      setDevice(foundDevice);
    }
  }, [deviceId, devices, getDeviceById]);

  useEffect(() => {
    setIsLoading(isContextLoading);
  }, [isContextLoading]);

  useEffect(() => {
    setError(contextError);
  }, [contextError]);

  // Navigate to device details
  const navigateToDeviceDetails = useCallback(
    (id: string, deviceName?: string) => {
      navigation.navigate(
        DEVICE_ROUTES.DEVICE_DETAILS as never,
        {
          deviceId: id,
          title: deviceName || "Device Details",
        } as never
      );
    },
    [navigation]
  );

  // Navigate to edit device
  const navigateToEditDevice = useCallback(
    (id: string, deviceName?: string) => {
      navigation.navigate(
        DEVICE_ROUTES.EDIT_DEVICE as never,
        {
          deviceId: id,
          title: `Edit ${deviceName || "Device"}`,
        } as never
      );
    },
    [navigation]
  );

  // Toggle device status
  const toggleDeviceStatus = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        await updateDevice(id, { status: newStatus });
        return true;
      } catch (err) {
        return false;
      }
    },
    [updateDevice]
  );

  // Handle device deletion with confirmation
  const handleDeleteDevice = useCallback(
    (id: string, deviceName?: string) => {
      Alert.alert(
        "Delete Device",
        `Are you sure you want to delete ${
          deviceName || "this device"
        }? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);
                await deleteDevice(id);
                navigation.goBack();
              } catch (err) {
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    },
    [deleteDevice, navigation]
  );

  // Mark device as needing maintenance
  const markForMaintenance = useCallback(
    async (id: string) => {
      try {
        await updateDevice(id, { status: "maintenance" });
        return true;
      } catch (err) {
        return false;
      }
    },
    [updateDevice]
  );

  // Complete maintenance
  const completeMaintenance = useCallback(
    async (id: string) => {
      try {
        await updateDevice(id, {
          status: "active",
          //lastMaintenance: new Date()
        });
        return true;
      } catch (err) {
        return false;
      }
    },
    [updateDevice]
  );

  // Get device analysis (health, battery, maintenance needs)
  const getDeviceAnalysis = useCallback(
    (deviceToAnalyze: Device | undefined = device) => {
      if (!deviceToAnalyze) return null;

      return {
        health: getDeviceHealth(deviceToAnalyze),
        battery: getBatteryStatus(deviceToAnalyze.batteryLevel),
        //needsMaintenance: needsMaintenance(deviceToAnalyze),
        readingsOutdated: areReadingsOutdated(deviceToAnalyze),
        readingConfidence: calculateReadingConfidence(deviceToAnalyze),
      };
    },
    [device]
  );

  return {
    device,
    devices,
    isLoading,
    error,
    refreshDevices,
    navigateToDeviceDetails,
    navigateToEditDevice,
    toggleDeviceStatus,
    handleDeleteDevice,
    markForMaintenance,
    completeMaintenance,
    updateDeviceReading,
    getDeviceAnalysis,
  };
};
