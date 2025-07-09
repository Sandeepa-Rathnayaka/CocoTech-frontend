import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { WateringProvider } from "../context/WateringContext";
import { DeviceProvider } from "../context/DeviceContext";
import { LocationProvider } from "../context/LocationContext";
import { useTranslation } from "react-i18next"; // Add this import
import AuthNavigator from "./AuthNavigator";
import WateringNavigator from "./WateringNavigator";
import CoconutYieldNavigator from "./CoconutYieldNavigator";
import DeviceNavigator from "./DeviceNavigator";
import LocationNavigator from "./LocationNavigator";
import CopraNavigator from "./copraNavigator";
import HomeScreen from "../components/screens/home/HomeScreen";
import Loading from "../components/common/Loading";
import { colors } from "../constants/colors";
import { setLogoutFunction } from "../api/axios";
import { logout } from "../api/authApi";
import { EventRegister } from "react-native-event-listeners";
import AccountScreen from "../components/screens/account/AccountScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator when logged in
const MainTabNavigator = () => {
  const { t } = useTranslation(); // Add translation hook

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Watering") {
            iconName = focused ? "water" : "water-outline";
          } else if (route.name === "CoconutYield") {
            iconName = focused ? "leaf" : "leaf-outline";
          } else if (route.name === "OilYield") {
            iconName = focused ? "flask" : "flask-outline";
          } else if (route.name === "CopraIdentification") {
            iconName = focused ? "scan" : "scan-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingTop: 8,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ title: t("home.home") || "Home" }} 
      />
      <Tab.Screen 
        name="Watering" 
        component={WateringNavigator} 
        options={{ title: t("home.waterScheduling") || "Water Scheduling" }} 
      />
      <Tab.Screen 
        name="CoconutYield" 
        component={CoconutYieldNavigator} 
        options={{ title: t("home.coconutYield") || "Coconut Yield" }} 
      />
      <Tab.Screen 
        name="OilYield" 
        component={CopraNavigator} 
        options={{ title: t("copra.allBatches") || "All Batches" }} 
      />
      <Tab.Screen
        name="CopraIdentification"
        component={HomeScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Home", { screen: "CopraIdentification" });
          },
        })}
        options={{ title: t("home.copraIdentification") || "Copra ID" }}
      />
    </Tab.Navigator>
  );
};

// Home stack that includes LocationNavigator and DeviceNavigator
const HomeStack = () => {
  const HomeStackNav = createNativeStackNavigator();
  const { t } = useTranslation(); // Add translation hook
  
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: t("home.home") || "Home" }} 
      />
      <HomeStackNav.Screen 
        name="LocationList" 
        component={LocationNavigator} 
        options={{ title: t("home.locations") || "Locations" }} 
      />
      <HomeStackNav.Screen 
        name="Devices" 
        component={DeviceNavigator} 
        options={{ title: t("home.devices") || "Devices" }} 
      />
      <HomeStackNav.Screen 
        name="AccountScreen" 
        component={AccountScreen} 
        options={{ title: t("home.account") || "Account" }} 
      />
    </HomeStackNav.Navigator>
  );
};

// This component wraps everything with the providers
const MainNavigator = () => {
  return (
    <WateringProvider>
      <DeviceProvider>
        <LocationProvider>
          <MainTabNavigator />
        </LocationProvider>
      </DeviceProvider>
    </WateringProvider>
  );
};

const AppNavigator = () => {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation(); // Add translation hook

  useEffect(() => {
    const logoutListener = EventRegister.addEventListener("userLogout", () => {
      logout();
    });

    return () => {
      EventRegister.removeEventListener(logoutListener as string);
    };
  }, []);

  if (isLoading) {
    return <Loading fullScreen message={t("common.loading") || "Loading..."} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;