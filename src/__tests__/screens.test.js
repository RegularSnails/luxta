import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen";
import LucaScreen from "../screens/LucaScreen";

test("home shows hello world", () => {
  const tree = render(<HomeScreen navigation={{ navigate: () => {} }} />);
  expect(tree.getByText("Hello World from Regular Snails")).toBeTruthy();
});

test("map screen renders", () => {
  const tree = render(<MapScreen />);
  expect(tree.getByText("Luxta Map")).toBeTruthy();
});

