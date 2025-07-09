import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { copraApi } from '../../../api/copraApi';
import type { BatchInfo } from '../../../api/copraApi';

const { width } = Dimensions.get('window');

export const AllBatchesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load batches when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBatches();
    }, [])
  );

  const loadBatches = async () => {
    try {
      setLoading(true);
      const response = await copraApi.getAllBatches();
      setBatches(response.data);
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBatches();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const updateDate = new Date(dateString);
    const diffMs = now.getTime() - updateDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return t('copra.daysAgo', { count: diffDays });
    } else if (diffHours > 0) {
      return t('copra.hoursAgo', { count: diffHours });
    } else {
      return t('copra.justNow');
    }
  };

  const navigateToBatchHistory = (batchId: string) => {
    // @ts-ignore
    navigation.navigate('BatchHistory', { batchId });
  };

  const navigateToCreateReading = () => {
    navigation.navigate('CreateReading' as never);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="folder-open-outline" size={80} color="#B0BEC5" />
      <Text style={styles.emptyTitle}>{t('copra.noBatchesFound')}</Text>
      <Text style={styles.emptyText}>
        {t('copra.createBatchPrompt')}
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={navigateToCreateReading}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>{t('copra.createNewBatch')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }: { item: BatchInfo, index: number }) => (
    <TouchableOpacity
      style={[styles.batchCard, { transform: [{ scale: 1 }] }]}
      onPress={() => navigateToBatchHistory(item.batchId)}
      activeOpacity={0.7}
    >
      <View style={styles.batchColorIndicator} />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.batchIdContainer}>
            <MaterialIcons name="batch-prediction" size={24} color="#007AFF" />
            <Text style={styles.batchId}>{t('copra.batchLabel', { id: item.batchId })}</Text>
          </View>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: index % 3 === 0 ? '#4CAF50' : index % 3 === 1 ? '#FFA726' : '#2196F3' }
          ]}>
            <Text style={styles.statusText}>
              {index % 3 === 0 ? t('copra.statusActive') : index % 3 === 1 ? t('copra.statusDrying') : t('copra.statusComplete')}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="data-usage" size={20} color="#546E7A" />
            <Text style={styles.infoText}>
              <Text style={styles.infoHighlight}>{item.readingsCount}</Text> {t('copra.readings')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="update" size={20} color="#546E7A" />
            <Text style={styles.infoText}>
              {t('copra.updated')} <Text style={styles.infoHighlight}>{getTimeSince(item.lastUpdated)}</Text>
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#546E7A" />
            <Text style={styles.infoText}>{formatDate(item.lastUpdated)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <MaterialIcons name="chevron-right" size={26} color="#B0BEC5" />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{t('copra.copraBatches')}</Text>
      <Text style={styles.headerSubtitle}>
        {t('copra.activeBatches', { count: batches.length })}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity 
      style={styles.footerButton}
      onPress={navigateToCreateReading}
    >
      <MaterialIcons name="add-circle" size={20} color="#007AFF" />
      <Text style={styles.footerButtonText}>{t('copra.createNewBatch')}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('copra.loadingBatches')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <FlatList
        data={batches}
        renderItem={renderItem}
        keyExtractor={(item) => item.batchId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={batches.length > 0 ? renderFooter : null}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />
      
      {batches.length > 0 && (
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={navigateToCreateReading}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#546E7A',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    minHeight: '100%',
  },
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  batchColorIndicator: {
    width: 6,
    backgroundColor: '#007AFF',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  batchIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#546E7A',
    marginLeft: 8,
  },
  infoHighlight: {
    color: '#263238',
    fontWeight: '600',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#455A64',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 72,
  },
  footerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});