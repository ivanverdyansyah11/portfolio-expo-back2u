import { useState, useEffect } from "react";
import { Text, ScrollView, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { getDatabase, ref, onValue } from "firebase/database";

export default function ReportScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const db = getDatabase();
        const reportsRef = ref(db, "reports");

        const unsubscribe = onValue(reportsRef, (snapshot) => {
            const data = snapshot.val();
            const list = data
                ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
                : [];
            setItems(list);
            setFilteredItems(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredItems(items);
        } else {
            const lower = search.toLowerCase();
            setFilteredItems(
                items.filter((item) =>
                    item.title.toLowerCase().includes(lower) ||
                    item.description.toLowerCase().includes(lower)
                )
            );
        }
    }, [search, items]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Barang Hilang</Text>
            <TextInput
                placeholder="Cari barang..."
                style={styles.search}
                value={search}
                onChangeText={setSearch}
            />
            {filteredItems.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>Tidak ada barang ditemukan</Text>
            ) : (
                <FlatList
                    data={filteredItems}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    columnWrapperStyle={{ gap: 10 }}
                    contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/report/${item.id}`)}
                        >
                            <Image source={{ uri: item.image_path }} style={styles.cardImage} />
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", padding: 10 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
    search: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#F9F9F9",
        marginBottom: 10,
    },
    card: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        borderRadius: 10,
        padding: 10,
    },
    cardImage: { width: "100%", height: 100, borderRadius: 8, marginBottom: 8 },
    cardTitle: { fontWeight: "600", fontSize: 14 },
    cardDesc: { fontSize: 12, color: "#666" },
});