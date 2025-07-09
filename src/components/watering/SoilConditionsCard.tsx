import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Card from '../common/Card';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

interface SoilConditionsCardProps {
  soilConditions: {
    moisture10cm: number;
    moisture20cm: number;
    moisture30cm: number;
    soilType: string;
  };
  plantAge?: number;
  style?: ViewStyle;
  title?: string;
  containerStyle?: ViewStyle;
}

const SoilConditionsCard: React.FC<SoilConditionsCardProps> = ({
  soilConditions,
  plantAge,
  style,
  title,
  containerStyle,
}) => {
  // Initialize translation hook
  const { t } = useTranslation();
  
  // If no custom title is provided, use the translated default title
  const cardTitle = title || t('soilConditions.title');
  
  const getMoistureColor = (moisture: number) => {
    if (moisture < 20) return colors.error; // Too dry
    if (moisture < 40) return colors.warning; // Dry
    if (moisture < 60) return colors.success; // Optimal
    if (moisture < 80) return colors.info; // Moist
    return colors.primary; // Very moist
  };
  
  const getMoistureLabel = (moisture: number): string => {
    if (moisture < 20) return t('soilConditions.moisture.tooDry');
    if (moisture < 40) return t('soilConditions.moisture.dry');
    if (moisture < 60) return t('soilConditions.moisture.optimal');
    if (moisture < 80) return t('soilConditions.moisture.moist');
    return t('soilConditions.moisture.veryMoist');
  };

  const getSoilTypeColor = (soilType: string): string => {
    switch (soilType) {
      case t('soilConditions.soilTypes.lateritic'):
        return '#CD7F32'; // Bronze
      case t('soilConditions.soilTypes.sandyLoam'):
        return '#DAA520'; // Golden
      case t('soilConditions.soilTypes.cinnamonSand'):
        return '#D2691E'; // Cinnamon
      case t('soilConditions.soilTypes.redYellowPodzolic'):
        return '#A52A2A'; // Brown
      case t('soilConditions.soilTypes.alluvial'):
        return '#708090'; // Slate gray
      default:
        return '#8B4513'; // Default brown
    }
  };

  return (
    <Card style={[styles.container, containerStyle]} variant="flat">
      <Text style={styles.title}>{cardTitle}</Text>
      
      <View style={styles.moistureGrid}>
        <View style={styles.moistureColumn}>
          <Text style={styles.depthLabel}>10 cm</Text>
          <View style={styles.moistureBarContainer}>
            <View 
              style={[
                styles.moistureBar, 
                { 
                  height: `${soilConditions.moisture10cm}%`,
                  backgroundColor: getMoistureColor(soilConditions.moisture10cm) 
                }
              ]} 
            />
          </View>
          <Text style={styles.moistureValue}>{soilConditions.moisture10cm}%</Text>
        </View>
        
        <View style={styles.moistureColumn}>
          <Text style={styles.depthLabel}>20 cm</Text>
          <View style={styles.moistureBarContainer}>
            <View 
              style={[
                styles.moistureBar, 
                { 
                  height: `${soilConditions.moisture20cm}%`,
                  backgroundColor: getMoistureColor(soilConditions.moisture20cm) 
                }
              ]} 
            />
          </View>
          <Text style={styles.moistureValue}>{soilConditions.moisture20cm}%</Text>
        </View>
        
        <View style={styles.moistureColumn}>
          <Text style={styles.depthLabel}>30 cm</Text>
          <View style={styles.moistureBarContainer}>
            <View 
              style={[
                styles.moistureBar, 
                { 
                  height: `${soilConditions.moisture30cm}%`,
                  backgroundColor: getMoistureColor(soilConditions.moisture30cm) 
                }
              ]} 
            />
          </View>
          <Text style={styles.moistureValue}>{soilConditions.moisture30cm}%</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.soilTypeContainer}>
          <View style={[
            styles.soilTypeIcon,
            { backgroundColor: getSoilTypeColor(soilConditions.soilType) }
          ]} />
          <View>
            <Text style={styles.infoLabel}>{t('soilConditions.soilType')}</Text>
            <Text style={styles.infoValue}>{soilConditions.soilType}</Text>
          </View>
        </View>
        
        {plantAge !== undefined && (
          <View style={styles.ageContainer}>
            <Text style={styles.infoLabel}>{t('soilConditions.plantAge')}</Text>
            <Text style={styles.infoValue}>
              {plantAge} {plantAge === 1 
                ? t('soilConditions.year') 
                : t('soilConditions.years')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>{t('soilConditions.moisture.tooDry')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>{t('soilConditions.moisture.dry')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>{t('soilConditions.moisture.optimal')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.info }]} />
          <Text style={styles.legendText}>{t('soilConditions.moisture.moist')}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  moistureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  moistureColumn: {
    alignItems: 'center',
    width: 70,
  },
  depthLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  moistureBarContainer: {
    height: 120,
    width: 20,
    backgroundColor: colors.gray100,
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  moistureBar: {
    width: '100%',
    borderRadius: 10,
  },
  moistureValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray200,
    paddingVertical: 12,
    marginBottom: 12,
  },
  soilTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soilTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  ageContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default SoilConditionsCard;