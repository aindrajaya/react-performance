import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          <Link to="/" className="hover:text-gray-200 transition-colors">
            React Performance
          </Link>
        </div>
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/"
              className="hover:text-gray-200 transition-colors px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/performance"
              className="hover:text-gray-200 transition-colors px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10"
            >
              Performance
            </Link>
          </li>
          <li>
            <Link
              to="/workorders"
              className="hover:text-gray-200 transition-colors px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10"
            >
              Work Orders
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
