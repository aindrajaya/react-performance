import React from 'react';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Welcome to React Performance
        </h1>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Explore the intricacies of React performance optimization. Learn about rendering, state management, and best practices to build faster, more efficient applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            Get Started
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
            Learn More
          </button>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Rendering Optimization</h3>
            <p className="text-gray-400">Understand how React renders components and optimize for better performance.</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">State Management</h3>
            <p className="text-gray-400">Learn efficient ways to manage state in your React applications.</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-400">Best Practices</h3>
            <p className="text-gray-400">Discover proven techniques to write performant React code.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
