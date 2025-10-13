import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
    try {
        const maps = require("react-native-maps");
        MapView = maps.default;
        Marker = maps.Marker;
    } catch (e) {
        console.error("Failed to load react-native-maps:", e);
    }
}

interface MapComponentProps {
    mapVisible: boolean;
    location: { latitude: number; longitude: number } | null;
    onMapPress: (e: any) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ mapVisible, location, onMapPress }) => {
    if (!mapVisible) {
        return null;
    }

    if (Platform.OS === "web") {
        return (
            <View style={styles.webMapPlaceholder}>
                <Text style={styles.webMapText}>Fitur Peta tidak didukung di Web saat ini.</Text>
                <Text style={styles.webMapTextSmall}>(Gunakan Latitude & Longitude manual)</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {MapView ? (
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: location?.latitude || -6.200000,
                        longitude: location?.longitude || 106.816666,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={onMapPress}
                >
                    {location && Marker && <Marker coordinate={location} />}
                </MapView>
            ) : (
                <View style={styles.webMapPlaceholder}>
                    <Text style={styles.webMapText}>Peta tidak tersedia</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    webMapPlaceholder: {
        flex: 1,
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    webMapText: {
        fontSize: 18,
        color: '#555',
        fontWeight: 'bold',
    },
    webMapTextSmall: {
        fontSize: 14,
        color: '#777',
        marginTop: 5,
    },
});