import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Experience = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with New Background */}
      <section
        className="relative h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 z-10" />

        {/* Hero Content */}
        <div className={`relative z-30 px-6 text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold mb-8 leading-tight">
            Trải Nghiệm Cùng HomeStay
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full mb-8"></div>
          
          <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-light mb-6">
            Nơi hội tụ vẻ đẹp hiện đại và không gian nghỉ dưỡng ấm cúng
          </p>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Khám phá những điểm đến được chọn lọc kỹ càng, không chỉ là nơi dừng chân mà còn là phong cách sống 
            <span className="text-blue-300 font-medium"> nhẹ nhàng</span>, 
            <span className="text-purple-300 font-medium"> trọn vẹn</span> và 
            <span className="text-pink-300 font-medium"> đáng nhớ</span>.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Chia Sẻ Từ Du Khách
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lắng nghe cảm nhận thực tế từ những khách hàng đã có kỳ nghỉ tuyệt vời cùng HomeStay
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* User Testimonials */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" alt="Nguyễn Minh Anh" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Nguyễn Minh Anh</h4>
                  <p className="text-gray-500 text-sm">Hà Nội, Việt Nam</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "HomeStay đã giúp chuyến đi công tác và nghỉ ngơi của tôi tại Đà Lạt trở nên vô cùng hoàn hảo. Phòng sạch sẽ, quy trình đặt phòng nhanh gọn chỉ trong vài giây!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=200" alt="Trần Thu Hương" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Trần Thu Hương</h4>
                  <p className="text-gray-500 text-sm">TP. Hồ Chí Minh</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Là người thường xuyên du lịch trải nghiệm, tôi đánh giá rất cao sự chăm chút của HomeStay. Các gợi ý phòng luôn vượt trên sự kỳ vọng của tôi và gia đình."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200" alt="Lê Hoàng Nam" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Lê Hoàng Nam</h4>
                  <p className="text-gray-500 text-sm">Đà Nẵng, Việt Nam</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "HomeStay giúp tôi tìm thấy những căn villa nguyên căn view biển tuyệt đẹp cho nhóm bạn. Tiện ích đầy đủ, giá cả minh bạch và không phát sinh chi phí ẩn."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" alt="Phạm Quốc Bảo" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Phạm Quốc Bảo</h4>
                  <p className="text-gray-500 text-sm">Hải Phòng, Việt Nam</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Chủ nhà đón tiếp rất nhiệt tình, hỗ trợ nhận phòng sớm và chuẩn bị sẵn xe máy. Tôi chắc chắn sẽ quay lại sử dụng HomeStay cho các chuyến đi tiếp theo."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="Đặng Quỳnh Như" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Đặng Quỳnh Như</h4>
                  <p className="text-gray-500 text-sm">Cần Thơ, Việt Nam</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Không gian yên tĩnh, thiết kế vintage ấm cúng và đầy đủ góc chụp ảnh đẹp. Cảm ơn HomeStay đã tạo nên một trải nghiệm cuối tuần đáng nhớ!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" alt="Vũ Đình Trọng" className="w-16 h-16 rounded-full mr-4 object-cover" />
                <div>
                  <h4 className="text-gray-900 font-semibold text-lg">Vũ Đình Trọng</h4>
                  <p className="text-gray-500 text-sm">Nha Trang, Việt Nam</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={assets.starIconFilled} alt="star" className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Giao diện trực quan, lọc giá và tiện ích rất thông minh. Tôi tìm được phòng ưng ý chỉ trong chưa đầy 3 phút. Rất hài lòng với dịch vụ."
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <button 
              onClick={() => navigate('/rooms')}
              className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10">Khám Phá Homestay Lý Tưởng Ngay</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Experience;
