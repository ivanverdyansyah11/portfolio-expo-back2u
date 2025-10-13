import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: { backgroundColor: "#FFFFFF" },
            }}
        >
            <Tabs.Screen
                name="main"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="report/index"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="return/index"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkmark-circle-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile/index"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}