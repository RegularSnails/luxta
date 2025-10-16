import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import LucaScreen from "./src/screens/LucaScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Regular Snails" }} />
        <Stack.Screen name="Luca" component={LucaScreen} options={{ title: "Luca" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

