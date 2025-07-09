import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { colors } from '../../../constants/colors';
import { getLocationById } from '../../../api/locationApi';
import { Location } from '../../../types';
import { Picker } from '@react-native-picker/picker';
import { yieldApi, YieldPredictionRequest, YieldPredictionResponse } from '../../../api/yieldApi';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

type PredictionRouteParams = {
  locationId: string;
  locationName?: string;
};

type PredictionScreenProps = {
  route: RouteProp<Record<string, PredictionRouteParams>, string>;
  navigation: any;
};

type WeatherData = {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon: string;
};

// Update the YieldPrediction type to match the actual response format
type YieldPrediction = {
  year: number;
  average_prediction: number;
  monthly_predictions: {
    confidence_score: number;
    ensemble_prediction: number;
    month: number;
    month_name: string;
    seasonal_factor: number;
    seasonal_prediction: number;
    input_data: {
      humidity: number;
      plant_age: number;
      rainfall: number;
      soil_moisture_10cm: number;
      soil_moisture_20cm: number;
      soil_moisture_30cm: number;
      soil_type: number;
      temperature: number;
      weather_description: string;
    };
    weights: number[];
    _id: string;
  }[];
  status: string;
};

const API_KEY = 'cc9c9becda5d2a32f04ec64f3e0b8dd6';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026];

