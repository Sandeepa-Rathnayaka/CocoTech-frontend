import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Device } from "../../types";
import { colors } from "../../constants/colors";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  DEVICE_TYPES,
  DEVICE_STATUS,
  DEFAULT_SETTINGS,
} from "../../constants/deviceConstants";
import { useDevice } from "../../hooks/useDevice";

interface DeviceFormProps {
  device?: any;
  onSubmit: (deviceData: Partial<Device>) => Promise<void>;
  isLoading: boolean;
}

const DeviceForm: React.FC<DeviceFormProps> = ({
  device,
  onSubmit,
  isLoading,
}) => {
  const isEditMode = !!device;

  // Form fields
  const [deviceId, setDeviceId] = useState("");
  const [type, setType] = useState<string>(DEVICE_TYPES.SOIL_SENSOR);
  const [status, setStatus] = useState<string>(DEVICE_STATUS.ACTIVE);
  const [firmware, setFirmware] = useState("1.0.0");
  const [readingInterval, setReadingInterval] = useState(
    DEFAULT_SETTINGS.readingInterval.toString()
  );
  const [reportingInterval, setReportingInterval] = useState(
    DEFAULT_SETTINGS.reportingInterval.toString()
  );
  const [thresholdMoisture, setThresholdMoisture] = useState(
    DEFAULT_SETTINGS.thresholds.moisture?.toString() || "30"
  );
  const [thresholdTemperature, setThresholdTemperature] = useState(
    DEFAULT_SETTINGS.thresholds.temperature?.toString() || "35"
  );
  const [thresholdHumidity, setThresholdHumidity] = useState(
    DEFAULT_SETTINGS.thresholds.humidity?.toString() || "70"
  );
  const [isActive, setIsActive] = useState(true);

  // Type selector modal
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data if in edit mode
  useEffect(() => {
    if (device) {
      setDeviceId(device.deviceId || "");
      setType(device.type || DEVICE_TYPES.SOIL_SENSOR);
      setStatus(device.status || DEVICE_STATUS.ACTIVE);
      setFirmware(device.firmware || "1.0.0");
      setReadingInterval(
        device.settings?.readingInterval?.toString() ||
          DEFAULT_SETTINGS.readingInterval.toString()
      );
      setReportingInterval(
        device.settings?.reportingInterval?.toString() ||
          DEFAULT_SETTINGS.reportingInterval.toString()
      );
      setThresholdMoisture(
        device.settings?.thresholds?.moisture?.toString() ||
          DEFAULT_SETTINGS.thresholds.moisture?.toString() ||
          "30"
      );
      setThresholdTemperature(
        device.settings?.thresholds?.temperature?.toString() ||
          DEFAULT_SETTINGS.thresholds.temperature?.toString() ||
          "35"
      );
      setThresholdHumidity(
        device.settings?.thresholds?.humidity?.toString() ||
          DEFAULT_SETTINGS.thresholds.humidity?.toString() ||
          "70"
      );
      setIsActive(device.isActive !== undefined ? device.isActive : true);
    }
  }, [device]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!deviceId.trim()) {
      newErrors.deviceId = "Device ID is required";
    } else if (deviceId.length < 3) {
      newErrors.deviceId = "Device ID must be at least 3 characters";
    }

    if (!firmware.trim()) {
      newErrors.firmware = "Firmware version is required";
    }

    if (!readingInterval.trim() || isNaN(Number(readingInterval))) {
      newErrors.readingInterval = "Reading interval must be a number";
    } else if (Number(readingInterval) < 1 || Number(readingInterval) > 1440) {
      newErrors.readingInterval =
        "Reading interval must be between 1 and 1440 minutes";
    }

    if (!reportingInterval.trim() || isNaN(Number(reportingInterval))) {
      newErrors.reportingInterval = "Reporting interval must be a number";
    } else if (
      Number(reportingInterval) < 1 ||
      Number(reportingInterval) > 1440
    ) {
      newErrors.reportingInterval =
        "Reporting interval must be between 1 and 1440 minutes";
    }

    if (
      thresholdMoisture &&
      (!thresholdMoisture.trim() || isNaN(Number(thresholdMoisture)))
    ) {
      newErrors.thresholdMoisture = "Moisture threshold must be a number";
    } else if (
      thresholdMoisture &&
      (Number(thresholdMoisture) < 0 || Number(thresholdMoisture) > 100)
    ) {
      newErrors.thresholdMoisture =
        "Moisture threshold must be between 0 and 100";
    }

    if (
      thresholdTemperature &&
      (!thresholdTemperature.trim() || isNaN(Number(thresholdTemperature)))
    ) {
      newErrors.thresholdTemperature = "Temperature threshold must be a number";
    } else if (
      thresholdTemperature &&
      (Number(thresholdTemperature) < -50 || Number(thresholdTemperature) > 100)
    ) {
      newErrors.thresholdTemperature =
        "Temperature threshold must be between -50 and 100";
    }

    if (
      thresholdHumidity &&
      (!thresholdHumidity.trim() || isNaN(Number(thresholdHumidity)))
    ) {
      newErrors.thresholdHumidity = "Humidity threshold must be a number";
    } else if (
      thresholdHumidity &&
      (Number(thresholdHumidity) < 0 || Number(thresholdHumidity) > 100)
    ) {
      newErrors.thresholdHumidity =
        "Humidity threshold must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const deviceData: any = {
      deviceId,
      type,
      status,
      firmware,
      isActive,
      settings: {
        readingInterval: Number(readingInterval),
        reportingInterval: Number(reportingInterval),
        thresholds: {
          moisture: thresholdMoisture ? Number(thresholdMoisture) : undefined,
          temperature: thresholdTemperature
            ? Number(thresholdTemperature)
            : undefined,
          humidity: thresholdHumidity ? Number(thresholdHumidity) : undefined,
        },
      },
    };

    try {
      await onSubmit(deviceData);
    } catch (error) {
      // Error handling is done at the screen level
    }
  };

  const getDeviceTypeLabel = (deviceType: string): string => {
    switch (deviceType) {
      case DEVICE_TYPES.SOIL_SENSOR:
        return "Soil Sensor";
      case DEVICE_TYPES.WEATHER_STATION:
        return "Weather Station";
      case DEVICE_TYPES.IRRIGATION_CONTROLLER:
        return "Irrigation Controller";
      default:
        return "Unknown Type";
    }
  };

  const renderTypeSelector = () => {
    if (!showTypeSelector) return null;

    const deviceTypes = [
      {
        value: DEVICE_TYPES.SOIL_SENSOR,
        label: "Soil Sensor",
        icon: "water-outline",
      },
      {
        value: DEVICE_TYPES.WEATHER_STATION,
        label: "Weather Station",
        icon: "rainy-outline",
      },
      {
        value: DEVICE_TYPES.IRRIGATION_CONTROLLER,
        label: "Irrigation Controller",
        icon: "options-outline",
      },
    ];

    return (
      <View style={styles.typeSelectorContainer}>
        <View style={styles.typeSelectorContent}>
          <View style={styles.typeSelectorHeader}>
            <Text style={styles.typeSelectorTitle}>Select Device Type</Text>
            <TouchableOpacity
              onPress={() => setShowTypeSelector(false)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.gray600} />
            </TouchableOpacity>
          </View>

          {deviceTypes.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.typeOption,
                type === item.value && styles.selectedTypeOption,
              ]}
              onPress={() => {
                setType(item.value);
                setShowTypeSelector(false);
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={type === item.value ? colors.primary : colors.gray600}
              />
              <Text
                style={[
                  styles.typeOptionLabel,
                  type === item.value && styles.selectedTypeOptionLabel,
                ]}
              >
                {item.label}
              </Text>
              {type === item.value && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            label="Device ID"
            value={deviceId}
            onChangeText={setDeviceId}
            placeholder="Enter device ID"
            error={errors.deviceId}
            editable={!isEditMode}
            leftIcon="barcode-outline"
          />

          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowTypeSelector(true)}
            disabled={isEditMode}
          >
            <Text style={styles.selectInputLabel}>Device Type</Text>
            <View style={styles.selectInputValue}>
              <Ionicons
                name={
                  type === DEVICE_TYPES.SOIL_SENSOR
                    ? "water-outline"
                    : type === DEVICE_TYPES.WEATHER_STATION
                    ? "rainy-outline"
                    : "options-outline"
                }
                size={20}
                color={colors.gray600}
                style={styles.selectInputIcon}
              />
              <Text style={styles.selectInputText}>
                {getDeviceTypeLabel(type)}
              </Text>
              {!isEditMode && (
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.gray600}
                />
              )}
            </View>
          </TouchableOpacity>

          <Input
            label="Firmware Version"
            value={firmware}
            onChangeText={setFirmware}
            placeholder="e.g. 1.0.0"
            error={errors.firmware}
            leftIcon="code-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>

          <Input
            label="Reading Interval (minutes)"
            value={readingInterval}
            onChangeText={setReadingInterval}
            placeholder="e.g. 30"
            keyboardType="numeric"
            error={errors.readingInterval}
            leftIcon="time-outline"
          />

          <Input
            label="Reporting Interval (minutes)"
            value={reportingInterval}
            onChangeText={setReportingInterval}
            placeholder="e.g. 60"
            keyboardType="numeric"
            error={errors.reportingInterval}
            leftIcon="cloud-upload-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thresholds</Text>
          <Text style={styles.sectionSubtitle}>
            Alert thresholds for sensor readings
          </Text>

          <Input
            label="Moisture Threshold (%)"
            value={thresholdMoisture}
            onChangeText={setThresholdMoisture}
            placeholder="e.g. 30"
            keyboardType="numeric"
            error={errors.thresholdMoisture}
            leftIcon="water-outline"
          />

          <Input
            label="Temperature Threshold (°C)"
            value={thresholdTemperature}
            onChangeText={setThresholdTemperature}
            placeholder="e.g. 35"
            keyboardType="numeric"
            error={errors.thresholdTemperature}
            leftIcon="thermometer-outline"
          />

          <Input
            label="Humidity Threshold (%)"
            value={thresholdHumidity}
            onChangeText={setThresholdHumidity}
            placeholder="e.g. 70"
            keyboardType="numeric"
            error={errors.thresholdHumidity}
            leftIcon="water-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Ionicons name="power" size={20} color={colors.gray700} />
              <Text style={styles.switchText}>Device Active</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{
                false: colors.gray300,
                true: `${colors.primary}80`,
              }}
              thumbColor={isActive ? colors.primary : colors.gray500}
              ios_backgroundColor={colors.gray300}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isEditMode ? "Update Device" : "Register Device"}
            onPress={handleSubmit}
            isLoading={isLoading}
            loadingText={isEditMode ? "Updating..." : "Registering..."}
            variant="primary"
            size="large"
          />
        </View>
      </ScrollView>

      {renderTypeSelector()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -12,
    marginBottom: 16,
  },
  selectInput: {
    marginBottom: 16,
  },
  selectInputLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "500",
  },
  selectInputValue: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  selectInputIcon: {
    marginRight: 12,
  },
  selectInputText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  typeSelectorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  typeSelectorContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: "80%",
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  typeSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  typeSelectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: `${colors.primary}15`,
  },
  typeOptionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 16,
    flex: 1,
  },
  selectedTypeOptionLabel: {
    color: colors.primary,
    fontWeight: "500",
  },
});

export default DeviceForm;
