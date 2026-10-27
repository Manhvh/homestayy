import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const UserMenu = () => {
  const { user, isOwner, isAdmin, userRole, logout, navigate } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const roleBadge = () => {
    if (isAdmin || userRole === 'admin') {
      return <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">Admin</span>;
    }
    if (isOwner || userRole === 'hotelOwner') {
      return <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">Chủ nhà</span>;
    }
    return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">Khách hàng</span>;
  };

  const avatarUrl = user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}`;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer bg-white/10 backdrop-blur-xs"
      >
        <img
          src={avatarUrl}
          alt={user.username || 'Avatar'}
          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn text-gray-800">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-sm text-gray-900 truncate">{user.username || 'Người dùng'}</p>
              {roleBadge()}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1 text-sm font-medium">
            <button
              onClick={() => {
                navigate('/my-bookings');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition cursor-pointer"
            >
              <span>📑</span>
              <span>Lịch sử đặt phòng</span>
            </button>

            {(isOwner || userRole === 'hotelOwner') && (
              <button
                onClick={() => {
                  navigate('/owner-dashboard');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-3 transition cursor-pointer"
              >
                <span>🏡</span>
                <span>Kênh Quản trị Homestay</span>
              </button>
            )}

            {(isAdmin || userRole === 'admin') && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-3 transition cursor-pointer"
              >
                <span>🛡️</span>
                <span>Bảng điều khiển Admin</span>
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-3 transition cursor-pointer text-sm font-medium"
            >
              <span>🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
