import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const HotelCard = ({room, index}) => {
  const { currency } = useAppContext();
  const roomId = room.id || room._id;
  const hotel = room.hotel || {};
  const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : [assets.roomImg1];

  return (
    <Link to={'/rooms/' + roomId} onClick={() => scrollTo(0, 0)} key={roomId} 
    className='group relative w-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col'>
        {/* Mobile Design - Large Image (60-65% of card height) */}
        <div className="md:hidden">
          <div className="relative overflow-hidden h-64">
            <img 
              src={images[0]} 
              alt="hotel room"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
            />
            
            {/* Heart icon in top-right */}
            <div className='absolute top-4 right-4'>
              <div className='w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200'>
                <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className='p-5'>
            {/* Hotel Name and Capacity */}
            <div className='flex items-center justify-between gap-2 mb-2'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>
                {hotel.name || "Homestay"}
              </h3>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                Tối đa {room.maxGuests || 2} người
              </span>
            </div>
            
            {/* Location with pin icon */}
            <div className='flex items-center gap-2 text-sm text-gray-600 mb-3'>
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{hotel.address || "Việt Nam"}</span>
            </div>

            {/* Price */}
            <div className='mb-3'>
              <p className='text-lg font-semibold text-gray-900'>
                {Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}<span className='text-sm font-normal text-gray-500'> / đêm</span>
              </p>
            </div>

            {/* Star Rating */}
            <div className='flex items-center gap-1'>
              <div className='flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-1">({room.reviews?.length || 12} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* Desktop Design - Original Layout */}
        <div className="hidden md:flex flex-col">
          <div className="relative overflow-hidden h-40 flex-shrink-0">
            <img 
              src={images[0]} 
              alt="hotel room"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Simple badge */}
            {index % 2 === 0 && 
            <div className='absolute top-3 left-3'>
              <span className='px-3 py-1 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm border border-gray-200'>
                Yêu thích
              </span>
            </div>}
            
            {/* Price badge */}
            <div className='absolute top-3 right-3'>
              <span className='px-3 py-1 text-sm bg-white text-gray-800 font-semibold rounded-lg shadow-sm border border-gray-200'>
                {Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}
              </span>
            </div>
          </div>

            <div className='p-5 flex flex-col flex-grow min-h-0'>
                {/* Hotel name and rating */}
                <div className='flex items-start justify-between mb-3 flex-shrink-0'>
                    <div className="flex-1 min-w-0">
                        <h3 className='font-playfair text-xl font-semibold text-gray-900 mb-1 line-clamp-2'>
                            {hotel.name || "Homestay"}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{room.roomType}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-blue-600 font-medium">Tối đa {room.maxGuests || 2} khách</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 flex-shrink-0 ml-2'>
                        <img src={assets.starIconFilled} alt="starIcon" className="w-4 h-4"/>
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                    </div>
                </div>

                {/* Location */}
                <div className='flex items-center gap-2 text-sm text-gray-600 mb-3 flex-shrink-0'>
                    <img src={assets.locationIcon} alt="locationIcon" className="w-4 h-4 flex-shrink-0"/>
                    <span className="truncate">{room.hotel.address}</span>
                </div>

                {/* Amenities preview */}
                <div className="flex items-center gap-2 mb-3 flex-wrap flex-grow min-h-0">
                    {room.amenities.slice(0, 2).map((amenity, idx) => (
                        <span key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md flex-shrink-0">
                  {amenity}
                </span>
                    ))}
                    {room.amenities.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md flex-shrink-0">
                  +{room.amenities.length - 2} tiện ích khác
                </span>
                    )}
                </div>

                {/* Price and Book button */}
                <div className='flex items-center justify-between mt-auto flex-shrink-0'>
                    <p className='text-xs text-gray-500'>Chỉ từ</p>
                    <p className='text-sm font-bold text-gray-900'>{Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}<span
                        className='text-sm font-normal text-gray-500'> / đêm</span></p>
                </div>
                <button
                    className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer shadow-sm mt-2'>
                    Xem phòng
                </button>
            </div>
        </div>
    </Link>
  )
}

export default HotelCard
