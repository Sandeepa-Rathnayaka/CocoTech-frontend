import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  registerDevice,
  updateDevice,
  getDeviceById,
} from "../../../api/deviceApi";
import { Device } from "../../../types";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { colors } from "../../../constants/colors";
import { useTranslation } from "react-i18next";

type DeviceFormScreenRouteProp = RouteProp<
  {
    DeviceForm: {
      mode: "create" | "edit";
      deviceId?: string;
      deviceData?: Device;
    };
  },
  "DeviceForm"
>;

const DeviceFormScreen: React.FC = () => {
  const { t } = useTranslation();
  
  // Device types with translation keys
  const deviceTypes = [
    { value: "soil_sensor", label: t("water-scheduling.devices.soilSensor") },
    { value: "moisture_sensor", label: t("water-scheduling.devices.moistureSensor") },
  ];

  // Form state
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState(deviceTypes[0].value);
  const [showDeviceTypePicker, setShowDeviceTypePicker] = useState(false);
  const [firmware, setFirmware] = useState("1.0.0");
  const [isActive, setIsActive] = useState(true);
  const [readingInterval, setReadingInterval] = useState("30");
  const [reportingInterval, setReportingInterval] = useState("60");
  const [moistureThreshold, setMoistureThreshold] = useState("30");
  const [temperatureThreshold, setTemperatureThreshold] = useState("35");
  const [humidityThreshold, setHumidityThreshold] = useState("70");
  const [batteryLevel, setBatteryLevel] = useState("100");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const navigation = useNavigation();
  const route = useRoute<DeviceFormScreenRouteProp>();
  const { mode, deviceId: routeDeviceId, deviceData } = route.params;

  useEffect(() => {
    if (mode === "edit") {
      if (deviceData) {
        setFormDataFromDevice(deviceData);
      } else if (routeDeviceId) {
        loadDeviceData(routeDeviceId);
      }
    }
  }, [mode, routeDeviceId, deviceData]);

  const loadDeviceData = async (id: string) => {
    try {
      setIsLoading(true);
      const device = await getDeviceById(id);
      setFormDataFromDevice(device);
    } catch (error) {
      // console.error("Failed to load device data:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.devices.failedToLoad")
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const setFormDataFromDevice = (device: Device) => {
    setDeviceId(device.deviceId);
    setDeviceType(device.type);
    //setFirmware(device.firmware);
    setIsActive(device.status === "active");
    setReadingInterval(device.settings?.readingInterval?.toString() || "30");
    setReportingInterval(
      device.settings?.reportingInterval?.toString() || "60"
    );

    if (device.settings?.thresholds) {
      setMoistureThreshold(
        device.settings.thresholds.moisture?.toString() || "30"
      );
      setTemperatureThreshold(
        device.settings.thresholds.temperature?.toString() || "35"
      );
      setHumidityThreshold(
        device.settings.thresholds.humidity?.toString() || "70"
      );
    }

    if (device.batteryLevel) {
      setBatteryLevel(device.batteryLevel.toString());
    }

    // Show advanced settings if they were configured
    if (
      device.settings?.thresholds?.moisture ||
      device.settings?.thresholds?.temperature ||
      device.settings?.thresholds?.humidity
    ) {
      setShowAdvancedSettings(true);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Device ID validation
    if (!deviceId) {
      newErrors.deviceId = t("water-scheduling.devices.deviceIdRequired");
    } else if (deviceId.length < 3) {
      newErrors.deviceId = t("water-scheduling.devices.deviceIdMinLength");
    }

    // Firmware validation
    if (!firmware) {
      newErrors.firmware = t("water-scheduling.devices.firmwareRequired");
    }

    // Interval validations
    if (!readingInterval || isNaN(Number(readingInterval))) {
      newErrors.readingInterval = t("water-scheduling.devices.readingIntervalNumber");
    } else if (Number(readingInterval) < 1 || Number(readingInterval) > 1440) {
      newErrors.readingInterval = t("water-scheduling.devices.readingIntervalRange");
    }

    if (!reportingInterval || isNaN(Number(reportingInterval))) {
      newErrors.reportingInterval = t("water-scheduling.devices.reportingIntervalNumber");
    } else if (
      Number(reportingInterval) < 1 ||
      Number(reportingInterval) > 1440
    ) {
      newErrors.reportingInterval = t("water-scheduling.devices.reportingIntervalRange");
    }

    // Advanced settings validation (only if visible)
    if (showAdvancedSettings) {
      if (
        moistureThreshold &&
        (!isNumeric(moistureThreshold) ||
          Number(moistureThreshold) < 0 ||
          Number(moistureThreshold) > 100)
      ) {
        newErrors.moistureThreshold = t("water-scheduling.devices.moistureThresholdRange");
      }

      if (
        temperatureThreshold &&
        (!isNumeric(temperatureThreshold) ||
          Number(temperatureThreshold) < -50 ||
          Number(temperatureThreshold) > 100)
      ) {
        newErrors.temperatureThreshold = t("water-scheduling.devices.temperatureThresholdRange");
      }

      if (
        humidityThreshold &&
        (!isNumeric(humidityThreshold) ||
          Number(humidityThreshold) < 0 ||
          Number(humidityThreshold) > 100)
      ) {
        newErrors.humidityThreshold = t("water-scheduling.devices.humidityThresholdRange");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const deviceData:any = {
        deviceId,
        type: deviceType,
        firmware,
        status: isActive ? "active" : "inactive",
        settings: {
          readingInterval: Number(readingInterval),
          reportingInterval: Number(reportingInterval),
          thresholds: showAdvancedSettings
            ? {
                moisture: moistureThreshold
                  ? Number(moistureThreshold)
                  : undefined,
                temperature: temperatureThreshold
                  ? Number(temperatureThreshold)
                  : undefined,
                humidity: humidityThreshold
                  ? Number(humidityThreshold)
                  : undefined,
              }
            : undefined,
        },
        batteryLevel: Number(batteryLevel),
      };

      if (mode === "create") {
        await registerDevice(deviceData);
        Alert.alert(t("common.success"), t("water-scheduling.devices.deviceRegistered"));
      } else {
        await updateDevice(routeDeviceId || deviceId, deviceData);
        Alert.alert(t("common.success"), t("water-scheduling.devices.deviceUpdated"));
      }

      navigation.goBack();
    } catch (error) {
      // console.error("Failed to save device:", error);
      Alert.alert(
        t("common.error"),
        mode === "create" 
          ? t("water-scheduling.devices.failedToRegister") 
          : t("water-scheduling.devices.failedToUpdate")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("water-scheduling.devices.loadingDevice")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === "create" 
              ? t("water-scheduling.devices.registerDevice") 
              : t("water-scheduling.devices.editDevice")}
          </Text>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContainer}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("water-scheduling.devices.deviceInformation")}</Text>

            <Input
              label={t("water-scheduling.devices.deviceId")}
              value={deviceId}
              onChangeText={setDeviceId}
              placeholder={t("water-scheduling.devices.deviceIdPlaceholder")}
              error={errors.deviceId}
              leftIcon="hardware-chip-outline"
              containerStyle={styles.inputContainer}
              editable={mode === "create"} // Only editable when creating
            />

            {/* Device Type Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("water-scheduling.devices.deviceType")}</Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  errors.deviceType && styles.inputError,
                ]}
                onPress={() => setShowDeviceTypePicker(true)}
                disabled={mode === "edit"} // Disable in edit mode
              >
                <Ionicons
                  //name={getDeviceTypeIcon(deviceType)}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.pickerText}>
                  {getDeviceTypeLabel(deviceType)}
                </Text>
                {mode === "create" && (
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.gray500}
                  />
                )}
              </TouchableOpacity>
              {errors.deviceType && (
                <Text style={styles.errorText}>{errors.deviceType}</Text>
              )}
            </View>

            <Input
              label={t("water-scheduling.devices.firmware")}
              value={firmware}
              onChangeText={setFirmware}
              placeholder={t("water-scheduling.devices.firmwarePlaceholder")}
              error={errors.firmware}
              leftIcon="code-outline"
              containerStyle={styles.inputContainer}
            />

            {/* Active Status Toggle */}
            <View style={styles.statusContainer}>
              <Text style={styles.label}>{t("water-scheduling.devices.status")}</Text>
              <View style={styles.statusToggle}>
                <Text style={styles.statusLabel}>
                  {isActive 
                    ? t("water-scheduling.devices.statusActive") 
                    : t("water-scheduling.devices.statusInactive")}
                </Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{
                    false: colors.gray300,
                    true: colors.primary + "80",
                  }}
                  thumbColor={isActive ? colors.primary : colors.gray500}
                />
              </View>
            </View>
          </View>
          {/* Submit Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              title={mode === "create" 
                ? t("water-scheduling.devices.registerDevice") 
                : t("water-scheduling.devices.updateDevice")}
              variant="primary"
              size="large"
              isLoading={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitButton}
            />

            <Button
              title={t("common.cancel")}
              variant="outline"
              size="large"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Device Type Picker Modal */}
      {showDeviceTypePicker && (
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>{t("water-scheduling.devices.selectDeviceType")}</Text>
              <TouchableOpacity
                onPress={() => setShowDeviceTypePicker(false)}
                style={styles.pickerCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalContent}>
              {deviceTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeItem,
                    deviceType === type.value && styles.selectedTypeItem,
                  ]}
                  onPress={() => {
                    setDeviceType(type.value);
                    setShowDeviceTypePicker(false);
                  }}
                >
                  <Ionicons
                    size={24}
                    color={
                      deviceType === type.value
                        ? colors.primary
                        : colors.gray600
                    }
                  />
                  <Text
                    style={[
                      styles.typeItemText,
                      deviceType === type.value && styles.selectedTypeItemText,
                    ]}
                  >
                    {type.label}
                  </Text>
                  {deviceType === type.value && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper functions
const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value));
};

const getDeviceTypeLabel = (type: string): string => {
  const { t } = useTranslation();
  switch (type) {
    case "soil_sensor":
      return t("water-scheduling.devices.soilSensor");
    case "moisture_sensor":
      return t("water-scheduling.devices.moistureSensor");
    default:
      return type;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    marginTop:30
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray600,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  placeholderButton: {
    width: 32,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  advancedSettingsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    marginBottom: 16,
  },
  advancedSettingsText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  advancedSettings: {
    paddingTop: 8,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  thresholdsInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 8,
  },
  buttonsContainer: {
    marginTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: colors.gray400,
  },
  pickerModalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContainer: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  pickerCloseButton: {
    padding: 4,
  },
  pickerModalContent: {
    paddingVertical: 8,
    maxHeight: 400,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedTypeItem: {
    backgroundColor: colors.primary + "10",
  },
  typeItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  selectedTypeItemText: {
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default DeviceFormScreen;