import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { checkPasswordRules } from '../utils/passwordValidator';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, sendVerifyCode, sendResetPasswordCode, resetPassword, toast } = useAppContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    codeVerify: '',
    role: 'user', // 'user' or 'hotelOwner'
  });

  const passwordStatus = useMemo(() => checkPasswordRules(formData.password), [formData.password]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendVerifyCode = async () => {
    if (!formData.email) {
      toast.error("Vui lòng nhập email trước khi nhận mã xác thực.");
      return;
    }
    setSendingCode(true);
    try {
      if (isForgotMode) {
        await sendResetPasswordCode(formData.email);
      } else {
        await sendVerifyCode(formData.email, formData.username);
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
        if (!passwordStatus.isValid) {
          toast.error(passwordStatus.errorMessage);
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp.");
          setLoading(false);
          return;
        }
        const res = await resetPassword(formData.email, formData.codeVerify, formData.password);
        if (res.success) {
          setIsForgotMode(false);
          setIsLoginMode(true);
          setFormData((prev) => ({ ...prev, codeVerify: '', password: '', confirmPassword: '' }));
        }
      } else if (isLoginMode) {
        if (!formData.email || !formData.password) {
          toast.error("Vui lòng nhập email và mật khẩu.");
          setLoading(false);
          return;
        }
        if (/\s/.test(formData.password)) {
          toast.error("Mật khẩu không được chứa khoảng trắng.");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
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
        if (!passwordStatus.isValid) {
          toast.error(passwordStatus.errorMessage);
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp.");
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLoginMode && !isForgotMode ? 'Nhập mật khẩu của bạn' : 'Ít nhất 8 ký tự, gồm chữ hoa, thường, số & ký tự đặc biệt'}
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator & Checklist for Register / Forgot Password */}
              {(!isLoginMode || isForgotMode) && formData.password.length > 0 && (
                <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                    <span
                      className={
                        passwordStatus.score <= 1
                          ? 'text-red-600'
                          : passwordStatus.score === 2
                          ? 'text-amber-600'
                          : passwordStatus.score === 3
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                      }
                    >
                      {passwordStatus.score <= 1
                        ? 'Yếu'
                        : passwordStatus.score === 2
                        ? 'Trung bình'
                        : passwordStatus.score === 3
                        ? 'Khá'
                        : 'Mạnh (Đạt chuẩn)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${
                          passwordStatus.score >= step
                            ? passwordStatus.score <= 1
                              ? 'bg-red-500'
                              : passwordStatus.score === 2
                              ? 'bg-amber-500'
                              : passwordStatus.score === 3
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div className={`flex items-center gap-1 ${passwordStatus.minLength ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                      <span>{passwordStatus.minLength ? '✓' : '○'}</span>
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStatus.hasUpperLower ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                      <span>{passwordStatus.hasUpperLower ? '✓' : '○'}</span>
                      <span>Chữ hoa & chữ thường</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStatus.hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                      <span>{passwordStatus.hasNumber ? '✓' : '○'}</span>
                      <span>Ít nhất 1 chữ số (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStatus.hasSpecial ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                      <span>{passwordStatus.hasSpecial ? '✓' : '○'}</span>
                      <span>Ký tự đặc biệt (@#$!...)</span>
                    </div>
                  </div>
                  {!passwordStatus.noSpace && (
                    <p className="text-[11px] text-red-600 font-medium">
                      ✕ Mật khẩu không được chứa khoảng trắng
                    </p>
                  )}
                </div>
              )}
            </div>

            {(!isLoginMode || isForgotMode) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isForgotMode ? 'Xác nhận mật khẩu mới' : 'Xác nhận mật khẩu'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full pl-3.5 pr-10 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none transition ${
                      formData.confirmPassword && formData.confirmPassword !== formData.password
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                  <p className="text-[11px] text-red-500 mt-1">Mật khẩu xác nhận chưa khớp.</p>
                )}
              </div>
            )}

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
