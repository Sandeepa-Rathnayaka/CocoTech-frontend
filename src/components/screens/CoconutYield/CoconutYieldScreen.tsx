import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getLocations } from '../../../api/locationApi';
import { Location } from '../../../types';
import { colors } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';
import { NavigationProp } from '@react-navigation/native';
import { YieldPredictionHistory, yieldApi, LocationDetails } from '../../../api/yieldApi';

const calculateAge = (plantationDate: Date): string => {
  const plantDate = new Date(plantationDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - plantDate.getTime());
  const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  if (years === 0) {
    return `${months} months old`;
  }
  return years === 1 ? `${years} year old` : `${years} years old`;
};


const CoconutYieldScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await getLocations(1);
      setLocations(response);
      setPage(1);
      setHasMore(response.length >= ITEMS_PER_PAGE);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchLocations();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMoreLocations = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const response = await getLocations(nextPage);

      if (response.length === 0) {
        setHasMore(false);
        return;
      }

      setLocations(prevLocations => [...prevLocations, ...response]);
      setPage(nextPage);
      setHasMore(response.length >= ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more locations:', error);
    }
  };

  const getSoilColor = (soilType: string): string => {
    switch (soilType) {
      case "Lateritic":
        return "#CD7F32"; // Bronze
      case "Sandy Loam":
        return "#DAA520"; // Golden
      case "Cinnamon Sand":
        return "#D2691E"; // Cinnamon
      case "Red Yellow Podzolic":
        return "#A52A2A"; // Brown
      case "Alluvial":
        return "#708090"; // Slate gray
      default:
        return "#8B4513"; // Default brown
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => navigation.navigate('Prediction', { 
        locationId: item._id,
        locationName: item.name
      })}
    >
      <View style={styles.locationHeader}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationArea}>{item.area} acres</Text>
      </View>
      <View style={styles.locationDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="leaf-outline" size={20} color="#4CD964" />
            <Text style={styles.detailText}>{item.totalTrees} {t('lands.trees')}</Text>
          </View>
          <View style={styles.statItem}>
            <View
              style={[
                styles.soilIcon,
                { backgroundColor: getSoilColor(item.soilType) },
              ]}
            />
            <Text style={styles.statValue}>{item.soilType}</Text>
            {/* <Text style={styles.statLabel}>{t('lands.soilType')}</Text> */}
          </View>
        </View>
        <View style={[styles.detailRow, styles.marginTop]}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View style={styles.dateContainer}>
              <Text style={styles.detailText}>
                {new Date(item.plantationDate).toLocaleDateString()}
              </Text>
              <View style={styles.ageContainer}>
                <Text style={styles.ageText}>{t('lands.age')}: </Text>
                <Text style={styles.ageValue}>{calculateAge(item.plantationDate)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#FF6B6B" />
            <Text style={styles.detailText}>
              {`${item.coordinates.latitude.toFixed(4)}, ${item.coordinates.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>
        {item.description && (
          <View style={[styles.detailRow, styles.marginTop]}>
            <View style={styles.detailItem}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity 
        style={styles.loadMoreButton}
        onPress={loadMoreLocations}
      >
        <Text style={styles.loadMoreText}>{t('lands.loadMore')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CD964" style={styles.loader} />
      ) : locations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('lands.emptyState')}</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddLocation')}
          >
            <Text style={styles.addFirstButtonText}>{t('lands.addFirst')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Instruction text for users */}
          <View style={styles.instructionContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#4CD964" />
            <Text style={styles.instructionText}>
              {t('lands.selectToPredict', 'Please select a location to predict yield')}
            </Text>
          </View>
          
          <FlatList
            data={locations}
            renderItem={renderLocationItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.locationsList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={hasMore ? renderFooter : null}
            onEndReached={hasMore ? loadMoreLocations : null}
            onEndReachedThreshold={0.2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4CD964']}
                tintColor="#4CD964"
                title={t('common.refreshing')}
                titleColor={'#4CD964'}
              />
            }
          />
          
          {/* Coconut Price Prediction Button */}
          <TouchableOpacity 
            style={styles.pricePredictionButton}
            onPress={() => navigation.navigate('CoconutPricePredict')}
          >
            <Ionicons name="trending-up-outline" size={20} color="#FFFFFF" />
            <Text style={styles.pricePredictionButtonText}>
              {t('navigation.coconutPricePredict')}
            </Text>
          </TouchableOpacity>
          
          {/* Button to navigate to Prediction History page */}
          <TouchableOpacity 
            style={[styles.historyButton, { marginTop: 12 }]} // Adjusted margin top
            onPress={() => navigation.navigate('PredictionHistory')}
          >
            <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            <Text style={styles.historyButtonText}>
              {t('navigation.viewPredictionHistory')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  addFirstButton: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationsList: {
    paddingBottom: 20,
  },
  locationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  locationArea: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationDetails: {
    flexDirection: 'column',
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  soilIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  dateContainer: {
    flex: 1,
    marginLeft: 8,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 8,
  },
  ageText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ageValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  marginTop: {
    marginTop: 8,
  },
  loadMoreButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  loadMoreText: {
    color: '#4CD964',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4', // Light green background
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7', // Lighter green border
  },
  instructionText: {
    fontSize: 14,
    color: '#166534', // Dark green text
    marginLeft: 8,
    flex: 1,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CD964',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pricePredictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6', // Different color from yield button (blue)
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pricePredictionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CoconutYieldScreen;