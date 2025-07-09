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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getDeviceById,
  deleteDevice,
  updateDevice,
} from "../../../api/deviceApi";
import { getLocationByDeviceId } from "../../../api/locationApi";
import { Device } from "../../../types";
import Card from "../../common/Card";
import StatusBadge from "../../common/StatusBadge";
import Button from "../../common/Button";
import { colors } from "../../../constants/colors";
import { DEVICE_ROUTES } from "../../../constants/routes";
import { useTranslation } from "react-i18next";

const DeviceDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { deviceId } = (route.params as any) || {};

  useEffect(() => {
    if (deviceId) {
      loadDevice();
      loadLocationForDevice();
    } else {
      navigation.goBack();
    }
  }, [deviceId]);

  const loadDevice = async () => {
    try {
      setIsLoading(true);
      const fetchedDevice = await getDeviceById(deviceId);
      setDevice(fetchedDevice);
    } catch (error) {
      // console.error(`Failed to load device ${deviceId}:`, error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.devices.failedToLoad")
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationForDevice = async () => {
    try {
      setIsLocationLoading(true);
      const locationData = await getLocationByDeviceId(deviceId);
      setLocation(locationData);
    } catch (error) {
      console.error("Failed to load location for device:", error);
      setLocation(null);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleEditDevice = () => {
    if (device) {
      (navigation.navigate as any)("RegisterDevice", {
        mode: "edit",
        deviceId: device.deviceId,
        deviceData: device,
      });
    }
  };

  const handleDeleteDevice = async () => {
    try {
      await deleteDevice(deviceId);
      Alert.alert(t("common.success"), t("water-scheduling.devices.deviceDeleted"));
      navigation.goBack();
    } catch (error) {
      console.error(`Failed to delete device ${deviceId}:`, error);
      Alert.alert(t("common.error"), t("water-scheduling.devices.failedToUpdate"));
    }
  };

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "maintenance"
  ) => {
    try {
      // Check if device is assigned to a location
      if (
        (newStatus === "inactive" || newStatus === "maintenance") &&
        location
      ) {
        Alert.alert(
          t("water-scheduling.devices.cannotChangeStatus"),
          t("water-scheduling.devices.deviceAssignedWarning"),
          [{ text: t("common.ok") }]
        );
        return;
      }

      await updateDevice(deviceId, { status: newStatus });
      loadDevice(); // Reload device to get updated status
      Alert.alert(
        t("common.success"), 
        t("water-scheduling.devices.statusUpdated", { status: newStatus })
      );
    } catch (error: any) {
      console.error(`Failed to update device status:`, error);

      // Check if it's our specific error
      const errorMessage =
        error.response?.data?.message ||
        t("water-scheduling.devices.failedToUpdate");

      Alert.alert(t("common.error"), errorMessage);
    }
  };

  const getDeviceTypeIcon = (type: string = ""): string => {
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

  const getDeviceTypeLabel = (type: string = ""): string => {
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

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getBatteryStatusColor = (level?: number) => {
    if (!level) return colors.gray500;
    if (level >= 50) return colors.success;
    if (level >= 20) return colors.warning;
    return colors.error;
  };

  const getMoistureColor = (level: number) => {
    if (level < 20) return colors.error; // Too dry
    if (level < 40) return colors.warning; // Dry
    if (level < 60) return colors.success; // Optimal
    if (level < 80) return colors.info; // Moist
    return colors.primary; // Very moist
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("water-scheduling.devices.loadingDevice")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("water-scheduling.devices.deviceDetails")}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditDevice}
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main content */}
        {device && (
          <>
            {/* Device Overview Card */}
            <Card style={styles.overviewCard}>
              <View style={styles.deviceHeaderContainer}>
                <View style={styles.deviceHeaderLeft}>
                  <Text style={styles.deviceId}>{device.deviceId}</Text>
                  <View style={styles.deviceTypeContainer}>
                    <Ionicons
                      name={getDeviceTypeIcon(device.type) as any}
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.deviceType}>
                      {getDeviceTypeLabel(device.type)}
                    </Text>
                  </View>
                </View>
                <StatusBadge status={device.status as any} />
              </View>

              {device.batteryLevel !== undefined && (
                <View style={styles.batteryContainer}>
                  <View style={styles.batteryLevelContainer}>
                    <View
                      style={[
                        styles.batteryLevelFill,
                        {
                          width: `${Math.min(device.batteryLevel, 100)}%`,
                          backgroundColor: getBatteryStatusColor(
                            device.batteryLevel
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.batteryText}>
                    {device.batteryLevel}% {t("water-scheduling.devices.batteryLevel")}
                  </Text>
                </View>
              )}

              <View style={styles.deviceDetails}>
                {(device as any).firmware && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons
                        name="code-outline"
                        size={18}
                        color={colors.gray600}
                      />
                      <Text style={styles.detailLabel}>{t("water-scheduling.devices.firmware")}:</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {(device as any).firmware}
                    </Text>
                  </View>
                )}

                {(device as any).lastMaintenance && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelContainer}>
                      <Ionicons
                        name="construct-outline"
                        size={18}
                        color={colors.gray600}
                      />
                      <Text style={styles.detailLabel}>{t("water-scheduling.devices.lastUpdated")}:</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {new Date(
                        (device as any).lastMaintenance
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={colors.gray600}
                    />
                    <Text style={styles.detailLabel}>{t("water-scheduling.devices.readingInterval")}:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {device.settings?.readingInterval || 30} {t("water-scheduling.devices.minutesUnit")}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <Ionicons
                      name="sync-outline"
                      size={18}
                      color={colors.gray600}
                    />
                    <Text style={styles.detailLabel}>{t("water-scheduling.devices.reportingInterval")}:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {device.settings?.reportingInterval || 60} {t("water-scheduling.devices.minutesUnit")}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Location Assignment Card */}
            <Card style={styles.locationCard}>
              <Text style={styles.sectionTitle}>{t("water-scheduling.devices.locationAssignment")}</Text>

              {isLocationLoading ? (
                <View style={styles.loadingIndicatorContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>
                    {t("common.loadingLocation")}
                  </Text>
                </View>
              ) : location ? (
                <View>
                  <View style={styles.assignedLocationContainer}>
                    <Ionicons
                      name="location"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.assignedLocationText}>
                      {t("water-scheduling.devices.assignedToLocation", { location: location.name })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.unassignedContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={28}
                    color={colors.gray400}
                  />
                  <Text style={styles.unassignedText}>
                    {t("water-scheduling.devices.notAssignedToLocation")}
                  </Text>
                  <Text style={styles.unassignedSubtext}>
                    {t("water-scheduling.devices.assignInLocationDetails")}
                  </Text>
                </View>
              )}
            </Card>

            {/* Current Readings Card */}
            {device.type === "soil_sensor" && device.lastReading && (
              <Card style={styles.readingsCard}>
                <View style={styles.readingsHeader}>
                  <Text style={styles.sectionTitle}>{t("water-scheduling.devices.currentReadings")}</Text>
                  <Text style={styles.lastUpdatedText}>
                    {t("water-scheduling.devices.lastUpdatedAt", { time: formatDateTime(device.lastReading.timestamp) })}
                  </Text>
                </View>

                <View style={styles.moistureReadings}>
                  <View style={styles.moistureItem}>
                    <Text style={styles.depthLabel}>10cm</Text>
                    <View style={styles.moistureValueContainer}>
                      <View
                        style={[
                          styles.moistureFill,
                          {
                            height: `${device.lastReading.moisture10cm}%`,
                            backgroundColor: getMoistureColor(
                              device.lastReading.moisture10cm
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moistureValue}>
                      {device.lastReading.moisture10cm}%
                    </Text>
                  </View>

                  <View style={styles.moistureItem}>
                    <Text style={styles.depthLabel}>20cm</Text>
                    <View style={styles.moistureValueContainer}>
                      <View
                        style={[
                          styles.moistureFill,
                          {
                            height: `${device.lastReading.moisture20cm}%`,
                            backgroundColor: getMoistureColor(
                              device.lastReading.moisture20cm
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moistureValue}>
                      {device.lastReading.moisture20cm}%
                    </Text>
                  </View>

                  <View style={styles.moistureItem}>
                    <Text style={styles.depthLabel}>30cm</Text>
                    <View style={styles.moistureValueContainer}>
                      <View
                        style={[
                          styles.moistureFill,
                          {
                            height: `${device.lastReading.moisture30cm}%`,
                            backgroundColor: getMoistureColor(
                              device.lastReading.moisture30cm
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moistureValue}>
                      {device.lastReading.moisture30cm}%
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Device Status Actions */}
            <Card style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>{t("water-scheduling.devices.status")}</Text>

              {device.status === "active" ? (
                <View style={styles.statusActions}>
                  {location ? (
                    <View style={styles.statusWarning}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.warning}
                      />
                      <Text style={styles.statusWarningText}>
                        {t("water-scheduling.devices.unassignedToChange")}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Button
                        title={t("water-scheduling.devices.markAsMaintenance")}
                        variant="outline"
                        leftIcon={
                          <Ionicons
                            name="construct-outline"
                            size={18}
                            color={colors.warning}
                          />
                        }
                        onPress={() => handleStatusChange("maintenance")}
                        style={styles.maintenanceButton}
                        textStyle={{ color: colors.warning }}
                      />
                      <Button
                        title={t("water-scheduling.devices.markAsInactive")}
                        variant="outline"
                        leftIcon={
                          <Ionicons
                            name="power-outline"
                            size={18}
                            color={colors.error}
                          />
                        }
                        onPress={() => handleStatusChange("inactive")}
                        style={styles.inactiveButton}
                        textStyle={{ color: colors.error }}
                      />
                    </>
                  )}
                </View>
              ) : device.status === "maintenance" ? (
                <Button
                  title={t("water-scheduling.devices.markAsActive")}
                  variant="primary"
                  leftIcon={
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color={colors.white}
                    />
                  }
                  onPress={() => handleStatusChange("active")}
                  style={styles.activateButton}
                />
              ) : (
                <Button
                  title={t("water-scheduling.devices.reactivateDevice")}
                  variant="primary"
                  leftIcon={
                    <Ionicons
                      name="power-outline"
                      size={18}
                      color={colors.white}
                    />
                  }
                  onPress={() => handleStatusChange("active")}
                  style={styles.activateButton}
                />
              )}
            </Card>

            {/* Delete Button */}
            <View style={styles.deleteContainer}>
              <Button
                title={t("water-scheduling.devices.deleteDevice")}
                variant="outline"
                leftIcon={
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.error}
                  />
                }
                onPress={() => setShowDeleteConfirm(true)}
                style={styles.deleteButton}
                textStyle={{ color: colors.error }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("water-scheduling.devices.deleteDeviceTitle")}</Text>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Ionicons
                name="trash"
                size={48}
                color={colors.error}
                style={styles.modalIcon}
              />
              <Text style={styles.modalText}>
                {t("water-scheduling.devices.deleteDeviceConfirm")}
              </Text>
              <Text style={styles.modalWarning}>
                {t("water-scheduling.devices.deleteDeviceWarning")}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title={t("common.cancel")}
                variant="outline"
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.modalCancelButton}
              />
              <Button
                title={t("common.delete")}
                variant="primary"
                leftIcon={
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.white}
                  />
                }
                onPress={handleDeleteDevice}
                style={styles.modalDeleteButton}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    marginTop: 30,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.gray600,
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
  editButton: {
    padding: 4,
  },
  overviewCard: {
    margin: 16,
    marginBottom: 12,
  },
  deviceHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deviceHeaderLeft: {
    flex: 1,
  },
  deviceId: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deviceTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  batteryContainer: {
    marginBottom: 16,
  },
  batteryLevelContainer: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  batteryLevelFill: {
    height: "100%",
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
  },
  deviceDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  locationCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  assignedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  assignedLocationText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: "500",
  },
  viewLocationButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  unassignedContainer: {
    alignItems: "center",
    padding: 16,
  },
  unassignedText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
  },
  unassignedSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  readingsCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  readingsHeader: {
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moistureReadings: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  moistureItem: {
    alignItems: "center",
    width: 80,
  },
  depthLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    marginBottom: 8,
  },
  moistureValueContainer: {
    height: 150,
    width: 30,
    backgroundColor: colors.gray100,
    borderRadius: 15,
    marginBottom: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  moistureFill: {
    width: "100%",
    borderRadius: 15,
  },
  moistureValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  actionsCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  statusActions: {
    gap: 12,
  },
  maintenanceButton: {
    borderColor: colors.warning,
    marginBottom: 8,
  },
  inactiveButton: {
    borderColor: colors.error,
  },
  activateButton: {
    marginTop: 4,
  },
  deleteContainer: {
    margin: 16,
    marginTop: 4,
    marginBottom: 32,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
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
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  modalWarning: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 16,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  modalDeleteButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: colors.error,
  },
  statusWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "15",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  statusWarningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.warning,
  },
});

export default DeviceDetailScreen;