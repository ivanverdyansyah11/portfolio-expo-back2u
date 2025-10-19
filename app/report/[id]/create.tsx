import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push, get } from "firebase/database";
import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";

type UserType = {
    name: string;
    email: string;
    phone_number: string;
    uid: string;
};

export default function CreateReturnPage() {
    const { user } = useAuth();
    const { id: report_id } = useLocalSearchParams();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [locationName, setLocationName] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [imagePath, setImagePath] = useState("");
    const [mapVisible, setMapVisible] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    let MapView: any = null;
    let Marker: any = null;

    if (Platform.OS !== "web") {
        const maps = require("react-native-maps");
        MapView = maps.default;
        Marker = maps.Marker;
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) setImagePath(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Harap login terlebih dahulu!");

        try {
            const db = getDatabase();

            const reportSnapshot = await get(ref(db, `reports/${report_id}`));
            if (!reportSnapshot.exists()) {
                alert("Laporan tidak ditemukan");
                return;
            }
            const reportData = reportSnapshot.val();
            const userData: UserType = {
                name: user?.name || "User",
                email: user?.email || "",
                phone_number: user?.phone_number || "",
                uid: auth.currentUser!.uid,
            };

            const newReturnRef = await push(ref(db, "returns"), {
                report_id,
                user_id: auth.currentUser.uid,
                user: userData,
                title,
                description,
                location_name: locationName,
                latitude: latitude ? parseFloat(latitude) : location?.latitude || null,
                longitude: longitude ? parseFloat(longitude) : location?.longitude || null,
                image_path: imagePath || null,
                status: "FOUND",
                created_at: new Date().toISOString(),
            });

            const returnId = newReturnRef.key;

            const returnData = {
                id: returnId,
                report_id,
                user_id: auth.currentUser.uid,
                user: userData,
                title,
                description,
                location_name: locationName,
                latitude: latitude ? parseFloat(latitude) : location?.latitude || null,
                longitude: longitude ? parseFloat(longitude) : location?.longitude || null,
                image_path: imagePath || null,
                status: "FOUND",
                created_at: new Date().toISOString(),
            };

            await push(ref(db, "notifications"), {
                report_id,
                return_id: returnId,
                report: reportData,
                return: returnData,
                message: `${userData.name} telah menemukan barang anda. cek apakah milik anda`,
                type: "RETURN",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            alert("Laporan penemuan berhasil dibuat!");
            router.push("/return");
        } catch (err) {
            console.error("Error submit return:", err);
            alert("Gagal membuat laporan penemuan");
        }
    };


    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Konfirmasi Penemuan Barang</Text>

                <Text style={styles.label}>Gambar</Text>
                {imagePath ? <Image source={{ uri: imagePath }} style={styles.previewImage} /> : null}
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadText}>{imagePath ? "Ganti Gambar" : "Upload Gambar"}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Judul</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Contoh: Dompet ditemukan di taman" />

                <Text style={styles.label}>Deskripsi</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ceritakan detailnya"
                    multiline
                />

                <Text style={styles.label}>Lokasi Penemuan</Text>
                <TextInput style={styles.input} value={locationName} onChangeText={setLocationName} placeholder="Contoh: Taman Merdeka" />

                <TouchableOpacity style={styles.uploadButton} onPress={() => setMapVisible(true)}>
                    <Text style={styles.uploadText}>Pilih Lokasi di Peta</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Latitude</Text>
                <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numeric" placeholder="-6.12345" />

                <Text style={styles.label}>Longitude</Text>
                <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numeric" placeholder="106.12345" />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Kirim</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push(`/report/${report_id}`)} style={styles.backButton}>
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={mapVisible} animationType="slide">
                <View style={{ flex: 1 }}>
                    {MapView && (
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
                                setLatitude(latitude.toString());
                                setLongitude(longitude.toString());
                                setMapVisible(false);
                            }}
                        >
                            {location && <Marker coordinate={location} />}
                        </MapView>
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => setMapVisible(false)}>
                        <Text style={styles.backText}>Tutup Map</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#FFF" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", marginTop: 12 },
    input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 10, marginTop: 6 },
    previewImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
    uploadButton: { padding: 14, backgroundColor: "#6C63FF", borderRadius: 8, alignItems: "center", marginVertical: 12 },
    uploadText: { color: "#FFF", fontWeight: "bold" },
    button: { backgroundColor: "#6C63FF", paddingVertical: 14, borderRadius: 8, marginTop: 24 },
    buttonText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
    backButton: { paddingVertical: 12, marginTop: 10 },
    backText: { textAlign: "center", color: "#6C63FF" },
});