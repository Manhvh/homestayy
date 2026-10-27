import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, toast } = useAppContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user', // 'user' or 'hotelOwner'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
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
          toast.error("Vui lòng điền đầy đủ các trường.");
          setLoading(false);
          return;
        }
        const res = await register(formData.username, formData.email, formData.password, formData.role);
        if (res.success) {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper for presentation/evaluation
  const handleQuickDemo = async (demoRole) => {
    setLoading(true);
    try {
      const demoAccounts = {
        user: { email: 'khachhang@homestay.vn', password: 'password123', name: 'Nguyễn Văn Khách' },
        hotelOwner: { email: 'chubay@homestay.vn', password: 'password123', name: 'Trần Văn Chủ Nhà' },
        admin: { email: 'admin@homestay.vn', password: 'password123', name: 'Quản Trị Viên' },
      };

      const account = demoAccounts[demoRole];
      let res = await login(account.email, account.password);
      
      // If demo account doesn't exist yet, auto register it
      if (!res.success) {
        res = await register(account.name, account.email, account.password, demoRole);
      }

      if (res.success) {
        onClose();
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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/70">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
              isLoginMode
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${
              !isLoginMode
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
              {isLoginMode ? 'Chào mừng bạn trở lại! 👋' : 'Tạo tài khoản mới ✨'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isLoginMode
                ? 'Đăng nhập để đặt phòng và quản lý homestay của bạn'
                : 'Trải nghiệm hệ sinh thái đặt homestay chuyên nghiệp'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
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

            {!isLoginMode && (
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
                    🎒 Khách du lịch
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
                    🏡 Chủ Homestay
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : (isLoginMode ? 'Đăng nhập ngay' : 'Đăng ký tài khoản')}
            </button>
          </form>

          {/* Quick Demo Buttons for Evaluators */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 font-medium mb-3">
              ⚡ Đăng nhập nhanh cho Hội đồng chấm đồ án:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                disabled={loading}
                className="py-1.5 px-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Đăng nhập tài khoản khách hàng mẫu"
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('hotelOwner')}
                disabled={loading}
                className="py-1.5 px-2 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Đăng nhập tài khoản chủ homestay mẫu"
              >
                Chủ nhà
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="py-1.5 px-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Đăng nhập tài khoản Quản trị viên mẫu"
              >
                Quản trị viên
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
