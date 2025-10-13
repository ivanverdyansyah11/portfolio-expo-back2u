import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { updateEmail, updatePassword, updateProfile, User, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function EditProfilePage() {
    const router = useRouter();
    const { user: currentUser, loading } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        currentPassword: "",
        newPassword: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setForm({
                name: currentUser.name,
                email: currentUser.email,
                phone_number: currentUser.phone_number,
                currentPassword: "",
                newPassword: "",
            });
        }
    }, [currentUser]);

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setSaving(true);

        try {
            const user: User = auth.currentUser;

            // re-authenticate jika ingin update email atau password
            if ((form.email && form.email !== user.email) || form.newPassword) {
                if (!form.currentPassword) {
                    Alert.alert("Error", "Masukkan password lama untuk mengubah email atau password");
                    setSaving(false);
                    return;
                }
                const credential = EmailAuthProvider.credential(
                    user.email!,
                    form.currentPassword
                );
                await reauthenticateWithCredential(user, credential);
            }

            // update displayName
            await updateProfile(user, { displayName: form.name });

            // update email
            if (form.email && form.email !== user.email) {
                await updateEmail(user, form.email);
            }

            // update password
            if (form.newPassword) {
                await updatePassword(user, form.newPassword);
            }

            // update phone_number di Firestore
            const db = getFirestore();
            await setDoc(doc(db, "users", user.uid), {
                phone_number: form.phone_number,
            }, { merge: true });

            Alert.alert("Sukses", "Profil berhasil diperbarui");
            router.push("/profile");

        } catch (err: any) {
            console.error("Update error:", err);
            Alert.alert("Error", err.message || "Gagal memperbarui profil");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !currentUser) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Edit Profil</Text>

            <Input label="Nama" value={form.name} onChangeText={(v: string) => handleChange("name", v)} />
            <Input label="Email" value={form.email} onChangeText={(v: string) => handleChange("email", v)} />
            <Input label="Nomor Telepon" value={form.phone_number} onChangeText={(v: string) => handleChange("phone_number", v)} />
            <Input label="Password Lama" value={form.currentPassword} onChangeText={(v: string) => handleChange("currentPassword", v)} secureTextEntry />
            <Input label="Password Baru" value={form.newPassword} onChangeText={(v: string) => handleChange("newPassword", v)} secureTextEntry />

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/profile")}>
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                    <Text style={styles.saveText}>{saving ? "Menyimpan..." : "Simpan"}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    container: { flex: 1, backgroundColor: "#FFF" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },

    inputGroup: { marginBottom: 15 },
    inputLabel: { fontWeight: "600", marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#F9F9F9",
    },

    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    backButton: { flex: 1, padding: 14, backgroundColor: "#999", borderRadius: 8, marginRight: 8, alignItems: "center" },
    backText: { color: "#FFF", fontWeight: "bold" },
    saveButton: { flex: 1, padding: 14, backgroundColor: "#6C63FF", borderRadius: 8, marginLeft: 8, alignItems: "center" },
    saveText: { color: "#FFF", fontWeight: "bold" },
});