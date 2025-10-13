import { Pressable, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

type ReportItem = {
    id: string;
    title: string;
    image_path: string;
    description: string;
    user_id: string;
};

type SectionProps = {
    title: string;
    items: ReportItem[];
    onSeeAll: () => void;
};

export default function Main() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [reports, setReports] = useState<ReportItem[]>([]);
    const [returns, setReturns] = useState<ReportItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoadingData(true);
                // Fetch reports
                const reportsRes = await fetch(`https://expo-back2u-default-rtdb.asia-southeast1.firebasedatabase.app/reports.json`);
                const reportsData = await reportsRes.json();
                const reportsList: ReportItem[] = Object.entries(reportsData || {})
                    .map(([id, value]: any) => ({ id, ...value }))
                    .filter((r: any) => r.user_id === user.uid)
                    .slice(0, 4); // hanya ambil 4 item

                // Fetch returns
                const returnsRes = await fetch(`https://expo-back2u-default-rtdb.asia-southeast1.firebasedatabase.app/returns.json`);
                const returnsData = await returnsRes.json();
                const returnsList: ReportItem[] = Object.entries(returnsData || {})
                    .map(([id, value]: any) => ({ id, ...value }))
                    .filter((r: any) => r.user_id === user.uid);

                setReports(reportsList);
                setReturns(returnsList);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading || loadingData || !user) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>Hai, {user?.name} 👋</Text>
                    <Text style={styles.subtitle}>{user?.email}</Text>
                </View>

                <TouchableOpacity onPress={() => router.push("/notification")}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{reports.length}</Text>
                    <Text style={styles.statLabel}>Kehilangan</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{returns.length}</Text>
                    <Text style={styles.statLabel}>Membantu</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.reportButton} onPress={() => router.push("/report/create")}>
                <Text style={styles.reportText}>Barang kamu hilang?</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "column", gap: 32, marginBottom: 20 }}>
                <Section title="Barang yang Belum Ditemukan" items={reports} onSeeAll={() => router.push("/report")} />
                <Section title="Barang yang Telah Dikembalikan" items={returns} onSeeAll={() => router.push("/return")} />
            </View>
        </ScrollView>
    );
}

function Section({ title, items, onSeeAll }: SectionProps) {
    const router = useRouter();

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <TouchableOpacity onPress={onSeeAll}>
                    <Text style={styles.link}>Lihat semuanya</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={items}
                numColumns={2}
                columnWrapperStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push({ pathname: "/report/[id]", params: { id: item.id } })}
                    >
                        <Image source={{ uri: item.image_path }} style={styles.cardImage} />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    </Pressable>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
    subtitle: { color: "#666", marginBottom: 20 },
    statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    statCard: { backgroundColor: "#FFF", flex: 0.48, padding: 16, borderRadius: 10, alignItems: "center" },
    statNumber: { fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#666" },
    reportButton: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 20 },
    reportText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    link: { color: "#6C63FF", fontWeight: "600" },
    card: { backgroundColor: "#F7F7F7", padding: 12, borderRadius: 10, flex: 1 },
    cardImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
    cardTitle: { fontWeight: "bold", fontSize: 14 },
    cardDesc: { fontSize: 12, color: "#666" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    container: { flex: 1, backgroundColor: "#FFF" },
});