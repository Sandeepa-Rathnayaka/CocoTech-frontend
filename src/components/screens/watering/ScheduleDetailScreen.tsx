import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { getLocationById } from "../../../api/locationApi";
import { getDeviceById } from "../../../api/deviceApi";
import {
  getScheduleById,
  updateScheduleStatus,
} from "../../../api/wateringApi";
import { WateringSchedule, Location, Device } from "../../../types";
import {
  formatScheduleDate,
  calculateWateringEfficiency,
} from "../../../utils/wateringHelpers";
import { colors } from "../../../constants/colors";
import Card from "../../../components/common/Card";
import StatusBadge from "../../../components/common/StatusBadge";
import WaterNeedChart from "../../../components/watering/WaterNeedChart";
import SoilConditionsCard from "../../../components/watering/SoilConditionsCard";
import WeatherConditionsCard from "../../../components/watering/WeatherConditionsCard";
import ScheduleActionButtons from "../../../components/watering/ScheduleActionButtons";
import { useTranslation } from "react-i18next";

type ScheduleDetailScreenRouteProp = RouteProp<
  { ScheduleDetail: { scheduleId: string } },
  "ScheduleDetail"
>;

const ScheduleDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState<any | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigation:any = useNavigation();
  const route = useRoute<ScheduleDetailScreenRouteProp>();
  const { scheduleId } = route.params;

  useEffect(() => {
    loadScheduleDetails();
  }, [scheduleId]);

  const loadScheduleDetails = async () => {
    try {
      setIsLoading(true);

      // Fetch schedule details
      const fetchedSchedule:any = await getScheduleById(scheduleId);
      setSchedule(fetchedSchedule);

      if (fetchedSchedule?.locationId?._id) {
        const locationId = fetchedSchedule.locationId._id;
        const fetchedLocation = await getLocationById(locationId);
        setLocation(fetchedLocation);

        if (fetchedLocation?.deviceId) {
          const fetchedDevice = await getDeviceById(fetchedLocation.deviceId);
          setDevice(fetchedDevice);
        }
      }
    } catch (error) {
      console.error(`Failed to load schedule ${scheduleId}:`, error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.schedule.failedToLoadSchedule")
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };
  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateScheduleStatus(scheduleId, newStatus);
      // Reload schedule to get updated data
      loadScheduleDetails();
    } catch (error) {
      console.error("Failed to update schedule status:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.schedule.failedToUpdateStatus")
      );
    }
  };

  const handleViewLocation = () => {
    if (location) {
      navigation.navigate("LocationDetails", { locationId: location._id });
    }
  };

  const handleViewDevice = () => {
    if (device) {
      navigation.navigate("DeviceDetails", { deviceId: device.deviceId });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("water-scheduling.schedule.loadingSchedule")}</Text>
      </SafeAreaView>
    );
  }

  if (!schedule) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>{t("water-scheduling.schedule.scheduleNotFound")}</Text>
        <Text style={styles.errorText}>
          {t("water-scheduling.schedule.scheduleNotFoundDescription")}
        </Text>
      </SafeAreaView>
    );
  }

  // Calculate efficiency if completed with actual amount
  const efficiency =
    schedule.status === "completed" && schedule.actualAmount
      ? calculateWateringEfficiency(
          schedule.recommendedAmount,
          schedule.actualAmount
        )
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header section */}
        <Card style={styles.headerCard}>
          <View style={styles.statusContainer}>
            <Text style={styles.dateText}>
              {formatScheduleDate(schedule.date)}
            </Text>
            <StatusBadge status={schedule.status as any} />
          </View>

          <Text style={styles.locationName}>
            {location?.name || t("water-scheduling.locations.unknownLocation")}
          </Text>

          {schedule.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{schedule.notes}</Text>
            </View>
          )}

          {efficiency && (
            <View
              style={[
                styles.efficiencyContainer,
                efficiency.status === "optimal" && styles.optimalEfficiency,
                efficiency.status === "overwatered" &&
                  styles.overWateredEfficiency,
                efficiency.status === "underwatered" &&
                  styles.underWateredEfficiency,
              ]}
            >
              <Ionicons
                name={
                  efficiency.status === "optimal"
                    ? "checkmark-circle-outline"
                    : efficiency.status === "overwatered"
                    ? "arrow-up-circle-outline"
                    : "arrow-down-circle-outline"
                }
                size={20}
                color={
                  efficiency.status === "optimal"
                    ? colors.success
                    : efficiency.status === "overwatered"
                    ? colors.warning
                    : colors.error
                }
              />
              <Text
                style={[
                  styles.efficiencyText,
                  efficiency.status === "optimal" && { color: colors.success },
                  efficiency.status === "overwatered" && {
                    color: colors.warning,
                  },
                  efficiency.status === "underwatered" && {
                    color: colors.error,
                  },
                ]}
              >
                {efficiency.status === "optimal"
                  ? t("water-scheduling.schedule.optimalEfficiency")
                  : efficiency.status === "overwatered"
                  ? t("water-scheduling.schedule.overwatered", {
                      percentage: Math.abs(Math.round(100 - efficiency.percentage))
                    })
                  : t("water-scheduling.schedule.underwatered", {
                      percentage: Math.abs(Math.round(100 - efficiency.percentage))
                    })}
              </Text>
            </View>
          )}
        </Card>

        {/* Water need chart */}
        <WaterNeedChart
          amount={schedule.recommendedAmount}
          confidence={schedule.predictionConfidence}
          style={styles.chartCard}
        />

        {/* Execution details if completed */}
        {schedule.status === "completed" && schedule.executionDetails && (
          <Card style={styles.executionCard}>
            <Text style={styles.sectionTitle}>{t("water-scheduling.schedule.executionDetails")}</Text>

            <View style={styles.executionDetail}>
              <Text style={styles.detailLabel}>{t("water-scheduling.schedule.waterUsed")}:</Text>
              <Text style={styles.detailValue}>
                {schedule.actualAmount || schedule.recommendedAmount} {t("water-scheduling.schedule.liters")}
              </Text>
            </View>

            {schedule.executionDetails.startTime && (
              <View style={styles.executionDetail}>
                <Text style={styles.detailLabel}>{t("water-scheduling.schedule.startTime")}:</Text>
                <Text style={styles.detailValue}>
                  {formatScheduleDate(
                    schedule.executionDetails.startTime,
                    "time"
                  )}
                </Text>
              </View>
            )}

            {schedule.executionDetails.endTime && (
              <View style={styles.executionDetail}>
                <Text style={styles.detailLabel}>{t("water-scheduling.schedule.endTime")}:</Text>
                <Text style={styles.detailValue}>
                  {formatScheduleDate(
                    schedule.executionDetails.endTime,
                    "time"
                  )}
                </Text>
              </View>
            )}

            {schedule.executionDetails.duration && (
              <View style={styles.executionDetail}>
                <Text style={styles.detailLabel}>{t("water-scheduling.schedule.duration")}:</Text>
                <Text style={styles.detailValue}>
                  {schedule.executionDetails.duration} {t("water-scheduling.schedule.minutes")}
                </Text>
              </View>
            )}

            <View style={styles.executionDetail}>
              <Text style={styles.detailLabel}>{t("water-scheduling.schedule.executedBy")}:</Text>
              <Text style={styles.detailValue}>
                {schedule.executionDetails.executedBy === "automatic"
                  ? t("water-scheduling.schedule.automaticSystem")
                  : t("water-scheduling.schedule.manual")}
              </Text>
            </View>
          </Card>
        )}

        {/* Soil conditions */}
        <SoilConditionsCard
          soilConditions={schedule.soilConditions}
          plantAge={schedule.plantAge}
          containerStyle={styles.conditionsCard}
        />

        {/* Weather conditions */}
        <WeatherConditionsCard
          weatherConditions={schedule.weatherConditions}
          date={schedule.date}
          containerStyle={styles.conditionsCard}
        />

        {/* Location and device links */}
        <Card style={styles.linksCard}>
          <Text style={styles.sectionTitle}>{t("water-scheduling.schedule.relatedResources")}</Text>

          {/* Location link */}
          <TouchableOpacity
            style={styles.linkItem}
            onPress={handleViewLocation}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="location" size={22} color={colors.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>
                {location?.name || t("water-scheduling.schedule.viewLocation")}
              </Text>
              <Text style={styles.linkSubtitle}>
                {location
                  ? `${location.totalTrees} ${t("water-scheduling.locations.trees")}, ${location.area} ${t("water-scheduling.locations.acres")}`
                  : t("water-scheduling.schedule.locationDetails")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>

          {/* Device link if available */}
          {device && (
            <TouchableOpacity
              style={[styles.linkItem, styles.deviceLink]}
              onPress={handleViewDevice}
            >
              <View style={styles.linkIcon}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={22}
                  color={colors.secondary}
                />
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>{device.deviceId}</Text>
                <Text style={styles.linkSubtitle}>
                  {device.type === "soil_sensor"
                    ? t("water-scheduling.devices.soilSensor")
                    : device.type === "irrigation_controller"
                    ? t("water-scheduling.devices.irrigationController")
                    : t("water-scheduling.devices.weatherStation")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.gray400}
              />
            </TouchableOpacity>
          )}
        </Card>

        {/* Action buttons for pending schedules */}
        <ScheduleActionButtons
          scheduleId={schedule._id}
          status={schedule.status as any}
          recommendedAmount={schedule.recommendedAmount}
          onStatusChange={handleStatusChange}
          containerStyle={styles.actionButtons}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  locationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  efficiencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  optimalEfficiency: {
    backgroundColor: colors.success + "20",
  },
  overWateredEfficiency: {
    backgroundColor: colors.warning + "20",
  },
  underWateredEfficiency: {
    backgroundColor: colors.error + "20",
  },
  efficiencyText: {
    fontSize: 14,
    marginLeft: 8,
  },
  chartCard: {
    marginBottom: 16,
  },
  executionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  executionDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  conditionsCard: {
    marginBottom: 16,
  },
  linksCard: {
    marginBottom: 16,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  deviceLink: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 16,
    marginTop: 4,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    marginTop: 8,
  },
});

export default ScheduleDetailScreen;