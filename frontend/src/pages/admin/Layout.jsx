import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const AdminLayout = () => {
    const { isAdmin, user, becomeAdmin } = useAppContext();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <span className="text-6xl mb-4">🔒</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Yêu cầu đăng nhập</h2>
                <p className="text-gray-500 mb-6">Vui lòng đăng nhập để truy cập khu vực Quản trị viên.</p>
                <Link to="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                    Quay về Trang chủ
                </Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-lg mx-auto">
                <span className="text-6xl mb-4">🛡️</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Khu vực dành cho Quản trị viên</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Tài khoản của bạn hiện chưa có quyền Quản trị viên (Admin). Bạn có thể kích hoạt quyền Admin ngay bên dưới để thử nghiệm hoặc chấm điểm đồ án tốt nghiệp:
                </p>
                <button
                    onClick={becomeAdmin}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
                >
                    ⚡ Kích hoạt quyền Quản trị viên (Admin Demo)
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Admin Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={assets.logo} alt="Logo" className="h-8" />
                    </Link>
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                        Admin Portal
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 text-xs font-semibold">
                        ← Xem trang người dùng
                    </Link>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-medium text-gray-700">
                        Admin: <strong>{user?.fullName || user?.firstName || "Quản trị viên"}</strong>
                    </span>
                </div>
            </div>

            {/* Content area */}
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-6 md:p-10 overflow-x-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
