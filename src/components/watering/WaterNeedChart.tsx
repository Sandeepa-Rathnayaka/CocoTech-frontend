import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { getWaterNeedColors, getWaterNeedLabel } from '../../utils/wateringHelpers';
import Card from '../common/Card';
import ConfidenceGauge from '../common/ConfidenceGauge';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

interface WaterNeedChartProps {
  amount: number;
  confidence?: number;
  showGauge?: boolean;
  showDetail?: boolean;
  style?: ViewStyle;
}

const WaterNeedChart: React.FC<WaterNeedChartProps> = ({
  amount,
  confidence = 0,
  showGauge = true,
  showDetail = true,
  style,
}) => {
  // Initialize translation hook
  const { t } = useTranslation();
  
  const waterColors = getWaterNeedColors(amount);
  const waterLabel = getWaterNeedLabel(amount);

  // Format amount to have one decimal if not a whole number
  const formattedAmount = Number.isInteger(amount) 
    ? amount.toString() 
    : amount.toFixed(1);
    
  // Get recommendation text based on water amount
  const getRecommendationText = (amount: number): string => {
    if (amount === 0) {
      return t('waterNeedChart.recommendations.noWatering');
    } else if (amount < 30) {
      return t('waterNeedChart.recommendations.lightWatering');
    } else if (amount < 50) {
      return t('waterNeedChart.recommendations.moderateWatering');
    } else {
      return t('waterNeedChart.recommendations.fullWatering');
    }
  };

  return (
    <Card style={[styles.container, style]} variant="elevated">
      <View style={styles.header}>
        <Text style={styles.title}>{t('waterNeedChart.title')}</Text>
        {showGauge && confidence > 0 && (
          <ConfidenceGauge 
            value={confidence} 
            size="small" 
            showLabel={false}
            gaugeColor={waterColors.main}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.amountContainer}>
          <View 
            style={[
              styles.amountBackground,
              { backgroundColor: waterColors.bg }
            ]}
          >
            <Text style={[styles.amountText, { color: waterColors.text }]}>
              {formattedAmount}L
            </Text>
          </View>
          <Text style={[styles.categoryText, { color: waterColors.text }]}>
            {waterLabel}
          </Text>
        </View>

        {showDetail && (
          <View style={styles.detailContainer}>
            {/* Info icon with recommendation message */}
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                {getRecommendationText(amount)}
              </Text>
            </View>

            {/* Confidence explanation if available */}
            {confidence > 0 && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="analytics-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoText}>
                  {t('waterNeedChart.mlModelConfidence', { confidence: confidence.toFixed(0) })}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary
  },
  contentContainer: {
    alignItems: 'center'
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  amountBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600'
  },
  detailContainer: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1
  }
});

export default WaterNeedChart;