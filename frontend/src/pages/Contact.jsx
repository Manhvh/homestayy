import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CONTACT_INFO = [
  {
    icon: "📞",
    title: "Hotline Hỗ Trợ 24/7",
    desc: "Hỗ trợ khẩn cấp mọi lúc, mọi nơi",
    details: ["1900 6868 (Miễn phí cước)", "024 7300 8888 (Văn phòng)"],
    action: "tel:19006868",
    actionLabel: "Gọi ngay"
  },
  {
    icon: "✉️",
    title: "Email Chăm Sóc Khách Hàng",
    desc: "Tiếp nhận phản hồi và xử lý khiếu nại",
    details: ["support@homestay.vn", "partner@homestay.vn"],
    action: "mailto:support@homestay.vn",
    actionLabel: "Gửi email"
  },
  {
    icon: "🏢",
    title: "Văn Phòng Trụ Sở",
    desc: "Đón tiếp đối tác và khách hàng trực tiếp",
    details: ["Tầng 8, Tòa nhà Innovation", "Phố Duy Tân, Cầu Giấy, Hà Nội"],
    action: "https://maps.google.com",
    actionLabel: "Xem bản đồ"
  },
  {
    icon: "⏰",
    title: "Thời Gian Làm Việc",
    desc: "Khung giờ phục vụ chu đáo",
    details: ["Văn phòng: Thứ 2 - Thứ 7 (8h30 - 18h00)", "Tổng đài CSKH: 24/7 cả ngày lễ"],
    action: null,
    actionLabel: null
  }
];

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bookingCode: "",
    topic: "Hỗ trợ đặt phòng",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên của bạn!");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn!");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Gửi yêu cầu hỗ trợ thành công! Đội ngũ HomeStay sẽ liên hệ với bạn trong vòng 2 giờ.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        bookingCode: "",
        topic: "Hỗ trợ đặt phòng",
        message: ""
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Kết Nối Nhanh Chóng
          </span>
          <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-gray-900 leading-tight">
            Liên Hệ Với Đội Ngũ HomeStay
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm">
            Chúng tôi luôn lắng nghe và sẵn sàng giải đáp mọi thắc mắc của bạn về kỳ nghỉ, thủ tục đặt phòng hoặc hợp tác phát triển homestay.
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition">
              <div className="space-y-2">
                <span className="text-3xl p-2.5 bg-blue-50 rounded-xl inline-block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                <p className="text-gray-400 text-[11px]">{item.desc}</p>
                <div className="space-y-0.5 pt-1 text-xs font-semibold text-gray-700">
                  {item.details.map((d, dIdx) => (
                    <p key={dIdx}>{d}</p>
                  ))}
                </div>
              </div>
              {item.action && (
                <a
                  href={item.action}
                  target={item.action.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                >
                  {item.actionLabel} →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Form and Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Support Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-playfair text-gray-900">
                Gửi Tin Nhắn Cho Chúng Tôi
              </h2>
              <p className="text-gray-500 text-xs">
                Điền đầy đủ thông tin bên dưới, chuyên viên hỗ trợ sẽ phản hồi bạn qua điện thoại hoặc email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Mã đơn đặt phòng (Nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: bk123456"
                    value={formData.bookingCode}
                    onChange={(e) => setFormData({ ...formData, bookingCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Chủ đề cần hỗ trợ</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Hỗ trợ đặt phòng">Hỗ trợ đặt phòng & kiểm tra tình trạng</option>
                  <option value="Hủy phòng & Hoàn tiền">Hủy phòng & Hoàn tiền</option>
                  <option value="Hợp tác chủ nhà">Hợp tác trở thành Chủ homestay</option>
                  <option value="Khiếu nại chất lượng dịch vụ">Khiếu nại chất lượng dịch vụ</option>
                  <option value="Vấn đề tài khoản">Vấn đề tài khoản & mật khẩu</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Vui lòng mô tả chi tiết yêu cầu hoặc sự cố bạn gặp phải..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
              >
                {submitting ? "Đang gửi yêu cầu..." : "Gửi tin nhắn ngay →"}
              </button>
            </form>
          </div>

          {/* Office Showcase & Quick Guide */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white space-y-4 shadow-sm flex-1">
              <span className="bg-blue-500/30 text-blue-200 text-[11px] font-semibold px-3 py-1 rounded-full">
                Cam Kết Dịch Vụ
              </span>
              <h3 className="text-xl sm:text-2xl font-playfair font-bold">
                HomeStay Customer Care
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                Đội ngũ chăm sóc khách hàng của chúng tôi được đào tạo bài bản, tận tâm và cam kết giải quyết mọi vấn đề của bạn trong thời gian nhanh nhất:
              </p>
              <ul className="space-y-2 text-xs text-gray-200">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Phản hồi điện thoại dưới 3 hồi chuông.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Phản hồi email hỗ trợ trong tối đa 2 giờ.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Trung thực, minh bạch và đặt quyền lợi của khách hàng lên hàng đầu.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">Câu hỏi nhanh?</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                Bạn có thể tự tra cứu câu trả lời ngay lập tức trong mục câu hỏi thường gặp tại Trung tâm trợ giúp.
              </p>
              <Link
                to="/help-center"
                className="inline-block text-xs font-bold text-blue-600 hover:underline"
              >
                Đến Trung tâm trợ giúp →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
