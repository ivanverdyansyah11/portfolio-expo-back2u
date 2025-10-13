import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getDatabase, ref, get, child } from "firebase/database";

export default function ReportDetail() {
    const { id } = useLocalSearchParams();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const db = getDatabase();
        const fetchReport = async () => {
            try {
                const snapshot = await get(ref(db, `reports/${id}`));
                if (!snapshot.exists()) {
                    alert("Laporan tidak ditemukan");
                    router.back();
                    return;
                }

                const reportData = snapshot.val();
                let userData = null;
                if (reportData.user_id) {
                    const userSnap = await get(ref(db, `users/${reportData.user_id}`));
                    userData = userSnap.exists() ? userSnap.val() : null;
                }

                setReport({ ...reportData, user: userData });
            } catch (err) {
                console.error("Error fetching report:", err);
                alert("Gagal mengambil data laporan");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!report) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: report.image_path }} style={styles.image} />

            <Text style={styles.title}>{report.title}</Text>

            <Text style={styles.sectionLabel}>Deskripsi</Text>
            <Text style={styles.text}>{report.description}</Text>

            <Text style={styles.sectionLabel}>Lokasi</Text>
            <Text style={styles.text}>{report.location_name}</Text>
            <Text style={styles.subText}>Lat: {report.latitude} | Lng: {report.longitude}</Text>

            <Text style={styles.sectionLabel}>Status</Text>
            <Text style={[styles.status, report.status && report.status !== "OPEN" ? styles.resolved : styles.open]}>
                {report.status && report.status !== "OPEN" ? "Sudah Ditemukan" : "Belum Ditemukan"}
            </Text>

            {/*<Text style={styles.sectionLabel}>Pelapor</Text>*/}
            {/*<Text style={styles.text}>{report.user?.name}</Text>*/}
            {/*<Text style={styles.subText}>{report.user?.email}</Text>*/}
            {/*<Text style={styles.subText}>{report.user?.phone_number}</Text>*/}

            <Text style={styles.sectionLabel}>Dilaporkan Pada</Text>
            <Text style={styles.text}>{report.created_at}</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/report")}>
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => router.push(`/report/${id}/create`)}
                >
                    <Text style={styles.confirmText}>Apakah Anda menemukan Barang ini?</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
    image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    sectionLabel: { fontSize: 16, fontWeight: "600", marginTop: 14 },
    text: { fontSize: 14, color: "#333", marginTop: 4 },
    subText: { fontSize: 12, color: "#666" },

    status: { padding: 6, borderRadius: 6, marginTop: 4, alignSelf: "flex-start" },
    open: { backgroundColor: "#FFD54F", color: "#000" },
    resolved: { backgroundColor: "#4CAF50", color: "#FFF" },

    buttonRow: { flexDirection: "column", marginTop: 24 },
    backButton: {
        backgroundColor: "#999",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: "#6C63FF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    backText: { color: "#FFF", fontWeight: "bold" },
    confirmText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
});