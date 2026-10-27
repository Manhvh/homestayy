import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Experience = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with New Background */}
      <section
        className="relative h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 z-10" />

        {/* Hero Content */}
        <div className={`relative z-30 px-6 text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold mb-8 leading-tight">
            The HomeStay Experience
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full mb-8"></div>
          
          <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-light mb-6">
            Where modern elegance meets timeless luxury
          </p>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Discover curated destinations that offer more than just a room – they offer a lifestyle designed to be 
            <span className="text-blue-300 font-medium"> effortless</span>, 
            <span className="text-purple-300 font-medium"> indulgent</span>, and 
            <span className="text-pink-300 font-medium"> unforgettable</span>.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6">
              What Our Guests Say
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from travelers around the world who have experienced the HomeStay difference
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Indian User Testimonials */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" alt="Rajesh Kumar" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Rajesh Kumar</h4>
                  <p className="text-gray-500 text-sm">Mumbai, India</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "HomeStay made my business trip to Delhi absolutely seamless. The hotel recommendations were perfect, and the booking process was so smooth. I felt like I was staying at a 5-star property!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=200" alt="Priya Sharma" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Priya Sharma</h4>
                  <p className="text-gray-500 text-sm">Bangalore, India</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "As a frequent traveler, I've tried many platforms, but HomeStay's attention to detail and customer service is unmatched. The hotels they recommend always exceed my expectations!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" alt="Arjun Patel" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Arjun Patel</h4>
                  <p className="text-gray-500 text-sm">Goa, India</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "HomeStay helped me discover amazing properties in my own city! The local insights and recommendations are spot-on. It's like having a personal travel concierge."
              </p>
            </div>

            {/* Foreign User Testimonials */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" alt="James Wilson" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">James Wilson</h4>
                  <p className="text-gray-500 text-sm">London, UK</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "I was skeptical about booking through a new platform, but HomeStay delivered beyond my expectations. The properties are curated with such care and attention to quality."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="Marie Dubois" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Marie Dubois</h4>
                  <p className="text-gray-500 text-sm">Paris, France</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "HomeStay understands luxury like no other platform. Every property I've stayed at through them has been absolutely perfect. The service is impeccable!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" alt="David Chen" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">David Chen</h4>
                  <p className="text-gray-500 text-sm">Singapore</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "The personalized recommendations from HomeStay are incredible. They understand my preferences and always suggest properties that match my style perfectly."
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button 
              onClick={() => navigate('/rooms')}
              className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10">Discover Your Perfect Stay</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Experience;
