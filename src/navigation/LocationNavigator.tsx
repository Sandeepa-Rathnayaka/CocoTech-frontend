import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { useTranslation } from "react-i18next";

import LocationListScreen from "../components/screens/location/LocationListScreen";
import LocationDetailScreen from "../components/screens/location/LocationDetailScreen";
import LocationFormScreen from "../components/screens/location/LocationFormScreen";
import LocationWateringHistoryScreen from "../components/screens/location/LocationWateringHistoryScreen";

const Stack = createNativeStackNavigator();

const LocationNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: "bold",
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Stack.Screen
        name="LocationList"
        component={LocationListScreen}
        options={({ navigation }) => ({
          title: t("water-scheduling.locations.locationList"),
          headerShown: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("LocationForm", { mode: "create" })
              }
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="LocationDetails"
        component={LocationDetailScreen}
        options={{
          title: t("water-scheduling.locations.locationDetails"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LocationForm"
        component={LocationFormScreen}
        options={({ route }) => ({
          headerShown: false,
          title:
            route.params?.mode === "create"
              ? t("water-scheduling.locations.addLocation")
              : t("water-scheduling.locations.editLocation"),
        })}
      />
      <Stack.Screen
        name="LocationWateringHistory"
        component={LocationWateringHistoryScreen}
        options={{
          title: t("water-scheduling.locations.wateringHistory"),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default LocationNavigator;
