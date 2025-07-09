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
  Linking,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getLocationById,
  deleteLocation,
  assignDeviceToLocation,
  removeDeviceFromLocation,
} from "../../../api/locationApi";
import { getDeviceById, getUnassignedDevices } from "../../../api/deviceApi";
import { Location, Device } from "../../../types";
import Card from "../../common/Card";
import StatusBadge from "../../common/StatusBadge";
import Button from "../../common/Button";
import { colors } from "../../../constants/colors";
import { useTranslation } from "react-i18next";

type LocationDetailScreenRouteProp = RouteProp<
  { LocationDetails: { locationId: string } },
  "LocationDetails"
>;

const LocationDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<any | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeviceLoading, setIsDeviceLoading] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isAssigningDevice, setIsAssigningDevice] = useState(false);

  const navigation:any = useNavigation();
  const route = useRoute<LocationDetailScreenRouteProp>();
  const { locationId } = route.params;

  useEffect(() => {
    loadLocation();
  }, [locationId]);

  useEffect(() => {
    if (location?.deviceId) {
      loadDeviceDetails(location.deviceId);
    }
  }, [location]);

  const loadLocation = async () => {
    try {
      setIsLoading(true);
      const fetchedLocation = await getLocationById(locationId);
      setLocation(fetchedLocation);
    } catch (error) {
      // console.error(`Failed to load location ${locationId}:`, error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.locations.failedToLoad")
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeviceDetails = async (deviceId: string) => {
    try {
      setIsDeviceLoading(true);
      const fetchedDevice = await getDeviceById(deviceId);
      setDevice(fetchedDevice);
    } catch (error) {
      // console.error(`Failed to load device ${deviceId}:`, error);
      setDevice(null);
    } finally {
      setIsDeviceLoading(false);
    }
  };

  const handleEditLocation = () => {
    if (location) {
      navigation.navigate("LocationForm", {
        mode: "edit",
        locationId: location._id,
        locationData: location,
      });
    }
  };
  
  const handleViewWateringHistory = () => {
    if (location) {
      navigation.navigate("LocationWateringHistory", {
        locationId: location._id,
        locationName: location.name
      });
    }
  };
  
  const handleDeleteLocation = async () => {
    Alert.alert(
      t("water-scheduling.locations.deleteLocation"),
      t("water-scheduling.locations.deleteConfirmation"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLocation(locationId);
              Alert.alert(t("common.success"), t("water-scheduling.locations.locationDeleted"));
              navigation.goBack();
            } catch (error) {
              // console.error(`Failed to delete location ${locationId}:`, error);
              Alert.alert(
                t("common.error"),
                t("water-scheduling.locations.failedToDelete")
              );
            }
          },
        },
      ]
    );
  };

  const handleShowAssignDeviceModal = async () => {
    try {
      setIsAssigningDevice(true);
      const devices = await getUnassignedDevices();

      const moistureSensors = devices.filter(
        (device: any) => device.type === 'soil_sensor'
      );
      setAvailableDevices(moistureSensors);
      setShowDeviceModal(true);
    } catch (error) {
      // console.error("Failed to get unassigned devices:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.locations.failedToFetchDevices")
      );
    } finally {
      setIsAssigningDevice(false);
    }
  };

  const handleAssignDevice = async (deviceId: string) => {
    try {
      setIsAssigningDevice(true);
      await assignDeviceToLocation(locationId, deviceId);
      setShowDeviceModal(false);
      loadLocation(); // Reload to get updated location with device
    } catch (error) {
      // console.error("Failed to assign device:", error);
      Alert.alert(
        t("common.error"),
        String(error) ||
          t("water-scheduling.locations.failedToAssignDevice")
      );
    } finally {
      setIsAssigningDevice(false);
    }
  };

  const handleRemoveDevice = async () => {
    Alert.alert(
      t("water-scheduling.locations.removeDevice"),
      t("water-scheduling.locations.removeDeviceConfirmation"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("water-scheduling.locations.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeDeviceFromLocation(locationId);
              setDevice(null);
              loadLocation(); // Reload to get updated location
            } catch (error) {
              // console.error("Failed to remove device:", error);
              Alert.alert(
                t("common.error"),
                t("water-scheduling.locations.failedToRemoveDevice")
              );
            }
          },
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (location?.coordinates) {
      const { latitude, longitude } = location.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url).catch((err) => {
        // console.error("Failed to open maps:", err);
        Alert.alert(t("common.error"), t("water-scheduling.locations.unableToOpenMaps"));
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderCalculatedAge = (plantationDate: string) => {
    const plantDate = new Date(plantationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - plantDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );

    return (
      <Text style={styles.calculatedAge}>
        {diffYears > 0 ? `${diffYears} ${diffYears !== 1 ? t("common.years") : t("common.year")}` : ""}
        {diffMonths > 0
          ? ` ${diffMonths} ${diffMonths !== 1 ? t("common.months") : t("common.month")}`
          : diffYears === 0
          ? t("water-scheduling.locations.lessThanOneMonth")
          : ""}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("water-scheduling.locations.loadingLocation")}</Text>
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
          <Text style={styles.headerTitle}>{t("water-scheduling.locations.locationDetails")}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditLocation}
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main content */}
        {location && (
          <>
            {/* Location Overview Card */}
            <Card style={styles.overviewCard}>
              <View style={styles.nameContainer}>
                <Text style={styles.locationName}>{location.name}</Text>
                <StatusBadge status={location.status as any} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.statValue}>{location.area}</Text>
                  <Text style={styles.statLabel}>{t("water-scheduling.locations.acres")}</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons
                    name="leaf-outline"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={styles.statValue}>{location.totalTrees}</Text>
                  <Text style={styles.statLabel}>{t("water-scheduling.locations.trees")}</Text>
                </View>

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.soilIcon,
                      { backgroundColor: getSoilColor(location.soilType) },
                    ]}
                  />
                  <Text style={styles.statValue}>{location.soilType}</Text>
                  <Text style={styles.statLabel}>{t("water-scheduling.locations.soilType")}</Text>
                </View>
              </View>
            </Card>

            {/* Plantation Details Card */}
            <Card style={styles.detailCard}>
              <Text style={styles.sectionTitle}>{t("water-scheduling.locations.plantationDetails")}</Text>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.gray600}
                  />
                  <Text style={styles.detailLabel}>{t("water-scheduling.locations.plantedOn")}:</Text>
                </View>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>
                    {formatDate(location.plantationDate)}
                  </Text>
                  {renderCalculatedAge(location.plantationDate)}
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.gray600}
                  />
                  <Text style={styles.detailLabel}>{t("water-scheduling.locations.coordinates")}:</Text>
                </View>
                <TouchableOpacity
                  style={styles.coordinatesContainer}
                  onPress={handleOpenMap}
                >
                  <Text style={styles.detailValue}>
                    {location.coordinates.latitude.toFixed(4)},{" "}
                    {location.coordinates.longitude.toFixed(4)}
                  </Text>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {location.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>{t("water-scheduling.locations.description")}:</Text>
                  <Text style={styles.descriptionText}>
                    {location.description}
                  </Text>
                </View>
              )}
            </Card>

            {/* Device Section */}
            <Card style={styles.deviceCard}>
              <Text style={styles.sectionTitle}>{t("water-scheduling.locations.deviceAssignment")}</Text>

              {isDeviceLoading ? (
                <View style={styles.deviceLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>{t("water-scheduling.locations.loadingDeviceInfo")}</Text>
                </View>
              ) : location.deviceId && device ? (
                <View style={styles.deviceInfoContainer}>
                  <View style={styles.deviceHeader}>
                    <View>
                      <Text style={styles.deviceName}>
                        {device.deviceId} ({getDeviceTypeName(device.type)})
                      </Text>
                      <StatusBadge status={device.status as any} size="small" />
                    </View>
                  </View>
                  <Button
                    title={t("water-scheduling.locations.removeDevice")}
                    leftIcon={
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color={colors.error}
                      />
                    }
                    variant="outline"
                    onPress={handleRemoveDevice}
                    style={styles.removeDeviceButton}
                    textStyle={{ color: colors.error }}
                  />
                </View>
              ) : (
                <View style={styles.noDeviceContainer}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={48}
                    color={colors.gray300}
                  />
                  <Text style={styles.noDeviceText}>{t("water-scheduling.locations.noDeviceAssigned")}</Text>
                  <Text style={styles.noDeviceSubtext}>
                    {t("water-scheduling.locations.assignDeviceDescription")}
                  </Text>
                  <Button
                    title={t("water-scheduling.locations.assignDevice")}
                    leftIcon={
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={colors.white}
                      />
                    }
                    onPress={handleShowAssignDeviceModal}
                    isLoading={isAssigningDevice}
                    style={styles.assignDeviceButton}
                  />
                </View>
              )}
            </Card>

            {/* Watering History Button */}
            <Card style={styles.wateringHistoryCard}>
              <View style={styles.wateringHistoryHeader}>
                <Text style={styles.sectionTitle}>{t("water-scheduling.locations.wateringHistory")}</Text>
                <Text style={styles.wateringHistorySubtext}>
                  {t("water-scheduling.locations.wateringHistoryDescription")}
                </Text>
              </View>
              <Button
                title={t("water-scheduling.locations.viewWateringHistory")}
                leftIcon={
                  <Ionicons
                    name="water-outline"
                    size={18}
                    color={colors.white}
                  />
                }
                variant="primary"
                onPress={handleViewWateringHistory}
                style={styles.wateringHistoryButton}
              />
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Button
                title={t("water-scheduling.locations.deleteLocation")}
                variant="outline"
                leftIcon={
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                }
                onPress={handleDeleteLocation}
                style={styles.deleteButton}
                textStyle={{ color: colors.error }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Device Assignment Modal */}
      {showDeviceModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("water-scheduling.locations.availableDevices")}</Text>
              <TouchableOpacity
                onPress={() => setShowDeviceModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            {availableDevices.length > 0 ? (
              <ScrollView style={styles.devicesList}>
                {availableDevices.map((device) => (
                  <TouchableOpacity
                    key={device._id}
                    style={styles.deviceItem}
                    onPress={() => handleAssignDevice(device.deviceId)}
                    disabled={isAssigningDevice}
                  >
                    <View style={styles.deviceItemInfo}>
                      <Text style={styles.deviceItemId}>{device.deviceId}</Text>
                      <Text style={styles.deviceItemType}>
                        {getDeviceTypeName(device.type)}
                      </Text>
                      <StatusBadge status={device.status as any} size="small" />
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.gray400}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDevicesAvailable}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={colors.gray400}
                />
                <Text style={styles.noDevicesText}>{t("water-scheduling.locations.noDevicesAvailable")}</Text>
                <Text style={styles.noDevicesSubtext}>
                  {t("water-scheduling.locations.noDevicesAvailableDescription")}
                </Text>
                <Button
                  title={t("water-scheduling.locations.registerNewDevice")}
                  variant="primary"
                  onPress={() => {
                    setShowDeviceModal(false);
                    navigation.navigate("DeviceForm", { mode: "create" });
                  }}
                  style={styles.registerDeviceButton}
                />
              </View>
            )}
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

const getBatteryIcon = (level?: number): string => {
  if (!level) return "battery-dead-outline";
  if (level >= 90) return "battery-full-outline";
  if (level >= 60) return "battery-half-outline";
  if (level >= 30) return "battery-half-outline";
  return "battery-dead-outline";
};

const getBatteryColor = (level?: number): string => {
  if (!level) return colors.gray500;
  if (level >= 60) return colors.success;
  if (level >= 30) return colors.warning;
  return colors.error;
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
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  soilIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  detailCard: {
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
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 6,
  },
  detailValueContainer: {
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  calculatedAge: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  descriptionLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  deviceCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  deviceLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  deviceInfoContainer: {
    padding: 4,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  viewDeviceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    marginBottom: 12,
  },
  viewDeviceText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  removeDeviceButton: {
    borderColor: colors.error,
  },
  noDeviceContainer: {
    alignItems: "center",
    padding: 20,
  },
  noDeviceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  noDeviceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  assignDeviceButton: {
    minWidth: 180,
  },
  // Add wateringHistoryCard styles
  wateringHistoryCard: {
    margin: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  wateringHistoryHeader: {
    marginBottom: 12,
  },
  wateringHistorySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  wateringHistoryButton: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    margin: 16,
    marginTop: 4,
    marginBottom: 32,
  },
  scheduleButton: {
    marginBottom: 12,
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
    maxHeight: "80%",
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
  closeButton: {
    padding: 4,
  },
  devicesList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemId: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  deviceItemType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noDevicesAvailable: {
    alignItems: "center",
    padding: 30,
  },
  noDevicesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  noDevicesSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  registerDeviceButton: {
    minWidth: 200,
  },
});

export default LocationDetailScreen;