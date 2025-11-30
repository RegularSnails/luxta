import { useState } from 'react';
import './App.css';

function App() {
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [isCircularDropdownOpen, setIsCircularDropdownOpen] = useState(false);
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="logo-text">Lux</span>
        </div>
        <div className="navbar-right">
          {/* Dropdown Button (left of Login) */}
          <div className="dropdown-container">
            <button
              className="nav-dropdown-btn"
              onClick={() => setIsLeftDropdownOpen(!isLeftDropdownOpen)}
              aria-label="Menu dropdown"
            >
              ☰
            </button>
            {isLeftDropdownOpen && (
              <div className="dropdown-menu">
                <a href="#option1" className="dropdown-item">Option 1</a>
                <a href="#option2" className="dropdown-item">Option 2</a>
                <a href="#option3" className="dropdown-item">Option 3</a>
              </div>
            )}
          </div>
          
          {/* Login/Create Account Button */}
          <button className="login-btn">Login/Create Account</button>
          
          {/* Circular Dropdown Button (rightmost) */}
          <div className="dropdown-container">
            <button
              className="circular-btn"
              onClick={() => setIsCircularDropdownOpen(!isCircularDropdownOpen)}
              aria-label="User menu"
            >
              ●
            </button>
            {isCircularDropdownOpen && (
              <div className="dropdown-menu">
                <a href="#profile" className="dropdown-item">Profile</a>
                <a href="#settings" className="dropdown-item">Settings</a>
                <a href="#logout" className="dropdown-item">Logout</a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-placeholder">
          <span>Map Integration Area</span>
        </div>

        {/* Floating Button with Expanding Menu */}
        <div className="floating-button-container">
          {isFloatingMenuOpen && (
            <div className="floating-menu">
              <button className="floating-menu-item">Filter</button>
              <button className="floating-menu-item">Search</button>
              <button className="floating-menu-item">Layers</button>
            </div>
          )}
          <button
            className="floating-btn"
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            aria-label="Toggle menu"
          >
            {isFloatingMenuOpen ? '×' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
