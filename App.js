import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { currentUser, loading } = useAuth();

  // While Firebase is figuring out if you're logged in or not
  if (loading) {
    return null; // or a simple loading screen if you want
  }

  return (
    <Stack.Navigator>
      {currentUser ? (
        // 🔐 LOGGED-IN STACK: shows all your features
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Regular Snails" }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ title: "Map" }}
          />
        </>
      ) : (
        // 🔓 AUTH STACK: only login/sign-up
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: "Sign Up" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
