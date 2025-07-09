import React, { useEffect } from "react";
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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useWatering } from "../../../context/WateringContext";
import ScheduleCard from "../../watering/ScheduleCard";
import Button from "../../common/Button";
import Card from "../../common/Card";
import { colors } from "../../../constants/colors";
import { DEVICE_ROUTES } from "../../../constants/routes";

const CopraIdentificationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleViewCopraGrading = () => {
    // Navigate to the LocationNavigator's main screen
    navigation.navigate("CopraGradingView");
  };

  const handleViewCopraMoldDetection = () => {
    // Navigate to the DeviceNavigator's main screen
    navigation.navigate("CopraMoldDetectionView");
  };


  const renderDetectionButtons = () => (
    <View style={styles.resourceButtonsContainer}>
      {/* <Text style={styles.resourceTitle}>Manage Resources</Text> */}
      <Text style={styles.resourceTitle}>Do you have questions about copra ?</Text>

      <View style={styles.resourceButtons}>
        <TouchableOpacity
          style={styles.resourceButton}
          onPress={handleViewCopraGrading}
        >
          <View
            style={[
              styles.resourceIcon,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.resourceText}>Copra Grading</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resourceButton}
          onPress={handleViewCopraMoldDetection}
        >
          <View
            style={[
              styles.resourceIcon,
              { backgroundColor: colors.secondary + "20" },
            ]}
          >
            <Ionicons
              name="hardware-chip-outline"
              size={24}
              color={colors.secondary}
            />
          </View>
          <Text style={styles.resourceText}>Copra Mold Detection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}

      >

        <View style={styles.sectionContainer}>
          <Text style={styles.noUpcomingText}>Welcome to Copra Function</Text>
        </View>

        {renderDetectionButtons()}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",

    marginBottom: 12,
  },
  todaySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  countBadge: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  countNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  countLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scheduleCard: {
    marginBottom: 12,
  },
  createButton: {
    marginTop: 8,
  },
  emptyTodayContainer: {
    alignItems: "center",
    padding: 32,
    marginBottom: 16,
  },
  emptyTodayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTodayText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  noUpcomingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
  resourceButtonsContainer: {
    marginTop: 8,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  resourceButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resourceButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CopraIdentificationScreen;
