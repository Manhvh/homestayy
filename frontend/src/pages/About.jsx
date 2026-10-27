import React, { useEffect, useState } from "react";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-32 pb-20 px-6 md:px-20 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gray-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gray-300/10 rounded-full blur-3xl"></div>
      
      {/* About HomeStay */}
      <div className={`max-w-5xl mx-auto mb-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-block mb-12">
          <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <span>🏨</span>
            <span>About HomeStay</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
            Redefining
            <span className="block text-gray-600">Luxury Travel</span>
          </h2>
          <div className="w-32 h-1 bg-gray-900 mx-auto rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
            <strong className="text-gray-900">HomeStay</strong> is a premium hotel booking platform
            designed for the discerning traveler who seeks exceptional experiences.
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            Whether you're planning a luxurious retreat, a business trip, or an adventurous escape, 
            HomeStay connects you with the world's finest accommodations. Our platform combines 
            cutting-edge technology with personalized service to deliver unforgettable stays.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h3 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900 mb-4">
            Why Choose HomeStay?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of technology and hospitality
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Booking System",
              desc: "Real-time availability checks, date validation, and seamless booking flow with instant confirmations.",
              icon: "🎯",
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "Hotel Owner Dashboard",
              desc: "Comprehensive management tools for rooms, availability, revenue tracking, and guest analytics.",
              icon: "🏨",
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "Luxury-Focused Design",
              desc: "Elegant, intuitive interface built with modern technologies for the ultimate user experience.",
              icon: "✨",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              title: "Secure Authentication",
              desc: "Bank-level security with encrypted payments and protected user data for peace of mind.",
              icon: "🔐",
              color: "from-green-500 to-green-600"
            },
            {
              title: "Lightning Fast",
              desc: "Optimized performance across all devices with instant loading and smooth interactions.",
              icon: "⚡",
              color: "from-orange-500 to-orange-600"
            },
            {
              title: "24/7 Support",
              desc: "Round-the-clock customer service and dedicated support for both guests and hotel partners.",
              icon: "💬",
              color: "from-teal-500 to-teal-600"
            },
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className={`group relative bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 hover:border-gray-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{transitionDelay: `${idx * 100}ms`}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`text-center mt-28 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm">© {new Date().getFullYear()}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-gray-500 text-sm font-medium">Aditya</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-gray-700 text-sm font-semibold">HomeStay Project</span>
        </div>
      </div>
    </div>
  );
};

export default About;
