import React from 'react';
import { useAuth } from '../utils/auth';

const Navbar = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <nav className="bg-[#E5E8EB] p-4 flex justify-between items-center text-black">
      <h1 className="text-xl font-bold">VeriFund</h1>
      <div>
        {isAuthenticated ? (
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={logout}
          >
            Logout
          </button>
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