import React, { useState, useEffect } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "../context/AppContext";

const FeaturedDestination = () => {
  const { rooms, navigate } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  //here the return will be true only if there is a room or more than 0
  return rooms.length > 0 && (
    <div className="bg-white py-24">
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block mb-6">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
              ⭐ Featured Collection
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Featured Destinations
          </h2>
          <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
            Discover our handpicked selection of exceptional properties around the world, offering 
            <span className="text-gray-900 font-semibold"> unparalleled luxury and unforgettable experiences</span>.
          </p>
        </div>
        
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl place-items-center">
            {rooms.slice(0, 4).map((room, index) => (
              <div 
                key={room._id} 
                className={`transform transition-all duration-700 hover:scale-105 w-full ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  animationDelay: `${index * 150}ms`
                }}
              >
                <HotelCard room={room} index={index} />
              </div>
            ))}
          </div>
        </div>
        
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button 
            onClick={() => { navigate('/rooms'); scrollTo(0, 0) }} 
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white px-10 py-4 rounded-2xl font-semibold hover:from-slate-700 hover:to-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🗺️ Explore All Destinations</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedDestination;
