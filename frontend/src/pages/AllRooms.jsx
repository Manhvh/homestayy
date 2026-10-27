import React, { useMemo, useState, useEffect } from "react";
import { assets, facilityIcons } from "../assets/assets";
import { useSearchParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected = false, onChange = () => { } }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={(e) => onChange(e.target.checked, label)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
      <span className="font-medium select-none text-gray-700">{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected = false, onChange = () => { } }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
      <input 
        type="radio" 
        name="sortOption" 
        checked={selected} 
        onChange={() => onChange(label)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
      />
      <span className="font-medium select-none text-gray-700">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const { rooms, navigate, currency, fetchRooms, amenities: dynamicAmenities } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params
  const destinationQuery = searchParams.get('destination') || '';
  const checkInQuery = searchParams.get('checkIn') || '';
  const checkOutQuery = searchParams.get('checkOut') || '';

  const [dateFilters, setDateFilters] = useState({
    checkIn: checkInQuery,
    checkOut: checkOutQuery,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
    amenities: [],
  });

  const [selectedSort, setSelectedSort] = useState('');

  const roomTypes = [
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite"
  ];
  const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
  ];
  const sortOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
  ];

  const amenityList = dynamicAmenities && dynamicAmenities.length > 0
    ? dynamicAmenities.map(a => a.name)
    : ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];

  // Fetch rooms whenever dates or destination in URL changes
  useEffect(() => {
    const params = {};
    if (destinationQuery) params.destination = destinationQuery;
    if (dateFilters.checkIn) params.checkIn = dateFilters.checkIn;
    if (dateFilters.checkOut) params.checkOut = dateFilters.checkOut;
    fetchRooms(params);
  }, [destinationQuery, dateFilters.checkIn, dateFilters.checkOut]);

  // Handle filter changes
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type] = [...updatedFilters[type], value];
      } else {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      }
      return updatedFilters;
    });
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  // Matches Room Type
  const matchesRoomType = (room) => {
    return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
  };

  // Matches Price Range
  const matchesPriceRange = (room) => {
    return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
      const [min, max] = range.split(' to ').map(Number);
      return room.pricePerNight >= min && room.pricePerNight <= max;
    });
  };

  // Matches Amenities
  const matchesAmenities = (room) => {
    if (selectedFilters.amenities.length === 0) return true;
    return selectedFilters.amenities.every(amenity => room.amenities && room.amenities.includes(amenity));
  };

  // Sort
  const sortRooms = (a, b) => {
    if (selectedSort === 'Price: Low to High') return a.pricePerNight - b.pricePerNight;
    if (selectedSort === 'Price: High to Low') return b.pricePerNight - a.pricePerNight;
    if (selectedSort === 'Newest First') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  // Filter Destination
  const filterDestination = (room) => {
    if (!destinationQuery) return true;
    const dest = destinationQuery.toLowerCase();
    return (
      (room.hotel?.city && room.hotel.city.toLowerCase().includes(dest)) ||
      (room.hotel?.name && room.hotel.name.toLowerCase().includes(dest)) ||
      (room.hotel?.address && room.hotel.address.toLowerCase().includes(dest))
    );
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => matchesRoomType(room) && matchesPriceRange(room) && matchesAmenities(room) && filterDestination(room))
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, destinationQuery]);

  // Clear All Filters
  const clearFilters = () => {
    setSelectedFilters({
      roomType: [],
      priceRange: [],
      amenities: [],
    });
    setDateFilters({ checkIn: '', checkOut: '' });
    setSelectedSort('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className="relative pt-32 pb-16 px-4 md:px-16 lg:px-24 xl:px-32 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gray-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gray-300/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-5xl">
          <div className="inline-block mb-8">
            <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <span>🏨</span>
              <span>Khám phá Homestay & Khách sạn</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
              Tìm kiếm <span className="text-gray-600">kỳ nghỉ lý tưởng</span>
            </h1>
            <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
          </div>
          
          {destinationQuery && (
            <div className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl w-fit">
              <span>📍 Địa điểm đang lọc: <strong>{destinationQuery}</strong></span>
              {dateFilters.checkIn && dateFilters.checkOut && (
                <span>| 📅 {dateFilters.checkIn} đến {dateFilters.checkOut}</span>
              )}
              <button onClick={clearFilters} className="ml-3 text-xs text-blue-600 underline font-semibold hover:text-blue-800">
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col-reverse lg:flex-row items-start justify-between px-4 md:px-16 lg:px-24 xl:px-32 pb-20 gap-8">
        <div className="w-full lg:w-2/3">
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
              <span className="text-6xl mb-4 block">🏡</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy phòng phù hợp</h3>
              <p className="text-gray-500 mb-6">Hãy thử thay đổi ngày nhận/trả phòng hoặc nới lỏng các tiêu chí tìm kiếm.</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room._id}
                className="group bg-white rounded-2xl p-8 mb-10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="lg:w-1/2 relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => {
                        navigate(`/rooms/${room._id}`);
                        window.scrollTo(0, 0);
                      }}
                      src={room.images?.[0] || assets.roomImg1}
                      alt="hotel-images"
                      title="Xem chi tiết phòng"
                      className="w-full h-80 lg:h-96 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-gray-800 shadow-lg border border-gray-200">
                      {room.roomType}
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">{room.hotel?.city || "Vietnam"}</p>
                      </div>
                      <p
                        onClick={() => {
                          navigate(`/rooms/${room._id}`);
                          window.scrollTo(0, 0);
                        }}
                        className="text-gray-900 text-2xl lg:text-3xl font-playfair cursor-pointer hover:text-gray-700 transition-colors duration-300 mb-2"
                      >
                        {room.hotel?.name || "Homestay"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StarRating />
                      <p className="text-gray-500 text-sm">Được đánh giá cao</p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                      <img src={assets.locationIcon} alt="location-icon" className="w-5 h-5 flex-shrink-0" />
                      <span className="leading-relaxed">{room.hotel?.address}</span>
                    </div>
                    
                    {/* Room Amenities */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {room.amenities && room.amenities.slice(0, 4).map((item, amenityIndex) => (
                        <div key={amenityIndex} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                          {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-4 h-4" />}
                          <p className="text-xs font-medium text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Room Price and Book Button */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{currency} {room.pricePerNight}</p>
                        <p className="text-xs text-gray-500">mỗi đêm</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate(`/rooms/${room._id}`);
                          window.scrollTo(0, 0);
                        }}
                        className="group/btn flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-xl text-sm"
                      >
                        <span>Xem chi tiết</span>
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Filters Sidebar */}
        <div className="bg-white w-full lg:w-80 rounded-2xl shadow-lg border border-gray-200 text-gray-600">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <p className="text-base font-semibold text-gray-800">BỘ LỌC TÌM KIẾM</p>
            <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
              XÓA TẤT CẢ
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Date filter */}
            <div className="pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 mb-3 text-sm">📅 Lọc theo ngày trống</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Ngày nhận phòng</label>
                  <input
                    type="date"
                    value={dateFilters.checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDateFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Ngày trả phòng</label>
                  <input
                    type="date"
                    value={dateFilters.checkOut}
                    min={dateFilters.checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDateFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Room Types */}
            <div className="pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Loại phòng</p>
              <div className="space-y-1">
                {roomTypes.map((type, index) => (
                  <CheckBox
                    key={index}
                    label={type}
                    selected={selectedFilters.roomType.includes(type)}
                    onChange={(checked) => handleFilterChange(checked, type, 'roomType')}
                  />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Mức giá ({currency})</p>
              <div className="space-y-1">
                {priceRanges.map((range, index) => (
                  <CheckBox
                    key={index}
                    label={`${currency} ${range}`}
                    selected={selectedFilters.priceRange.includes(range)}
                    onChange={(checked) => handleFilterChange(checked, range, 'priceRange')}
                  />
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Tiện ích</p>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {amenityList.map((amenity, index) => (
                  <CheckBox
                    key={index}
                    label={amenity}
                    selected={selectedFilters.amenities.includes(amenity)}
                    onChange={(checked) => handleFilterChange(checked, amenity, 'amenities')}
                  />
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-sm">Sắp xếp theo</p>
              <div className="space-y-1">
                {sortOptions.map((option, index) => (
                  <RadioButton
                    key={index}
                    label={option}
                    selected={selectedSort === option}
                    onChange={() => handleSortChange(option)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
