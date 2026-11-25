import React, { useState, useEffect } from "react";
import { assets, cities as defaultCities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HotelRegistration = () => {
  const { setShowHotelRegistration, axios, getToken, setIsOwner, user, cities: dynamicCities } = useAppContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityOptions = dynamicCities && dynamicCities.length > 0 ? dynamicCities : defaultCities;

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (submitting) return;

    try {
      if (!user) {
        toast.error("Vui lòng đăng nhập để đăng ký Homestay của bạn");
        return;
      }

      if (user?.role === "admin") {
        toast.error("Tài khoản Quản trị viên (Admin) không thực hiện đăng ký Homestay.");
        setShowHotelRegistration(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("contact", contact.trim());
      formData.append("address", address.trim());
      formData.append("city", city.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post(`/api/hotels/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message || "Đăng ký Homestay thành công!");
        setIsOwner(true);
        setShowHotelRegistration(false);
        setName("");
        setAddress("");
        setContact("");
        setCity("");
        setDescription("");
        setImageFile(null);
        setImagePreview("");
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => !submitting && setShowHotelRegistration(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl max-h-[92vh]"
      >
        <img
          src={imagePreview || assets.regImage}
          alt="reg-image"
          className="w-1/2 object-cover hidden md:block"
        />

        <div className="relative flex flex-col items-center w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
          <img
            src={assets.closeIcon}
            onClick={() => !submitting && setShowHotelRegistration(false)}
            alt="close-icon"
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer hover:opacity-75"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Đăng Ký Homestay Mới</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4 text-center">
            Hồ sơ sau khi đăng ký sẽ ở trạng thái chờ Quản trị viên phê duyệt trước khi hiển thị công khai.
          </p>

          {/* Hotel Cover Image Upload */}
          <div className="w-full mt-1">
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Ảnh đại diện Homestay (Tùy chọn)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-400">Chưa có</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {/* Hotel Name */}
          <div className="w-full mt-3">
            <label htmlFor="name" className="text-xs font-semibold text-gray-700">
              Tên Homestay / Khách sạn *
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

          {/* Hotel Phone */}
          <div className="w-full mt-3">
            <label htmlFor="contact" className="text-xs font-semibold text-gray-700">
              Số điện thoại liên hệ *
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

          {/* Hotel Address */}
          <div className="w-full mt-3">
            <label htmlFor="address" className="text-xs font-semibold text-gray-700">
              Địa chỉ cụ thể *
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

          {/* Select city Drop Down */}
          <div className="w-full mt-3">
            <label htmlFor="city" className="text-xs font-semibold text-gray-700">
              Khu vực / Thành phố *
            </label>
            <select
              id="city"
              onChange={(e) => setCity(e.target.value)}
              value={city}
              required
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2.5 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Chọn thành phố --</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Short Description */}
          <div className="w-full mt-3">
            <label htmlFor="hotel-desc" className="text-xs font-semibold text-gray-700">
              Mô tả ngắn (Tùy chọn)
            </label>
            <textarea
              id="hotel-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu sơ lược về không gian homestay của bạn..."
              className="border border-gray-300 rounded-xl w-full px-3.5 py-2 mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all text-white py-3 rounded-xl font-semibold cursor-pointer mt-5 shadow-md text-sm"
          >
            {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đăng ký"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelRegistration;
