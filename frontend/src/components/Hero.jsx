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
    <div className="relative flex flex-col items-start justify-center px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 pt-24 pb-14 md:pt-28 md:pb-24 text-white bg-slate-900 bg-cover bg-center bg-no-repeat min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `${heroImages[currentImageIndex]}, url(${assets.heroImage})`,
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
          backgroundImage: `${heroImages[(currentImageIndex + 1) % heroImages.length]}, url(${assets.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/70 md:bg-gradient-to-r md:from-black/75 md:via-black/50 md:to-black/30" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse hidden sm:block" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-lg animate-bounce hidden sm:block" />
      
      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-6xl transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="inline-block">
          <p className="bg-gradient-to-r from-blue-500/85 to-purple-500/85 backdrop-blur-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg animate-fade-in">
            Kỳ nghỉ hoàn hảo, Trải nghiệm thăng hoa
          </p>
        </div>
        
        <h1 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold md:font-extrabold max-w-4xl mt-4 md:mt-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-slide-up">
            Khám Phá Điểm Đến
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up-delay">
            Nghỉ Dưỡng Lý Tưởng
          </span>
        </h1>
        
        <p className="max-w-2xl mt-3 md:mt-6 text-sm sm:text-base md:text-xl text-gray-200 leading-relaxed animate-fade-in-delay">
          Từ khu nghỉ dưỡng sang trọng đến homestay ấm cúng và thiên nhiên kỳ vĩ,{" "}
          <br className="hidden md:block" />
          <span className="text-blue-300 font-medium">Tìm kiếm phòng nghỉ hoàn hảo theo cách riêng của bạn</span>
        </p>

        {/* Modern Search Form */}
        <form
          onSubmit={onSearch}
          className="w-full bg-white/95 backdrop-blur-md text-gray-700 rounded-2xl p-4 sm:p-6 mt-5 md:mt-10 flex flex-col lg:flex-row lg:items-end gap-3.5 sm:gap-4 max-w-6xl shadow-2xl border border-white/20 animate-slide-up-form overflow-hidden"
        >
          {/* Destination */}
          <div className="w-full min-w-0 lg:flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <label htmlFor="destinationInput" className="text-xs sm:text-sm font-semibold text-gray-700">Điểm đến</label>
            </div>
            <input
              onChange={e => setDestination(e.target.value)}
              value={destination}
              list="destinations"
              id="destinationInput"
              type="text"
              className="w-full min-w-0 max-w-full h-11 rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white"
              placeholder="Bạn muốn đi đâu?"
              required
            />
            <datalist id="destinations">
              {availableCities.map((city, index) => (
                <option value={city} key={index} />
              ))}
            </datalist>
          </div>

          {/* Check-in & Check-out grid on mobile/tablet, flex items on desktop */}
          <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:contents gap-3.5 sm:gap-4">
            {/* Check-in */}
            <div className="w-full min-w-0 lg:flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label htmlFor="checkIn" className="text-xs sm:text-sm font-semibold text-gray-700">Nhận phòng</label>
              </div>
              <div className="relative w-full min-w-0">
                <input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={`w-full min-w-0 max-w-full h-11 rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 bg-white cursor-pointer appearance-none block ${
                    !checkIn ? "text-transparent sm:text-gray-700" : "text-gray-700"
                  }`}
                />
                {!checkIn && (
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 right-9 flex items-center text-sm text-gray-400 truncate sm:hidden">
                    Chọn ngày nhận phòng
                  </span>
                )}
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400 sm:hidden">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Check-out */}
            <div className="w-full min-w-0 lg:flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 shrink-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label htmlFor="checkOut" className="text-xs sm:text-sm font-semibold text-gray-700">Trả phòng</label>
              </div>
              <div className="relative w-full min-w-0">
                <input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={`w-full min-w-0 max-w-full h-11 rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white cursor-pointer appearance-none block ${
                    !checkOut ? "text-transparent sm:text-gray-700" : "text-gray-700"
                  }`}
                />
                {!checkOut && (
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 right-9 flex items-center text-sm text-gray-400 truncate sm:hidden">
                    Chọn ngày trả phòng
                  </span>
                )}
                <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400 sm:hidden">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="w-full min-w-0 lg:w-36">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <label htmlFor="guests" className="text-xs sm:text-sm font-semibold text-gray-700">Số khách</label>
            </div>
            <input
              min={1}
              max={8}
              id="guests"
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full min-w-0 max-w-full h-11 rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white"
              placeholder="2"
            />
          </div>

          <button
            type="submit"
            className="w-full lg:w-auto h-12 lg:h-11 mt-1 lg:mt-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 text-white font-semibold hover:from-blue-700 hover:to-purple-700 active:scale-[0.99] lg:hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer shrink-0"
          >
            <img src={assets.searchIcon} alt="search-icon" className="h-5 w-5 brightness-0 invert" />
            <span>Tìm kiếm phòng</span>
          </button>
        </form>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-4 md:bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
