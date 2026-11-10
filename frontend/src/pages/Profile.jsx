import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';
import { checkPasswordRules } from '../utils/passwordValidator';
import { getAvatarUrl, createRandomAvatarUrl, getRoleBadgeInfo } from '../utils/formatters';

const Profile = () => {
  const { user, updateUserProfile, changePassword, toast } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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
      setPreviewUrl(getAvatarUrl(user));
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
    const newAvatar = createRandomAvatarUrl();
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

  const passRules = checkPasswordRules(passData.newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!passRules.isValid) {
      toast.error(passRules.errorMessage);
      return;
    }
    if (passData.currentPassword === passData.newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    setChangingPass(true);
    try {
      const res = await changePassword(passData.currentPassword, passData.newPassword);
      if (res.success) {
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } finally {
      setChangingPass(false);
    }
  };

  const roleInfo = getRoleBadgeInfo(user.role);

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

      {/* Change Password Card */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu bảo mật</h3>
              <p className="text-xs text-gray-500 mt-1">
                Cập nhật mật khẩu định kỳ để bảo vệ an toàn cho tài khoản của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
            >
              {showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu cũ"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                placeholder="Tối thiểu 8 ký tự, chữ hoa, số, ký tự ĐB"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  passData.confirmPassword && passData.confirmPassword !== passData.newPassword
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-300'
                }`}
              />
              {passData.confirmPassword && passData.confirmPassword !== passData.newPassword && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  Xác nhận mật khẩu mới chưa khớp.
                </p>
              )}
            </div>
          </div>

          {passData.newPassword.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-medium">Độ mạnh mật khẩu mới:</span>
                <span
                  className={`font-semibold ${
                    passRules.score <= 1
                      ? 'text-red-600'
                      : passRules.score === 2
                      ? 'text-amber-600'
                      : passRules.score === 3
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {passRules.score <= 1
                    ? 'Yếu'
                    : passRules.score === 2
                    ? 'Trung bình'
                    : passRules.score === 3
                    ? 'Khá'
                    : 'Mạnh (Đạt chuẩn)'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      passRules.score >= step
                        ? passRules.score <= 1
                          ? 'bg-red-500'
                          : passRules.score === 2
                          ? 'bg-amber-500'
                          : passRules.score === 3
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1 pt-0.5 text-[11px]">
                <span className={`flex items-center gap-1 ${passRules.minLength ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  <span>{passRules.minLength ? '✓' : '○'}</span> Ít nhất 8 ký tự
                </span>
                <span className={`flex items-center gap-1 ${passRules.hasUpperLower ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  <span>{passRules.hasUpperLower ? '✓' : '○'}</span> Chữ hoa & thường
                </span>
                <span className={`flex items-center gap-1 ${passRules.hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  <span>{passRules.hasNumber ? '✓' : '○'}</span> Ít nhất 1 chữ số
                </span>
                <span className={`flex items-center gap-1 ${passRules.hasSpecial ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  <span>{passRules.hasSpecial ? '✓' : '○'}</span> Ký tự đặc biệt
                </span>
              </div>
              {!passRules.noSpace && (
                <p className="text-[11px] text-red-600 font-medium">
                  ⚠ Mật khẩu không được chứa khoảng trắng.
                </p>
              )}
              {passData.currentPassword && passData.currentPassword === passData.newPassword && (
                <p className="text-[11px] text-red-600 font-medium">
                  ⚠ Mật khẩu mới không được trùng với mật khẩu hiện tại.
                </p>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={changingPass}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {changingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
