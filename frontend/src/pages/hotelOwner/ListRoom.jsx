import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [deletingId, setDeletingId] = useState(null);

  // Add Room Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addImages, setAddImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [addInputs, setAddInputs] = useState({
    roomType: '',
    pricePerNight: '',
    maxGuests: 2,
  });
  const [addSelectedAmenities, setAddSelectedAmenities] = useState([
    'Free WiFi',
    'Điều hòa 2 chiều',
  ]);
  const [addCustomAmenity, setAddCustomAmenity] = useState('');
  const [addSeasonalPricing, setAddSeasonalPricing] = useState([]);
  const [showSeasonSection, setShowSeasonSection] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    startDate: '',
    endDate: '',
    pricePerNight: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit Room Modal state
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    roomType: '',
    pricePerNight: 0,
    maxGuests: 2,
    isAvailable: true,
    amenities: [],
  });
  const [customAmenity, setCustomAmenity] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const { axios, getToken, user, currency, amenities: dynamicAmenities } = useAppContext();

  // Safely parse amenities list from array or JSON/string
  const parseAmenities = (rawAmenities) => {
    if (!rawAmenities) return [];
    if (Array.isArray(rawAmenities)) return rawAmenities;
    if (typeof rawAmenities === 'string') {
      try {
        const parsed = JSON.parse(rawAmenities);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return rawAmenities.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Base list of amenities
  const defaultAmenitiesList = useMemo(() => {
    const dynamicNames = (dynamicAmenities || [])
      .map((a) => (typeof a === 'string' ? a : a.name))
      .filter(Boolean);
    const defaults = [
      'Free WiFi',
      'Free Breakfast',
      'Room Service',
      'Mountain View',
      'Pool Access',
      'Bếp BBQ ngoài trời',
      'Bồn tắm massage',
      'Smart TV 4K',
      'Điều hòa 2 chiều',
      'Chỗ đậu xe ô tô',
      'Ban công',
      'Tủ lạnh',
      'Máy sấy tóc',
    ];
    return Array.from(new Set([...dynamicNames, ...defaults]));
  }, [dynamicAmenities]);

  // Fetch Rooms for the Hotel Owner
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        toast.error(data.message || 'Không thể tải danh sách phòng');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Availability of Room
  const toggleAvailability = async (roomId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message || 'Đã cập nhật trạng thái phòng');
        setRooms((prev) =>
          prev.map((r) => {
            const currentId = r.id || r._id;
            if (currentId === roomId) {
              return { ...r, isAvailable: !r.isAvailable };
            }
            return r;
          })
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomName || 'này'}" không?\nThao tác này sẽ xóa vĩnh viễn dữ liệu phòng khỏi hệ thống.`)) {
      return;
    }
    try {
      setDeletingId(roomId);
      const token = await getToken();
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message || 'Đã xóa phòng thành công!');
        setRooms((prev) => prev.filter((r) => (r.id || r._id) !== roomId));
      } else {
        toast.error(data.message || 'Không thể xóa phòng');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Open Add Room Modal
  const handleOpenAdd = () => {
    setAddInputs({
      roomType: '',
      pricePerNight: '',
      maxGuests: 2,
    });
    setAddImages({ 1: null, 2: null, 3: null, 4: null });
    setAddSelectedAmenities(['Free WiFi', 'Điều hòa 2 chiều']);
    setAddCustomAmenity('');
    setAddSeasonalPricing([]);
    setNewSeason({ name: '', startDate: '', endDate: '', pricePerNight: '' });
    setShowSeasonSection(false);
    setShowAddModal(true);
  };

  // Toggle amenity in Add Modal
  const handleToggleAddAmenity = (name) => {
    setAddSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // Add custom amenity in Add Modal
  const handleAddCustomAmenityToAddModal = () => {
    const trimmed = addCustomAmenity.trim();
    if (!trimmed) return;
    if (!addSelectedAmenities.includes(trimmed)) {
      setAddSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setAddCustomAmenity('');
  };

  // Add seasonal pricing block in Add Modal
  const handleAddSeason = () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate || !newSeason.pricePerNight) {
      toast.error('Vui lòng điền đủ tên mùa/đợt, ngày bắt đầu, ngày kết thúc và giá!');
      return;
    }
    if (new Date(newSeason.startDate) >= new Date(newSeason.endDate)) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc!');
      return;
    }
    setAddSeasonalPricing((prev) => [
      ...prev,
      { ...newSeason, pricePerNight: Number(newSeason.pricePerNight) },
    ]);
    setNewSeason({ name: '', startDate: '', endDate: '', pricePerNight: '' });
    toast.success('Đã thêm khoảng giá theo mùa!');
  };

  const handleRemoveSeason = (idx) => {
    setAddSeasonalPricing((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Add Room Form
  const handleSubmitAddRoom = async (e) => {
    e.preventDefault();

    if (!addInputs.roomType.trim()) {
      toast.error('Vui lòng nhập tên loại phòng');
      return;
    }
    if (Number(addInputs.pricePerNight) <= 0) {
      toast.error('Giá phòng mỗi đêm phải lớn hơn 0');
      return;
    }
    if (Number(addInputs.maxGuests) < 1) {
      toast.error('Sức chứa tối đa phải từ 1 người trở lên');
      return;
    }
    if (addSelectedAmenities.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 tiện nghi phòng');
      return;
    }
    if (!Object.values(addImages).some(Boolean)) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh phòng!');
      return;
    }

    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append('roomType', addInputs.roomType.trim());
      formData.append('pricePerNight', addInputs.pricePerNight);
      formData.append('maxGuests', addInputs.maxGuests || 2);
      formData.append('amenities', JSON.stringify(addSelectedAmenities));
      formData.append('seasonalPricing', JSON.stringify(addSeasonalPricing));

      Object.keys(addImages).forEach((key) => {
        if (addImages[key]) {
          formData.append('images', addImages[key]);
        }
      });

      const token = await getToken();
      const { data } = await axios.post('/api/rooms/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || 'Thêm phòng mới và thiết lập giá thành công!');
        setShowAddModal(false);
        fetchRooms();
      } else {
        toast.error(data.message || 'Không thể tạo phòng mới');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Open Edit Room Modal
  const handleOpenEdit = (room) => {
    const parsed = parseAmenities(room.amenities);
    setEditingRoom(room);
    setEditForm({
      roomType: room.roomType || '',
      pricePerNight: room.pricePerNight || 0,
      maxGuests: room.maxGuests || 2,
      isAvailable: Boolean(room.isAvailable),
      amenities: parsed,
    });
    setCustomAmenity('');
    setNewImages([]);
  };

  // Toggle amenity selection in Edit Modal
  const handleToggleAmenity = (name) => {
    setEditForm((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((item) => item !== name)
          : [...prev.amenities, name],
      };
    });
  };

  // Add custom amenity in Edit Modal
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!editForm.amenities.includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
    }
    setCustomAmenity('');
  };

  // Handle image files selection in Edit Modal
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      toast.error('Chỉ được chọn tối đa 4 hình ảnh!');
      return;
    }
    setNewImages(files);
  };

  // Save edited room
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.roomType.trim()) {
      toast.error('Vui lòng nhập tên loại phòng');
      return;
    }
    if (Number(editForm.pricePerNight) <= 0) {
      toast.error('Giá phòng mỗi đêm phải lớn hơn 0');
      return;
    }
    if (Number(editForm.maxGuests) < 1) {
      toast.error('Sức chứa tối đa phải từ 1 người trở lên');
      return;
    }
    if (editForm.amenities.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 tiện nghi');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const roomId = editingRoom.id || editingRoom._id;

      const formData = new FormData();
      formData.append('roomType', editForm.roomType.trim());
      formData.append('pricePerNight', editForm.pricePerNight);
      formData.append('maxGuests', editForm.maxGuests);
      formData.append('isAvailable', editForm.isAvailable);
      formData.append('amenities', JSON.stringify(editForm.amenities));

      if (newImages.length > 0) {
        newImages.forEach((file) => {
          formData.append('images', file);
        });
      }

      const { data } = await axios.put(`/api/rooms/${roomId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || 'Cập nhật thông tin phòng thành công!');
        fetchRooms();
        setEditingRoom(null);
      } else {
        toast.error(data.message || 'Không thể cập nhật phòng');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  // Merge available amenities for edit modal
  const allAvailableAmenitiesForEdit = useMemo(() => {
    const current = editForm.amenities || [];
    return Array.from(new Set([...defaultAmenitiesList, ...current]));
  }, [defaultAmenitiesList, editForm.amenities]);

  // Merge available amenities for add modal
  const allAvailableAmenitiesForAdd = useMemo(() => {
    return Array.from(new Set([...defaultAmenitiesList, ...addSelectedAmenities]));
  }, [defaultAmenitiesList, addSelectedAmenities]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // Derived statistics
  const totalRooms = rooms.length;
  const activeCount = useMemo(() => rooms.filter((r) => r.isAvailable).length, [rooms]);
  const inactiveCount = totalRooms - activeCount;
  const avgPrice = useMemo(() => {
    if (totalRooms === 0) return 0;
    const sum = rooms.reduce((acc, r) => acc + Number(r.pricePerNight || 0), 0);
    return Math.round(sum / totalRooms);
  }, [rooms, totalRooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Status filter
      if (filterStatus === 'active' && !room.isAvailable) return false;
      if (filterStatus === 'inactive' && room.isAvailable) return false;

      // Search keyword filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const typeMatch = (room.roomType || '').toLowerCase().includes(query);
        const amenities = parseAmenities(room.amenities).join(' ').toLowerCase();
        const amenityMatch = amenities.includes(query);
        return typeMatch || amenityMatch;
      }

      return true;
    });
  }, [rooms, filterStatus, searchTerm]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-outfit">
            Danh Sách Phòng Của Bạn
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh mục các phòng homestay đã đăng tải, bật/tắt trạng thái nhận khách và cập nhật thông tin phòng.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRooms}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>+</span>
            <span>Thêm phòng mới</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Tổng số phòng</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalRooms}</p>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">Đang nhận khách</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-200 bg-gray-50/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Tạm khóa nhận</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{inactiveCount}</p>
        </div>
        <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-blue-700 tracking-wider">Giá trung bình</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {avgPrice > 0 ? `${avgPrice.toLocaleString('vi-VN')} ${currency}` : '--'}
          </p>
        </div>
      </div>

      {/* Toolbar: Search & Quick Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên phòng hoặc tiện nghi..."
            className="w-full text-xs px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap px-1"
            >
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả ({totalRooms})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đang nhận khách ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'inactive'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tạm khóa ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Main Table Container (Full width, responsive) */}
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[280px]">
                  Phòng nghỉ
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[120px]">
                  Sức chứa
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[260px]">
                  Tiện nghi phòng
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-right min-w-[150px]">
                  Giá mỗi đêm
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[180px]">
                  Trạng thái nhận khách
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[160px]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-600 border-t-transparent mb-2"></div>
                    <p className="text-xs text-gray-500">Đang tải danh sách phòng...</p>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <p className="font-medium text-gray-700 text-base">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Không tìm thấy phòng phù hợp với bộ lọc'
                        : 'Chưa có phòng nào được tạo'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Hãy thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.'
                        : 'Bắt đầu đăng tải phòng homestay để đón những vị khách đầu tiên.'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {searchTerm || filterStatus !== 'all' ? (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                          className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Đặt lại bộ lọc
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenAdd}
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          + Thêm phòng mới ngay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((item, index) => {
                  const roomId = item.id || item._id;
                  const amenitiesList = parseAmenities(item.amenities);
                  const isDeleting = deletingId === roomId;

                  return (
                    <tr
                      key={roomId || index}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Phòng nghỉ (Thumbnail + Title + Subtitle) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img
                              src={item.images?.[0] || assets.roomImg1}
                              alt={item.roomType}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = assets.roomImg1;
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                              {item.roomType}
                            </p>
                            {item.hotel?.name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {item.hotel.name}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              Mã: #{String(roomId).slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sức chứa */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                          Tối đa {item.maxGuests || 2} khách
                        </span>
                      </td>

                      {/* Tiện nghi phòng */}
                      <td className="py-3.5 px-4">
                        {amenitiesList.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {amenitiesList.slice(0, 3).map((amenity, i) => (
                              <span
                                key={i}
                                className="inline-block text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap"
                              >
                                {amenity}
                              </span>
                            ))}
                            {amenitiesList.length > 3 && (
                              <span
                                className="inline-block text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium whitespace-nowrap"
                                title={amenitiesList.slice(3).join(', ')}
                              >
                                +{amenitiesList.length - 3} tiện nghi
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Giá mỗi đêm */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {Number(item.pricePerNight).toLocaleString('vi-VN')} {currency}
                        </p>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">/ đêm</span>
                      </td>

                      {/* Trạng thái nhận khách */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              onChange={() => toggleAvailability(roomId)}
                              type="checkbox"
                              className="sr-only peer"
                              checked={Boolean(item.isAvailable)}
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                item.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            ></span>
                            {item.isAvailable ? 'Đang nhận khách' : 'Tạm khóa'}
                          </span>
                        </div>
                      </td>

                      {/* Hành động (Xem / Sửa / Xóa) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/rooms/${roomId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                            title="Xem chi tiết trên website"
                          >
                            Xem
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                            title="Chỉnh sửa thông tin phòng này"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(roomId, item.roomType)}
                            disabled={isDeleting}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                            title="Xóa phòng này"
                          >
                            {isDeleting ? '...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* POPUP: THÊM PHÒNG & GIÁ MỚI (ADD ROOM MODAL)                   */}
      {/* ============================================================== */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !addLoading) setShowAddModal(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-outfit">
                  Thêm Phòng Mới & Thiết Lập Giá
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Điền đầy đủ thông tin phòng, mức giá tiêu chuẩn và tiện nghi để đăng tải ngay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !addLoading && setShowAddModal(false)}
                disabled={addLoading}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              id="add-room-form"
              onSubmit={handleSubmitAddRoom}
              className="p-6 space-y-5 overflow-y-auto flex-1 text-left"
            >
              {/* Hình ảnh phòng */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hình ảnh phòng (Tối đa 4 ảnh, ít nhất 1 ảnh) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-1">
                  {[1, 2, 3, 4].map((key) => (
                    <div key={key} className="relative group">
                      <label htmlFor={`newRoomImageSlot${key}`} className="cursor-pointer block">
                        <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 bg-gray-50 flex flex-col items-center justify-center p-2 text-center transition-colors">
                          {addImages[key] ? (
                            <img
                              src={URL.createObjectURL(addImages[key])}
                              alt={`Ảnh ${key}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <svg
                                className="w-6 h-6 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-[11px] font-medium text-gray-500">Ảnh {key}</span>
                              {key === 1 && (
                                <span className="text-[9px] text-red-500 font-semibold">*Bắt buộc</span>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`newRoomImageSlot${key}`}
                          hidden
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAddImages((prev) => ({ ...prev, [key]: e.target.files[0] }));
                            }
                          }}
                        />
                      </label>
                      {addImages[key] && (
                        <button
                          type="button"
                          onClick={() => setAddImages((prev) => ({ ...prev, [key]: null }))}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 shadow"
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Loại phòng & Sức chứa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Loại phòng / Tên phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="new-room-types-list"
                    value={addInputs.roomType}
                    onChange={(e) => {
                      const val = e.target.value;
                      let defaultMax = addInputs.maxGuests;
                      if (val === 'Phòng đơn') defaultMax = 1;
                      else if (val === 'Phòng đôi') defaultMax = 2;
                      else if (val === 'Căn hộ gia đình') defaultMax = 4;
                      else if (val === 'Phòng cao cấp') defaultMax = 3;
                      setAddInputs((prev) => ({
                        ...prev,
                        roomType: val,
                        maxGuests: defaultMax,
                      }));
                    }}
                    placeholder="VD: Deluxe King Room, Phòng Đôi Ban Công..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <datalist id="new-room-types-list">
                    <option value="Phòng đơn" />
                    <option value="Phòng đôi" />
                    <option value="Phòng cao cấp" />
                    <option value="Căn hộ gia đình" />
                    <option value="Deluxe King Room" />
                    <option value="Phòng Suite Hướng Núi" />
                    <option value="Villa Biệt Thự Hồ Bơi" />
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sức chứa tối đa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={addInputs.maxGuests}
                      onChange={(e) =>
                        setAddInputs((prev) => ({
                          ...prev,
                          maxGuests: Math.max(1, parseInt(e.target.value, 10) || 1),
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">
                      khách
                    </span>
                  </div>
                </div>
              </div>

              {/* Giá tiêu chuẩn */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Giá tiêu chuẩn mỗi đêm ({currency}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  required
                  value={addInputs.pricePerNight}
                  onChange={(e) =>
                    setAddInputs((prev) => ({ ...prev, pricePerNight: e.target.value }))
                  }
                  placeholder="VD: 500000"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                />
                {Number(addInputs.pricePerNight) > 0 && (
                  <p className="text-xs text-blue-600 font-medium">
                    {Number(addInputs.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                  </p>
                )}
              </div>

              {/* Tiện nghi phòng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tiện nghi phòng ({addSelectedAmenities.length} đã chọn) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Nhấp để bật / tắt tiện nghi</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
                  {allAvailableAmenitiesForAdd.map((amenity) => {
                    const isSelected = addSelectedAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAddAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected ? `✓ ${amenity}` : `+ ${amenity}`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={addCustomAmenity}
                    onChange={(e) => setAddCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenityToAddModal();
                      }
                    }}
                    placeholder="Nhập thêm tiện nghi khác nếu có..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenityToAddModal}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    + Thêm tiện nghi
                  </button>
                </div>
              </div>

              {/* Bảng giá theo mùa (Tùy chọn) */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSeasonSection(!showSeasonSection)}
                  className="flex items-center justify-between w-full text-left py-2 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="uppercase tracking-wider">
                    Thiết lập giá theo mùa / dịp lễ ({addSeasonalPricing.length} đợt đã thêm)
                  </span>
                  <span className="text-gray-400 font-normal">
                    {showSeasonSection ? '▲ Ẩn bớt' : '▼ Mở rộng'}
                  </span>
                </button>

                {showSeasonSection && (
                  <div className="mt-2 p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                    <p className="text-xs text-gray-600">
                      Thiết lập giá riêng cho các đợt cao điểm, ngày lễ Tết hoặc cuối tuần. Khách đặt trong khoảng này sẽ tự động áp dụng giá mùa.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Tên đợt (VD: Mùa Hè)"
                        value={newSeason.name}
                        onChange={(e) => setNewSeason((prev) => ({ ...prev, name: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                      />
                      <input
                        type="date"
                        value={newSeason.startDate}
                        onChange={(e) => setNewSeason((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                      />
                      <input
                        type="date"
                        value={newSeason.endDate}
                        min={newSeason.startDate}
                        onChange={(e) => setNewSeason((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg p-2 text-xs bg-white"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder={`Giá (${currency})`}
                          value={newSeason.pricePerNight}
                          onChange={(e) => setNewSeason((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                          className="border border-gray-300 rounded-lg p-2 text-xs bg-white w-full"
                        />
                        <button
                          type="button"
                          onClick={handleAddSeason}
                          className="px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs whitespace-nowrap"
                        >
                          + Thêm
                        </button>
                      </div>
                    </div>

                    {addSeasonalPricing.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-amber-200">
                        {addSeasonalPricing.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs"
                          >
                            <div>
                              <strong className="text-gray-900">{item.name}</strong>: {item.startDate} đến {item.endDate}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-amber-700">
                                {Number(item.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                              </span>
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
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={addLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="add-room-form"
                disabled={addLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {addLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{addLoading ? 'Đang tạo phòng...' : 'Lưu & Đăng Phòng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP: CHỈNH SỬA THÔNG TIN PHÒNG (EDIT ROOM MODAL)            */}
      {/* ============================================================== */}
      {editingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setEditingRoom(null);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-outfit">
                  Chỉnh Sửa Thông Tin Phòng
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mã phòng: #{String(editingRoom.id || editingRoom._id).slice(-6).toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setEditingRoom(null)}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              id="edit-room-form"
              onSubmit={handleSaveEdit}
              className="p-6 space-y-5 overflow-y-auto flex-1 text-left"
            >
              {/* Tên loại phòng & Sức chứa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Loại phòng / Tên phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.roomType}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, roomType: e.target.value }))
                    }
                    placeholder="VD: Deluxe King Room, Phòng Gia Đình..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sức chứa tối đa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={editForm.maxGuests}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          maxGuests: Math.max(1, parseInt(e.target.value, 10) || 1),
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">
                      khách
                    </span>
                  </div>
                </div>
              </div>

              {/* Giá mỗi đêm & Trạng thái nhận khách */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Giá mỗi đêm ({currency}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={editForm.pricePerNight}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, pricePerNight: e.target.value }))
                    }
                    placeholder="VD: 500000"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                  {Number(editForm.pricePerNight) > 0 && (
                    <p className="text-xs text-blue-600 font-medium">
                      {Number(editForm.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái đón khách
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isAvailable}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                        editForm.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {editForm.isAvailable ? 'Đang mở nhận khách' : 'Tạm khóa nhận'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tiện nghi phòng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tiện nghi phòng ({editForm.amenities.length} đã chọn)
                  </label>
                  <span className="text-[11px] text-gray-400">Nhấp để bật / tắt tiện nghi</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
                  {allAvailableAmenitiesForEdit.map((amenity) => {
                    const isSelected = editForm.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected ? `✓ ${amenity}` : `+ ${amenity}`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                    placeholder="Nhập thêm tiện nghi khác nếu có..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    + Thêm tiện nghi
                  </button>
                </div>
              </div>

              {/* Ảnh phòng hiện tại & Tải ảnh mới */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hình ảnh phòng
                </label>

                {editingRoom.images && editingRoom.images.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1.5">Ảnh hiện tại:</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {editingRoom.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100"
                        >
                          <img
                            src={imgUrl}
                            alt={`Ảnh phòng ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = assets.roomImg1;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <p className="text-[11px] text-gray-500 mb-1.5">
                    Tải ảnh mới thay thế (tối đa 4 ảnh, tùy chọn):
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl"
                  />
                  {newImages.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                      Đã chọn {newImages.length} ảnh mới để tải lên.
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-room-form"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRoom;
