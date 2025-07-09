import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  FlatList,
  Animated,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { t, i18n } = useTranslation();
  
  // Add new state for profile menu and language settings
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  
  // Using translated slide images
  const slideImages = [
    { 
      id: '1',
      image: require('../../../../assets/images/HomeSlide1.jpg'), 
      title: t('home.smartFarmManagement'),
      subtitle: t('home.monitorFarm')
    },
    { 
      id: '2',
      image: require('../../../../assets/images/HomeSlide3.jpg'),
      title: t('home.copraClassification'),
      subtitle: t('home.dataInsights')
    },
    { 
      id: '3',
      image: require('../../../../assets/images/HomeSlide2.jpg'),
      title: t('home.weatherIntegration'),
      subtitle: t('home.optimizeIrrigation')
    },
    { 
      id: '4',
      image: require('../../../../assets/images/HomeSlide4.jpg'),
      title: t('home.remoteControl'),
      subtitle: t('home.automateIrrigation')
    }
  ];
  
  const [imagesLoaded, setImagesLoaded] = useState(
    slideImages.map(() => false)
  );

  // Auto scroll for image slider
  useEffect(() => {
    const timerId = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slideImages.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timerId);
  }, [currentIndex]);

  const menuItems = [
    {
      id: 'water',
      title: t('home.waterScheduling'),
      icon: 'water-outline',
      color: '#4DA3FF',
      bgColor: '#EBF5FF',
      onPress: () => navigation.navigate('Watering')
    },
    {
      id: 'yield',
      title: t('home.coconutYield'),
      icon: 'leaf-outline',
      color: '#4CD964',
      bgColor: '#EAFFF2',
      onPress: () => navigation.navigate('CoconutYield')
    },
    {
      id: 'copra',
      title: t('home.copraIdentification'),
      icon: 'scan-outline',
      color: '#9B59B6',
      bgColor: '#F8EFFF',
      onPress: () => navigation.navigate('CopraIdentification')
    },
    {
      id: 'oil',
      title: t('home.dryingTime'),
      icon: 'flask-outline',
      color: '#FF9500',
      bgColor: '#FFF6EB',
      onPress: () => navigation.navigate('OilYield')
    },
    {
      id: 'locations',
      title: t('home.locations'),
      icon: 'location-outline',
      color: '#FF4D4D',
      bgColor: '#FFEBEB',
      onPress: () => navigation.navigate('LocationList')
    },
    {
      id: 'devices',
      title: t('home.devices'),
      icon: 'hardware-chip-outline',
      color: '#7F58FF',
      bgColor: '#F0EBFF',
      onPress: () => navigation.navigate('Devices')
    },
  ];

  const handleImageLoad = (index: number) => {
    const newLoadedState = [...imagesLoaded];
    newLoadedState[index] = true;
    setImagesLoaded(newLoadedState);
  };

  const renderSlideItem = (item: any, index: any) => {
    return (
      <View style={styles.slideItem}>
        <Image 
          source={item.image} 
          style={styles.slideImage}
          onLoad={() => handleImageLoad(index)}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.slideGradient}
        />
        <View style={styles.slideContent}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  const renderDotIndicator = () => {
    return (
      <View style={styles.dotContainer}>
        {slideImages.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const onSlideChange = (event: any) => {
    const slideIndex = Math.floor(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slideIndex >= 0) {
      setCurrentIndex(slideIndex);
    }
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setShowLanguageOptions(false);
    setShowProfileMenu(false);
  };

  // Function to handle sign out
  const handleSignOut = () => {
    // Close the menu first
    setShowProfileMenu(false);
    // Show confirmation dialog
    Alert.alert(
      t('home.signOutTitle') || "Sign Out",
      t('home.signOutConfirmation') || "Are you sure you want to sign out?",
      [
        {
          text: t('common.cancel') || "Cancel",
          style: "cancel"
        },
        {
          text: t('common.signOut') || "Sign Out",
          onPress: logout,
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t('home.welcomeBack')}</Text>
            <Text style={styles.nameText}>{user?.name || 'John Doe'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(true)}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0) || 'J'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Menu Modal */}
        <Modal
          visible={showProfileMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowProfileMenu(false);
              setShowLanguageOptions(false);
            }}
          >
            <View style={styles.profileMenuContainer}>
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => {
                  setShowProfileMenu(false);
                  navigation.navigate('AccountScreen');
                }}
              >
                <Ionicons name="person-outline" size={20} color="#374151" />
                <Text style={styles.menuOptionText}>{t('home.account')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => setShowLanguageOptions(true)}
              >
                <Ionicons name="settings-outline" size={20} color="#374151" />
                <Text style={styles.menuOptionText}>{t('home.settings')}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>

              {/* Language Options */}
              {showLanguageOptions && (
                <View style={styles.languageOptionsContainer}>
                  <Text style={styles.languageTitle}>{t('home.selectLanguage')}</Text>
                  <TouchableOpacity 
                    style={styles.languageOption}
                    onPress={() => changeLanguage('en')}
                  >
                    <Text style={[
                      styles.languageText, 
                      i18n.language === 'en' && styles.activeLanguage
                    ]}>English</Text>
                    {i18n.language === 'en' && (
                      <Ionicons name="checkmark" size={16} color="#4CD964" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.languageOption}
                    onPress={() => changeLanguage('si')}
                  >
                    <Text style={[
                      styles.languageText, 
                      i18n.language === 'si' && styles.activeLanguage
                    ]}>සිංහල</Text>
                    {i18n.language === 'si' && (
                      <Ionicons name="checkmark" size={16} color="#4CD964" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.languageOption}
                    onPress={() => changeLanguage('ta')}
                  >
                    <Text style={[
                      styles.languageText, 
                      i18n.language === 'ta' && styles.activeLanguage
                    ]}>தமிழ்</Text>
                    {i18n.language === 'ta' && (
                      <Ionicons name="checkmark" size={16} color="#4CD964" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Sign Out Option - Added to the menu */}
              <TouchableOpacity 
                style={[styles.menuOption, styles.signOutOption]}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF4D4D" />
                <Text style={[styles.menuOptionText, styles.signOutText]}>
                  {t('home.signOut')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Image slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={slideImages}
            renderItem={({ item, index }) => renderSlideItem(item, index)}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={onSlideChange}
          />
          {renderDotIndicator()}
        </View>

        {/* Menu grid */}
        <View style={styles.menuContainer}>
          <View style={styles.menuGrid}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: item.bgColor }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={30} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'System',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  sliderContainer: {
    height: 180,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  slideItem: {
    width,
    height: 180,
    paddingHorizontal: 20,
  },
  slideImage: {
    width: width - 40,
    height: 180,
    borderRadius: 16,
    position: 'absolute',
    backgroundColor: '#f0f0f0', // Placeholder color while loading
  },
  slideGradient: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    height: 100,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  slideContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 4,
  },
  slideSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'System',
    opacity: 0.9,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  menuContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
    fontFamily: 'System',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    fontFamily: 'System',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  profileMenuContainer: {
    position: 'absolute',
    top: 90,
    right: 20,
    width: 220,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  languageOptionsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 15,
    color: '#374151',
  },
  activeLanguage: {
    fontWeight: '600',
    color: '#4CD964',
  },
  // Add styles for the sign out option
  signOutOption: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  
  signOutText: {
    color: '#FF4D4D', // Red color for sign out
  },
});

export default HomeScreen;