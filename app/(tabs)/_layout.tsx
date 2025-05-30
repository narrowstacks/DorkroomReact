import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4CAF50",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: "transparent", // Use a transparent background on iOS to show the blur effect
            },
            default: {
              backgroundColor: "#fff",
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="border"
          options={{
            title: "Border",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="square.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="resize"
          options={{
            title: "Resize",
            tabBarIcon: ({ color }) => (
              <IconSymbol
                size={28}
                name="arrow.up.left.and.arrow.down.right"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="exposure"
          options={{
            title: "Stops",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="timer" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cameraExposure"
          options={{
            title: "Exposure",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="camera.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reciprocity"
          options={{
            title: "Reciprocity",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="clock.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
