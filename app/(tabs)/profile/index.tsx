import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";

type UserType = {
    name: string;
    email: string;
    phone_number: string;
    uid: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    async function handleLogout() {
        try {
            await signOut(auth);
        } catch (err) {
            Alert.alert("Error", "Gagal logout. Coba lagi.");
        }
    }

    if (loading) return <ActivityIndicator />;
    if (!user) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Profil Saya</Text>

            <Input label="Nama" value={user.name} editable={false} />
            <Input label="Email" value={user.email} editable={false} />
            <Input label="Nomor Telepon" value={user.phone_number} editable={false} />

            <TouchableOpacity style={styles.reportButton} onPress={() => router.push("/profile/edit")}>
                <Text style={styles.reportText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function Input({ label, value, editable }: any) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={[styles.input, !editable && styles.readonly]} value={value} editable={editable} />
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
    readonly: {
        color: "#555",
    },

    logoutButton: {
        padding: 14,
        backgroundColor: "#FF4D4D",
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    logoutText: { color: "#FFF", fontWeight: "bold" },
    reportButton: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 12, marginTop: 30 },
    reportText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});