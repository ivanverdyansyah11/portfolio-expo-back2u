import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: "https://lh5.googleusercontent.com/9yk56jTcfnp-FbKMeowy1GdXITCCRnrJRLsG2QESidr4q0Uyig47tpKBVbd32222jWarfWhimvcmXu_e8Uy_N2gANsZ4MOf0ZDX1WTUgt-EVyZQ1BzDt4FLDMb2be5hNtBv5hm_TxKq8cwK-FQ" }}
                style={styles.image}
                resizeMode="cover"
            />
            <View>
                <Text style={styles.title}>Lapor & Temukan Barangmu</Text>
                <Text style={styles.subtitle}>
                    Kehilangan barang? Atau menemukan barang milik orang lain? Bantu dan dibantu lewat satu aplikasi.
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => router.push("/auth/login")}>
                    <Text style={styles.buttonText}>Lanjutkan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "space-between",
        backgroundColor: "#FFF",
    },
    image: {
        width: "100%",
        height: 400,
        borderRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#6C63FF",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
