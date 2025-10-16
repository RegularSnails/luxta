import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen";
import LucaScreen from "../screens/LucaScreen";

test("home shows hello world", () => {
  const tree = render(<HomeScreen navigation={{ navigate: () => {} }} />);
  expect(tree.getByText("Hello World from Regular Snails")).toBeTruthy();
});

test("luca shows data", () => {
  const tree = render(<LucaScreen />);
  expect(tree.getByText("Luca's first API should be working.")).toBeTruthy();
  expect(tree.getByText(/owner:/)).toBeTruthy();
  expect(tree.getByText(/team:/)).toBeTruthy();
});

