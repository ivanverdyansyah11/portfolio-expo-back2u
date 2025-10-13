import { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Platform
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push } from "firebase/database";
import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";

type UserType = {
    name: string;
    email: string;
    phone_number: string;
    uid: string;
};

export default function ReportCreate() {
    const { user } = useAuth();
    const router = useRouter();
    const [mapVisible, setMapVisible] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [form, setForm] = useState({
        user_id: "",
        image_path: "",
        title: "",
        description: "",
        location_name: "",
        latitude: "",
        longitude: "",
        status: "OPEN",
    });

    let MapView: any = null;
    let Marker: any = null;
    if (Platform.OS !== "web") {
        const maps = require("react-native-maps");
        MapView = maps.default;
        Marker = maps.Marker;
    }

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            handleChange("image_path", result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Harap login terlebih dahulu!");

        try {
            const db = getDatabase();

            const userData: UserType = {
                name: user?.name || "User",
                email: user?.email || "",
                phone_number: user?.phone_number || "",
                uid: auth.currentUser!.uid,
            };

            await push(ref(db, "reports"), {
                ...form,
                user: userData,
                user_id: auth.currentUser!.uid,
                created_at: new Date().toISOString(),
                status: "OPEN",
            });

            alert("Laporan berhasil dibuat!");
            router.push("/main");
        } catch (err) {
            console.error("Error submit report:", err);
            alert("Gagal membuat laporan");
        }
    };

    useEffect(() => {
        if (user) {
            setForm(prev => ({ ...prev, user_id: user.uid }));
        }
    }, [user]);

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Laporkan Barang Hilang</Text>

                <Text style={styles.inputLabel}>Gambar</Text>
                {form.image_path && (
                    <Image source={{ uri: form.image_path }} style={styles.previewImage} />
                )}
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadText}>
                        {form.image_path ? "Ganti Gambar" : "Upload Gambar"}
                    </Text>
                </TouchableOpacity>

                <Input label="Judul Barang" value={form.title} onChangeText={(v: any) => handleChange("title", v)} />
                <Input label="Deskripsi" value={form.description} onChangeText={(v: any) => handleChange("description", v)} multiline />
                <Input label="Nama Lokasi" value={form.location_name} onChangeText={(v: any) => handleChange("location_name", v)} />

                {Platform.OS !== "web" ? (
                    <TouchableOpacity style={styles.uploadButton} onPress={() => setMapVisible(true)}>
                        <Text style={styles.uploadText}>Pilih Lokasi di Peta</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={{ color: "red", marginBottom: 10 }}>
                        Map tidak tersedia di web. Masukkan koordinat secara manual.
                    </Text>
                )}

                <Input label="Latitude" value={form.latitude} onChangeText={(v: any) => handleChange("latitude", v)} />
                <Input label="Longitude" value={form.longitude} onChangeText={(v: any) => handleChange("longitude", v)} />

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backText}>Kembali</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Laporkan</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal Map hanya untuk mobile */}
            {MapView && (
                <Modal visible={mapVisible} animationType="slide">
                    <View style={{ flex: 1 }}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: location?.latitude || -6.200000,
                                longitude: location?.longitude || 106.816666,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            onPress={(e: any) => {
                                const { latitude, longitude } = e.nativeEvent.coordinate;
                                setLocation({ latitude, longitude });
                                handleChange("latitude", latitude.toString());
                                handleChange("longitude", longitude.toString());
                                setMapVisible(false);
                            }}
                        >
                            {location && <Marker coordinate={location} />}
                        </MapView>
                        <TouchableOpacity style={styles.backButton} onPress={() => setMapVisible(false)}>
                            <Text style={styles.backText}>Tutup Map</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </>
    );
}

function Input({ label, ...props }: any) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={styles.input} {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },

    inputGroup: { marginBottom: 15 },
    inputLabel: { fontWeight: "600", marginBottom: 5 },
    input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 10, backgroundColor: "#F9F9F9" },

    previewImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
    uploadButton: { padding: 14, backgroundColor: "#6C63FF", borderRadius: 8, alignItems: "center", marginBottom: 20 },
    uploadText: { color: "#FFF", fontWeight: "bold" },

    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    backButton: { flex: 1, padding: 14, backgroundColor: "#999", borderRadius: 8, marginRight: 8, alignItems: "center" },
    backText: { color: "#FFF", fontWeight: "bold" },
    submitButton: { flex: 1, padding: 14, backgroundColor: "#6C63FF", borderRadius: 8, marginLeft: 8, alignItems: "center" },
    submitText: { color: "#FFF", fontWeight: "bold" },
});