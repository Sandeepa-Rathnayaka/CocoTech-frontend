import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { colors } from '../../constants/colors';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

interface WeatherConditionsCardProps {
  weatherConditions: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  date?: string | Date;
  style?: ViewStyle;
  title?: string;
  containerStyle?: ViewStyle;
}

const WeatherConditionsCard: React.FC<WeatherConditionsCardProps> = ({
  weatherConditions,
  date,
  style,
  title,
  containerStyle,
}) => {
  // Initialize translation hook
  const { t, i18n } = useTranslation();
  
  // If no custom title is provided, use the translated default title
  const cardTitle = title || t('weatherConditions.title');
  
  const getTemperatureColor = (temperature: number) => {
    if (temperature < 15) return '#6495ED'; // Cold (Cornflower Blue)
    if (temperature < 25) return '#98FB98'; // Mild (Pale Green)
    if (temperature < 32) return '#FFA500'; // Warm (Orange)
    return '#FF4500'; // Hot (Orange Red)
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 30) return '#E6E6FA'; // Low (Lavender)
    if (humidity < 50) return '#87CEFA'; // Moderate (Light Sky Blue)
    if (humidity < 70) return '#1E90FF'; // High (Dodger Blue)
    return '#0000CD'; // Very High (Medium Blue)
  };

  const getRainfallIcon = (rainfall: number) => {
    if (rainfall <= 0) return 'sunny-outline';
    if (rainfall < 1) return 'rainy-outline';
    if (rainfall < 10) return 'thunderstorm-outline';
    return 'water-outline';
  };

  const getRainfallLabel = (rainfall: number) => {
    if (rainfall <= 0) return t('weatherConditions.rainfallLabels.none');
    if (rainfall < 1) return t('weatherConditions.rainfallLabels.light');
    if (rainfall < 10) return t('weatherConditions.rainfallLabels.moderate');
    return t('weatherConditions.rainfallLabels.heavy');
  };

  // Get appropriate locale based on current language
  const getCurrentLocale = () => {
    const language = i18n.language;
    switch (language) {
      case 'ta':
        return 'ta-IN'; // Tamil locale
      case 'si':
        return 'si-LK'; // Sinhala locale
      default:
        return 'en-US'; // Default to English locale
    }
  };

  const formatDateTime = (dateString?: string | Date) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString(getCurrentLocale(), {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Helper function to generate weather summary
  const getRainfallSummary = (weather: { temperature: number; humidity: number; rainfall: number }) => {
    if (weather.rainfall > 0) {
      return t('weatherConditions.summaries.rainfallDetected', { amount: weather.rainfall });
    } else if (weather.temperature > 30 && weather.humidity < 50) {
      return t('weatherConditions.summaries.hotAndDry');
    } else if (weather.temperature < 20 && weather.humidity > 70) {
      return t('weatherConditions.summaries.coolAndHumid');
    } else if (weather.humidity > 80) {
      return t('weatherConditions.summaries.highHumidity');
    } else {
      return t('weatherConditions.summaries.regular');
    }
  };

  return (
    <Card style={[styles.container, containerStyle]} variant="flat">
      <View style={styles.header}>
        <Text style={styles.title}>{cardTitle}</Text>
        {date && (
          <Text style={styles.dateText}>
            {t('weatherConditions.asOf', { dateTime: formatDateTime(date) })}
          </Text>
        )}
      </View>
      
      <View style={styles.metricsContainer}>
        {/* Temperature */}
        <View style={styles.metricCard}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getTemperatureColor(weatherConditions.temperature) + '20' }
          ]}>
            <Ionicons 
              name="thermometer-outline" 
              size={24} 
              color={getTemperatureColor(weatherConditions.temperature)} 
            />
          </View>
          <Text style={styles.metricValue}>
            {weatherConditions.temperature}°C
          </Text>
          <Text style={styles.metricLabel}>{t('weatherConditions.temperature')}</Text>
        </View>
        
        {/* Humidity */}
        <View style={styles.metricCard}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getHumidityColor(weatherConditions.humidity) + '20' }
          ]}>
            <Ionicons 
              name="water-outline" 
              size={24} 
              color={getHumidityColor(weatherConditions.humidity)} 
            />
          </View>
          <Text style={styles.metricValue}>
            {weatherConditions.humidity}%
          </Text>
          <Text style={styles.metricLabel}>{t('weatherConditions.humidity')}</Text>
        </View>
        
        {/* Rainfall */}
        <View style={styles.metricCard}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '20' }
          ]}>
            <Ionicons 
              name={getRainfallIcon(weatherConditions.rainfall)} 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.metricValue}>
            {weatherConditions.rainfall} mm
          </Text>
          <Text style={styles.metricLabel}>{t('weatherConditions.rainfall')}</Text>
        </View>
      </View>
      
      <View style={styles.summaryContainer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.summaryText}>
          {getRainfallSummary(weatherConditions)}
        </Text>
      </View>
    </Card>
  );
};

// Helper function to generate weather summary
// const getRainfallSummary = (weather: { temperature: number; humidity: number; rainfall: number }) => {
//   if (weather.rainfall > 0) {
//     return `Rainfall of ${weather.rainfall}mm detected. Adjust watering accordingly.`;
//   } else if (weather.temperature > 30 && weather.humidity < 50) {
//     return `Hot and dry conditions. Plants may need additional water.`;
//   } else if (weather.temperature < 20 && weather.humidity > 70) {
//     return `Cool and humid conditions. Reduced watering may be sufficient.`;
//   } else if (weather.humidity > 80) {
//     return `High humidity may reduce plant water needs.`;
//   } else {
//     return `Regular watering recommended based on soil conditions.`;
//   }
// };

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
});

export default WeatherConditionsCard;