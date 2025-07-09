import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getLocationSchedules } from "../../../api/wateringApi";
import { WateringSchedule } from "../../../types";
import { colors } from "../../../constants/colors";
import Card from "../../common/Card";
import Button from "../../common/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";

type LocationWateringHistoryRouteProp = RouteProp<
  { LocationWateringHistory: { locationId: string; locationName: string } },
  "LocationWateringHistory"
>;

const { width } = Dimensions.get("window");

const LocationWateringHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to 1 month ago
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [chartType, setChartType] = useState<
    "amount" | "efficiency" | "frequency"
  >("amount");

  const navigation: any = useNavigation();
  const route = useRoute<LocationWateringHistoryRouteProp>();
  const { locationId, locationName } = route.params;

  useEffect(() => {
    loadWateringHistory();
  }, [timeRange, startDate, endDate]);

  const loadWateringHistory = async () => {
    try {
      setIsLoading(true);

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const historyData = await getLocationSchedules(locationId, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      setSchedules(historyData);
    } catch (error) {
      // console.error("Failed to load watering history:", error);
      Alert.alert(
        t("common.error"),
        t("water-scheduling.watering.failedToLoadHistory")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setDateRange = (range: "week" | "month" | "year") => {
    const end = new Date();
    const start = new Date();

    if (range === "week") {
      start.setDate(end.getDate() - 7);
    } else if (range === "month") {
      start.setMonth(end.getMonth() - 1);
    } else if (range === "year") {
      start.setFullYear(end.getFullYear() - 1);
    }

    setStartDate(start);
    setEndDate(end);
    setTimeRange(range);
  };

  // Helper to group schedules by date for charts
  const groupSchedulesByDate = () => {
    const grouped = schedules.reduce((acc, schedule) => {
      const date = new Date(schedule.date).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(schedule);
      return acc;
    }, {} as Record<string, WateringSchedule[]>);

    return grouped;
  };

  // Data processing for the charts
  const getChartData = () => {
    const groupedSchedules = groupSchedulesByDate();
    const dates = Object.keys(groupedSchedules).sort();

    // For displaying on the chart
    const labels = dates.map((date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    // Calculate water amounts by date
    const waterAmounts = dates.map((date) => {
      const daySchedules = groupedSchedules[date];
      const totalWater = daySchedules.reduce((sum, schedule) => {
        // Use actual amount if available, otherwise recommended amount
        const amount = schedule.actualAmount || schedule.recommendedAmount;
        return sum + amount;
      }, 0);
      return totalWater;
    });

    // Calculate efficiency by date (only for completed schedules)
    const efficiencyData = dates.map((date) => {
      const daySchedules = groupedSchedules[date].filter(
        (s) => s.status === "completed" && s.actualAmount !== undefined
      );

      if (daySchedules.length === 0) return 0;

      const averageEfficiency =
        daySchedules.reduce((sum, schedule) => {
          const recommended = schedule.recommendedAmount;
          const actual = schedule.actualAmount || recommended;
          // Calculate as a percentage of recommended (100% = perfect match)
          const efficiency =
            100 - Math.abs(((actual - recommended) / recommended) * 100);
          return sum + Math.max(0, Math.min(100, efficiency)); // Clamp between 0-100%
        }, 0) / daySchedules.length;

      return averageEfficiency;
    });

    // Calculate schedule frequency by date
    const frequencyData = dates.map((date) => {
      return groupedSchedules[date].length;
    });

    return {
      labels: labels.slice(-7), // Show only last 7 points for readability
      datasets: [
        {
          data:
            chartType === "amount"
              ? waterAmounts.slice(-7)
              : chartType === "efficiency"
              ? efficiencyData.slice(-7)
              : frequencyData.slice(-7),
          color: (opacity = 1) => `rgba(72, 132, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: [
        chartType === "amount"
          ? t("water-scheduling.watering.waterAmountChart")
          : chartType === "efficiency"
          ? t("water-scheduling.watering.efficiencyChart")
          : t("water-scheduling.watering.frequencyChart"),
      ],
    };
  };

  // Get some summary statistics
  const getSummaryStats = () => {
    if (schedules.length === 0) {
      return {
        totalWaterUsed: 0,
        averageAmount: 0,
        completedCount: 0,
        averageEfficiency: 0,
      };
    }

    const completedSchedules = schedules.filter(
      (s) => s.status === "completed"
    );
    const totalWaterUsed = completedSchedules.reduce(
      (sum, s) => sum + (s.actualAmount || s.recommendedAmount),
      0
    );

    const averageAmount = totalWaterUsed / (completedSchedules.length || 1);

    const schedulesWithActualAmount = completedSchedules.filter(
      (s) => s.actualAmount !== undefined
    );
    const totalEfficiency = schedulesWithActualAmount.reduce((sum, s) => {
      const efficiency =
        100 -
        Math.abs(
          (((s.actualAmount || s.recommendedAmount) - s.recommendedAmount) /
            s.recommendedAmount) *
            100
        );
      return sum + Math.max(0, Math.min(100, efficiency)); // Clamp between 0-100%
    }, 0);

    const averageEfficiency =
      schedulesWithActualAmount.length > 0
        ? totalEfficiency / schedulesWithActualAmount.length
        : 0;

    return {
      totalWaterUsed: Math.round(totalWaterUsed),
      averageAmount: Math.round(averageAmount * 10) / 10,
      completedCount: completedSchedules.length,
      averageEfficiency: Math.round(averageEfficiency),
    };
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces:
      chartType === "amount" ? 0 : chartType === "efficiency" ? 0 : 0,
    color: (opacity = 1) => `rgba(72, 132, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#007AFF",
    },
  };

  const renderDatePicker = (
    showPicker: boolean,
    currentDate: Date,
    onDateChange: (date: Date) => void,
    onClose: () => void
  ) => {
    if (!showPicker) return null;

    return (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          onClose();
          if (selectedDate) {
            onDateChange(selectedDate);
          }
        }}
      />
    );
  };

  const stats = getSummaryStats();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("water-scheduling.watering.loadingHistory")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("water-scheduling.watering.wateringHistory")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.locationName}>{locationName}</Text>

        {/* Time Range Selector */}
        <Card style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>{t("water-scheduling.watering.timeRange")}</Text>
          <View style={styles.timeRangeButtons}>
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                timeRange === "week" && styles.activeTimeRangeButton,
              ]}
              onPress={() => setDateRange("week")}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === "week" && styles.activeTimeRangeText,
                ]}
              >
                {t("water-scheduling.watering.week")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                timeRange === "month" && styles.activeTimeRangeButton,
              ]}
              onPress={() => setDateRange("month")}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === "month" && styles.activeTimeRangeText,
                ]}
              >
                {t("water-scheduling.watering.month")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                timeRange === "year" && styles.activeTimeRangeButton,
              ]}
              onPress={() => setDateRange("year")}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === "year" && styles.activeTimeRangeText,
                ]}
              >
                {t("water-scheduling.watering.year")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customDateContainer}>
            <View style={styles.datePickerButton}>
              <Text style={styles.datePickerLabel}>{t("water-scheduling.watering.start")}:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerButton}>
              <Text style={styles.datePickerLabel}>{t("water-scheduling.watering.end")}:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Summary Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>{t("water-scheduling.watering.summary")}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalWaterUsed}</Text>
              <Text style={styles.statLabel}>{t("water-scheduling.watering.totalWater")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageAmount}</Text>
              <Text style={styles.statLabel}>{t("water-scheduling.watering.avgPerSchedule")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{schedules.length}</Text>
              <Text style={styles.statLabel}>{t("water-scheduling.watering.totalSchedules")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedCount}</Text>
              <Text style={styles.statLabel}>{t("water-scheduling.watering.completed")}</Text>
            </View>
          </View>
        </Card>

        {/* Chart Type Selector */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>{t("water-scheduling.watering.wateringTrends")}</Text>
            <View style={styles.chartTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "amount" && styles.activeChartTypeButton,
                ]}
                onPress={() => setChartType("amount")}
              >
                <Text
                  style={[
                    styles.chartTypeText,
                    chartType === "amount" && styles.activeChartTypeText,
                  ]}
                >
                  {t("water-scheduling.watering.amount")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "efficiency" && styles.activeChartTypeButton,
                ]}
                onPress={() => setChartType("efficiency")}
              >
                <Text
                  style={[
                    styles.chartTypeText,
                    chartType === "efficiency" && styles.activeChartTypeText,
                  ]}
                >
                  {t("water-scheduling.watering.efficiency")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTypeButton,
                  chartType === "frequency" && styles.activeChartTypeButton,
                ]}
                onPress={() => setChartType("frequency")}
              >
                <Text
                  style={[
                    styles.chartTypeText,
                    chartType === "frequency" && styles.activeChartTypeText,
                  ]}
                >
                  {t("water-scheduling.watering.frequency")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {schedules.length > 0 ? (
            <>
              <LineChart
                data={getChartData()}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                yAxisSuffix={
                  chartType === "amount"
                    ? "L"
                    : chartType === "efficiency"
                    ? "%"
                    : ""
                }
              />

              {chartType === "amount" && (
                <BarChart
                  data={getChartData()}
                  width={width - 40}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  yAxisSuffix="L"
                  fromZero
                  yAxisLabel="T"
                />
              )}
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="water-outline" size={48} color={colors.gray300} />
              <Text style={styles.noDataTitle}>{t("water-scheduling.watering.noWateringData")}</Text>
              <Text style={styles.noDataSubtitle}>
                {t("water-scheduling.watering.noWateringDataDescription")}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Date Pickers */}
      {renderDatePicker(
        showStartDatePicker,
        startDate,
        (date) => setStartDate(date),
        () => setShowStartDatePicker(false)
      )}

      {renderDatePicker(
        showEndDatePicker,
        endDate,
        (date) => setEndDate(date),
        () => setShowEndDatePicker(false)
      )}
    </SafeAreaView>
  );
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  locationName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  selectorCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  timeRangeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.gray100,
  },
  activeTimeRangeButton: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray700,
  },
  activeTimeRangeText: {
    color: colors.white,
  },
  customDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 6,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTypeButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  chartTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  activeChartTypeButton: {
    backgroundColor: colors.primary + "20",
  },
  chartTypeText: {
    fontSize: 14,
    color: colors.gray700,
  },
  activeChartTypeText: {
    color: colors.primary,
    fontWeight: "500",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: "center",
    padding: 30,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray700,
    marginTop: 12,
  },
  noDataSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: "center",
    marginTop: 8,
  },
  createButton: {
    marginBottom: 24,
  },
});

export default LocationWateringHistoryScreen;