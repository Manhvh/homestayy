import React, { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HotelRegistration = () => {

  const { setShowHotelRegistration, axios, getToken, setIsOwner, user } = useAppContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");


  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      
      // Check if user is authenticated
      if (!user) {
        toast.error("Vui lòng đăng nhập để đăng ký Homestay của bạn");
        return;
      }

      if (user?.role === 'admin') {
        toast.error("Tài khoản Quản trị viên (Admin) không thực hiện đăng ký Homestay.");
        setShowHotelRegistration(false);
        return;
      }
      
      const token = await getToken();
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const { data } = await axios.post(`/api/hotels/`, { name, contact, address, city }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(data.message || "Đăng ký Homestay thành công!");
        setIsOwner(true);
        setShowHotelRegistration(false);
        // Reset form
        setName("");
        setAddress("");
        setContact("");
        setCity("");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error("Hotel registration error:", error);
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để đăng ký Homestay");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Đăng ký Homestay thất bại. Vui lòng thử lại.");
      }
    }
  }

  return (
    <div
      onClick={() => setShowHotelRegistration(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()}
        className="flex bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl">
        <img
          src={assets.regImage}
          alt="reg-image"
          className="w-1/2 object-cover hidden md:block"
        />

        <div className="relative flex flex-col items-center w-full md:w-1/2 p-6 md:p-8">
          <img
            src={assets.closeIcon}
            onClick={() => setShowHotelRegistration(false)}
            alt="close-icon"
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer hover:opacity-75"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Đăng Ký Homestay Mới</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4 text-center">Bắt đầu kinh doanh và tiếp cận hàng ngàn khách du lịch</p>

          {/*----Hotel Name----*/}
          <div className="w-full mt-2">
            <label htmlFor="name" className="text-xs font-semibold text-gray-700">
              Tên Homestay / Khách sạn
            </label>
            <input
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Ví dụ: Đà Lạt Eco Homestay"
              required
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/*----Hotel Phone----*/}
          <div className="w-full mt-3">
            <label htmlFor="contact" className="text-xs font-semibold text-gray-700">
              Số điện thoại liên hệ
            </label>
            <input
              id="contact"
              onChange={(e) => setContact(e.target.value)}
              value={contact}
              type="text"
              placeholder="0987654321"
              required
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/*----Hotel Address----*/}
          <div className="w-full mt-3">
            <label htmlFor="address" className="text-xs font-semibold text-gray-700">
              Địa chỉ cụ thể
            </label>
            <input
              id="address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              type="text"
              placeholder="Số 123 đường ABC, Phường X..."
              required
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/*-----Select city Drop Down-----*/}
          <div className="w-full mt-3">
            <label htmlFor="city" className="text-xs font-semibold text-gray-700">
              Khu vực / Thành phố
            </label>
            <select
              id="city"
              onChange={(e) => setCity(e.target.value)}
              value={city}
              required
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Chọn thành phố --</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white py-3 rounded-xl font-semibold cursor-pointer mt-6 shadow-md text-sm">
            Gửi yêu cầu đăng ký
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelRegistration;
