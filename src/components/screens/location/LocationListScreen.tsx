import React, { useState, useEffect } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getLocations } from "../../../api/locationApi";
import { Location } from "../../../types";
import Card from "../../common/Card";
import StatusBadge from "../../common/StatusBadge";
import { colors } from "../../../constants/colors";
import Button from "../../common/Button";
import { useTranslation } from "react-i18next";

const LocationListScreen: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  // Add useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLocations();
      return () => {
        // Optional cleanup if needed
      };
    }, [])
  );

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);
    } catch (error) {
      // console.error("Failed to load locations:", error);
      Alert.alert(t("common.error"), t("water-scheduling.locations.failedToLoadLocations"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLocations();
  };

  const handleAddLocation = () => {
    (navigation.navigate as any)("LocationForm", { mode: "create" });
  };

  const handleLocationPress = (locationId: string) => {
    (navigation.navigate as any)("LocationDetails", { locationId });
  };

  const renderSoilTypeIcon = (soilType: string) => {
    let color;
    switch (soilType) {
      case "Lateritic":
        color = "#CD7F32"; // Bronze
        break;
      case "Sandy Loam":
        color = "#DAA520"; // Golden
        break;
      case "Cinnamon Sand":
        color = "#D2691E"; // Cinnamon
        break;
      case "Red Yellow Podzolic":
        color = "#A52A2A"; // Brown
        break;
      case "Alluvial":
        color = "#708090"; // Slate gray
        break;
      default:
        color = "#8B4513"; // Default brown
    }

    return <View style={[styles.soilIcon, { backgroundColor: color }]} />;
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <Card
      style={styles.locationCard}
      onPress={() => handleLocationPress(item._id)}
      variant="elevated"
    >
      <View style={styles.locationHeader}>
        <Text style={styles.locationName}>{item.name}</Text>
        <StatusBadge status={item.status as any} size="small" />
      </View>

      <View style={styles.locationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="resize-outline" size={16} color={colors.gray600} />
          <Text style={styles.detailText}>{item.area} {t("water-scheduling.locations.acres")}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="leaf-outline" size={16} color={colors.gray600} />
          <Text style={styles.detailText}>{item.totalTrees} {t("water-scheduling.locations.trees")}</Text>
        </View>

        <View style={styles.detailRow}>
          {renderSoilTypeIcon(item.soilType)}
          <Text style={styles.detailText}>{item.soilType}</Text>
        </View>
      </View>

      <View style={styles.deviceStatus}>
        {item.deviceId ? (
          <View style={styles.deviceContainer}>
            <Ionicons
              name="hardware-chip-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.deviceText}>{t("water-scheduling.locations.deviceAttached")}</Text>
          </View>
        ) : (
          <View style={styles.deviceContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.gray500}
            />
            <Text style={styles.noDeviceText}>{t("water-scheduling.locations.noDevice")}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>{t("water-scheduling.locations.loadingLocations")}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="location-outline"
          size={64}
          color={colors.gray400}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{t("water-scheduling.locations.noLocationsFound")}</Text>
        <Text style={styles.emptyText}>
          {t("water-scheduling.locations.noLocationsDescription")}
        </Text>
        <Button
          title={t("water-scheduling.locations.addFirstLocation")}
          onPress={handleAddLocation}
          variant="primary"
          style={styles.addButton}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("water-scheduling.locations.locationList")}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddLocation}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
    marginTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  locationCard: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
  },
  locationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  soilIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  deviceStatus: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 12,
  },
  deviceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
  noDeviceText: {
    fontSize: 14,
    color: colors.gray500,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
});

export default LocationListScreen;