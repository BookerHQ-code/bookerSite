import React from 'react';
import { Link } from 'react-router-dom';
import config from '../config/environment';

const HomePage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Book, Buy & Sell
              <span className="block text-brand-100">Stylist Appointments</span>
            </h1>
            <p className="text-xl sm:text-2xl text-brand-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              The modern platform connecting customers, stylists, and salons. 
              Discover, book, and trade beauty appointments with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup" className="btn-primary bg-white text-brand-600 hover:bg-gray-50 text-lg px-8 py-4">
                Get Started Free
              </Link>
              <button className="btn-secondary border-brand-200 text-white hover:bg-brand-700 text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </section>

      {/* Features for User Types */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're booking, providing, or managing beauty services, 
              BookerHQ has everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* For Customers */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Customers</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Book appointments with verified stylists
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Buy and sell appointment slots
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Discover new stylists and services
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Secure payments and reviews
                </li>
              </ul>
              <Link to="/signup" className="btn-primary w-full text-center">
                Start Booking
              </Link>
            </div>

            {/* For Stylists */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Stylists</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">•</span>
                  Manage your services and schedule
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">•</span>
                  Accept bookings and receive payments
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">•</span>
                  Open appointments for bidding
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">•</span>
                  Build your client base
                </li>
              </ul>
              <Link to="/signup" className="btn-accent w-full text-center">
                Join as Stylist
              </Link>
            </div>

            {/* For Business Owners */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Salon Owners</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Coordinate multiple stylists
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Manage store hours and services
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Handle payments and appointments
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Grow your business online
                </li>
              </ul>
              <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg w-full text-center transition-colors">
                Manage Your Salon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How BookerHQ Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and efficient appointment management for the beauty industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up & Set Up</h3>
              <p className="text-gray-600">
                Create your profile as a customer, stylist, or business owner. 
                Set up your services, availability, and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect & Book</h3>
              <p className="text-gray-600">
                Browse available appointments, book services, or open your slots for bidding. 
                Everything happens securely on our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-brand-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enjoy & Grow</h3>
              <p className="text-gray-600">
                Attend your appointments, leave reviews, and build lasting relationships. 
                Grow your business or discover your new favorite stylist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 text-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Beauty Experience?
          </h2>
          <p className="text-xl text-brand-100 mb-8">
            Join thousands of customers, stylists, and salon owners who trust BookerHQ 
            for their appointment needs.
          </p>
          <Link to="/signup" className="btn-primary bg-white text-brand-600 hover:bg-gray-50 text-lg px-8 py-4 inline-block">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;