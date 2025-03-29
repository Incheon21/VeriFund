import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { NavLink } from "react-router";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { principal, isAuthenticated, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasBackground, setHasBackground] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if navbar should have background (after scrolling a bit)
      setHasBackground(currentScrollY > 50);

      // Determine if navbar should be visible based on scroll direction
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsVisible(false);
      } else {
        // Scrolling up - show navbar
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
      setScrollPosition(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-12 p-4 flex justify-between items-center text-black transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"} ${
        hasBackground ? "bg-[#E5E8EB] shadow-md" : "bg-transparent"
      }`}
    >
      <h1 className="text-xl font-bold">VeriFund</h1>
      <div className="gap-4 relative flex flex-row items-center justify-center">
        <div className="gap-4 flex flex-row items-center justify-center">
          <NavLink
            to="/"
            className="hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 100);
            }}
          >
            Home
          </NavLink>
          <NavLink
            to="/"
            className="hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setTimeout(() => {
                const element = document.getElementById("about-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            }}
          >
            About
          </NavLink>
          <NavLink to="/explore" className="hover:underline cursor-pointer">
            Donate
          </NavLink>
          <NavLink to="/auditors" className="hover:underline cursor-pointer">
            Auditors
          </NavLink>
          {principal && (
            <NavLink to="/profile" className="hover:underline cursor-pointer">
              Create
            </NavLink>
          )}
        </div>
        {isAuthenticated ? (
          <div className="relative h-fit">
            <button className={`${dropdownOpen ? "bg-black" : "bg-transparent"} hover:bg-black rounded-full text-white font-bold p-1`} onClick={toggleDropdown}>
              <img src="/profile.png" className="w-6 h-6 rounded-full" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
                <NavLink to="/profile" className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                  Profile
                </NavLink>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={logout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="bg-[#12A3ED] hover:bg-[#1292ed] text-white font-bold py-2 px-4 rounded-lg cursor-pointer" onClick={login}>
            Sign In with Internet Identity
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
