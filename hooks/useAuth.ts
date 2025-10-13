import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export type UserType = {
    name: string;
    email: string;
    phone_number: string;
    uid: string;
};

export function useAuth() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
            if (u) {
                const db = getFirestore();
                const docRef = doc(db, "users", u.uid);
                const docSnap = await getDoc(docRef);

                setUser({
                    name: u.displayName ?? "",
                    email: u.email ?? "",
                    phone_number: docSnap.exists() ? (docSnap.data()?.phone_number ?? "") : "",
                    uid: u.uid,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}