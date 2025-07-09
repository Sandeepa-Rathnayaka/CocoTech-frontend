import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { createSchedule } from "../../../api/wateringApi";
import { getLocations } from "../../../api/locationApi";
import { Location } from "../../../types";
import { colors } from "../../../constants/colors";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import { estimateWaterNeed } from "../../../utils/wateringHelpers";
import { useTranslation } from "react-i18next";

type CreateScheduleScreenRouteProp = RouteProp<
  {
    CreateSchedule: {
      locationId?: string;
    };
  },
  "CreateSchedule"
>;

const CreateScheduleScreen: React.FC = () => {
  const { t } = useTranslation();

  // Form state
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [soilMoisture10cm, setSoilMoisture10cm] = useState("");
  const [soilMoisture20cm, setSoilMoisture20cm] = useState("");
  const [soilMoisture30cm, setSoilMoisture30cm] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [isNow, setIsNow] = useState(true);
  const [notes, setNotes] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [estimatedWaterAmount, setEstimatedWaterAmount] = useState<
    number | null
  >(null);
  // New state for date picker mode
  const [mode, setMode] = useState<"date" | "time">("date");

  const navigation: any = useNavigation();
  const route = useRoute<CreateScheduleScreenRouteProp>();

  useEffect(() => {
    loadLocations();

    // If locationId is provided in route params, use it
    if (route.params?.locationId) {
      setLocationId(route.params.locationId);
    }
  }, []);

  useEffect(() => {
    // When locationId changes, find the corresponding location
    if (locationId && locations.length > 0) {
      const location = locations.find((loc) => loc._id === locationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [locationId, locations]);

  // Estimate water need when soil moisture values change
  useEffect(() => {
    if (
      soilMoisture10cm &&
      soilMoisture20cm &&
      soilMoisture30cm &&
      !isNaN(Number(soilMoisture10cm)) &&
      !isNaN(Number(soilMoisture20cm)) &&
      !isNaN(Number(soilMoisture30cm))
    ) {
      // Basic estimation without real weather data
      const estimatedAmount = estimateWaterNeed(
        {
          moisture10cm: Number(soilMoisture10cm),
          moisture20cm: Number(soilMoisture20cm),
          moisture30cm: Number(soilMoisture30cm),
        },
        28, // Default temperature
        0 // Default rainfall (none)
      );

      setEstimatedWaterAmount(estimatedAmount);
    } else {
      setEstimatedWaterAmount(null);
    }
  }, [soilMoisture10cm, soilMoisture20cm, soilMoisture30cm]);

  const loadLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);

      if (fetchedLocations.length === 0) {
        Alert.alert(
          t("water-scheduling.schedule.noLocations"),
          t("water-scheduling.schedule.createLocationPrompt"),
          [
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            {
              text: t("water-scheduling.schedule.createLocation"),
              onPress: () =>
                navigation.navigate("LocationForm", { mode: "create" }),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to load locations:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.schedule.failedToLoadLocations")
      );
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const validateForm = (): boolean => {
    if (!locationId) {
      Alert.alert(
        t("common.error"),
        t("water-scheduling.schedule.pleaseSelectLocation")
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const scheduleData = {
        soilConditions: {
          moisture10cm: Number(soilMoisture10cm),
          moisture20cm: Number(soilMoisture20cm),
          moisture30cm: Number(soilMoisture30cm),
        },
        date: isNow ? undefined : scheduleDate.toISOString(),
        notes: notes || undefined,
      };

      if (!locationId) {
        throw new Error(t("water-scheduling.schedule.noLocationSelected"));
      }

      await createSchedule(locationId, scheduleData);

      Alert.alert(
        t("common.success"),
        t("water-scheduling.schedule.scheduleCreated"),
        [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Failed to create schedule:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.schedule.failedToCreateSchedule")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // New function to handle showing the date picker
  const showDateTimePicker = () => {
    if (Platform.OS === "android") {
      // First show date picker on Android
      setMode("date");
    }
    setShowDatePicker(true);
  };

  // New function to handle date/time change
  const handleDateChange = (event: any, selectedDate: any) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || scheduleDate;

    if (Platform.OS === "android") {
      if (mode === "date") {
        // After selecting date on Android, show time picker
        setScheduleDate(currentDate);
        setMode("time");
      } else {
        // After selecting time on Android, combine date and time and hide picker
        const combinedDate = new Date(scheduleDate);
        combinedDate.setHours(currentDate.getHours());
        combinedDate.setMinutes(currentDate.getMinutes());
        setScheduleDate(combinedDate);
        setShowDatePicker(false);
      }
    } else {
      // iOS handles date and time in one picker
      setScheduleDate(currentDate);
      setShowDatePicker(false);
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        locationId === item._id && styles.selectedLocationItem,
      ]}
      onPress={() => {
        setLocationId(item._id);
        setShowLocationPicker(false);
      }}
    >
      <View style={styles.locationItemContent}>
        <Ionicons
          name="location"
          size={22}
          color={locationId === item._id ? colors.primary : colors.gray600}
        />
        <View style={styles.locationItemInfo}>
          <Text
            style={[
              styles.locationItemName,
              locationId === item._id && styles.selectedLocationItemText,
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.locationItemDetails}>
            {item.totalTrees} {t("water-scheduling.locations.trees")} •{" "}
            {item.soilType}
          </Text>
        </View>
      </View>
      {locationId === item._id && (
        <Ionicons name="checkmark" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoadingLocations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {t("water-scheduling.schedule.loadingLocations")}
              </Text>
            </View>
          ) : (
            <>
              {/* Location selector */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("water-scheduling.schedule.selectLocation")}
                </Text>
                <TouchableOpacity
                  style={styles.locationSelector}
                  onPress={() => setShowLocationPicker(true)}
                >
                  {selectedLocation ? (
                    <>
                      <View style={styles.selectedLocationIcon}>
                        <Ionicons
                          name="location"
                          size={22}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.selectedLocationInfo}>
                        <Text style={styles.selectedLocationName}>
                          {selectedLocation.name}
                        </Text>
                        <Text style={styles.selectedLocationDetails}>
                          {selectedLocation.totalTrees}{" "}
                          {t("water-scheduling.locations.trees")} •{" "}
                          {selectedLocation.area}{" "}
                          {t("water-scheduling.locations.acres")}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={22}
                        color={colors.gray500}
                      />
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="location-outline"
                        size={22}
                        color={colors.gray600}
                      />
                      <Text style={styles.placeholderText}>
                        {t("water-scheduling.schedule.selectALocation")}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={22}
                        color={colors.gray500}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
              {/* Schedule timing */}
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("water-scheduling.schedule.timing")}
                </Text>

                <View style={styles.timingOptions}>
                  <TouchableOpacity
                    style={[
                      styles.timingOption,
                      isNow && styles.selectedTimingOption,
                    ]}
                    onPress={() => setIsNow(true)}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        isNow && styles.selectedRadioButton,
                      ]}
                    >
                      {isNow && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.timingOptionText}>
                      {t("water-scheduling.schedule.scheduleForNow")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.timingOption,
                      !isNow && styles.selectedTimingOption,
                    ]}
                    onPress={() => setIsNow(false)}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        !isNow && styles.selectedRadioButton,
                      ]}
                    >
                      {!isNow && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.timingOptionText}>
                      {t("water-scheduling.schedule.scheduleForLater")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isNow && (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={showDateTimePicker}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.dateText}>
                      {formatDate(scheduleDate)}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={colors.gray500}
                    />
                  </TouchableOpacity>
                )}
              </Card>

              {/* Notes */}
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("water-scheduling.schedule.notesOptional")}
                </Text>
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t("water-scheduling.schedule.notesPlaceholder")}
                  multiline
                  numberOfLines={3}
                  containerStyle={styles.notesInput}
                />
              </Card>

              {/* Submit button */}
              <Button
                title={t("water-scheduling.schedule.createSchedule")}
                variant="primary"
                size="large"
                isLoading={isSubmitting}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal - FIXED */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={scheduleDate}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("water-scheduling.schedule.selectLocation")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            {locations.length > 0 ? (
              <FlatList
                data={locations}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.locationList}
              />
            ) : (
              <View style={styles.noLocationsContainer}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={colors.gray300}
                />
                <Text style={styles.noLocationsTitle}>
                  {t("water-scheduling.schedule.noLocationsFound")}
                </Text>
                <Text style={styles.noLocationsText}>
                  {t("water-scheduling.schedule.noLocationsDescription")}
                </Text>
                <Button
                  title={t("water-scheduling.schedule.createNewLocation")}
                  variant="primary"
                  onPress={() => {
                    setShowLocationPicker(false);
                    navigation.navigate("LocationForm", { mode: "create" });
                  }}
                  style={styles.createLocationButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray600,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedLocationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  selectedLocationDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray500,
    marginLeft: 12,
  },
  moistureInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  moistureInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  moistureInputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  moistureInput: {
    marginBottom: 0,
  },
  unitText: {
    position: "absolute",
    right: 12,
    top: 40,
    fontSize: 16,
    color: colors.textSecondary,
  },
  fetchFromDeviceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  fetchButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
  estimationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  estimationLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  estimationValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  timingOptions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timingOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  selectedTimingOption: {
    borderColor: colors.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRadioButton: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  timingOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  notesInput: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  locationList: {
    paddingVertical: 8,
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedLocationItem: {
    backgroundColor: colors.primary + "10",
  },
  locationItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  selectedLocationItemText: {
    color: colors.primary,
  },
  locationItemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noLocationsContainer: {
    alignItems: "center",
    padding: 40,
  },
  noLocationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noLocationsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  createLocationButton: {
    minWidth: 200,
  },
});

export default CreateScheduleScreen;
