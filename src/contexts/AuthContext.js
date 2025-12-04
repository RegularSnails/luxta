import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? { email: user.email, uid: user.uid } : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      loading,
      currentUser,
      signup: async (email, password) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized || !password) throw new Error("Email and password are required.");
        await createUserWithEmailAndPassword(auth, normalized, password);
      },
      login: async (email, password) => {
        const normalized = email.trim().toLowerCase();
        await signInWithEmailAndPassword(auth, normalized, password);
      },
      logout: async () => {
        await signOut(auth);
      },
      getIdToken: async () => {
        if (!auth.currentUser) return null;
        return await auth.currentUser.getIdToken();
      }
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
