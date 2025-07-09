import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import * as deviceApi from "../api/deviceApi";
import { Device } from "../types";
import { useAuth } from "./AuthContext";

interface DeviceContextType {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
  getDeviceById: (id: string) => Device | undefined;
  registerDevice: (deviceData: Partial<Device>) => Promise<Device>;
  updateDevice: (id: string, deviceData: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;
  updateDeviceReading: (deviceId: string, reading: any) => Promise<Device>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshDevices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedDevices = await deviceApi.getDevices();
      setDevices(fetchedDevices);
    } catch (err: any) {
      setError(err.message || "Failed to fetch devices");
      Alert.alert("Error", "Failed to load devices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshDevices();
    } else {
      setDevices([]);
    }
  }, [user]);

  const getDeviceById = (id: string): Device | undefined => {
    return devices.find(
      (device) => device._id === id || device.deviceId === id
    );
  };

  const registerDevice = async (deviceData: any): Promise<Device> => {
    try {
      setIsLoading(true);
      const newDevice = await deviceApi.registerDevice(deviceData);
      setDevices((prevDevices) => [...prevDevices, newDevice]);
      return newDevice;
    } catch (err: any) {
      setError(err.message || "Failed to register device");
      Alert.alert(
        "Error",
        err.message || "Failed to register device. Please try again."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDevice = async (
    id: string,
    deviceData: Partial<Device>
  ): Promise<Device> => {
    try {
      setIsLoading(true);
      const updatedDevice = await deviceApi.updateDevice(id, deviceData);
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device._id === id || device.deviceId === id ? updatedDevice : device
        )
      );
      return updatedDevice;
    } catch (err: any) {
      setError(err.message || "Failed to update device");
      Alert.alert("Error", "Failed to update device. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDevice = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      await deviceApi.deleteDevice(id);
      setDevices((prevDevices) =>
        prevDevices.filter(
          (device) => device._id !== id && device.deviceId !== id
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to delete device");
      Alert.alert("Error", "Failed to delete device. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeviceReading = async (
    deviceId: string,
    reading: any
  ): Promise<Device> => {
    try {
      setIsLoading(true);
      const updatedDevice = await deviceApi.updateDeviceReading(
        deviceId,
        reading
      );
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.deviceId === deviceId ? updatedDevice : device
        )
      );
      return updatedDevice;
    } catch (err: any) {
      setError(err.message || "Failed to update device reading");
      Alert.alert(
        "Error",
        "Failed to update device reading. Please try again."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    devices,
    isLoading,
    error,
    refreshDevices,
    getDeviceById,
    registerDevice,
    updateDevice,
    deleteDevice,
    updateDeviceReading,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};
