import {StatusBar, StyleSheet, View, ActivityIndicator} from "react-native";
import React, { useEffect } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const publicPaths = ["/", "/auth/login", "/auth/register"];

    useEffect(() => {
        if (!loading) {
            if (!user && !publicPaths.includes(pathname)) {
                router.replace("/auth/login");
            } else if (user && publicPaths.includes(pathname)) {
                router.replace("/main");
            }
        }
    }, [user, loading, pathname]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent={false}/>
            <View style={styles.content}>
                <Slot/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 52,
    },
    content: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
});