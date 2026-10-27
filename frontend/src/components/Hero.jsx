import React, { useState, useEffect } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
  const { navigate, axios, getToken, setSearchedCities, cities: dynamicCities, user } = useAppContext();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const availableCities = dynamicCities && dynamicCities.length > 0 ? dynamicCities : cities;

  const heroImages = [
    "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80')",
    "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
    "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80')",
    "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate background images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (destination) queryParams.set("destination", destination);
    if (checkIn) queryParams.set("checkIn", checkIn);
    if (checkOut) queryParams.set("checkOut", checkOut);
    if (guests) queryParams.set("guests", guests);

    navigate(`/rooms?${queryParams.toString()}`);

    // Call API to save recent searched City if user logged in
    try {
      if (user && destination) {
        const token = await getToken();
        if (token) {
          await axios.post('/api/user/store-recent-search', { recentSearchedCity: destination },
            { headers: { Authorization: `Bearer ${token}` } });
        }
      }
    } catch (err) {
      console.log(err.message);
    }

    if (destination) {
      setSearchedCities((prevSearchedCities) => {
        const updatedSearchedCities = [...prevSearchedCities, destination];
        if (updatedSearchedCities.length > 3) {
          updatedSearchedCities.shift();
        }
        return updatedSearchedCities;
      });
    }
  };

  return (
    <div className="relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-cover bg-center bg-no-repeat h-screen overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: heroImages[currentImageIndex],
          transform: 'scale(1.05)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Image transition overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
          backgroundImage: heroImages[(currentImageIndex + 1) % heroImages.length],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-lg animate-bounce" />
      
      {/* Main Content */}
      <div className={`relative z-10 transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="inline-block">
          <p className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in">
            ✨ Seamless Stays, Elevated Experiences
          </p>
        </div>
        
        <h1 className="font-playfair text-3xl md:text-6xl lg:text-7xl font-bold md:font-extrabold max-w-4xl mt-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-slide-up">
            Explore Your Perfect
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up-delay">
            Gateway Destination
          </span>
        </h1>
        
        <p className="max-w-2xl mt-6 text-lg md:text-xl text-gray-200 leading-relaxed animate-fade-in-delay">
          From Luxury Resorts to Budget Gems and Wild Escapes, 
          <br className="hidden md:block" />
          <span className="text-blue-300 font-medium">Find your perfect stay, your way</span>
        </p>

        {/* Modern Search Form */}
        <form onSubmit={onSearch} className="bg-white/95 backdrop-blur-md text-gray-700 rounded-2xl p-6 mt-10 flex flex-col lg:flex-row gap-4 max-w-6xl shadow-2xl border border-white/20 animate-slide-up-form">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <img src={assets.locationIcon} alt="location" className="h-3 w-3" />
              </div>
              <label htmlFor="destinationInput" className="text-sm font-semibold text-gray-600">Destination</label>
            </div>
            <input
              onChange={e => setDestination(e.target.value)}
              value={destination}
              list="destinations"
              id="destinationInput"
              type="text"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80"
              placeholder="Where are you going?"
              required
            />
            <datalist id="destinations">
              {availableCities.map((city, index) => (
                <option value={city} key={index} />
              ))}
            </datalist>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <img src={assets.calenderIcon} alt="calendar" className="h-3 w-3" />
              </div>
              <label htmlFor="checkIn" className="text-sm font-semibold text-gray-600">Check in</label>
            </div>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 bg-white/80"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <img src={assets.calenderIcon} alt="calendar" className="h-3 w-3" />
              </div>
              <label htmlFor="checkOut" className="text-sm font-semibold text-gray-600">Check out</label>
            </div>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/80"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <img src={assets.guestsIcon} alt="guests" className="h-3 w-3" />
              </div>
              <label htmlFor="guests" className="text-sm font-semibold text-gray-600">Guests</label>
            </div>
            <input
              min={1}
              max={8}
              id="guests"
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/80"
              placeholder="2"
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 px-8 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <img src={assets.searchIcon} alt="search-icon" className="h-5 w-5" />
            <span>Search Hotels</span>
          </button>
        </form>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
