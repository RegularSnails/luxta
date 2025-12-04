import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";  // Add this import

test("home shows hello world", () => {
  const tree = render(<HomeScreen navigation={{ navigate: () => {} }} />);
  expect(tree.getByText("Hello World from Regular Snails")).toBeTruthy();
});

test("map screen renders", () => {
  const tree = render(<MapScreen navigation={{ navigate: () => {} }} />);
  // Update this expectation to match your new map component's content
  expect(tree).toBeTruthy();
});

