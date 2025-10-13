import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuth } from "@/hooks/useAuth";

type NotificationType = {
    id: string;
    report_id: string;
    return_id: string;
    message: string;
    type: "REPORT" | "RETURN";
    created_at: string;
    updated_at?: string;
    report?: any;
    return?: any;
};

export default function NotificationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getDatabase();
        const notificationsRef = ref(db, "notifications");

        get(notificationsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const filtered = Object.entries(data)
                        .map(([key, value]: any) => ({ id: key, ...value }))
                        .filter((item: any) => item.report?.user_id === user.uid)
                        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setNotifications(filtered);
                } else {
                    setNotifications([]);
                }
            })
            .catch((err) => console.error("Error fetching notifications:", err))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/main")}>
                <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Notifikasi</Text>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => router.push(`/return/${item.return_id}`)}>
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
    backButton: { paddingVertical: 10, marginBottom: 12 },
    backText: { color: "#6C63FF", fontWeight: "bold" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    card: { backgroundColor: "#F7F7F7", padding: 14, borderRadius: 10 },
    message: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    date: { fontSize: 12, color: "#666" },
});