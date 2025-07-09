import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { priceApi, PricePredictionResponse } from '../../../api/priceApi';
import { colors } from '../../../constants/colors';

interface CoconutPricePredictScreenProps {
    navigation: NavigationProp<any>;
}

const CoconutPricePredictScreen: React.FC<CoconutPricePredictScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PricePredictionResponse | null>(null);

    // Form inputs
    const [yieldNuts, setYieldNuts] = useState('');
    const [exportVolume, setExportVolume] = useState('');
    const [domesticConsumption, setDomesticConsumption] = useState('');
    const [inflationRate, setInflationRate] = useState('');
    const [predictionDate, setPredictionDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Previous prices
    const [previousPrice1, setPreviousPrice1] = useState('');
    const [previousPrice3, setPreviousPrice3] = useState('');
    const [previousPrice6, setPreviousPrice6] = useState('');
    const [previousPrice12, setPreviousPrice12] = useState('');

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setPredictionDate(selectedDate);
        }
    };

    // Add this new handler function to auto-fill export and domestic values
    const handleYieldChange = (value: string) => {
        setYieldNuts(value);

        // Auto-calculate export and domestic values when yield changes
        const yieldValue = parseFloat(value);
        if (!isNaN(yieldValue)) {
            // Calculate export (1/3) and domestic (2/3)
            const exportVal = (yieldValue / 3).toFixed(1);
            const domesticVal = (yieldValue * 2 / 3).toFixed(1);

            // Update the state variables
            setExportVolume(exportVal);
            setDomesticConsumption(domesticVal);
        }
    };

    const validateForm = () => {
        // Check if required fields have values
        if (
            !yieldNuts ||
            !exportVolume ||
            !domesticConsumption ||
            !inflationRate
        ) {
            Alert.alert(
                t('price.validationError'),
                t('price.fillRequiredFields')
            );
            return false;
        }

        // Check if export + domestic = yield
        const totalYield = parseFloat(yieldNuts);
        const totalExport = parseFloat(exportVolume);
        const totalDomestic = parseFloat(domesticConsumption);

        if (totalExport + totalDomestic !== totalYield) {
            Alert.alert(
                t('price.validationError'),
                t('price.exportPlusDomestic')
            );
            return false;
        }

        return true;
    };

    const handlePredict = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            // Previous prices object with only values that were provided
            const previousPrices = {
                '1': previousPrice1 ? parseFloat(previousPrice1) : 0,
                '3': previousPrice3 ? parseFloat(previousPrice3) : 0,
                '6': previousPrice6 ? parseFloat(previousPrice6) : 0,
                '12': previousPrice12 ? parseFloat(previousPrice12) : 0,
            };

            // Check if at least one value in previousPrices is greater than 0
            const hasPreviousPrices = Object.values(previousPrices).some(price => price > 0);

            const data: {
                yield_nuts: number;
                export_volume: number;
                domestic_consumption: number;
                inflation_rate: number;
                prediction_date: string;
                previous_prices?: {
                    '1': number;
                    '3': number;
                    '6': number;
                    '12': number;
                };
            } = {
                yield_nuts: parseFloat(yieldNuts),
                export_volume: parseFloat(exportVolume),
                domestic_consumption: parseFloat(domesticConsumption),
                inflation_rate: parseFloat(inflationRate),
                prediction_date: predictionDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
            };

            // Conditionally add previous_prices if at least one value is greater than 0
            if (hasPreviousPrices) {
                data.previous_prices = previousPrices;
            }


            const response = await priceApi.predictPrice(data);
            setResult(response);

        } catch (error) {
            console.error('Error predicting coconut price:', error);
            Alert.alert(
                t('price.predictionError'),
                t('price.tryAgainLater')
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setResult(null);
        setYieldNuts('');
        setExportVolume('');
        setDomesticConsumption('');
        setInflationRate('');
        setPredictionDate(new Date());
        setPreviousPrice1('');
        setPreviousPrice3('');
        setPreviousPrice6('');
        setPreviousPrice12('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {!result ? (
                        // Input Form View - Restructured
                        <>                            
                            <View style={styles.infoCard}>
                                <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
                                <Text style={styles.infoText}>
                                    {t('price.infoMessage')}
                                </Text>
                            </View>

                            {/* Market Conditions Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="stats-chart" size={22} color={colors.primary} />
                                    <Text style={styles.cardTitle}>{t('price.marketConditions')}</Text>
                                </View>

                                <View style={styles.cardContent}>
                                    {/* Yield Input with Auto-Fill Notice */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>{t('price.yieldNuts')}</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={yieldNuts}
                                            onChangeText={handleYieldChange}
                                            keyboardType="numeric"
                                            placeholder={t('price.enterValue')}
                                        />
                                        {yieldNuts && !isNaN(parseFloat(yieldNuts)) && (
                                            <View style={styles.helperTextContainer}>
                                                <Ionicons name="flash" size={12} color={colors.info} />
                                                <Text style={styles.helperText}>
                                                    {t('price.autoFillMessage')}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Export and Domestic Consumption Row */}
                                    <View style={styles.row}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.inputLabel}>{t('price.exportVolume')}</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={exportVolume}
                                                onChangeText={setExportVolume}
                                                keyboardType="numeric"
                                                placeholder={t('price.enterValue')}
                                            />
                                        </View>

                                        <View style={styles.halfInput}>
                                            <Text style={styles.inputLabel}>{t('price.domesticConsumption')}</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={domesticConsumption}
                                                onChangeText={setDomesticConsumption}
                                                keyboardType="numeric"
                                                placeholder={t('price.enterValue')}
                                            />
                                        </View>
                                    </View>

                                    {/* Inflation Rate */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>{t('price.inflationRate')}</Text>
                                        <View style={styles.inputWithUnit}>
                                            <TextInput
                                                style={[styles.input, {flex: 1}]}
                                                value={inflationRate}
                                                onChangeText={setInflationRate}
                                                keyboardType="numeric"
                                                placeholder={t('price.enterPercentage')}
                                            />
                                            <View style={styles.inputUnit}>
                                                <Text style={styles.unitText}>%</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Prediction Date */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>{t('price.predictionDate')}</Text>
                                        <TouchableOpacity
                                            style={styles.datePickerButton}
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                            <Text style={styles.datePickerText}>
                                                {predictionDate.toISOString().split('T')[0]}
                                            </Text>
                                        </TouchableOpacity>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={predictionDate}
                                                mode="date"
                                                display="default"
                                                minimumDate={new Date()}
                                                onChange={handleDateChange}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Previous Prices Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="time" size={22} color={colors.primary} />
                                    <Text style={styles.cardTitle}>{t('price.previousPrices')} <Text style={styles.optionalText}>({t('common.optional')})</Text></Text>
                                </View>

                                <View style={styles.cardContent}>
                                    {/* Previous Prices Grid */}
                                    <View style={styles.priceHistoryGrid}>
                                        <View style={styles.priceHistoryItem}>
                                            <Text style={styles.priceHistoryMonth}>1 {t('price.month')}</Text>
                                            <TextInput
                                                style={styles.priceHistoryInput}
                                                value={previousPrice1}
                                                onChangeText={setPreviousPrice1}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                            />
                                        </View>
                                        
                                        <View style={styles.priceHistoryItem}>
                                            <Text style={styles.priceHistoryMonth}>3 {t('price.months')}</Text>
                                            <TextInput
                                                style={styles.priceHistoryInput}
                                                value={previousPrice3}
                                                onChangeText={setPreviousPrice3}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                            />
                                        </View>
                                        
                                        <View style={styles.priceHistoryItem}>
                                            <Text style={styles.priceHistoryMonth}>6 {t('price.months')}</Text>
                                            <TextInput
                                                style={styles.priceHistoryInput}
                                                value={previousPrice6}
                                                onChangeText={setPreviousPrice6}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                            />
                                        </View>
                                        
                                        <View style={styles.priceHistoryItem}>
                                            <Text style={styles.priceHistoryMonth}>12 {t('price.months')}</Text>
                                            <TextInput
                                                style={styles.priceHistoryInput}
                                                value={previousPrice12}
                                                onChangeText={setPreviousPrice12}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Predict Button - Enhanced for visibility */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.predictButton}
                                    onPress={handlePredict}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="analytics" size={22} color="#FFFFFF" />
                                            <Text style={styles.predictButtonText}>{t('price.predict')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        // Results View - Restructured to match new design
                        <View style={styles.resultContainer}>
                            <View style={styles.resultHeader}>
                                <View style={styles.resultHeaderLeft}>
                                    {/* <Text style={styles.resultTitle}>{t('price.predictionResult')}</Text> */}
                                    <View style={styles.dateChip}>
                                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                                        <Text style={styles.resultDate}>
                                            {result.month} {result.year}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                            </View>

                            <View style={styles.priceContainerCard}>
                                <View style={styles.priceContainerInner}>
                                    <Text style={styles.priceLabel}>{t('price.predictedPrice')}</Text>
                                    <Text style={styles.priceValue}>
                                        Rs. {result.predicted_price.toFixed(2)}
                                    </Text>
                                    <Text style={styles.priceUnit}>{t('price.perNut')}</Text>
                                </View>
                                <View style={styles.priceGraph}>
                                    <Ionicons name="trending-up" size={60} color="#FFFFFF" style={styles.priceIcon} />
                                </View>
                            </View>

                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="stats-chart" size={22} color={colors.primary} />
                                    <Text style={styles.cardTitle}>{t('price.marketFactors')}</Text>
                                </View>
                                
                                <View style={styles.metricsGrid}>
                                    <View style={styles.metricItem}>
                                        <Ionicons name="leaf-outline" size={22} color={colors.success} style={styles.metricIcon} />
                                        <Text style={styles.metricValue}>{result.yield_nuts}</Text>
                                        <Text style={styles.metricLabel}>{t('price.yieldNuts')}</Text>
                                    </View>
                                    
                                    <View style={styles.metricItem}>
                                        <Ionicons name="trending-up-outline" size={22} color="#ff6b6b" style={styles.metricIcon} />
                                        <Text style={styles.metricValue}>{result.inflation_rate}%</Text>
                                        <Text style={styles.metricLabel}>{t('price.inflationRate')}</Text>
                                    </View>
                                    
                                    <View style={styles.metricItem}>
                                        <Ionicons name="airplane-outline" size={22} color="#4dabf7" style={styles.metricIcon} />
                                        <Text style={styles.metricValue}>{result.export_volume}</Text>
                                        <Text style={styles.metricLabel}>{t('price.exportVolume')}</Text>
                                    </View>
                                    
                                    <View style={styles.metricItem}>
                                        <Ionicons name="home-outline" size={22} color="#9775fa" style={styles.metricIcon} />
                                        <Text style={styles.metricValue}>{result.domestic_consumption}</Text>
                                        <Text style={styles.metricLabel}>{t('price.domesticConsumption')}</Text>
                                    </View>
                                </View>
                            </View>

                            {result.previous_prices && (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="time" size={22} color={colors.primary} />
                                        <Text style={styles.cardTitle}>{t('price.priceHistory')}</Text>
                                    </View>
                                    
                                    <View style={styles.priceHistoryChart}>
                                        {Object.keys(result.previous_prices).map((month, index) => (
                                            result.previous_prices[month as keyof typeof result.previous_prices] ? (
                                                <View key={index} style={styles.historyChartItem}>
                                                    <View style={styles.historyChartBar}>
                                                        <View 
                                                            style={[
                                                                styles.historyChartBarFill,
                                                                { height: `${Math.min(100, result.previous_prices[month as keyof typeof result.previous_prices] / result.predicted_price * 100)}%` }
                                                            ]}
                                                        />
                                                    </View>
                                                    <Text style={styles.historyChartValue}>Rs. {result.previous_prices[month as keyof typeof result.previous_prices]}</Text>
                                                    <Text style={styles.historyChartLabel}>{month} {t('price.month' + (month === '1' ? '' : 's'))}</Text>
                                                </View>
                                            ) : null
                                        ))}
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.newPredictionButton}
                                onPress={resetForm}
                            >
                                <Ionicons name="refresh" size={22} color="#FFFFFF" />
                                <Text style={styles.newPredictionText}>{t('price.newPrediction')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        marginTop: -50,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    infoCard: {
        backgroundColor: '#edf5ff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d0e1ff',
    },
    infoText: {
        fontSize: 14,
        color: '#2c5fea',
        flex: 1,
        marginLeft: 12,
        lineHeight: 20,
    },
    
    // New Card-Based Design
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f2f5',
        backgroundColor: '#FAFBFC',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginLeft: 10,
    },
    optionalText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    cardContent: {
        padding: 16,
    },
    
    // Improved Input Styling
    inputContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    halfInput: {
        width: '48%',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFC',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    helperTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    helperText: {
        fontSize: 13,
        color: colors.info,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    inputWithUnit: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputUnit: {
        backgroundColor: '#f5f7fa',
        padding: 16,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 0,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    datePickerButton: {
        backgroundColor: '#F9FAFC',
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    datePickerText: {
        fontSize: 16,
        color: colors.textPrimary,
        marginLeft: 10,
    },
    
    // Price History Grid
    priceHistoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    priceHistoryItem: {
        width: '48%',
        backgroundColor: '#f9fafc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eef0f5',
    },
    priceHistoryMonth: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    priceHistoryInput: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e8ebef',
    },
    
    // Results View Styling
    resultContainer: {
        flex: 1,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    resultHeaderLeft: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f7ff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1e3ff',
        alignSelf: 'flex-start',
    },
    resultDate: {
        fontSize: 14,
        color: colors.primary,
        marginLeft: 6,
        fontWeight: '600',
    },
    priceContainerCard: {
        backgroundColor: colors.primary,
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
        flexDirection: 'row',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    priceContainerInner: {
        flex: 3,
    },
    priceLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    priceValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginVertical: 6,
    },
    priceUnit: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    priceGraph: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceIcon: {
        opacity: 0.8,
    },
    
    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
    },
    metricItem: {
        width: '50%',
        padding: 10,
        alignItems: 'center',
    },
    metricIcon: {
        backgroundColor: '#f5f7fa',
        padding: 12,
        borderRadius: 40,
        marginBottom: 8,
        overflow: 'hidden',
    },
    metricValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    
    // Price History Chart
    priceHistoryChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        padding: 20,
        height: 180,
        backgroundColor: '#fafbfc',
    },
    historyChartItem: {
        alignItems: 'center',
        width: '22%',
    },
    historyChartBar: {
        width: '100%',
        height: 100,
        backgroundColor: '#ebeef2',
        borderRadius: 6,
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    historyChartBarFill: {
        backgroundColor: colors.primary,
        borderRadius: 6,
        width: '100%',
        minHeight: 10,
    },
    historyChartValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    historyChartLabel: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    
    // New Prediction Button
    newPredictionButton: {
        backgroundColor: colors.success,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        marginTop: 10,
        marginBottom: 40,
    },
    newPredictionText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        letterSpacing: 0.4,
    },
    
    // Button container to create clear separation
    buttonContainer: {
        marginTop: 16,
        marginBottom: 40,
        paddingVertical: 8,
        // backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        padding: 10,
        // borderTopWidth: 1,
        // borderTopColor: '#e0e0e0',
    },
    
    // Enhanced Predict Button with better visibility
    predictButton: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        // borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
    },
    predictButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 12,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 2,
    },
});

export default CoconutPricePredictScreen;