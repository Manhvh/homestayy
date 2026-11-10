import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, sendVerifyCode, sendResetPasswordCode, resetPassword, toast } = useAppContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    codeVerify: '',
    role: 'user', // 'user' or 'hotelOwner'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendVerifyCode = async () => {
    if (!formData.email) {
      toast.error("Vui lòng nhập địa chỉ email trước khi nhận mã xác thực.");
      return;
    }
    setSendingCode(true);
    try {
      const res = isForgotMode
        ? await sendResetPasswordCode(formData.email)
        : await sendVerifyCode(formData.email, formData.username);
      if (res.success && res.verifyCode) {
        setGeneratedCode(res.verifyCode);
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotMode) {
        if (!formData.email || !formData.codeVerify || !formData.password) {
          toast.error("Vui lòng nhập email, mã xác thực 6 số và mật khẩu mới.");
          setLoading(false);
          return;
        }
        const res = await resetPassword(formData.email, formData.codeVerify, formData.password);
        if (res.success) {
          setIsForgotMode(false);
          setIsLoginMode(true);
          setFormData((prev) => ({ ...prev, codeVerify: '', password: '' }));
        }
      } else if (isLoginMode) {
        if (!formData.email || !formData.password) {
          toast.error("Vui lòng nhập email và mật khẩu.");
          setLoading(false);
          return;
        }
        const res = await login(formData.email, formData.password);
        if (res.success) {
          onClose();
        }
      } else {
        if (!formData.username || !formData.email || !formData.password) {
          toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
          setLoading(false);
          return;
        }
        if (!formData.codeVerify) {
          toast.error("Vui lòng lấy và nhập mã xác thực (codeVerify) để đăng ký tài khoản.");
          setLoading(false);
          return;
        }
        const res = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.role,
          formData.phone,
          formData.codeVerify
        );
        if (res.success) {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/70">
          <button
            onClick={() => {
              setIsForgotMode(false);
              setIsLoginMode(true);
            }}
            className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
              isLoginMode && !isForgotMode
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setIsForgotMode(false);
              setIsLoginMode(false);
            }}
            className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
              !isLoginMode && !isForgotMode
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isForgotMode
                ? 'Khôi phục mật khẩu'
                : isLoginMode
                ? 'Chào mừng bạn trở lại!'
                : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isForgotMode
                ? 'Nhập email để nhận mã xác thực 6 số và đặt mật khẩu mới'
                : isLoginMode
                ? 'Đăng nhập để đặt phòng và quản lý homestay của bạn'
                : 'Trải nghiệm hệ sinh thái đặt homestay chuyên nghiệp'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && !isForgotMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  {isForgotMode ? 'Mật khẩu mới' : 'Mật khẩu'}
                </label>
                {isLoginMode && !isForgotMode && (
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {!isLoginMode && !isForgotMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            {(!isLoginMode || isForgotMode) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mã xác thực tài khoản <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="codeVerify"
                    required
                    value={formData.codeVerify}
                    onChange={handleChange}
                    placeholder="Nhập mã 6 số"
                    className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition tracking-widest font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSendVerifyCode}
                    disabled={sendingCode}
                    className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {sendingCode ? 'Đang gửi...' : 'Nhận mã xác thực'}
                  </button>
                </div>
              </div>
            )}

            {!isLoginMode && !isForgotMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bạn tham gia với tư cách</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'user' })}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition cursor-pointer ${
                      formData.role === 'user'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Khách du lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'hotelOwner' })}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition cursor-pointer ${
                      formData.role === 'hotelOwner'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Chủ Homestay
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Đang xử lý...'
                : isForgotMode
                ? 'Đặt lại mật khẩu mới'
                : isLoginMode
                ? 'Đăng nhập ngay'
                : 'Đăng ký tài khoản'}
            </button>

            {isForgotMode && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
