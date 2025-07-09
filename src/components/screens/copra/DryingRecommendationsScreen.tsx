import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface RouteParams {
  batchId: string;
  currentMoisture: number;
  targetMoisture: number;
  status: string;
  weatherConditions: {
    temperature: number;
    humidity: number;
  };
}

export const DryingRecommendationsScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { 
    batchId, 
    currentMoisture, 
    targetMoisture, 
    status, 
    weatherConditions 
  } = route.params as RouteParams;

  // Get recommendations based on current status and conditions
  const getDryingRecommendations = () => {
    const { temperature, humidity } = weatherConditions;
    const isHighHumidity = humidity > 70;
    const isLowTemperature = temperature < 25; // Celsius
    
    if (status === 'newly_harvested') {
      return [
        {
          title: t('copra.recommendations.initialDryingSetup.title'),
          icon: 'sun-wireless',
          description: t('copra.recommendations.initialDryingSetup.description'),
          iconColor: '#FF9800',
        },
        {
          title: t('copra.recommendations.airCirculation.title'),
          icon: 'fan',
          description: t('copra.recommendations.airCirculation.description'),
          iconColor: '#03A9F4',
        },
        {
          title: t('copra.recommendations.sunExposure.title'),
          icon: 'weather-sunny',
          description: isHighHumidity ? 
            t('copra.recommendations.sunExposure.highHumidity') : 
            t('copra.recommendations.sunExposure.normal'),
          iconColor: '#FF9800',
        },
        {
          title: t('copra.recommendations.firstTurn.title'),
          icon: 'rotate-3d-variant',
          description: t('copra.recommendations.firstTurn.description'),
          iconColor: '#9C27B0',
        },
        {
          title: t('copra.recommendations.protection.title'),
          icon: 'weather-night',
          description: t('copra.recommendations.protection.description'),
          iconColor: '#3F51B5',
        },
      ];
    } else if (status === 'Moderate_level') {
      return [
        {
          title: t('copra.recommendations.controlledDrying.title'),
          icon: 'thermometer',
          description: isLowTemperature ? 
            t('copra.recommendations.controlledDrying.lowTemperature') : 
            t('copra.recommendations.controlledDrying.normal'),
          iconColor: '#E91E63',
        },
        {
          title: t('copra.recommendations.regularTurning.title'),
          icon: 'sync',
          description: t('copra.recommendations.regularTurning.description'),
          iconColor: '#4CAF50',
        },
        {
          title: t('copra.recommendations.moistureMonitoring.title'),
          icon: 'water-percent',
          description: t('copra.recommendations.moistureMonitoring.description'),
          iconColor: '#00BCD4',
        },
        {
          title: t('copra.recommendations.spatialArrangement.title'),
          icon: 'grid',
          description: t('copra.recommendations.spatialArrangement.description'),
          iconColor: '#8BC34A',
        },
        {
          title: t('copra.recommendations.heatManagement.title'),
          icon: 'heat-wave',
          description: isHighHumidity ? 
            t('copra.recommendations.heatManagement.highHumidity') : 
            t('copra.recommendations.heatManagement.normal'),
          iconColor: '#FF5722',
        },
      ];
    }
    
    return []; // Default if somehow status isn't recognized
  };

  const recommendations = getDryingRecommendations();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{t('copra.dryingRecommendations')}</Text>
          <Text style={styles.subtitle}>
            {t('copra.optimizedForBatch', { id: batchId.slice(-6) })}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons 
              name="water-percent-alert" 
              size={28} 
              color="#007AFF" 
            />
            <Text style={styles.statusTitle}>{t('copra.currentStatus')}</Text>
          </View>
          <View style={styles.statusDetailsContainer}>
            <View style={styles.statusDetail}>
              <Text style={styles.statusLabel}>{t('copra.currentMoisture')}:</Text>
              <Text style={styles.statusValue}>{currentMoisture}%</Text>
            </View>
            <View style={styles.statusDetail}>
              <Text style={styles.statusLabel}>{t('copra.targetMoisture')}:</Text>
              <Text style={styles.statusValue}>{targetMoisture}%</Text>
            </View>
            <View style={styles.statusDetail}>
              <Text style={styles.statusLabel}>{t('copra.weather')}:</Text>
              <Text style={styles.statusValue}>
                {weatherConditions.temperature}°C, {weatherConditions.humidity}% {t('copra.humidity')}
              </Text>
            </View>
            <View style={styles.statusDetailFull}>
              <Text style={styles.statusLabel}>{t('copra.dryingStatus')}:</Text>
              <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                <Text style={styles.statusBadgeText}>{formatStatus(status)}</Text>
              </View>
            </View>
          </View>
        </View>

        {recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <MaterialCommunityIcons 
                name={recommendation.icon} 
                size={24} 
                color={recommendation.iconColor} 
              />
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            </View>
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>{t('copra.qualityReminders')}</Text>
          </View>
          <Text style={styles.infoText}>
            {t('copra.reminder1')}{'\n'}
            {t('copra.reminder2')}{'\n'}
            {t('copra.reminder3')}{'\n'}
            {t('copra.reminder4')}{'\n'}
            {t('copra.reminder5')}
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneButtonText}>{t('copra.returnToMoistureGraph')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Helper functions
const formatStatus = (status: string): string => {
  const { t } = useTranslation();
  switch (status) {
    case 'newly_harvested':
      return t('copra.status.newly_harvested');
    case 'Moderate_level':
      return t('copra.status.moderate_level');
    case 'dryed':
      return t('copra.status.dryed');
    case 'over_dryed':
      return t('copra.status.over_dryed');
    default:
      return status;
  }
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'newly_harvested':
      return { backgroundColor: '#FF9800' }; // Orange
    case 'Moderate_level':
      return { backgroundColor: '#2196F3' }; // Blue
    case 'dryed':
      return { backgroundColor: '#4CAF50' }; // Green
    case 'over_dryed':
      return { backgroundColor: '#F44336' }; // Red
    default:
      return { backgroundColor: '#9E9E9E' }; // Grey
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  statusDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusDetail: {
    width: '50%',
    marginBottom: 12,
  },
  statusDetailFull: {
    width: '100%',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  recommendationDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  spacer: {
    height: 80,
  },
  doneButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});