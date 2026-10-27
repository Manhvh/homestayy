import React, { useEffect, useState } from 'react'
import Title from './Title'
import { assets, exclusiveOffers } from '../assets/assets'

const ExclusiveOffer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className='bg-gray-50 py-20'>
      <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32'>
        <div className='flex flex-col md:flex-row items-center justify-between w-full mb-16'>
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Title align='left' title='Exclusive Offers' 
            subTitle='Take advantage of our exclusive offers and special packages to enhance your stay and create unforgettable memories.'/>
          </div>
          <button className={`group flex items-center gap-3 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 max-md:mt-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: '200ms'}}>
            View All Offers
            <img src={assets.arrowIcon} alt="arrow-icon" className='w-4 h-4 group-hover:translate-x-1 transition-all duration-300' />
          </button>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full'>
          {exclusiveOffers.map((item, index)=>(
            <div 
              key={item._id} 
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{transitionDelay: `${index * 150}ms`}}
            >
              <div className='relative h-80 bg-no-repeat bg-cover bg-center' style={{backgroundImage: `url(${item.image})`}}>
                {/* Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'></div>
                
                {/* Discount Badge */}
                <div className='absolute top-6 left-6'>
                  <span className='px-4 py-2 bg-white text-gray-900 font-bold text-sm rounded-full shadow-lg'>
                    {item.priceOff}% OFF
                  </span>
                </div>
                
                {/* Content */}
                <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                  <h3 className='text-2xl font-bold font-playfair mb-2'>{item.title}</h3>
                  <p className='text-gray-200 mb-3 text-sm leading-relaxed'>{item.description}</p>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-gray-300'>Expires {item.expiryDate}</p>
                    <button className='flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300 text-sm font-medium'>
                      View Offers
                      <img className='w-3 h-3 group-hover:translate-x-1 transition-all duration-300' src={assets.arrowIcon} alt="arrow-icon" />
                    </button>
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

export default ExclusiveOffer