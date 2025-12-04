import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Lux logo text', () => {
  render(<App />);
  const logoElement = screen.getByText(/Lux/i);
  expect(logoElement).toBeInTheDocument();
});

test('renders Login/Create Account button', () => {
  render(<App />);
  const loginButton = screen.getByText(/Login\/Create Account/i);
  expect(loginButton).toBeInTheDocument();
});

test('renders circular button', () => {
  render(<App />);
  const circularButton = screen.getByLabelText(/User menu/i);
  expect(circularButton).toBeInTheDocument();
});

test('renders floating button', () => {
  render(<App />);
  const floatingButton = screen.getByLabelText(/Toggle menu/i);
  expect(floatingButton).toBeInTheDocument();
});

test('floating button expands menu when clicked', () => {
  render(<App />);
  const floatingButton = screen.getByLabelText(/Toggle menu/i);

  // Menu items should not be visible initially
  expect(screen.queryByText(/Filter/i)).not.toBeInTheDocument();

  // Click the floating button
  fireEvent.click(floatingButton);

  // Menu items should now be visible
  expect(screen.getByText(/Filter/i)).toBeInTheDocument();
  expect(screen.getByText(/Search/i)).toBeInTheDocument();
  expect(screen.getByText(/Layers/i)).toBeInTheDocument();
});

test('circular button expands dropdown when clicked', () => {
  render(<App />);
  const circularButton = screen.getByLabelText(/User menu/i);

  // Dropdown items should not be visible initially
  expect(screen.queryByText(/Profile/i)).not.toBeInTheDocument();

  // Click the circular button
  fireEvent.click(circularButton);

  // Dropdown items should now be visible
  expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});

test('left dropdown button expands menu when clicked', () => {
  render(<App />);
  const leftDropdownButton = screen.getByLabelText(/Menu dropdown/i);

  // Dropdown items should not be visible initially
  expect(screen.queryByText(/Option 1/i)).not.toBeInTheDocument();

  // Click the left dropdown button
  fireEvent.click(leftDropdownButton);

  // Dropdown items should now be visible
  expect(screen.getByText(/Option 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Option 2/i)).toBeInTheDocument();
  expect(screen.getByText(/Option 3/i)).toBeInTheDocument();
});

test('renders map section', () => {
  render(<App />);
  const mapSection = screen.getByText(/Map Integration Area/i);
  expect(mapSection).toBeInTheDocument();
});