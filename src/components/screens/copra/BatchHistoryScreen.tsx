import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { copraApi } from '../../../api/copraApi';
import { calculateOilYield } from '../../../utils/moistureHelper';

const { width } = Dimensions.get('window');

interface Reading {
  _id: string;
  moistureLevel: number;
  status: string;
  startTime: string;
  endTime: string;
  dryingTime: number;
  weatherConditions: {
    temperature: number;
    humidity: number;
  };
  notes?: string;
}

const getStatusColor = (status: string) => {
  const statusColors = {
    TOO_WET: '#FF4B4B',
    WET: '#FFA726',
    OPTIMAL: '#4CAF50',
    DRY: '#2196F3',
    TOO_DRY: '#9C27B0',
    DEFAULT: '#666666',
  };
  return statusColors[status as keyof typeof statusColors] || statusColors.DEFAULT;
};

const getStatusIcon = (status: string) => {
  const statusIcons = {
    TOO_WET: 'water',
    WET: 'water-outline',
    OPTIMAL: 'check-circle',
    DRY: 'sun',
    TOO_DRY: 'alert-circle',
    DEFAULT: 'help-circle',
  };
  return statusIcons[status as keyof typeof statusIcons] || statusIcons.DEFAULT;
};

export const BatchHistoryScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { batchId } = route.params as any;
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBatchHistory();
    });

    return unsubscribe;
  }, [navigation, batchId]);

  const fetchBatchHistory = async () => {
    try {
      setLoading(true);
      const response = await copraApi.getBatchHistory(batchId);
      setReadings(response.data);
    } catch (error) {
      Alert.alert(t('common.error'), t('copra.failedToFetchHistory'));
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, dryingTime: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + dryingTime * 60 * 60 * 1000);
    return end.toLocaleString();
  };

  const handleDeleteReading = (readingId: string) => {
    Alert.alert(
      t('copra.confirmDelete'),
      t('copra.deleteRecordConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await copraApi.deleteSingleReading(batchId, readingId);
              // Remove the deleted reading from state
              setReadings(readings.filter(reading => reading._id !== readingId));
              Alert.alert(
                t('common.success'), 
                t('copra.recordDeletedSuccess'),
                [
                  { 
                    text: t('common.ok'),
                    onPress: () => {
                      // Refresh the batch history after deletion
                      fetchBatchHistory();
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert(t('common.error'), t('copra.failedToDeleteRecord'));
            }
          }
        }
      ]
    );
  };

  const handleEditReading = (reading: Reading) => {
    navigation.navigate('UpdateReading' as never, { 
      batchId, 
      reading 
    } as never);
  };

  const handleDeleteBatch = () => {
    Alert.alert(
      t('copra.deleteEntireBatch'),
      t('copra.deleteBatchConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('copra.deleteBatch'), 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await copraApi.deleteBatchReadings(batchId);
              Alert.alert(
                t('common.success'), 
                t('copra.batchDeletedSuccess'),
                [
                  { 
                    text: t('common.ok'),
                    onPress: () => {
                      navigation.navigate('AllBatches' as never);
                    }
                  }
                ]
              );
            } catch (error) {
              setLoading(false);
              Alert.alert(t('common.error'), t('copra.failedToDeleteBatch'));
            }
          }
        }
      ]
    );
  };

  const handleGenerateGraph = () => {
    if (readings.length < 2) {
      Alert.alert(
        t('copra.notEnoughData'),
        t('copra.needMoreReadings')
      );
      return;
    }
    
    // Navigate to graph screen with the readings data
    navigation.navigate('MoistureGraph' as never, { 
      batchId, 
      readings 
    } as never);
  };

  const getDisplayDryingTime = (moistureLevel: number, dryingTime: number) => {
    // If moisture level is 7 or lower, display drying time as 0
    if (moistureLevel <= 7) {
      return 0;
    }
    return dryingTime;
  };

  const formatStatus = (status: string) => {
    return t(`copra.status.${status.toLowerCase()}`);
  };

  const renderItem = ({ item }: { item: Reading }) => {
    // Calculate oil yield for 10kg of copra
    const oilYield = calculateOilYield(item.moistureLevel);
    // Get the correct drying time to display
    const displayDryingTime = getDisplayDryingTime(item.moistureLevel, item.dryingTime);
    
    return (
      <View style={styles.card}>
        {/* Status Header with Action Icons */}
        <View style={[styles.statusHeader, { backgroundColor: getStatusColor(item.status) }]}>
          <View style={styles.statusHeaderLeft}>
            <MaterialCommunityIcons name={getStatusIcon(item.status)} size={24} color="white" />
            <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEditReading(item)}
              style={styles.actionButton}
            >
              <MaterialIcons name="edit" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteReading(item._id)}
              style={styles.actionButton}
            >
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Moisture and Drying Time */}
        <View style={styles.mainInfo}>
          <View style={styles.moistureContainer}>
            <MaterialCommunityIcons name="water-percent" size={32} color="#007AFF" />
            <Text style={styles.moistureValue}>{item.moistureLevel}%</Text>
            <Text style={styles.moistureLabel}>{t('copra.moisture')}</Text>
          </View>

          <View style={styles.timeContainer}>
            <MaterialIcons name="timer" size={32} color="#4CAF50" />
            <Text style={styles.timeValue}>{displayDryingTime.toFixed(1)}h</Text>
            <Text style={styles.timeLabel}>{t('copra.dryingTime')}</Text>
          </View>
          
          {/* New Oil Yield Information */}
          <View style={styles.oilYieldContainer}>
            <FontAwesome5 name="oil-can" size={32} color="#FFD700" />
            <Text style={styles.oilYieldValue}>{oilYield.toFixed(1)}kg</Text>
            <Text style={styles.oilYieldLabel}>{t('copra.oilYield')}</Text>
          </View>
        </View>

        {/* Weather Conditions */}
        <View style={styles.weatherContainer}>
          <View style={styles.weatherCard}>
            <MaterialCommunityIcons name="thermometer" size={24} color="#FF9800" />
            <Text style={styles.weatherValue}>{item.weatherConditions.temperature}°C</Text>
            <Text style={styles.weatherLabel}>{t('copra.temperature')}</Text>
          </View>

          <View style={styles.weatherCard}>
            <MaterialCommunityIcons name="water-outline" size={24} color="#03A9F4" />
            <Text style={styles.weatherValue}>{item.weatherConditions.humidity}%</Text>
            <Text style={styles.weatherLabel}>{t('copra.humidity')}</Text>
          </View>
        </View>

        {/* Time Information */}
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={18} color="#666" />
            <Text style={styles.timeInfoText}>
              {t('copra.start')}: {new Date(item.startTime).toLocaleString()}
            </Text>
          </View>
          {/* Only show expected end time if there's a drying time greater than 0 */}
          {displayDryingTime > 0 && (
            <View style={styles.timeRow}>
              <MaterialIcons name="update" size={18} color="#666" />
              <Text style={styles.timeInfoText}>
                {t('copra.expectedEnd')}: {calculateEndTime(item.startTime, displayDryingTime)}
              </Text>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {item.notes && (
          <View style={styles.notesContainer}>
            <MaterialIcons name="note" size={18} color="#666" />
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={readings}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          onPress={handleGenerateGraph}
          style={styles.generateGraphButton}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color="#fff" />
          <Text style={styles.generateGraphText}>{t('copra.generateGraph')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={handleDeleteBatch}
        style={styles.deleteBatchButton}
      >
        <MaterialIcons name="delete-sweep" size={24} color="#fff" />
        <Text style={styles.deleteBatchText}>{t('copra.deleteBatch')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  headerButton: {
    marginRight: 8,
    padding: 4,
  },
  actionButtonsContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  generateGraphButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a86e8',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  generateGraphText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
    justifyContent: 'space-between',
    padding: 12,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  moistureContainer: {
    alignItems: 'center',
  },
  moistureValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 4,
  },
  moistureLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  oilYieldContainer: {
    alignItems: 'center',
  },
  oilYieldValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 4,
  },
  oilYieldLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  weatherCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    width: width * 0.35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  timeInfoText: {
    fontSize: 14,
    color: '#333',
  },
  notesContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  notes: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  deleteBatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    margin: 16,
    justifyContent: 'center',
    gap: 8,
  },
  deleteBatchText: {
    color: '#fff',
    fontWeight: '600',
  },
});