import React from "react";
import { Link } from "react-router-dom";

const TIERS = [
  {
    name: "Chính Sách Linh Hoạt",
    badge: "Phổ biến nhất",
    badgeColor: "bg-green-100 text-green-700",
    color: "border-green-300 bg-green-50/30",
    headerColor: "text-green-800",
    summary: "Thích hợp cho các chuyến đi có thể thay đổi lịch trình linh động.",
    rules: [
      { time: "Trước 24 giờ nhận phòng", refund: "Hoàn lại 100% tổng tiền" },
      { time: "Trong vòng 24 giờ nhận phòng", refund: "Tính phí đêm đầu tiên, hoàn phần còn lại" },
      { time: "Sau giờ nhận phòng / Vắng mặt", refund: "Không hoàn lại tiền" },
    ]
  },
  {
    name: "Chính Sách Tiêu Chuẩn",
    badge: "Cân bằng",
    badgeColor: "bg-blue-100 text-blue-700",
    color: "border-blue-300 bg-blue-50/30",
    headerColor: "text-blue-800",
    summary: "Thường áp dụng cho các căn homestay villa, nhà nguyên căn cuối tuần.",
    rules: [
      { time: "Trước 5 ngày nhận phòng", refund: "Hoàn lại 100% tổng tiền" },
      { time: "Từ 2 đến 5 ngày trước nhận phòng", refund: "Hoàn lại 50% tổng tiền" },
      { time: "Dưới 48 giờ trước nhận phòng", refund: "Không hoàn lại tiền" },
    ]
  },
  {
    name: "Chính Sách Nghiêm Ngặt",
    badge: "Mùa cao điểm & Lễ Tết",
    badgeColor: "bg-amber-100 text-amber-700",
    color: "border-amber-300 bg-amber-50/30",
    headerColor: "text-amber-800",
    summary: "Áp dụng vào các dịp nghỉ lễ lớn hoặc các căn biệt thự nghỉ dưỡng sang trọng.",
    rules: [
      { time: "Trước 14 ngày nhận phòng", refund: "Hoàn lại 100% tổng tiền" },
      { time: "Từ 7 đến 14 ngày trước nhận phòng", refund: "Hoàn lại 50% tổng tiền" },
      { time: "Dưới 7 ngày trước nhận phòng", refund: "Không hoàn lại tiền" },
    ]
  }
];

const STEPS = [
  {
    step: "1",
    title: "Truy Cập 'Chuyến Đi Của Tôi'",
    desc: "Đăng nhập tài khoản HomeStay, nhấp vào tên của bạn ở góc phải màn hình và chọn 'Chuyến đi của tôi'."
  },
  {
    step: "2",
    title: "Chọn Đơn Đặt Phòng Cần Hủy",
    desc: "Tìm mã đơn đặt phòng (bookingCode) mà bạn có nhu cầu hủy hoặc dời ngày lưu trú."
  },
  {
    step: "3",
    title: "Bấm 'Hủy Phòng' & Xác Nhận",
    desc: "Hệ thống sẽ hiển thị số tiền hoàn lại theo chính sách. Nhấp 'Xác nhận hủy' để gửi yêu cầu."
  },
  {
    step: "4",
    title: "Nhận Tiền Hoàn Trả",
    desc: "Tiền hoàn lại sẽ được chuyển trực tiếp vào tài khoản ngân hàng của bạn trong vòng 3 - 5 ngày làm việc."
  }
];

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Minh Bạch & Rõ Ràng
          </span>
          <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-gray-900 leading-tight">
            Quy Định & Chính Sách Hủy Phòng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm">
            HomeStay xây dựng quy định hủy phòng công bằng nhằm bảo vệ tối đa quyền lợi cho du khách, đồng thời tôn trọng công sức chuẩn bị phòng ốc của chủ homestay.
          </p>
        </div>

        {/* 3 Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 sm:p-7 border ${tier.color} shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`text-lg font-bold font-playfair ${tier.headerColor}`}>
                    {tier.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {tier.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                  {tier.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="bg-gray-50 p-3 rounded-xl space-y-1">
                      <p className="font-semibold text-gray-800">{rule.time}</p>
                      <p className="text-blue-600 font-bold">{rule.refund}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 italic">
                * Áp dụng theo múi giờ chuẩn Việt Nam (GMT+7).
              </div>
            </div>
          ))}
        </div>

        {/* Steps to Cancel */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
              Quy Trình Hủy Phòng Trực Tuyến
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Bạn có thể tự thực hiện hủy phòng trên hệ thống một cách nhanh chóng mà không cần thủ tục rườm rà.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {s.step}
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/my-bookings"
              className="inline-block px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs"
            >
              Kiểm tra đơn đặt của tôi →
            </Link>
          </div>
        </div>

        {/* Force Majeure Section */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-10 text-white space-y-5 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛈️</span>
            <h3 className="text-xl sm:text-2xl font-playfair font-bold">
              Chính Sách Trong Trường Hợp Bất Khả Kháng
            </h3>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Nếu chuyến đi của bạn không thể thực hiện do các nguyên nhân bất khả kháng nằm ngoài tầm kiểm soát (thiên tai, bão lụt gây cấm tàu thuyền, sạt lở đường xá hoặc hủy chuyến bay do thời tiết xấu), HomeStay sẽ can thiệp hỗ trợ tối đa:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-200">
            <li>Làm việc với chủ homestay để <strong>hoàn tiền 100%</strong> hoặc bảo lưu số tiền cọc cho kỳ nghỉ tiếp theo.</li>
            <li>Hỗ trợ dời ngày lưu trú miễn phí sang thời điểm thời tiết thuận lợi hơn theo sự đồng thuận của hai bên.</li>
            <li>Khách hàng chỉ cần cung cấp bằng chứng xác nhận chính thức từ cơ quan chức năng hoặc hãng hàng không.</li>
          </ul>
        </div>

        {/* Footer Links */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center space-y-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Bạn cần hỗ trợ thay đổi ngày hoặc có yêu cầu đặc biệt về đơn đặt phòng?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
            <Link to="/contact" className="text-blue-600 hover:underline">
              Liên hệ bộ phận CSKH 24/7 →
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/help-center" className="text-blue-600 hover:underline">
              Xem câu hỏi thường gặp tại Trung tâm trợ giúp →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
