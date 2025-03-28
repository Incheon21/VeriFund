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
      <div className="gap-4 relative flex flex-row items-center justify-center">
        <div className="gap-4 flex flex-row items-center justify-center">
          <NavLink to="/" className="hover:underline">Home</NavLink>
          <NavLink to="" className="hover:underline">About</NavLink>
          <NavLink to="/explore" className="hover:underline">Explore</NavLink>
        </div>
        {isAuthenticated ? (
          <div clas>
            <button
              className={` ${dropdownOpen ? "bg-black" : "bg-transparent"} hover:bg-black rounded-full text-white font-bold p-2`}
              onClick={toggleDropdown}
            >
              <img src="/profile.png" className="w-8 h-8 rounded-full" />
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