import { useState, useEffect } from "react";
import { ScrollView, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { getDatabase, ref, get, child } from "firebase/database";

export default function ReturnScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const db = getDatabase();
        get(child(ref(db), "returns"))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const itemArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                    setItems(itemArray);
                } else {
                    setItems([]);
                }
            })
            .catch(err => {
                console.error("Error fetching returns:", err);
            });
    }, []);

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Barang Ditemukan</Text>
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
                            onPress={() => router.push(`/return/${item.id}`)}
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
    container: { flex: 1, backgroundColor: "#FFF" },
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