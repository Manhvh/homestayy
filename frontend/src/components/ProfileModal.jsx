import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, toast } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        image: user.image || '',
      });
      setPreviewUrl(user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}`);
      setImageFile(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 5MB.');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setImageFile(null);
    setPreviewUrl(newAvatar);
    setFormData((prev) => ({ ...prev, image: newAvatar }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error('Họ và tên không được để trống.');
      return;
    }

    setLoading(true);
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('username', formData.username.trim());
        payload.append('phone', formData.phone.trim());
        payload.append('image', imageFile);
      } else {
        payload = {
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          image: formData.image || previewUrl,
        };
      }

      const res = await updateUserProfile(payload);
      if (res.success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'Quản trị viên (Admin)', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'hotelOwner':
        return { text: 'Chủ Homestay (Partner)', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { text: 'Khách hàng', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const roleInfo = getRoleLabel(user?.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h2>
            <p className="text-xs text-gray-500">Cập nhật hồ sơ tài khoản và số điện thoại liên hệ</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-gray-100">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-medium"
              >
                Đổi ảnh
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleInfo.bg}`}>
                  {roleInfo.text}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <label
                  htmlFor="avatar-upload"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  Tải ảnh mới
                </label>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  Avatar ngẫu nhiên
                </button>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Số điện thoại giúp chủ homestay hoặc quản trị viên dễ dàng liên hệ xác nhận đặt phòng.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Địa chỉ Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Email dùng để đăng nhập và nhận thông báo từ hệ thống.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
