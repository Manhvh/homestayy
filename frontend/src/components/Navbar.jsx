import React, { useEffect, useState } from "react";
import { assets, cities } from "../assets/assets.js";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import UserMenu from "./UserMenu.jsx";

const Navbar = () => {
  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Khách sạn & Phòng", path: "/rooms" },
    { name: "Trải nghiệm", path: "/Experience" },
    { name: "Giới thiệu", path: "/About" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();

  const { user, navigate, isOwner, setShowHotelRegistration, isAdmin, openLoginModal } = useAppContext();

  // Effect to handle scroll event and change navbar style
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    } else {
      setIsScrolled(false);
    }

    setIsScrolled(prev => location.pathname !== "/" ? true : prev);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rooms?destination=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('.search-container')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  return (
    <nav className={`fixed top-0 left-0  w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 
      ${isScrolled
        ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
        : "py-4 md:py-6"
      }`}>
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={assets.logo}
          alt="HomeStay Logo"
          className={`h-12 md:h-14 lg:h-16 transition-all duration-300 ${isScrolled && "invert opacity-90"}`} />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        {navLinks.map((link, i) => (
          <a key={i}
            href={link.path}
            className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isScrolled 
                ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                : "text-white hover:text-blue-200 hover:bg-white/10"
            }`}>
            {link.name}
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
              isScrolled ? "bg-blue-600" : "bg-blue-200"
            }`} />
          </a>
        ))}
        {user && (
          isAdmin ? (
            <button
              onClick={() => navigate("/admin")}
              className="group relative px-6 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            >
              Trang Quản trị
            </button>
          ) : isOwner ? (
            <button
              onClick={() => navigate("/owner-dashboard")}
              className={`group relative px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isScrolled 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl" 
                  : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Kênh Chủ nhà
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowHotelRegistration(true)}
              className={`group relative px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isScrolled 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl" 
                  : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Đăng ký Homestay
              </span>
            </button>
          )
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search Button */}
        <div className="relative search-container">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`group relative p-2 rounded-lg transition-all duration-300 ${
              isScrolled 
                ? "hover:bg-blue-50 text-gray-700" 
                : "hover:bg-white/20 text-white"
            }`}
          >
            <img
              src={assets.searchIcon}
              alt="search"
              className={`h-6 w-6 transition-all duration-300 ${isScrolled && "invert"}`} 
            />
          </button>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tìm Homestay theo thành phố
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên thành phố..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                  <datalist id="cities">
                    {cities.map((city, index) => (
                      <option value={city} key={index} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer"
                >
                  Tìm kiếm Homestay
                </button>
              </form>
              
              {/* Popular Cities */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Điểm đến phổ biến</p>
                <div className="flex flex-wrap gap-2">
                  {cities.slice(0, 6).map((city, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(city);
                        navigate(`/rooms?destination=${encodeURIComponent(city)}`);
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-full transition-all duration-200 cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* here if user is logged in, show UserButton, otherwise show Login button the user button will show the user profile and logout option */}
        {user ? (
          <UserMenu />
        ) : (
          <button
            onClick={openLoginModal}
            className={`group relative px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
              isScrolled 
                ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl" 
                : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
            }`}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập
            </span>
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isScrolled 
              ? "hover:bg-blue-50 text-gray-700" 
              : "hover:bg-white/20 text-white"
          }`}
        >
          <img
            src={assets.searchIcon}
            alt="search"
            className={`h-8 w-8 transition-all duration-300 ${isScrolled && "invert"}`} 
          />
        </button>

        {user && <UserMenu />}
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt="menu-icon"
          className={`${isScrolled && "invert"}h-4 cursor-pointer`} />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}>
          <img src={assets.closeIcon} alt="close-menu" className="h-8" />
        </button>

        {navLinks.map((link, i) => (
          <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}
            className="group relative px-6 py-3 text-lg font-medium rounded-xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-600">
            {link.name}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
          </a>
        ))}

        {user && (
          isAdmin ? (
            <button
              onClick={() => {
                navigate("/admin");
                setIsMenuOpen(false);
              }}
              className="px-6 py-3 text-sm font-bold rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-700 cursor-pointer"
            >
              Trang Quản trị
            </button>
          ) : isOwner ? (
            <button
              className="group relative px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              onClick={() => {
                navigate("/owner-dashboard");
                setIsMenuOpen(false);
              }}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Kênh Chủ nhà
              </span>
            </button>
          ) : (
            <button
              className="group relative px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              onClick={() => {
                setShowHotelRegistration(true);
                setIsMenuOpen(false);
              }}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Đăng ký Homestay
              </span>
            </button>
          )
        )}

        {!user && (
          <button
            onClick={() => {
              openLoginModal();
              setIsMenuOpen(false);
            }}
            className="group relative px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg cursor-pointer">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập
            </span>
          </button>
        )}
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="bg-white m-4 rounded-xl p-6 mt-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Tìm kiếm Homestay</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tìm theo thành phố
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên thành phố..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer"
              >
                Tìm kiếm Homestay
              </button>
            </form>
            
            {/* Popular Cities */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Điểm đến phổ biến</p>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 6).map((city, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(city);
                      navigate(`/rooms?destination=${encodeURIComponent(city)}`);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
