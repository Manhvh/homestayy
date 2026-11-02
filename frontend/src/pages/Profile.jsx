import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
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
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        image: user.image || '',
      });
      setPreviewUrl(user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}`);
      setImageFile(null);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 text-sm">Bạn cần đăng nhập để xem và chỉnh sửa thông tin cá nhân.</p>
      </div>
    );
  }

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

      await updateUserProfile(payload);
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

  const roleInfo = getRoleLabel(user.role);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <Title
        align="left"
        font="outfit"
        title="Thông Tin Cá Nhân"
        subTitle="Cập nhật thông tin tài khoản, số điện thoại liên lạc và ảnh đại diện."
      />

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
              <label
                htmlFor="page-avatar-upload"
                className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-medium"
              >
                Đổi ảnh
              </label>
              <input
                id="page-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${roleInfo.bg}`}>
                  {roleInfo.text}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <label
                  htmlFor="page-avatar-upload"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Tải ảnh mới từ máy
                </label>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Tạo Avatar ngẫu nhiên
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Dùng để nhận cuộc gọi/SMS xác nhận từ chủ homestay.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Email tài khoản cố định không thể thay đổi.
              </p>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
