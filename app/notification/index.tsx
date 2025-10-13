import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";

export default function NotificationPage() {
    const router = useRouter();

    const notifications = [
        { confirmation_id: "1", message: "Laporan dompet kamu sedang diproses", type: "REPORT", created_at: "2025-10-12" },
        { confirmation_id: "2", message: "Seseorang menemukan barangmu!", type: "RETURN", created_at: "2025-10-11" },
        { confirmation_id: "3", message: "Laporan berhasil dikirim", type: "REPORT", created_at: "2025-10-10" },
    ];

    const handlePress = (item: any) => {
        if (!item.confirmation_id) return;
        if (item.type === "REPORT") {
            router.push(`/report/${item.confirmation_id}`);
        } else {
            router.push(`/return/${item.confirmation_id}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifikasi</Text>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.confirmation_id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.date}>{item.created_at}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: 10 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    card: { backgroundColor: "#F7F7F7", padding: 14, borderRadius: 10 },
    message: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    date: { fontSize: 12, color: "#666" },
});
