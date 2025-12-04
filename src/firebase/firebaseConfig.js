import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";

// Firebase web config (from Firebase Console > Project settings > General > Your apps).
const firebaseConfig = {
  apiKey: "AIzaSyDG1QG1RmHscNjAtb-ERHlXYGez675TzQs",
  authDomain: "luxta-4d8d4.firebaseapp.com",
  projectId: "luxta-4d8d4",
  storageBucket: "luxta-4d8d4.appspot.com",
  messagingSenderId: "397766360270",
  appId: "1:397766360270:web:26d6a663fae7285c98649f",
  measurementId: "G-M2BDRRHNVG"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  // Ensure React Native persistence for native platforms.
  try {
    auth = getAuth(app);
  } catch {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
}

export { app, auth };
