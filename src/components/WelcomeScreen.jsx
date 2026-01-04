import { useState } from "react";
import PropTypes from "prop-types";

const WelcomeScreen = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onComplete({ name: name.trim(), email: email.trim() });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Task Manager
          </h1>
          <p className="text-gray-600">
            Let's get started by setting up your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="welcome-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What's your name?
            </label>
            <input
              id="welcome-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
            />
          </div>

          <div>
            <label
              htmlFor="welcome-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your email
            </label>
            <input
              id="welcome-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition transform hover:scale-105"
          >
            Get Started
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your data syncs to the cloud database</p>
        </div>
      </div>
    </div>
  );
};

WelcomeScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default WelcomeScreen;
