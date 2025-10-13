import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getDatabase, ref, get } from "firebase/database";

type UserType = {
    name: string;
    email: string;
    phone_number: string;
};

type ReturnType = {
    id: string;
    image_path: string;
    title: string;
    description: string;
    location_name: string;
    latitude: string;
    longitude: string;
    status: "FOUND" | "CONFIRMED";
    created_at: string;
    user: UserType;
};

export default function ReturnDetail() {
    const { id } = useLocalSearchParams();
    const [data, setData] = useState<ReturnType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const db = getDatabase();
        get(ref(db, `returns/${id}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const val = snapshot.val();
                    const user: UserType = val.user || { name: "Anonim", email: "-", phone_number: "-" };
                    setData({ ...val, id, user });
                } else {
                    alert("Data return tidak ditemukan");
                    router.back();
                }
            })
            .catch((err) => {
                console.error("Error fetching return:", err);
                alert("Gagal mengambil data return");
                router.back();
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    if (!data) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: data.image_path }} style={styles.image} />

            <Text style={styles.title}>{data.title}</Text>

            <Text style={styles.sectionLabel}>Deskripsi</Text>
            <Text style={styles.text}>{data.description}</Text>

            <Text style={styles.sectionLabel}>Lokasi Ditemukan</Text>
            <Text style={styles.text}>{data.location_name}</Text>
            <Text style={styles.subText}>Lat: {data.latitude} | Lng: {data.longitude}</Text>

            {/*<Text style={styles.sectionLabel}>Status</Text>*/}
            {/*<Text style={[styles.status, data.status && data.status !== "FOUND" ? styles.lost : styles.found]}>*/}
            {/*    {data.status && data.status !== "FOUND" ? "Sudah Dikonfirmasi Pemilik" : "Ditemukan"}*/}
            {/*</Text>*/}

            {/*<Text style={styles.sectionLabel}>Ditemukan Oleh</Text>*/}
            {/*<Text style={styles.text}>{data.user.name}</Text>*/}
            {/*<Text style={styles.subText}>{data.user.email}</Text>*/}
            {/*<Text style={styles.subText}>{data.user.phone_number}</Text>*/}

            <Text style={styles.sectionLabel}>Ditemukan Pada</Text>
            <Text style={styles.text}>{data.created_at}</Text>

            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/return")}>
                <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
    image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    sectionLabel: { fontSize: 16, fontWeight: "600", marginTop: 14 },
    text: { fontSize: 14, color: "#333", marginTop: 4 },
    subText: { fontSize: 12, color: "#666" },

    status: { padding: 6, borderRadius: 6, marginTop: 4, alignSelf: "flex-start" },
    found: { backgroundColor: "#4CAF50", color: "#FFF" },
    lost: { backgroundColor: "#FFD54F", color: "#000" },

    backButton: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24 },
    backText: { color: "#FFF", fontWeight: "bold" },
});