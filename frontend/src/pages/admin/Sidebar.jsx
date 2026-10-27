import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminSidebar = () => {
  const adminLinks = [
    { name: "Tổng quan thống kê", path: "/admin", icon: assets.dashboardIcon },
    { name: "Quản lý Người dùng", path: "/admin/users", icon: assets.userIcon },
    { name: "Duyệt tin Homestay", path: "/admin/hotels", icon: assets.homeIcon },
    { name: "Quản lý Danh mục", path: "/admin/categories", icon: assets.listIcon },
    { name: "Thống kê Đánh giá", path: "/admin/reviews", icon: assets.starIconFilled },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-[calc(100vh-70px)] border-gray-200 pt-4 flex flex-col bg-white">
      <div className="px-6 py-3 border-b border-gray-100 hidden md:block">
        <p className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg w-fit">
          🛡️ Quản trị hệ thống
        </p>
      </div>
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
    </div>
  );
};

export default AdminSidebar;
