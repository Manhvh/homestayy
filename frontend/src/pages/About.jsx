import React, { useEffect, useState } from "react";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-32 pb-20 px-6 md:px-20 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gray-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gray-300/10 rounded-full blur-3xl"></div>
      
      {/* About HomeStay */}
      <div className={`max-w-5xl mx-auto mb-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-block mb-12">
          <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <span>Về Chúng Tôi - HomeStay</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
            Nâng Tầm Trải Nghiệm
            <span className="block text-gray-600">Nghỉ Dưỡng Đẳng Cấp</span>
          </h2>
          <div className="w-32 h-1 bg-gray-900 mx-auto rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
            <strong className="text-gray-900">HomeStay</strong> là nền tảng kết nối và đặt phòng lưu trú cao cấp,
            mang đến cho du khách những trải nghiệm nghỉ dưỡng khác biệt và trọn vẹn nhất.
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            Dù bạn đang lên kế hoạch cho một kỳ nghỉ dưỡng sang trọng, một chuyến công tác thuận tiện, hay chuyến khám phá vùng đất mới, 
            HomeStay luôn đồng hành để kết nối bạn với những căn phòng tuyệt vời nhất. Nền tảng của chúng tôi kết hợp 
            công nghệ hiện đại với sự tận tâm nhằm mang lại dịch vụ hoàn hảo cho từng kỳ nghỉ.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h3 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900 mb-4">
            Tại Sao Nên Chọn HomeStay?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sự kết hợp hoàn hảo giữa công nghệ tiện ích và trải nghiệm mến khách
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Hệ Thống Đặt Phòng Thông Minh",
              desc: "Kiểm tra phòng trống theo thời gian thực, xác thực ngày nhận/trả và quy trình đặt phòng tức thì.",
              step: "01",
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "Kênh Quản Trị Dành Cho Chủ Nhà",
              desc: "Công cụ quản lý toàn diện: danh sách phòng, giá theo mùa, theo dõi lịch đặt và doanh thu dễ dàng.",
              step: "02",
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "Giao Diện Hiện Đại & Sang Trọng",
              desc: "Thiết kế thanh lịch, trực quan trên mọi thiết bị mang lại trải nghiệm tiện nghi nhất cho du khách.",
              step: "03",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              title: "Bảo Mật & An Toàn Tuyệt Đối",
              desc: "Bảo vệ thông tin cá nhân và quản lý thanh toán an toàn, minh bạch giúp bạn hoàn toàn an tâm.",
              step: "04",
              color: "from-green-500 to-green-600"
            },
            {
              title: "Tốc Độ Nhanh Chóng & Ổn Định",
              desc: "Hệ thống tối ưu hóa hiệu năng vượt trội, tải trang tức thì và hoạt động mượt mà trên di động lẫn máy tính.",
              step: "05",
              color: "from-orange-500 to-orange-600"
            },
            {
              title: "Hỗ Trợ Khách Hàng 24/7",
              desc: "Đội ngũ chăm sóc khách hàng và hỗ trợ đối tác chủ nhà luôn sẵn sàng đồng hành trên mọi hành trình.",
              step: "06",
              color: "from-teal-500 to-teal-600"
            },
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className={`group relative bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 hover:border-gray-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{transitionDelay: `${idx * 100}ms`}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-md`}>
                    {feature.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
