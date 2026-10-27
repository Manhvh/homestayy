import React, { useState } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';

const AddRoom = () => {
    const { axios, getToken, currency, amenities: dynamicAmenities } = useAppContext();

    const [images, setImages] = useState({
        1: null,
        2: null,
        3: null,
        4: null
    });

    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: 0,
    });

    const defaultAmenitiesList = dynamicAmenities && dynamicAmenities.length > 0
        ? dynamicAmenities.map(a => a.name)
        : ['Free WiFi', 'Free Breakfast', 'Room Service', 'Mountain View', 'Pool Access'];

    const [selectedAmenities, setSelectedAmenities] = useState({});

    // Seasonal Pricing List
    const [seasonalPricing, setSeasonalPricing] = useState([]);
    const [newSeason, setNewSeason] = useState({
        name: '',
        startDate: '',
        endDate: '',
        pricePerNight: '',
    });

    const [loading, setLoading] = useState(false);

    // Toggle amenity
    const toggleAmenity = (name) => {
        setSelectedAmenities(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Add a seasonal pricing block
    const handleAddSeason = () => {
        if (!newSeason.name || !newSeason.startDate || !newSeason.endDate || !newSeason.pricePerNight) {
            toast.error("Vui lòng điền đủ tên mùa, ngày bắt đầu, ngày kết thúc và giá!");
            return;
        }
        if (new Date(newSeason.startDate) >= new Date(newSeason.endDate)) {
            toast.error("Ngày bắt đầu phải trước ngày kết thúc!");
            return;
        }

        setSeasonalPricing(prev => [...prev, { ...newSeason, pricePerNight: Number(newSeason.pricePerNight) }]);
        setNewSeason({ name: '', startDate: '', endDate: '', pricePerNight: '' });
        toast.success("Đã thêm khoảng giá theo mùa!");
    };

    const handleRemoveSeason = (index) => {
        setSeasonalPricing(prev => prev.filter((_, idx) => idx !== index));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        const activeAmenities = Object.keys(selectedAmenities).filter(k => selectedAmenities[k]);

        if (!inputs.roomType || !inputs.pricePerNight || activeAmenities.length === 0 || !Object.values(images).some(Boolean)) {
            toast.error("Vui lòng nhập đầy đủ thông tin phòng, chọn tiện ích và tải lên ít nhất 1 ảnh!");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('roomType', inputs.roomType);
            formData.append('pricePerNight', inputs.pricePerNight);
            formData.append('amenities', JSON.stringify(activeAmenities));
            formData.append('seasonalPricing', JSON.stringify(seasonalPricing));

            // Adding Images to FormData
            Object.keys(images).forEach((key) => {
                if (images[key]) {
                    formData.append('images', images[key]);
                }
            });

            const token = await getToken();
            const { data } = await axios.post('/api/rooms/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message || "Tạo phòng và thiết lập giá thành công!");
                setInputs({ roomType: '', pricePerNight: 0 });
                setSelectedAmenities({});
                setSeasonalPricing([]);
                setImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="max-w-4xl pb-12">
            <Title 
                align='left' 
                font='outfit' 
                title='Thêm Phòng Mới & Thiết Lập Bảng Giá' 
                subTitle='Thiết lập đầy đủ thông tin chi tiết phòng, giá cơ bản và bảng giá linh hoạt theo mùa/dịp lễ để tối ưu hóa doanh thu homestay của bạn.' 
            />

            {/* Images Upload */}
            <p className='text-gray-800 font-semibold mt-8 mb-2 text-sm'>Hình ảnh phòng (Tối đa 4 ảnh)</p>
            <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
                {Object.keys(images).map((key) => (
                    <label htmlFor={`roomImage${key}`} key={key} className="relative group">
                        <img 
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} 
                            alt="upload"
                            className='w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-dashed border-gray-300 cursor-pointer group-hover:border-blue-500 transition-colors' 
                        />
                        <input 
                            type="file" 
                            accept='image/*' 
                            id={`roomImage${key}`} 
                            hidden 
                            onChange={e => setImages({ ...images, [key]: e.target.files[0] })} 
                        />
                    </label>
                ))}
            </div>

            {/* Room Basic Details */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
                <div>
                    <label className='text-gray-800 font-semibold text-sm block mb-1'>Loại phòng</label>
                    <select 
                        value={inputs.roomType}
                        onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
                        className='border border-gray-300 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                        required
                    >
                        <option value="">-- Chọn loại phòng --</option>
                        <option value="Single Bed">Single Bed (Phòng đơn)</option>
                        <option value="Double Bed">Double Bed (Phòng đôi)</option>
                        <option value="Luxury Room">Luxury Room (Phòng cao cấp)</option>
                        <option value="Family Suite">Family Suite (Căn hộ gia đình)</option>
                    </select>
                </div>
                <div>
                    <label className='text-gray-800 font-semibold text-sm block mb-1'>
                        Giá tiêu chuẩn ({currency}/đêm)
                    </label>
                    <input 
                        type="number" 
                        placeholder='0' 
                        min="1"
                        className='border border-gray-300 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm' 
                        value={inputs.pricePerNight}
                        onChange={e => setInputs({ ...inputs, pricePerNight: e.target.value })} 
                        required
                    />
                </div>
            </div>

            {/* Amenities Checklist */}
            <div className="mt-8">
                <p className='text-gray-800 font-semibold text-sm mb-3'>Tiện nghi phòng cung cấp</p>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {defaultAmenitiesList.map((amenity, index) => (
                        <label 
                            key={index} 
                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm cursor-pointer transition-colors ${
                                selectedAmenities[amenity] 
                                    ? "bg-blue-50 border-blue-400 text-blue-900 font-medium" 
                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <input 
                                type="checkbox" 
                                checked={!!selectedAmenities[amenity]}
                                onChange={() => toggleAmenity(amenity)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Seasonal Pricing Feature */}
            <div className="mt-10 p-6 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📅</span>
                    <h3 className="font-bold text-gray-900 text-base">Cập nhật bảng giá theo ngày / theo mùa (Tùy chọn)</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                    Thiết lập mức giá riêng cho các đợt cao điểm, mùa du lịch, ngày lễ Tết hoặc ngày cuối tuần. Khách đặt trong khoảng này sẽ tự động được áp dụng giá mùa.
                </p>

                {/* Form to add seasonal price */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Tên mùa (VD: Mùa Hè)"
                        value={newSeason.name}
                        onChange={e => setNewSeason(prev => ({ ...prev, name: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                    />
                    <input
                        type="date"
                        value={newSeason.startDate}
                        onChange={e => setNewSeason(prev => ({ ...prev, startDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                    />
                    <input
                        type="date"
                        value={newSeason.endDate}
                        min={newSeason.startDate}
                        onChange={e => setNewSeason(prev => ({ ...prev, endDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={`Giá (${currency})`}
                            value={newSeason.pricePerNight}
                            onChange={e => setNewSeason(prev => ({ ...prev, pricePerNight: e.target.value }))}
                            className="border border-gray-300 rounded-lg p-2 text-xs bg-white w-full"
                        />
                        <button
                            type="button"
                            onClick={handleAddSeason}
                            className="px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                        >
                            + Thêm
                        </button>
                    </div>
                </div>

                {/* Added Seasons List */}
                {seasonalPricing.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs font-semibold text-gray-700">Các khoảng giá theo mùa đã thiết lập:</p>
                        {seasonalPricing.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-200 text-xs">
                                <div>
                                    <strong className="text-gray-900">{item.name}</strong>: {item.startDate} đến {item.endDate}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-amber-700">{currency}{item.pricePerNight} / đêm</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveSeason(idx)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl mt-8 cursor-pointer shadow-md transition disabled:opacity-50 text-sm'
                disabled={loading}
            >
                {loading ? 'Đang tạo phòng...' : '✓ Lưu & Đăng Phòng'}
            </button>
        </form>
    );
};

export default AddRoom;
