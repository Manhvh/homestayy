import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HOST_BENEFITS = [
  {
    icon: "🌐",
    title: "Tiếp Cận Hàng Triệu Du Khách",
    desc: "Căn homestay của bạn được quảng bá đa kênh, tiếp cận tệp khách hàng tiềm năng dồi dào trong và ngoài nước yêu thích du lịch trải nghiệm."
  },
  {
    icon: "⚡",
    title: "Hệ Thống Quản Lý Thông Minh",
    desc: "Bảng điều khiển riêng biệt cho chủ nhà: cập nhật tình trạng phòng trống, điều chỉnh giá theo mùa, duyệt đơn tức thì và xem báo cáo doanh thu minh bạch."
  },
  {
    icon: "🛡️",
    title: "Chính Sách Bảo Vệ Toàn Diện",
    desc: "Quy định đặt cọc và chính sách hủy phòng rõ ràng bảo vệ quyền lợi tài chính của chủ nhà trước các sự cố khách hủy sát giờ hoặc vắng mặt."
  },
  {
    icon: "💬",
    title: "Đội Ngũ Hỗ Trợ Đối Tác 24/7",
    desc: "Chuyên viên tư vấn đồng hành từ khâu chụp ảnh, tối ưu mô tả phòng đến xử lý mọi khúc mắc phát sinh trong quá trình đón tiếp khách."
  }
];

const ONBOARDING_STEPS = [
  {
    step: "01",
    title: "Đăng Ký Tài Khoản",
    desc: "Tạo tài khoản miễn phí trên HomeStay chỉ trong 1 phút bằng email hoặc số điện thoại."
  },
  {
    step: "02",
    title: "Gửi Hồ Sơ Homestay",
    desc: "Điền tên cơ sở, địa chỉ, số điện thoại liên hệ và ảnh đại diện homestay của bạn."
  },
  {
    step: "03",
    title: "Xét Duyệt Nhanh Chóng",
    desc: "Đội ngũ quản trị kiểm duyệt thông tin và phê duyệt hồ sơ trong vòng tối đa 24 giờ làm việc."
  },
  {
    step: "04",
    title: "Đón Khách & Tăng Thu Nhập",
    desc: "Thêm danh mục phòng, nhận thông báo đặt phòng tức thì và theo dõi doanh thu về tài khoản."
  }
];

const HOST_FAQS = [
  {
    q: "Phí dịch vụ của HomeStay dành cho chủ nhà là bao nhiêu?",
    a: "Việc đăng ký mở gian hàng và đăng thông tin homestay trên HomeStay là hoàn toàn miễn phí. Chúng tôi chỉ áp dụng mức phí dịch vụ kết nối rất ưu đãi (từ 8% - 10%) khi có đơn đặt phòng thành công, không phát sinh bất kỳ khoản phí ẩn nào."
  },
  {
    q: "Sau khi gửi hồ sơ, bao lâu thì homestay của tôi được hiển thị?",
    a: "Đội ngũ kiểm duyệt của HomeStay sẽ xử lý hồ sơ đối tác trong vòng 12 - 24 giờ làm việc. Sau khi hồ sơ được phê duyệt, bạn có thể lập tức đăng phòng và phòng sẽ xuất hiện công khai trên trang tìm kiếm."
  },
  {
    q: "Tôi có thể tự quyết định giá phòng và quy định hủy không?",
    a: "Chắc chắn rồi. Bạn hoàn toàn làm chủ mức giá niêm yết, có thể tăng/giảm giá theo các ngày cuối tuần, ngày lễ hoặc mùa cao điểm, cũng như áp dụng chính sách hủy phòng phù hợp với homestay của bạn."
  },
  {
    q: "Làm thế nào để tôi nhận doanh thu từ các đơn đặt phòng?",
    a: "Doanh thu sẽ được đối soát tự động và chuyển khoản trực tiếp vào tài khoản ngân hàng của bạn theo chu kỳ tuần hoặc sau khi khách hàng hoàn tất thủ tục trả phòng (check-out) an toàn."
  }
];

const HostPartners = () => {
  const { user, isOwner, setShowHotelRegistration, openLoginModal } = useAppContext();
  const [openFaq, setOpenFaq] = useState(null);

  const handleStartHosting = () => {
    if (!user) {
      toast("Vui lòng đăng nhập để bắt đầu đăng ký Homestay!", { icon: "🔐" });
      openLoginModal();
      return;
    }
    if (isOwner) {
      toast.success("Bạn đã là đối tác chủ nhà! Đang chuyển đến bảng quản trị...");
      window.location.href = "/owner-dashboard";
      return;
    }
    setShowHotelRegistration(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="inline-block bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Dành cho Chủ Nhà & Đối tác Homestay
            </span>
            <h1 className="text-3xl sm:text-5xl font-playfair font-bold leading-tight">
              Biến Không Gian Của Bạn Thành Nguồn Thu Nhập Bền Vững
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Gia nhập mạng lưới hàng nghìn chủ nhà xuất sắc trên toàn quốc cùng HomeStay. Chúng tôi cung cấp giải pháp tiếp thị và phần mềm vận hành giúp bạn lấp đầy phòng trống quanh năm.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={handleStartHosting}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg cursor-pointer"
              >
                {isOwner ? "Vào Bảng Quản Trị Homestay" : "Đăng Ký Trở Thành Chủ Nhà →"}
              </button>
              <Link
                to="/about"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition"
              >
                Tìm hiểu thêm về chúng tôi
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { num: "50.000+", label: "Lượt du khách tìm phòng/tháng" },
            { num: "98%", label: "Tỷ lệ chủ nhà hài lòng" },
            { num: "82%", label: "Tỷ lệ lấp đầy phòng trung bình" },
            { num: "24/7", label: "Hỗ trợ kỹ thuật & vận hành" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-2xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{item.num}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Why Partner Section */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
              Tại Sao Nên Hợp Tác Cùng HomeStay?
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Chúng tôi cung cấp hệ sinh thái toàn diện giúp việc quản lý homestay trở nên nhẹ nhàng và hiệu quả hơn bao giờ hết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOST_BENEFITS.map((b, i) => (
              <div key={i} className="bg-white p-7 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-sm transition flex gap-5">
                <span className="text-3xl p-3 bg-blue-50 rounded-2xl h-fit">{b.icon}</span>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-gray-900 text-base">{b.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Step Onboarding */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
              Quy Trình Gia Nhập 4 Bước Đơn Giản
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Chỉ mất chưa đầy 10 phút để đưa homestay của bạn lên sóng và sẵn sàng chào đón vị khách đầu tiên.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ONBOARDING_STEPS.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-4">
                <span className="text-3xl font-black text-blue-600 font-mono">{s.step}</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleStartHosting}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
            >
              Bắt đầu đăng ký ngay hôm nay
            </button>
          </div>
        </div>

        {/* FAQs for Hosts */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
              Câu Hỏi Thường Gặp Của Chủ Nhà
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Những thắc mắc phổ biến nhất khi hợp tác cùng nền tảng HomeStay
            </p>
          </div>

          <div className="space-y-3">
            {HOST_FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left font-semibold text-gray-800 text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-blue-600 text-lg">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostPartners;
