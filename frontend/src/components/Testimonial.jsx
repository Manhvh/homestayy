import React, { useEffect, useState } from 'react'
import Title from './Title'
import { testimonials } from '../assets/assets'
import StarRating from './StarRating'

const Testimonial = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className='bg-gray-50 py-24'>
      <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32'>
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <Title title={`What Our Guests Say`} subTitle={`Discover why discerning travellers consistently choose HomeStay for their exclusive and luxurious accommodations around the world.`}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{transitionDelay: `${index * 150}ms`}}
            >
              <div className="flex items-center gap-4 mb-6">
                <img className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" src={testimonial.image} alt={testimonial.name} />
                <div>
                  <p className="font-playfair text-xl font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                <StarRating/>
              </div>
              
              <blockquote className="text-gray-600 leading-relaxed italic">
                "{testimonial.review}"
              </blockquote>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Verified Guest</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonial