import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    priceOff: 20,
    maxDiscount: 500000,
    minNights: 1,
    expiryDate: '',
    badge: 'HOT DEAL',
    category: 'summer',
    termsText: '',
    image: '',
    isActive: true,
  });

  const { axios, getToken, user, currency } = useAppContext();

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'summer', label: 'Mùa hè' },
    { id: 'couple', label: 'Cặp đôi' },
    { id: 'early', label: 'Đặt sớm' },
    { id: 'weekend', label: 'Cuối tuần' },
    { id: 'longstay', label: 'Dài ngày' },
  ];

  // Fetch owner's offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/offers/owner', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOffers(data.offers || []);
      } else {
        toast.error(data.message || 'Không thể tải danh sách ưu đãi');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingOffer(null);
    setImageFile(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      priceOff: 20,
      maxDiscount: 500000,
      minNights: 1,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      badge: 'HOT DEAL',
      category: 'summer',
      termsText: 'Giảm trực tiếp trên tổng giá phòng.\nÁp dụng cho mọi phòng nghỉ tại homestay.\nKhông áp dụng đồng thời cùng voucher khác.',
      image: '',
      isActive: true,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setImageFile(null);
    let termsStr = '';
    if (Array.isArray(offer.terms)) {
      termsStr = offer.terms.join('\n');
    } else if (typeof offer.terms === 'string') {
      try {
        const parsed = JSON.parse(offer.terms);
        termsStr = Array.isArray(parsed) ? parsed.join('\n') : offer.terms;
      } catch {
        termsStr = offer.terms;
      }
    }

    setFormData({
      code: offer.code || '',
      title: offer.title || '',
      description: offer.description || '',
      priceOff: offer.priceOff || 20,
      maxDiscount: offer.maxDiscount || 500000,
      minNights: offer.minNights || 1,
      expiryDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : '',
      badge: offer.badge || 'HOT DEAL',
      category: offer.category || 'summer',
      termsText: termsStr,
      image: offer.image || '',
      isActive: offer.isActive !== false,
    });
    setShowModal(true);
  };

  // Toggle offer active state
  const handleToggleStatus = async (offerId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        '/api/offers/toggle-status',
        { id: offerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setOffers((prev) =>
          prev.map((item) =>
            (item.id || item._id) === offerId ? { ...item, isActive: data.isActive } : item
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Delete offer
  const handleDeleteOffer = async (offerId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ưu đãi "${title || 'này'}" không?`)) {
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(data.message || 'Đã xóa ưu đãi thành công!');
        setOffers((prev) => prev.filter((item) => (item.id || item._id) !== offerId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Submit create or edit form
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá!');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên chương trình ưu đãi!');
      return;
    }
    if (!formData.expiryDate) {
      toast.error('Vui lòng chọn ngày hết hạn!');
      return;
    }

    setModalLoading(true);
    try {
      const token = await getToken();
      const payload = new FormData();
      payload.append('code', formData.code.trim().toUpperCase());
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('priceOff', formData.priceOff);
      payload.append('maxDiscount', formData.maxDiscount);
      payload.append('minNights', formData.minNights);
      payload.append('expiryDate', formData.expiryDate);
      payload.append('badge', formData.badge);
      payload.append('category', formData.category);
      payload.append('isActive', formData.isActive);

      const termsArray = formData.termsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      payload.append('terms', JSON.stringify(termsArray));

      if (imageFile) {
        payload.append('image', imageFile);
      } else if (formData.image) {
        payload.append('image', formData.image);
      }

      let resData;
      if (editingOffer) {
        const id = editingOffer.id || editingOffer._id;
        const res = await axios.put(`/api/offers/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        resData = res.data;
      } else {
        const res = await axios.post('/api/offers', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        resData = res.data;
      }

      if (resData.success) {
        toast.success(resData.message || 'Lưu ưu đãi thành công!');
        setShowModal(false);
        fetchOffers();
      } else {
        toast.error(resData.message || 'Thao tác không thành công');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Metrics
  const totalOffers = offers.length;
  const activeOffers = useMemo(() => offers.filter((o) => o.isActive).length, [offers]);
  const inactiveOffers = totalOffers - activeOffers;
  const maxDiscountRate = useMemo(() => {
    if (offers.length === 0) return 0;
    return Math.max(...offers.map((o) => Number(o.priceOff) || 0));
  }, [offers]);

  // Filtered list
  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const codeMatch = (item.code || '').toLowerCase().includes(q);
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        return codeMatch || titleMatch;
      }
      return true;
    });
  }, [offers, filterCategory, searchTerm]);

  return (
    <div className="w-full space-y-6 pb-12 text-left">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-outfit">
            Quản Lý Ưu Đãi & Khuyến Mãi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập các mã voucher, chương trình giảm giá và gói ưu đãi độc quyền cho homestay của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOffers}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>+</span>
            <span>Tạo ưu đãi mới</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Tổng số ưu đãi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalOffers}</p>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">Đang áp dụng</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeOffers}</p>
        </div>
        <div className="bg-white border border-gray-200 bg-gray-50/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Tạm dừng</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{inactiveOffers}</p>
        </div>
        <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase font-semibold text-blue-700 tracking-wider">Giảm cao nhất</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {maxDiscountRate > 0 ? `${maxDiscountRate}%` : '--'}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã voucher hoặc tên chương trình..."
            className="w-full text-xs px-3.5 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-gray-400 hover:text-gray-600 px-1 cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table */}
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap min-w-[280px]">
                  Chương trình ưu đãi
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[140px]">
                  Mã Voucher
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-right min-w-[150px]">
                  Mức giảm
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[140px]">
                  Điều kiện
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[130px]">
                  Hạn sử dụng
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[150px]">
                  Trạng thái
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap text-center min-w-[140px]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-600 border-t-transparent mb-2"></div>
                    <p className="text-xs text-gray-500">Đang tải danh sách ưu đãi...</p>
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <p className="font-medium text-gray-700 text-base">
                      {searchTerm || filterCategory !== 'all'
                        ? 'Không tìm thấy ưu đãi phù hợp'
                        : 'Chưa có chương trình ưu đãi nào'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tạo các chương trình khuyến mãi để thu hút thêm du khách đặt phòng.
                    </p>
                    <button
                      onClick={handleOpenCreate}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      + Tạo ưu đãi mới ngay
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((item) => {
                  const offerId = item.id || item._id;
                  return (
                    <tr key={offerId} className="hover:bg-gray-50/80 transition-colors">
                      {/* Chương trình ưu đãi */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=200'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {item.title}
                              </p>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Mã Voucher */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {item.code}
                        </span>
                      </td>

                      {/* Mức giảm */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                          Giảm {item.priceOff}%
                        </p>
                        {item.maxDiscount > 0 && (
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            Tối đa: {Number(item.maxDiscount).toLocaleString('vi-VN')} {currency}
                          </span>
                        )}
                      </td>

                      {/* Điều kiện */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                          Từ {item.minNights || 1} đêm
                        </span>
                      </td>

                      {/* Hạn sử dụng */}
                      <td className="py-3.5 px-4 text-center text-xs text-gray-600 whitespace-nowrap font-medium">
                        {item.expiryDate ? item.expiryDate.split('T')[0] : '--'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              onChange={() => handleToggleStatus(offerId)}
                              type="checkbox"
                              className="sr-only peer"
                              checked={Boolean(item.isActive)}
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                              item.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                item.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            ></span>
                            {item.isActive ? 'Đang mở' : 'Tạm dừng'}
                          </span>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offerId, item.title)}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Xóa
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
      {/* MODAL: TẠO / CHỈNH SỬA CHƯƠNG TRÌNH ƯU ĐÃI                      */}
      {/* ============================================================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !modalLoading) setShowModal(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-outfit">
                  {editingOffer ? 'Chỉnh Sửa Chương Trình Ưu Đãi' : 'Tạo Chương Trình Ưu Đãi Mới'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thiết lập mã voucher, mức giảm giá và điều kiện áp dụng cho khách đặt phòng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !modalLoading && setShowModal(false)}
                disabled={modalLoading}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              id="offer-form"
              onSubmit={handleSubmitForm}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-left"
            >
              {/* Tên ưu đãi & Mã Voucher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tên chương trình ưu đãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="VD: Gói Nghỉ Dưỡng Mùa Hè..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã Voucher giảm giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: SUMMER25, ROMANCE20..."
                    className="w-full px-3.5 py-2.5 text-sm uppercase font-mono tracking-wider border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Mức giảm (%) & Giảm tối đa (VNĐ) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mức giảm (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={formData.priceOff}
                      onChange={(e) => setFormData((prev) => ({ ...prev, priceOff: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Giảm tối đa ({currency})
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Số đêm tối thiểu
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.minNights}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minNights: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">đêm</span>
                  </div>
                </div>
              </div>

              {/* Hạn sử dụng, Danh mục & Huy hiệu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hạn sử dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Danh mục ưu đãi
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="summer">Mùa hè sôi động</option>
                    <option value="couple">Cặp đôi & Trăng mật</option>
                    <option value="early">Đặt phòng sớm</option>
                    <option value="weekend">Cuối tuần thảnh thơi</option>
                    <option value="longstay">Lưu trú dài ngày</option>
                    <option value="all">Khách hàng mới / Phổ thông</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Huy hiệu nổi bật
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="VD: HOT DEAL, LÃNG MẠN..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mô tả ngắn về ưu đãi
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="VD: Tặng 1 đêm nghỉ dưỡng kèm bữa sáng tự chọn đặc sản địa phương..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Điều kiện & Quyền lợi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Điều kiện & Quyền lợi áp dụng (Mỗi dòng là một điều kiện)
                </label>
                <textarea
                  rows="3"
                  value={formData.termsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, termsText: e.target.value }))}
                  placeholder="Giảm 25% tổng tiền phòng&#10;Miễn phí bữa sáng tự chọn&#10;Áp dụng cho đơn từ 2 đêm..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Hình ảnh banner */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hình ảnh banner ưu đãi
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl"
                  />
                  {formData.image && !imageFile && (
                    <img
                      src={formData.image}
                      alt="Current banner"
                      className="w-14 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Trạng thái bật/tắt */}
              <div className="pt-2 flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-gray-800">Trạng thái kích hoạt ưu đãi</p>
                  <p className="text-[11px] text-gray-500">Cho phép du khách xem và áp dụng mã giảm giá này.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="offer-form"
                disabled={modalLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {modalLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{modalLoading ? 'Đang lưu...' : editingOffer ? 'Cập nhật ưu đãi' : 'Tạo ưu đãi ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOffers;
