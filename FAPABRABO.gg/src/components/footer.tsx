// src/components/Footer.tsx
import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/about" className="footer-link">About</a>
          <a href="/privacy" className="footer-link">Privacy</a>
          <a href="/terms" className="footer-link">Terms</a>
          <a href="/help" className="footer-link">Help</a>
        </div>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Gamegle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;