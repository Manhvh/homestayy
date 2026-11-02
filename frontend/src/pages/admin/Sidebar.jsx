import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const AdminSidebar = () => {
  const { logout } = useAppContext();
  const adminLinks = [
    { name: "Tổng quan thống kê", path: "/admin", icon: assets.dashboardIcon },
    { name: "Quản lý Người dùng", path: "/admin/users", icon: assets.userIcon },
    { name: "Duyệt tin Homestay", path: "/admin/hotels", icon: assets.homeIcon },
    { name: "Quản lý Danh mục", path: "/admin/categories", icon: assets.listIcon },
    { name: "Thống kê Đánh giá", path: "/admin/reviews", icon: assets.starIconFilled },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-[calc(100vh-70px)] border-gray-200 pt-4 flex flex-col bg-white">
      <div className="mt-2">
        {adminLinks.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center py-3.5 px-4 md:px-6 gap-3 transition-colors ${
                isActive 
                  ? "border-r-4 bg-purple-50 border-purple-600 text-purple-700 font-semibold" 
                  : "hover:bg-gray-50 text-gray-700"
              }`
            }
          >
            <img src={item.icon} alt={item.name} className="h-5 w-5 object-contain" />
            <p className="md:block hidden text-sm">{item.name}</p>
          </NavLink>
        ))}
      </div>

      {/* Logout button at bottom of sidebar */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center md:justify-start gap-3 py-2.5 px-3 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
          title="Đăng xuất khỏi hệ thống"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
