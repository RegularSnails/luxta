import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import { AuthProvider } from "./src/contexts/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Regular Snails" }} />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Sign Up" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}