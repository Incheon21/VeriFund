import React, { useState } from 'react';
import { useAuth } from '../utils/auth';
import { NavLink } from "react-router";

const Navbar = () => {
  const { principal, isAuthenticated, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="fixed top-0 z-50 bg-[#E5E8EB] px-12 p-4 flex w-full justify-between items-center text-black">
      <h1 className="text-xl font-bold">VeriFund</h1>
      <div className="relative">
        {isAuthenticated ? (
          <div>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={toggleDropdown}
            >
              {principal}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
                <NavLink
                  to="/profile"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </NavLink>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="bg-[#12A3ED] hover:bg-[#1292ed] text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
            onClick={login}
          >
            Sign In with Internet Identity
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;