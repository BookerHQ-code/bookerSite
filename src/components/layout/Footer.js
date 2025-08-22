import React from 'react';
import { Link } from 'react-router-dom';
import config from '../../config/environment';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-white">
                {config.app.name}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {config.app.description}. Connect with professional stylists and
              manage your beauty appointments with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* User Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Everyone</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Customers: Book appointments</li>
              <li>• Stylists: Manage your business</li>
              <li>• Salons: Coordinate your team</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {config.app.name}. All rights
            reserved.
            {!config.isProduction && (
              <span className="ml-4 inline-block px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded font-medium">
                {config.environment.toUpperCase()}
              </span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
