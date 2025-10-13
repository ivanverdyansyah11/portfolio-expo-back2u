import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getDatabase, ref, get, update } from "firebase/database";
import { useAuth } from "@/hooks/useAuth";

export default function ReportDetail() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

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

    const isOwner = user?.uid === report?.user_id;

    const handleFound = async () => {
        if (!report) return;
        setUpdating(true);
        try {
            const db = getDatabase();
            await update(ref(db, `reports/${id}`), { status: "FOUND" });
            setReport({ ...report, status: "FOUND" });
            setModalVisible(false);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Gagal mengubah status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!report) return null;

    let actionButton = null;
    if (report.status === "OPEN") {
        if (isOwner) {
            actionButton = (
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.confirmText}>Apakah barang sudah ditemukan?</Text>
                </TouchableOpacity>
            );
        } else {
            actionButton = (
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => router.push(`/report/${id}/create`)}
                >
                    <Text style={styles.confirmText}>Apakah anda menemukan barang ini?</Text>
                </TouchableOpacity>
            );
        }
    }

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

            <Text style={styles.sectionLabel}>Dilaporkan Pada</Text>
            <Text style={styles.text}>{report.created_at}</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/report")}>
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                {actionButton}
            </View>
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Apakah anda sudah menemukan {report.title}?</Text>
                        <Text style={styles.modalDesc}>
                            Jika anda yakin barang ini sudah ditemukan, tekan "Ditemukan". Atau tekan "Kembali" jika belum.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalBack]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Kembali</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalConfirm]} onPress={handleFound} disabled={updating}>
                                <Text style={styles.modalButtonText}>{updating ? "Memproses..." : "Ditemukan"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
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

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 20,
        width: "100%",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    modalDesc: { fontSize: 14, color: "#333", marginBottom: 20 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between" },
    modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
    modalBack: { backgroundColor: "#999" },
    modalConfirm: { backgroundColor: "#6C63FF" },
    modalButtonText: { color: "#FFF", fontWeight: "bold" },
});