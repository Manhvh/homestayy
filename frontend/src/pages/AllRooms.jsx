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
  const guestsQuery = searchParams.get('guests') || '';

  const [dateFilters, setDateFilters] = useState({
    checkIn: checkInQuery,
    checkOut: checkOutQuery,
  });

  const [guestsFilter, setGuestsFilter] = useState(guestsQuery ? Number(guestsQuery) : '');

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    amenities: [],
  });

  // Price Range limits: 100.000 VNĐ to under 1.000.000 VNĐ
  const MIN_PRICE_LIMIT = 100000;
  const MAX_PRICE_LIMIT = 1000000;

  const [minPrice, setMinPrice] = useState(MIN_PRICE_LIMIT);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);

  const [selectedSort, setSelectedSort] = useState('');

  const roomTypes = [
    { label: "Phòng đơn", value: "Phòng đơn" },
    { label: "Phòng đôi", value: "Phòng đôi" },
    { label: "Phòng cao cấp", value: "Phòng cao cấp" },
    { label: "Căn hộ gia đình", value: "Căn hộ gia đình" }
  ];

  const sortOptions = [
    { label: "Giá: Thấp đến Cao", value: "price_asc" },
    { label: "Giá: Cao đến Thấp", value: "price_desc" },
    { label: "Mới nhất", value: "newest" },
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
    if (selectedFilters.roomType.length === 0) return true;
    return selectedFilters.roomType.some(val => room.roomType === val || room.roomType?.toLowerCase().includes(val.toLowerCase()));
  };

  // Matches Price Range via horizontal slider and quick brackets
  const matchesPriceRange = (room) => {
    const p = Number(room.pricePerNight) || 0;
    return p >= minPrice && p <= maxPrice;
  };

  // Matches Amenities
  const matchesAmenities = (room) => {
    if (selectedFilters.amenities.length === 0) return true;
    return selectedFilters.amenities.every(amenity => room.amenities && room.amenities.includes(amenity));
  };

  // Sort
  const sortRooms = (a, b) => {
    if (selectedSort === 'price_asc') return a.pricePerNight - b.pricePerNight;
    if (selectedSort === 'price_desc') return b.pricePerNight - a.pricePerNight;
    if (selectedSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
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

  // Matches Capacity / Number of Guests
  const matchesGuests = (room) => {
    if (!guestsFilter) return true;
    return (room.maxGuests || 2) >= Number(guestsFilter);
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => matchesRoomType(room) && matchesPriceRange(room) && matchesAmenities(room) && filterDestination(room) && matchesGuests(room))
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, destinationQuery, minPrice, maxPrice, guestsFilter]);

  // Clear All Filters
  const clearFilters = () => {
    setSelectedFilters({
      roomType: [],
      amenities: [],
    });
    setMinPrice(MIN_PRICE_LIMIT);
    setMaxPrice(MAX_PRICE_LIMIT);
    setDateFilters({ checkIn: '', checkOut: '' });
    setGuestsFilter('');
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
              <span>Khám phá Homestay & Khách sạn</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
              Tìm kiếm <span className="text-gray-600">kỳ nghỉ lý tưởng</span>
            </h1>
            <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
          </div>
          
          {destinationQuery && (
            <div className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl w-fit">
              <span>Địa điểm đang lọc: <strong>{destinationQuery}</strong></span>
              {dateFilters.checkIn && dateFilters.checkOut && (
                <span>| {dateFilters.checkIn} đến {dateFilters.checkOut}</span>
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
          {/* Quick Horizontal Price Scroll Bar */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap mr-1">
              Lọc nhanh giá:
            </span>
            {[
              { label: `Tất cả`, min: MIN_PRICE_LIMIT, max: MAX_PRICE_LIMIT },
              { label: `100.000 - 300.000 ${currency}`, min: 100000, max: 300000 },
              { label: `300.000 - 500.000 ${currency}`, min: 300000, max: 500000 },
              { label: `500.000 - 1.000.000 ${currency}`, min: 500000, max: 1000000 }
            ].map((chip, idx) => {
              const isSelected = minPrice === chip.min && maxPrice === chip.max;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMinPrice(chip.min);
                    setMaxPrice(chip.max);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy phòng phù hợp</h3>
              <p className="text-gray-500 mb-6">Hãy thử thay đổi ngày nhận/trả phòng hoặc nới lỏng các tiêu chí tìm kiếm.</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const roomId = room.id || room._id;
              return (
              <div
                key={roomId}
                className="group bg-white rounded-2xl p-8 mb-10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="lg:w-1/2 relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => {
                        navigate(`/rooms/${roomId}`);
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
                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">{room.hotel?.city || "Việt Nam"}</p>
                      </div>
                      <p
                        onClick={() => {
                          navigate(`/rooms/${roomId}`);
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
                      {room.amenities && (Array.isArray(room.amenities) ? room.amenities : []).slice(0, 4).map((item, amenityIndex) => (
                        <div key={amenityIndex} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                          {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-4 h-4" />}
                          <p className="text-xs font-medium text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Room Price and Book Button */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}</p>
                        <p className="text-xs text-gray-500">mỗi đêm</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate(`/rooms/${roomId}`);
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
            );})
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
              <p className="font-semibold text-gray-800 mb-3 text-sm">Lọc theo ngày trống</p>
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

            {/* Guests Capacity Filter */}
            <div className="pb-4 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800 text-sm">Số lượng khách</p>
                {guestsFilter && (
                  <button
                    onClick={() => setGuestsFilter('')}
                    className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "1+", value: 1 },
                  { label: "2+", value: 2 },
                  { label: "3+", value: 3 },
                  { label: "4+", value: 4 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGuestsFilter(prev => prev === item.value ? '' : item.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer text-center ${
                      guestsFilter === item.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item.label} khách
                  </button>
                ))}
              </div>
            </div>

            {/* Room Types */}
            <div className="pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Loại phòng</p>
              <div className="space-y-1">
                {roomTypes.map((type, index) => (
                  <CheckBox
                    key={index}
                    label={type.label}
                    selected={selectedFilters.roomType.includes(type.value)}
                    onChange={(checked) => handleFilterChange(checked, type.value, 'roomType')}
                  />
                ))}
              </div>
            </div>

            {/* Horizontal Price Range Slider (100.000 VNĐ - 1.000.000 VNĐ) */}
            <div className="pb-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-800 text-sm">
                  Mức giá
                </p>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {minPrice === MIN_PRICE_LIMIT && maxPrice >= MAX_PRICE_LIMIT
                    ? `Tất cả (< 1.000.000 ${currency})`
                    : `${Number(minPrice).toLocaleString('vi-VN')} - ${Number(maxPrice).toLocaleString('vi-VN')} ${currency}`}
                </span>
              </div>

              {/* Drag slider bar */}
              <div className="my-3 px-1">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Kéo chọn giá tối đa:</span>
                  <span className="font-bold text-blue-600">
                    {maxPrice >= MAX_PRICE_LIMIT ? `< 1.000.000 ${currency}` : `≤ ${Number(maxPrice).toLocaleString('vi-VN')} ${currency}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_PRICE_LIMIT}
                  max={MAX_PRICE_LIMIT}
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxPrice(val);
                    if (minPrice > val) setMinPrice(MIN_PRICE_LIMIT);
                  }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all duration-150"
                  style={{
                    background: `linear-gradient(to right, #2563eb ${Math.min(100, Math.max(0, ((maxPrice - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100))}%, #e5e7eb ${Math.min(100, Math.max(0, ((maxPrice - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100))}%)`
                  }}
                />
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1.5 font-medium">
                  <span>100.000 {currency}</span>
                  <span className="text-gray-500 font-semibold">{Number(maxPrice).toLocaleString('vi-VN')} {currency}</span>
                  <span>1.000.000 {currency}</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  { label: "Tất cả", min: MIN_PRICE_LIMIT, max: MAX_PRICE_LIMIT },
                  { label: `≤ 300k`, min: MIN_PRICE_LIMIT, max: 300000 },
                  { label: `≤ 500k`, min: MIN_PRICE_LIMIT, max: 500000 },
                  { label: `< 1tr`, min: MIN_PRICE_LIMIT, max: MAX_PRICE_LIMIT },
                ].map((preset, idx) => {
                  const isSelected = minPrice === preset.min && maxPrice === preset.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
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
                    label={option.label}
                    selected={selectedSort === option.value}
                    onChange={() => handleSortChange(option.value)}
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
