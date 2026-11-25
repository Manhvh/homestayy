import React from "react";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    icon: "🤝",
    title: "Tôn Trọng & Không Phân Biệt Đối Xử",
    desc: "Cộng đồng HomeStay chào đón mọi người không phân biệt giới tính, độ tuổi, tôn giáo, dân tộc hay quốc tịch. Mọi hành vi kỳ thị, quấy rối hoặc ngôn từ xúc phạm đều bị nghiêm cấm hoàn toàn."
  },
  {
    icon: "🛡️",
    title: "An Toàn Cá Nhân & Tuân Thủ Pháp Luật",
    desc: "Nghiêm cấm tuyệt đối việc mang theo vũ khí, chất cấm, chất gây cháy nổ hoặc tổ chức các hoạt động vi phạm pháp luật tại homestay. Mọi cá nhân có nghĩa vụ tuân thủ quy định khai báo lưu trú tạm trú tạm vắng theo luật định."
  },
  {
    icon: "🏡",
    title: "Giữ Gìn Trật Tự & Vệ Sinh Chung",
    desc: "Tôn trọng không gian yên tĩnh của cộng đồng xung quanh, đặc biệt là giảm thiểu tiếng ồn sau 22:00 đêm. Sử dụng các trang thiết bị (bếp, máy sưởi, hồ bơi) cẩn trọng và giữ gìn vệ sinh chung."
  },
  {
    icon: "⭐",
    title: "Đánh Giá Trung Thực & Xây Dựng",
    desc: "Các đánh giá bình luận phải phản ánh trung thực trải nghiệm thực tế của chuyến đi. Nghiêm cấm hành vi đe dọa đánh giá xấu để tống tiền, ép giá hoặc hành vi tự tạo đánh giá ảo để lừa dối người tiêu dùng."
  }
];

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Văn Hóa & Quy Tắc Ứng Xử
          </span>
          <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-gray-900 leading-tight">
            Tiêu Chuẩn Cộng Đồng HomeStay
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm">
            Một không gian lưu trú tuyệt vời chỉ có thể được tạo nên khi cả du khách và chủ nhà cùng nhau thấu hiểu, tôn trọng và chia sẻ trách nhiệm vì một cộng đồng văn minh.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, idx) => (
            <div key={idx} className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-3 hover:shadow-xs transition">
              <span className="text-3xl p-3 bg-purple-50 rounded-2xl inline-block">{p.icon}</span>
              <h3 className="font-bold text-gray-900 text-base">{p.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Guest & Host Dual Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* For Guests */}
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <span className="text-2xl">🎒</span>
              <h3 className="text-lg font-bold font-playfair text-gray-900">
                Dành Cho Du Khách
              </h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Khai báo thông tin chính xác:</strong> Đăng ký đúng số lượng người lưu trú thực tế để chủ nhà kịp thời sắp xếp chăn gối và chuẩn bị phòng.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Giữ gìn tài sản chung:</strong> Coi homestay như chính ngôi nhà của bạn. Nếu lỡ làm hỏng hóc đồ đạc, hãy chủ động thông báo cho chủ nhà để cùng thống nhất đền bù thỏa đáng.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Tuân thủ giờ giấc:</strong> Nhận và trả phòng đúng khung giờ đã quy định. Nếu có nhu cầu check-in sớm hoặc trễ, hãy thông báo trước với chủ nhà.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Ý thức bảo vệ môi trường:</strong> Tắt đèn, máy lạnh và các thiết bị điện khi ra khỏi phòng để tiết kiệm năng lượng.</span>
              </li>
            </ul>
          </div>

          {/* For Hosts */}
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <span className="text-2xl">🏡</span>
              <h3 className="text-lg font-bold font-playfair text-gray-900">
                Dành Cho Chủ Homestay
              </h3>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Trung thực về cơ sở vật chất:</strong> Cung cấp hình ảnh và mô tả đúng với hiện trạng phòng thực tế, không dùng hình ảnh giả mạo gây hiểu lầm cho khách.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Đảm bảo vệ sinh an toàn:</strong> Thay mới drap giường, khăn tắm và làm sạch phòng ốc kỹ lưỡng trước mỗi đợt khách nhận phòng.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Tôn trọng quyền riêng tư của khách:</strong> Tuyệt đối không tự ý vào phòng của khách khi chưa có sự đồng ý của khách, trừ các tình huống khẩn cấp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Hỗ trợ tận tình:</strong> Giữ liên lạc thông suốt, cung cấp thông tin chỉ đường chu đáo và tư vấn những địa điểm ăn uống, tham quan bản địa đặc sắc.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Violations and Reporting */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-red-700 font-bold text-base">
            <span>⚠️</span>
            <h3>Quy Trình Xử Lý Vi Phạm & Báo Cáo Sự Cố</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            HomeStay áp dụng chính sách không khoan nhượng đối với các hành vi vi phạm nghiêm trọng Tiêu chuẩn cộng đồng. Tùy theo mức độ vi phạm, tài khoản có thể bị nhắc nhở, tạm ngừng hoạt động hoặc khóa vĩnh viễn trên hệ thống.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Báo cáo hành vi vi phạm →
            </Link>
            <Link
              to="/privacy-policy"
              className="text-xs font-semibold text-gray-600 hover:underline"
            >
              Xem Chính sách bảo mật thông tin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
