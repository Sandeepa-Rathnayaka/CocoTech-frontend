import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";
import { SENSOR_DEPTHS } from "../../constants/deviceConstants";
import Card from "../common/Card";
import { calculateReadingConfidence } from "../../utils/deviceHelpers";
import { Device } from "../../types";
import ConfidenceGauge from "../common/ConfidenceGauge";

interface SensorReadingCardProps {
  device: Device;
  showConfidence?: boolean;
}

const SensorReadingCard: React.FC<SensorReadingCardProps> = ({
  device,
  showConfidence = true,
}) => {
  const { lastReading } = device;
  const readingTime = lastReading?.timestamp
    ? new Date(lastReading.timestamp).toLocaleString()
    : "No data available";

  const confidenceScore = calculateReadingConfidence(device);

  const getMoistureStatus = (value: number) => {
    if (value <= 20)
      return { status: "Dry", color: colors.error, icon: "sunny-outline" };
    if (value <= 40)
      return {
        status: "Somewhat Dry",
        color: colors.warning,
        icon: "partly-sunny-outline",
      };
    if (value <= 70)
      return {
        status: "Optimal",
        color: colors.success,
        icon: "checkmark-circle-outline",
      };
    return { status: "Wet", color: colors.info, icon: "water-outline" };
  };

  const renderMoistureReadings = () => {
    if (!lastReading)
      return (
        <View style={styles.noDataContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={24}
            color={colors.gray400}
          />
          <Text style={styles.noDataText}>No sensor readings available</Text>
        </View>
      );

    return (
      <View style={styles.readingsContainer}>
        {lastReading.moisture10cm !== undefined && (
          <View style={styles.readingItem}>
            <Text style={styles.readingDepth}>{SENSOR_DEPTHS.DEPTH_10CM}</Text>
            <View style={styles.valueContainer}>
              <View
                style={[
                  styles.moistureIndicator,
                  {
                    backgroundColor: getMoistureStatus(lastReading.moisture10cm)
                      .color,
                  },
                ]}
              />
              <Text style={styles.readingValue}>
                {lastReading.moisture10cm.toFixed(1)}%
              </Text>
              <Text
                style={[
                  styles.readingStatus,
                  { color: getMoistureStatus(lastReading.moisture10cm).color },
                ]}
              >
                {getMoistureStatus(lastReading.moisture10cm).status}
              </Text>
            </View>
          </View>
        )}

        {lastReading.moisture20cm !== undefined && (
          <View style={styles.readingItem}>
            <Text style={styles.readingDepth}>{SENSOR_DEPTHS.DEPTH_20CM}</Text>
            <View style={styles.valueContainer}>
              <View
                style={[
                  styles.moistureIndicator,
                  {
                    backgroundColor: getMoistureStatus(lastReading.moisture20cm)
                      .color,
                  },
                ]}
              />
              <Text style={styles.readingValue}>
                {lastReading.moisture20cm.toFixed(1)}%
              </Text>
              <Text
                style={[
                  styles.readingStatus,
                  { color: getMoistureStatus(lastReading.moisture20cm).color },
                ]}
              >
                {getMoistureStatus(lastReading.moisture20cm).status}
              </Text>
            </View>
          </View>
        )}

        {lastReading.moisture30cm !== undefined && (
          <View style={styles.readingItem}>
            <Text style={styles.readingDepth}>{SENSOR_DEPTHS.DEPTH_30CM}</Text>
            <View style={styles.valueContainer}>
              <View
                style={[
                  styles.moistureIndicator,
                  {
                    backgroundColor: getMoistureStatus(lastReading.moisture30cm)
                      .color,
                  },
                ]}
              />
              <Text style={styles.readingValue}>
                {lastReading.moisture30cm.toFixed(1)}%
              </Text>
              <Text
                style={[
                  styles.readingStatus,
                  { color: getMoistureStatus(lastReading.moisture30cm).color },
                ]}
              >
                {getMoistureStatus(lastReading.moisture30cm).status}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Card
    //title="Soil Moisture Readings"
    //icon="water-outline"
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.timestamp}>Last updated: {readingTime}</Text>
          {showConfidence && (
            <ConfidenceGauge value={confidenceScore} size="small" showLabel />
          )}
        </View>

        {renderMoistureReadings()}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.footerText}>
            Optimal soil moisture is between 40-70%
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  readingsContainer: {
    marginBottom: 16,
  },
  readingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  readingDepth: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  moistureIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  readingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginRight: 8,
  },
  readingStatus: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    marginTop: 10,
    color: colors.gray600,
    textAlign: "center",
  },
});

export default SensorReadingCard;
