import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "../context/AppContext";

const RecommendedHotel = () => {
    const { rooms, searchedCities } = useAppContext();
    const [recommended, setRecommended] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const filterHotels = () => {
        const filteredHotels = rooms.slice().filter(room => searchedCities.includes(room.hotel.city));
        setRecommended(filteredHotels);
    };

    useEffect(() => {
        filterHotels();
        
        // Trigger animation when component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [rooms, searchedCities]);

    //here the return will be true only if there is a room or more than 0
    return recommended.length > 0 && (
        <div className="relative flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gray-50 py-24">
            <div className={`transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className="text-center mb-16">
                    <div className="inline-block mb-6">
                        <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            ✨ Personalized for You
                        </span>
                    </div>
                    <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Recommended Hotels
                    </h2>
                    <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-6"></div>
                    <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                        Curated with care exclusively for your travel preferences — experience handpicked stays that blend 
                        <span className="text-gray-900 font-semibold"> elegance, comfort, and unforgettable hospitality</span> at every turn.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto place-items-center">
                    {recommended.slice(0, 4).map((room, index) => (
                        <div 
                            key={room._id} 
                            className={`transform transition-all duration-700 hover:scale-105 w-full max-w-sm ${
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
                
                <div className="text-center mt-16">
                    <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-10 py-4 rounded-2xl font-semibold hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                        <span>✨ Explore More Recommendations</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendedHotel;
