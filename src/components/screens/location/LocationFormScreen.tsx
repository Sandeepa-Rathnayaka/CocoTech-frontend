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
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { createLocation, updateLocation } from "../../../api/locationApi";
import { getUnassignedDevices } from "../../../api/deviceApi";
import { Device, Location as LocationType } from "../../../types";
import Input from "../../common/Input";
import Button from "../../common/Button";
import { colors } from "../../../constants/colors";
import { validateLocationForm } from "../../../utils/validation";
import { soilTypes } from "../../../constants/config";
import { ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

type LocationFormScreenRouteProp = RouteProp<
  {
    LocationForm: {
      mode: "create" | "edit";
      locationId?: string;
      locationData?: LocationType;
    };
  },
  "LocationForm"
>;

const LocationFormScreen: React.FC = () => {
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [totalTrees, setTotalTrees] = useState("");
  const [soilType, setSoilType] = useState(soilTypes[0]);
  const [showSoilTypePicker, setShowSoilTypePicker] = useState(false);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [plantationDate, setPlantationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigation: any = useNavigation();
  const route = useRoute<LocationFormScreenRouteProp>();
  const { mode, locationId, locationData } = route.params;

  useEffect(() => {
    if (mode === "edit" && locationData) {
      setFormDataFromLocation(locationData);
    }
    loadAvailableDevices();
  }, [mode, locationData]);

  const setFormDataFromLocation = (location: any) => {
    setName(location.name);
    setArea(location.area.toString());
    setTotalTrees(location.totalTrees.toString());
    setSoilType(location.soilType);
    setDescription(location.description || "");
    setLatitude(location.coordinates.latitude.toString());
    setLongitude(location.coordinates.longitude.toString());
    setPlantationDate(new Date(location.plantationDate));
    setIsActive(location.status === "active");
    setDeviceId(location.deviceId);
  };

  const loadAvailableDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await getUnassignedDevices();

      if (mode === "edit" && locationData?.deviceId) {
        const currentDeviceNotInList = !devices.some(
          (device) => device.deviceId === locationData.deviceId
        );

        if (currentDeviceNotInList) {
          devices.unshift({
            _id: "current",
            deviceId: locationData.deviceId,
            type: "unknown",
            status: "active",
            userId: "",
          } as unknown as Device);
        }
      }

      setAvailableDevices(devices);
    } catch (error) {
      // console.error("Failed to load available devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("water-scheduling.locations.permissionDenied"),
          t("water-scheduling.locations.permissionDeniedMessage")
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
    } catch (error) {
      // console.error("Error getting current location:", error);
      Alert.alert(
        t("water-scheduling.locations.locationError"),
        t("water-scheduling.locations.locationErrorMessage")
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = () => {
    const validationResult = validateLocationForm({
      name,
      area: parseFloat(area),
      totalTrees: parseInt(totalTrees),
      soilType,
    });

    if (!validationResult.isValid) {
      const newErrors: { [key: string]: string } = {};
      validationResult.errors.forEach((err) => {
        newErrors[err.field] = err.message;
      });

      // Add coordinate validation
      if (!latitude || isNaN(parseFloat(latitude))) {
        newErrors.latitude = t(
          "water-scheduling.locations.validLatitudeRequired"
        );
      } else if (parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
        newErrors.latitude = t("water-scheduling.locations.latitudeRange");
      }

      if (!longitude || isNaN(parseFloat(longitude))) {
        newErrors.longitude = t(
          "water-scheduling.locations.validLongitudeRequired"
        );
      } else if (parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
        newErrors.longitude = t("water-scheduling.locations.longitudeRange");
      }

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

      const locationData: any = {
        name,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        area: parseFloat(area),
        soilType,
        totalTrees: parseInt(totalTrees),
        plantationDate: plantationDate.toISOString(),
        description: description || undefined,
        deviceId: deviceId || undefined,
        status: isActive ? "active" : "inactive",
      };

      if (mode === "create") {
        await createLocation(locationData);
        Alert.alert(
          t("common.success"),
          t("water-scheduling.locations.locationCreated")
        );
      } else if (mode === "edit" && locationId) {
        await updateLocation(locationId, locationData);
        Alert.alert(
          t("common.success"),
          t("water-scheduling.locations.locationUpdated")
        );
      }

      navigation.goBack();
    } catch (error) {
      // console.error("Failed to save location:", error);
      Alert.alert(
        t("common.error"),
        mode === "create"
          ? t("water-scheduling.locations.failedToCreate")
          : t("water-scheduling.locations.failedToUpdate")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
              ? t("water-scheduling.locations.addNewLocation")
              : t("water-scheduling.locations.editLocation")}
          </Text>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContainer}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("water-scheduling.locations.basicInformation")}
            </Text>

            <Input
              label={t("water-scheduling.locations.locationName")}
              value={name}
              onChangeText={setName}
              placeholder={t(
                "water-scheduling.locations.locationNamePlaceholder"
              )}
              error={errors.name}
              leftIcon="location"
              containerStyle={styles.inputContainer}
            />

            <View style={styles.rowInputs}>
              <Input
                label={t("water-scheduling.locations.area")}
                value={area}
                onChangeText={setArea}
                placeholder={t("water-scheduling.locations.areaPlaceholder")}
                keyboardType="decimal-pad"
                error={errors.area}
                leftIcon="resize"
                containerStyle={
                  [
                    styles.inputContainer,
                    styles.halfInput,
                  ] as unknown as ViewStyle
                }
              />

              <Input
                label={t("water-scheduling.locations.totalTrees")}
                value={totalTrees}
                onChangeText={setTotalTrees}
                placeholder={t("water-scheduling.locations.treesPlaceholder")}
                keyboardType="number-pad"
                error={errors.totalTrees}
                leftIcon="leaf"
                containerStyle={
                  [
                    styles.inputContainer,
                    styles.halfInput,
                  ] as unknown as ViewStyle
                }
              />
            </View>

            {/* Soil Type Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t("water-scheduling.locations.soilType")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  errors.soilType && styles.inputError,
                ]}
                onPress={() => setShowSoilTypePicker(true)}
              >
                <View
                  style={[
                    styles.soilIcon,
                    { backgroundColor: getSoilColor(soilType) },
                  ]}
                />
                <Text style={styles.pickerText}>{soilType}</Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.gray500}
                />
              </TouchableOpacity>
              {errors.soilType && (
                <Text style={styles.errorText}>{errors.soilType}</Text>
              )}
            </View>

            {/* Plantation Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t("water-scheduling.locations.plantationDate")}
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.gray600}
                />
                <Text style={styles.dateText}>
                  {formatDate(plantationDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Status Toggle */}
            {mode === "edit" && (
              <View style={styles.statusContainer}>
                <Text style={styles.label}>
                  {t("water-scheduling.locations.status")}
                </Text>
                <View style={styles.statusToggle}>
                  <Text style={styles.statusLabel}>
                    {isActive ? t("common.active") : t("common.inactive")}
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
            )}

            <Input
              label={t("water-scheduling.locations.descriptionOptional")}
              value={description}
              onChangeText={setDescription}
              placeholder={t(
                "water-scheduling.locations.descriptionPlaceholder"
              )}
              multiline
              numberOfLines={3}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Location Coordinates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("water-scheduling.locations.locationCoordinates")}
            </Text>

            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateInputs}>
                <Input
                  label={t("water-scheduling.locations.latitude")}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder={t(
                    "water-scheduling.locations.latitudePlaceholder"
                  )}
                  keyboardType="decimal-pad"
                  error={errors.latitude}
                  containerStyle={
                    [
                      styles.inputContainer,
                      styles.halfInput,
                    ] as unknown as ViewStyle
                  }
                />

                <Input
                  label={t("water-scheduling.locations.longitude")}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder={t(
                    "water-scheduling.locations.longitudePlaceholder"
                  )}
                  keyboardType="decimal-pad"
                  error={errors.longitude}
                  containerStyle={
                    [
                      styles.inputContainer,
                      styles.halfInput,
                    ] as unknown as ViewStyle
                  }
                />
              </View>

              <Button
                title={t("water-scheduling.locations.getCurrentLocation")}
                leftIcon={
                  <Ionicons name="locate" size={18} color={colors.white} />
                }
                variant="primary"
                size="medium"
                isLoading={isGettingLocation}
                onPress={getCurrentLocation}
                style={styles.locationButton}
              />
            </View>
          </View>

          {/* Device Assignment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("water-scheduling.locations.deviceAssignment")}
            </Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  {t("water-scheduling.locations.loadingAvailableDevices")}
                </Text>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.devicePickerButton}
                  onPress={() => {
                    if (availableDevices.length > 0 || deviceId) {
                      setShowDevicePicker(true);
                    } else {
                      Alert.alert(
                        t("water-scheduling.locations.noDevicesAvailable"),
                        t("water-scheduling.locations.registerDeviceQuestion"),
                        [
                          { text: t("common.cancel"), style: "cancel" },
                          {
                            text: t(
                              "water-scheduling.locations.registerDevice"
                            ),
                            onPress: () =>
                              navigation.navigate("DeviceForm", {
                                mode: "create",
                              }),
                          },
                        ]
                      );
                    }
                  }}
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={22}
                    color={deviceId ? colors.primary : colors.gray600}
                  />
                  <Text
                    style={[
                      styles.devicePickerText,
                      deviceId && styles.activeDeviceText,
                    ]}
                  >
                    {deviceId
                      ? `${t("water-scheduling.locations.device")}: ${deviceId}`
                      : t("water-scheduling.locations.assignDeviceOptional")}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.gray500}
                  />
                </TouchableOpacity>

                {deviceId && (
                  <TouchableOpacity
                    style={styles.removeDeviceButton}
                    onPress={() => {
                      Alert.alert(
                        t("water-scheduling.locations.removeDevice"),
                        t(
                          "water-scheduling.locations.removeDeviceConfirmation"
                        ),
                        [
                          { text: t("common.cancel"), style: "cancel" },
                          {
                            text: t("water-scheduling.locations.remove"),
                            style: "destructive",
                            onPress: () => setDeviceId(undefined),
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color={colors.error}
                    />
                    <Text style={styles.removeDeviceText}>
                      {t("water-scheduling.locations.removeDevice")}
                    </Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.deviceInfoText}>
                  {t("water-scheduling.locations.deviceAssignmentDescription")}
                </Text>
              </View>
            )}
          </View>

          {/* Submit Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              title={
                mode === "create"
                  ? t("water-scheduling.locations.createLocation")
                  : t("water-scheduling.locations.updateLocation")
              }
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={plantationDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setPlantationDate(selectedDate);
            }
          }}
        />
      )}

      {/* Soil Type Picker Modal */}
      {showSoilTypePicker && (
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>
                {t("water-scheduling.locations.selectSoilType")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSoilTypePicker(false)}
                style={styles.pickerCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalContent}>
              {soilTypes.map((type: any) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.soilTypeItem,
                    soilType === type && styles.selectedSoilTypeItem,
                  ]}
                  onPress={() => {
                    setSoilType(type);
                    setShowSoilTypePicker(false);
                  }}
                >
                  <View
                    style={[
                      styles.soilItemIcon,
                      { backgroundColor: getSoilColor(type) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.soilTypeItemText,
                      soilType === type && styles.selectedSoilTypeItemText,
                    ]}
                  >
                    {type}
                  </Text>
                  {soilType === type && (
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

      {/* Device Picker Modal */}
      {showDevicePicker && (
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>
                {t("water-scheduling.locations.selectDevice")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDevicePicker(false)}
                style={styles.pickerCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerModalContent}>
              {/* Option to clear selection */}
              <TouchableOpacity
                style={[
                  styles.deviceItem,
                  !deviceId && styles.selectedDeviceItem,
                ]}
                onPress={() => {
                  setDeviceId(undefined);
                  setShowDevicePicker(false);
                }}
              >
                <View style={styles.deviceItemContent}>
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color={colors.gray600}
                  />
                  <Text style={styles.deviceItemText}>
                    {t("water-scheduling.locations.noDeviceClearSelection")}
                  </Text>
                </View>
                {!deviceId && (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Available devices */}
              {availableDevices.map((device) => (
                <TouchableOpacity
                  key={device.deviceId}
                  style={[
                    styles.deviceItem,
                    deviceId === device.deviceId && styles.selectedDeviceItem,
                  ]}
                  onPress={() => {
                    setDeviceId(device.deviceId);
                    setShowDevicePicker(false);
                  }}
                >
                  <View style={styles.deviceItemContent}>
                    <Ionicons
                      name={getDeviceIcon(device.type) as any}
                      size={22}
                      color={colors.primary}
                    />
                    <View style={styles.deviceItemInfo}>
                      <Text style={styles.deviceItemId}>{device.deviceId}</Text>
                      <Text style={styles.deviceItemType}>
                        {getDeviceTypeName(device.type)}
                      </Text>
                    </View>
                  </View>
                  {deviceId === device.deviceId && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Register new device option */}
              <TouchableOpacity
                style={styles.registerDeviceItem}
                onPress={() => {
                  setShowDevicePicker(false);
                  navigation.navigate("DeviceForm", { mode: "create" });
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.registerDeviceText}>
                  {t("water-scheduling.locations.registerNewDevice")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper functions
const getSoilColor = (soilType: string): string => {
  switch (soilType) {
    case "Lateritic":
      return "#CD7F32"; // Bronze
    case "Sandy Loam":
      return "#DAA520"; // Golden
    case "Cinnamon Sand":
      return "#D2691E"; // Cinnamon
    case "Red Yellow Podzolic":
      return "#A52A2A"; // Brown
    case "Alluvial":
      return "#708090"; // Slate gray
    default:
      return "#8B4513"; // Default brown
  }
};

const getDeviceIcon = (type: string): string => {
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

const getDeviceTypeName = (type: string): string => {
  switch (type) {
    case "soil_sensor":
      return "Soil Sensor";
    case "weather_station":
      return "Weather Station";
    case "irrigation_controller":
      return "Irrigation Controller";
    default:
      return type;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    marginTop: 30,
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
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
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
  soilIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
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
  coordinatesContainer: {
    marginBottom: 8,
  },
  coordinateInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationButton: {
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  devicePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  devicePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeDeviceText: {
    color: colors.primary,
    fontWeight: "500",
  },
  removeDeviceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 16,
  },
  removeDeviceText: {
    color: colors.error,
    fontSize: 14,
    marginLeft: 6,
  },
  deviceInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
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
  soilTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedSoilTypeItem: {
    backgroundColor: colors.primary + "10",
  },
  soilItemIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  soilTypeItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedSoilTypeItemText: {
    fontWeight: "bold",
    color: colors.primary,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedDeviceItem: {
    backgroundColor: colors.primary + "10",
  },
  deviceItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceItemInfo: {
    marginLeft: 12,
  },
  deviceItemId: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  deviceItemType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deviceItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  registerDeviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: 8,
  },
  registerDeviceText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 12,
  },
});

export default LocationFormScreen;
