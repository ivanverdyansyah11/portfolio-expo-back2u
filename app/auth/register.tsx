import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            Alert.alert("Berhasil mendaftar");
            router.push("/auth/login");
        } catch (_error) {
            Alert.alert("Register gagal");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daftar Akun</Text>
            <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/auth/login")} style={styles.linkContainer}>
                <Text style={styles.linkText}>
                    Sudah punya akun? <Text style={styles.linkBold}>Login</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        color: "#222",
    },
    input: {
        backgroundColor: "#FFF",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    button: {
        backgroundColor: "#6C63FF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    linkContainer: {
        marginTop: 15,
        alignItems: "center",
    },
    linkText: {
        color: "#666",
    },
    linkBold: {
        color: "#6C63FF",
        fontWeight: "bold",
    },
});
