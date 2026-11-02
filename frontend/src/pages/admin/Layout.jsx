import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';

const AdminLayout = () => {
    const { isAdmin, isOwner, user, logout } = useAppContext();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Yêu cầu đăng nhập</h2>
                <p className="text-gray-500 mb-6 text-xs leading-relaxed">
                    Vui lòng đăng nhập với tài khoản Quản trị viên để truy cập bảng điều khiển hệ thống.
                </p>
                <Link to="/" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition">
                    Quay về Trang chủ
                </Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
                <p className="text-gray-500 mb-6 text-xs leading-relaxed">
                    {isOwner
                        ? "Tài khoản của bạn là Chủ Homestay đối tác. Khu vực này chỉ dành riêng cho Quản trị viên cấp cao. Vui lòng chuyển sang Kênh Chủ nhà để quản lý homestay của bạn."
                        : "Tài khoản của bạn là Khách hàng thông thường và không có quyền truy cập khu vực Quản trị viên."}
                </p>
                <div className="flex items-center gap-3">
                    {isOwner && (
                        <Link
                            to="/owner-dashboard"
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                            Đến Kênh Chủ nhà
                        </Link>
                    )}
                    <Link
                        to="/"
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                    >
                        Quay về Trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Admin Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                        Bảng Điều Khiển Quản Trị Hệ Thống
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <img
                            src={user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.username || 'Admin')}`}
                            alt="Admin Avatar"
                            className="w-8 h-8 rounded-full object-cover border border-purple-200"
                        />
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-800 leading-tight">
                                {user?.fullName || user?.username || user?.firstName || "Quản trị viên"}
                            </p>
                            <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                        title="Đăng xuất khỏi hệ thống"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-6 md:p-8 min-w-0 overflow-x-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
