import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from './Title'

const NewsLetter = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-gray-900 py-24">
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32">
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
         <div className="flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl md:text-[40px] font-playfair text-white">{`Stay Inspired`}</h1>
            <p className='text-sm md:text-base text-gray-300 mt-2 max-w-174'>Join our newsletter and be the first to discover new updates, exclusive offers, and inspiration.</p>
          </div>
        </div>

        <div className={`w-full max-w-2xl transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="relative w-full">
              <input 
                type="email" 
                className="w-full bg-white/10 px-6 py-4 border border-white/20 rounded-lg outline-none text-white placeholder-gray-300 focus:border-white/40 focus:bg-white/15 transition-all duration-300" 
                placeholder="Enter your email address" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            <button className="group flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
              Subscribe
              <img src={assets.arrowIcon} alt="arrow-icon" className='w-4 h-4 group-hover:translate-x-1 transition-all duration-300' />
            </button>
          </div>
          
          <p className="text-gray-400 mt-6 text-sm text-center leading-relaxed">
            By subscribing, you agree to our <span className="text-white underline cursor-pointer hover:text-gray-300">Privacy Policy</span> and consent to receive updates from HomeStay.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NewsLetter