const PredictionScreen: React.FC<PredictionScreenProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { locationId, locationName } = route.params;
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Get current date information
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  // Yield prediction states - update with current date
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isPredicting, setIsPredicting] = useState(false);
  const [yieldPrediction, setYieldPrediction] = useState<YieldPrediction | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Get available months (current month plus next 5 months)
  const getAvailableMonths = () => {
    const result = [];
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - 1 + i) % 12; // Convert to 0-indexed
      const monthNumber = monthIndex + 1; // Convert back to 1-indexed
      result.push({
        index: monthNumber,
        name: MONTHS[monthIndex]
      });
    }
    
    return result;
  };

  const availableMonths = getAvailableMonths();

  // Determine year based on selected month
  const determineYear = (month: number) => {
    // If selected month is earlier in the calendar than current month,
    // it must be in the next year
    if (month < currentMonth) {
      return currentYear + 1;
    }
    return currentYear;
  };

  useEffect(() => {
    // Set up the header title with the location name if available
    if (locationName) {
      navigation.setOptions({ title: locationName });
    }

    fetchLocationData();
  }, [locationId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Function to fetch location data
  const fetchLocationData = async () => {
    try {
      setLoading(true);
      // Fetch location data from API
      const locationData = await getLocationById(locationId);
      setLocation(locationData);
      setLoading(false);

      // Once location data is loaded, fetch weather data
      if (locationData.coordinates) {
        fetchWeatherData(locationData.coordinates.latitude, locationData.coordinates.longitude);
      }
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to load location data');
      setLoading(false);
    }
  };

  // Function to fetch weather data
  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);

      // Fetch current weather data
      const response = await axios.get(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      // Extract relevant weather information
      const weatherData: WeatherData = {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon
      };

      setWeather(weatherData);
      setWeatherLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setWeatherLoading(false);
      // Non-critical error, we don't set the main error state
    }
  };

  // Update the predictYield function to use the calculated year
  const predictYield = async () => {
    try {
      setIsPredicting(true);

      // Calculate age in years from plantation date
      const plantDate = new Date(location?.plantationDate || new Date());
      const today = new Date();
      const ageInYears = Math.floor(
        (today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      );

      // Map soil type string to number
      const soilTypeMap: { [key: string]: number } = {
        'Lateritic': 1,
        'Sandy Loam': 2,
        'Cinnamon Sand': 3,
        'Red Yellow Podzolic': 4,
        'Alluvial': 5,
      };

      const soilTypeCode = soilTypeMap[location?.soilType || ''] || 2;
      const selectedYear = determineYear(selectedMonth);

      // Prepare request data
      const requestData: YieldPredictionRequest = {
        year: selectedYear,
        locationId: locationId,
        monthly_data: [
          {
            month: selectedMonth,
            sm_10: 19.89,
            sm_20: 41.67,
            sm_30: 34.82,
            age: ageInYears,
            soil_type: soilTypeCode,
            "Temperature (°C)": weather?.temperature || 0,
            "Humidity (%)": weather?.humidity || 0,
            "Rainfall (mm)": weather?.rainfall || 0,
            "Weather Description": weather?.description || "NaN"
          }
        ]
      };

      // Make the actual API call
      console.log('Predicting yield with data:', JSON.stringify(requestData, null, 2));

      try {
        const response = await yieldApi.predictYield(requestData);
        console.log('API Response:', JSON.stringify(response, null, 2));

        // Process the actual API response
        if (response) {
          setYieldPrediction(response);
          console.log('Prediction data set to state');
        } else {
          console.error('API response is invalid:', response);
          alert('Invalid API response. Please try again.');
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        alert('API call failed. Please check your connection and try again.');
      } finally {
        setIsPredicting(false);
      }
    } catch (err) {
      console.error('Error in prediction function:', err);
      setIsPredicting(false);
      alert('Failed to predict yield. Please check your connection and try again.');
    }
  };

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

  const getWeatherColors = (description: string) => {
    const desc = description?.toLowerCase() || '';
    
    if (desc.includes('clear') || desc.includes('sunny')) {
      return {
        primary: '#FDB813',
        secondary: '#F5F7FB',
        icon: '#FF9500'
      };
    } else if (desc.includes('cloud')) {
      return {
        primary: '#73A5C6',
        secondary: '#F0F4FA',
        icon: '#607D8B'
      };
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return {
        primary: '#57A0D3',
        secondary: '#EDF4F9',
        icon: '#4682B4'
      };
    } else if (desc.includes('thunder')) {
      return {
        primary: '#6A5ACD',
        secondary: '#EEEDF5',
        icon: '#483D8B'
      };
    } else if (desc.includes('snow') || desc.includes('ice')) {
      return {
        primary: '#CFECF4',
        secondary: '#F0FCFF',
        icon: '#A5D6E7'
      };
    }
    // Default
    return {
      primary: '#78A1BB',
      secondary: '#F0F4FA',
      icon: '#5B8EA1'
    };
  };

  // Loading state render
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading location data...</Text>
      </View>
    );
  }

  // Error state render
  if (error || !location) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Failed to load location data'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLocationData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render for when data is loaded
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Location Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{location.name}</Text>
          
          <View style={styles.compactDetailsGrid}>
            <View style={styles.compactDetailItem}>
              <Ionicons name="leaf-outline" size={18} color={colors.success} />
              <Text style={styles.compactDetailText}>
                {location.plantationDate ? calculateAge(new Date(location.plantationDate)) : 'Age unknown'}
              </Text>
            </View>

            {/* Soil Type */}
            <View style={styles.compactDetailItem}>
              <Ionicons name="earth-outline" size={18} color="#8B4513" />
              <Text style={styles.compactDetailText}>
                {location.soilType || 'Unknown soil type'}
              </Text>
            </View>
            
            {/* Area Size */}
            <View style={styles.compactDetailItem}>
              <Ionicons name="resize-outline" size={18} color="#3366CC" />
              <Text style={styles.compactDetailText}>
                {location.area ? `${location.area.toFixed(2)} ha` : 'Area unknown'}
              </Text>
            </View>
          </View>
          
          <View style={styles.thinDivider} />
          
          <View style={styles.compactDetailRow}>
            <Ionicons name="location-outline" size={16} color={colors.error} />
            <Text style={styles.smallDetailText}>
              {`${location.coordinates.latitude.toFixed(4)}, ${location.coordinates.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>

        {/* Enhanced Weather Information */}
        <View style={styles.compactCard}>
          {weatherLoading ? (
            <View style={styles.weatherLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
            </View>
          ) : weather ? (
            <View style={styles.compactWeatherContainer}>
              {/* Date and Time Display */}
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.dateText}>{format(currentDateTime, 'EEEE, MMM dd, yyyy')}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.timeText}>{format(currentDateTime, 'h:mm a')}</Text>
                </View>
              </View>

              <View 
                style={[
                  styles.weatherMain,
                  { backgroundColor: `${getWeatherColors(weather.description).secondary}` }
                ]}
              >
                {weather.icon && (
                  <View style={styles.weatherIconContainer}>
                    <Image
                      source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
                      style={styles.compactWeatherIcon}
                    />
                  </View>
                )}
                <View style={styles.weatherTextContainer}>
                  <Text style={styles.compactTemperature}>
                    {Math.round(weather.temperature)}°C
                  </Text>
                  <Text style={[
                    styles.compactWeatherDescription, 
                    {color: getWeatherColors(weather.description).primary}
                  ]}>
                    {weather.description}
                  </Text>
                  <Text style={styles.locationName}>
                    {location.name}
                  </Text>
                </View>
              </View>
              
              <View style={styles.compactWeatherDetails}>
                <View style={[
                  styles.compactWeatherDetail, 
                  {backgroundColor: `${getWeatherColors(weather.description).secondary}30`}
                ]}>
                  <Ionicons 
                    name="water-outline" 
                    size={22} 
                    color={getWeatherColors(weather.description).icon} 
                  />
                  <Text style={styles.compactWeatherValue}>{weather.humidity}%</Text>
                  <Text style={styles.compactWeatherLabel}>Humidity</Text>
                </View>

                <View style={[
                  styles.compactWeatherDetail, 
                  {backgroundColor: `${getWeatherColors(weather.description).secondary}30`}
                ]}>
                  <Ionicons 
                    name="rainy-outline" 
                    size={22} 
                    color={getWeatherColors(weather.description).icon} 
                  />
                  <Text style={styles.compactWeatherValue}>{weather.rainfall} mm</Text>
                  <Text style={styles.compactWeatherLabel}>Rainfall</Text>
                </View>
                
                <View style={[
                  styles.compactWeatherDetail, 
                  {backgroundColor: `${getWeatherColors(weather.description).secondary}30`}
                ]}>
                  <Ionicons 
                    name="thermometer-outline" 
                    size={22} 
                    color={getWeatherColors(weather.description).icon} 
                  />
                  <Text style={styles.compactWeatherValue}>
                    {Math.round(weather.temperature)}°
                  </Text>
                  <Text style={styles.compactWeatherLabel}>Temp</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.weatherLoadingContainer}>
              <Ionicons name="cloud-offline-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.weatherLoadingText}>Weather data unavailable</Text>
            </View>
          )}
        </View>

        {/* Yield Prediction Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('prediction.yieldPrediction')}</Text>
          
          <Text style={styles.predictionInfoText}>
            {t('prediction.accurateTimeframe')}
          </Text>

          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.pickerLabel}>{t('prediction.monthPickerLabel')}</Text>
              <View style={styles.pickerValue}>
                <Text style={styles.pickerValueText}>{MONTHS[selectedMonth - 1]}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.yearDisplay}>
              <Text style={styles.pickerLabel}>{t('prediction.yearPickerLabel')}</Text>
              <Text style={styles.yearDisplayText}>{determineYear(selectedMonth)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.predictButtonContainer}
            onPress={predictYield}
            disabled={isPredicting}
          >
            <LinearGradient
              colors={['#1a73e8', '#0d47a1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.predictButtonGradient}
            >
              {isPredicting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.predictButtonText}>{t('prediction.makeNewPrediction')}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Yield Prediction Results Section */}
        {yieldPrediction && (
          <View style={styles.predictionResultsCard}>
            <View style={styles.predictionHeaderSection}>
              <Text style={styles.predictionResultTitle}>{t('prediction.predictionResults')}</Text>
              <View style={styles.yearBadge}>
                <Text style={styles.yearBadgeText}>{yieldPrediction.year}</Text>
              </View>
            </View>

            <View style={styles.averagePredictionContainer}>
              <Text style={styles.averagePredictionValue}>
                {yieldPrediction.average_prediction.toFixed(1)}
              </Text>
              <Text style={styles.averagePredictionLabel}>{t('prediction.nutsPerHectare')}</Text>
            </View>

            <View style={styles.predictionStatusContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: yieldPrediction.status === 'success' ? colors.success : colors.warning }
              ]} />
              <Text style={styles.predictionStatusText}>
                {t('prediction.predictionStatus')}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Monthly Predictions */}
            <Text style={styles.sectionTitle}>{t('prediction.monthlyBreakdown')}</Text>
            {yieldPrediction.monthly_predictions.map((prediction, index) => (
              <View key={index} style={styles.monthlyPredictionContainer}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthName}>{prediction.month_name}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceBadgeText}>
                      {Math.round(prediction.confidence_score)}% confidence
                    </Text>
                  </View>
                </View>

                <View style={styles.predictionValuesContainer}>
                  <View style={styles.predictionValueBox}>
                    <Text style={styles.predictionValueAmount}>{prediction.ensemble_prediction.toFixed(1)}</Text>
                    <Text style={styles.predictionValueLabel}>Ensemble</Text>
                  </View>
                  <View style={styles.predictionValueDivider} />
                  <View style={styles.predictionValueBox}>
                    <Text style={styles.predictionValueAmount}>{prediction.seasonal_prediction.toFixed(1)}</Text>
                    <Text style={styles.predictionValueLabel}>Seasonal</Text>
                  </View>
                </View>

                {/* Prediction Factors */}

                <View style={styles.factorsContainer}>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Temperature</Text>
                    <Text style={styles.factorValue}>{prediction.input_data.temperature}°C</Text>
                  </View>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Humidity</Text>
                    <Text style={styles.factorValue}>{prediction.input_data.humidity}%</Text>
                  </View>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Rainfall</Text>
                    <Text style={styles.factorValue}>{prediction.input_data.rainfall} mm</Text>
                  </View>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Plant Age</Text>
                    <Text style={styles.factorValue}>{prediction.input_data.plant_age} years</Text>
                  </View>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Soil Type</Text>
                    <Text style={styles.factorValue}>Type {prediction.input_data.soil_type}</Text>
                  </View>
                  <View style={styles.factorRow}>
                    <Text style={styles.factorLabel}>Seasonal Factor</Text>
                    <Text style={styles.factorValue}>{prediction.seasonal_factor.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Year Picker Modal */}
        <Modal
          visible={showYearPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Year</Text>
                <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
              >
                {YEARS.map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Month Picker Modal - Updated to show only available months */}
        <Modal
          visible={showMonthPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Month</Text>
                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                {availableMonths.map((month) => (
                  <Picker.Item key={month.index} label={month.name} value={month.index} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Updated styles for a more professional and attractive look

const styles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: '#f0f5fa', // Cooler, softer background
    padding: 16,
    marginTop: -50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // More rounded corners
    padding: 22, // More generous padding
    marginBottom: 22,
    shadowColor: 'rgba(23, 49, 116, 0.1)', // Softer blue shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0, // Remove border
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // Match other cards
    padding: 16,
    marginBottom: 20,
    shadowColor: 'rgba(23, 49, 116, 0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0,
  },
  cardTitle: {
    fontSize: 22, // Larger title
    fontWeight: '700',
    color: '#1D2939', // Darker, richer text color
    marginBottom: 20,
    letterSpacing: 0.3, // Slight letter spacing for elegance
  },
  // compactCardTitle: {
  //   fontSize: 18,
  //   fontWeight: '700',
  //   color: '#1D2939',
  //   marginBottom: 14,
  //   letterSpacing: 0.2,
  // },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  detailSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#eef0f5', // Lighter divider for sophistication
    marginVertical: 10,
  },

  // Weather styles - enhanced
  weatherLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  weatherLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    fontWeight: '500',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherHeaderText: {
    flex: 1,
  },
  temperature: {
    fontSize: 36, // Larger temperature display
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: -1, // Tighter spacing for numbers
  },
  weatherDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  weatherIcon: {
    width: 90, // Larger icon
    height: 90,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f9f9fc', // Very subtle background
    borderRadius: 12,
    marginTop: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 10,
  },
  weatherLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },

  // Picker styles - more professional
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#f5f9ff', // Subtle blue tint
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e5eeff', // Subtle blue border
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  pickerValueText: {
    fontSize: 20, // Larger text
    fontWeight: '700',
    color: '#1D2939',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, // More rounded corners
    borderTopRightRadius: 20,
    paddingBottom: 30, // More padding
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f5', // Lighter border
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  // Prediction button styles - more prominent
  predictButtonContainer: {
    borderRadius: 14,
    marginTop: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  predictButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },

  // Prediction results styles - more sophisticated
  predictionResults: {
    marginTop: 30, // More space
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionSummary: {
    alignItems: 'center',
  },
  predictedYieldText: {
    fontSize: 40, // Larger numbers
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: -1, // Tighter spacing for numbers
  },
  predictedYieldLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  confidenceContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  confidenceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginVertical: 16,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f5',
  },
  monthValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginVertical: 16,
  },
  predictionFactorsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  predictionFactorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
  },
  // factorLabel: {
  //   fontSize: 15,
  //   color: colors.textSecondary,
  // },
  // factorValue: {
  //   fontSize: 15,
  //   fontWeight: '600',
  //   color: colors.textPrimary,
  // },

  // Enhanced card styles for the detailed prediction results
  predictionResultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22, 
    padding: 24,
    marginTop: 10,
    marginBottom: 26,
    shadowColor: 'rgba(23, 49, 116, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  predictionHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionResultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  yearBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  yearBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  averagePredictionContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'rgba(232, 245, 254, 0.6)', // Light blue background
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  averagePredictionValue: {
    fontSize: 60, // Larger for dramatic effect
    fontWeight: '800',
    color: '#0366d6', // Rich blue color
    letterSpacing: -1.5,
  },
  averagePredictionLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 6,
  },
  predictionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  predictionStatusText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 20,
  },
  monthlyPredictionContainer: {
    backgroundColor: '#f8faff', // Subtle light blue background
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4, // Add accent border
    borderLeftColor: colors.primary,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  confidenceBadge: {
    backgroundColor: '#e6f7ef', // Lighter green background
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d1ebdc', // Subtle border
  },
  confidenceBadgeText: {
    color: '#2c9f6e', // Darker green text
    fontSize: 13,
    fontWeight: '700',
  },
  predictionValuesContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionValueBox: {
    flex: 1,
    alignItems: 'center',
  },
  predictionValueAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  predictionValueLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  predictionValueDivider: {
    width: 1,
    backgroundColor: '#eaeef2',
    marginHorizontal: 16,
  },
  factorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f4fa',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  factorsButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 6,
    fontWeight: '600',
  },
  factorsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 12,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f5fa',
  },
  factorLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  factorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D2939',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2c9f6e', // Different color for variation
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#2c9f6e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },

  // Compact card styles
  compactCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D2939',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  compactDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  compactDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%', // Two items per row
    paddingVertical: 6,
  },
  compactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  compactDetailText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500',
  },
  smallDetailText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#eef0f5',
    marginVertical: 6,
  },
  compactWeatherContainer: {
    paddingVertical: 10,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 250, 255, 0.6)', // Light blue background
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  compactWeatherIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  compactTemperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D2939',
    letterSpacing: -0.5,
  },
  compactWeatherDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  compactWeatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5faff',
    borderRadius: 14,
    padding: 14,
  },
  compactWeatherDetail: {
    flexDirection: 'column', // Change to column for better layout
    alignItems: 'center',
    padding: 8,
  },
  compactWeatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 2,
  },
  compactWeatherLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  predictionInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  yearDisplay: {
    flex: 1,
    backgroundColor: '#f0f5fd', // Slightly different blue tint
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e9f7',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  yearDisplayText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D2939',
    marginTop: 4,
  },
  predictedYieldValue: {
    fontSize: 46, // Make numbers bigger for impact
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1, // Tighter spacing for numbers
    textAlign: 'center',
  },
  // Enhanced weather styles
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  weatherIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    padding: 5,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default PredictionScreen;