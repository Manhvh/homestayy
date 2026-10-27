import React from "react";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const sidebarLinks = [
    { name: "Tổng quan", path: "/owner-dashboard", icon: assets.dashboardIcon },
    { name: "Lịch đặt phòng", path: "/owner-dashboard/schedule", icon: assets.calenderIcon },
    { name: "Quản lý Homestay", path: "/owner-dashboard/manage-hotel", icon: assets.homeIcon },
    { name: "Thêm phòng & Giá", path: "/owner-dashboard/add-room", icon: assets.addIcon },
    { name: "Danh sách phòng", path: "/owner-dashboard/list-room", icon: assets.listIcon },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-200 pt-4 flex flex-col bg-white">
      {sidebarLinks.map((item, index) => (
        <NavLink
          to={item.path}
          key={index}
          end={item.path === "/owner-dashboard"}
          className={({ isActive }) =>
            `flex items-center py-3.5 px-4 md:px-6 gap-3 transition-colors ${
              isActive 
                ? "border-r-4 bg-blue-50 border-blue-600 text-blue-600 font-semibold" 
                : "hover:bg-gray-50 text-gray-700"
            }`
          }
        >
          <img src={item.icon} alt={item.name} className="h-5 w-5 object-contain" />
          <p className="md:block hidden text-sm">{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
