import React, { useState } from "react";
import { Link } from "react-router-dom";

const SECTIONS = [
  { id: "intro", title: "1. Giới thiệu chung" },
  { id: "collection", title: "2. Thu thập dữ liệu cá nhân" },
  { id: "purpose", title: "3. Mục đích sử dụng dữ liệu" },
  { id: "sharing", title: "4. Chia sẻ với bên thứ ba" },
  { id: "security", title: "5. Lưu trữ & An toàn bảo mật" },
  { id: "cookies", title: "6. Cookie & Công nghệ theo dõi" },
  { id: "user-rights", title: "7. Quyền của người dùng" },
  { id: "contact", title: "8. Cập nhật & Thông tin liên hệ" },
];

const DataProtection = () => {
  const [activeSection, setActiveSection] = useState("intro");

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Tài Liệu Pháp Lý & An Toàn
          </span>
          <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-gray-900">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Hiệu lực từ ngày: 01/01/2026 • Cập nhật lần cuối: 10/11/2026
          </p>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table of Contents - Sticky Desktop */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs sticky top-28 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider pb-2 border-b border-gray-100">
              Mục Lục Chính Sách
            </h3>
            <nav className="flex flex-col space-y-1.5 text-xs">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`text-left px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
                    activeSection === sec.id
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500">
              Cần hỗ trợ về quyền riêng tư? Liên hệ:{" "}
              <a href="mailto:privacy@homestay.vn" className="text-blue-600 font-bold hover:underline">
                privacy@homestay.vn
              </a>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-8 text-gray-700 text-xs sm:text-sm leading-relaxed">
            {/* Section 1 */}
            <section id="intro" className="space-y-3 pt-2">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                1. Giới Thiệu Chung
              </h2>
              <p>
                Chào mừng bạn đến với <strong>HomeStay</strong> (gọi tắt là "chúng tôi", "nền tảng"). HomeStay cam kết tôn trọng và bảo vệ tối đa quyền riêng tư cùng dữ liệu cá nhân của mọi du khách và đối tác chủ nhà khi sử dụng dịch vụ của chúng tôi.
              </p>
              <p>
                Chính sách bảo mật này giải thích rõ ràng cách thức chúng tôi thu thập, lưu trữ, sử dụng và bảo đảm an toàn thông tin của bạn khi truy cập website hoặc sử dụng các dịch vụ đặt phòng trực tuyến.
              </p>
            </section>

            {/* Section 2 */}
            <section id="collection" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                2. Thu Thập Dữ Liệu Cá Nhân
              </h2>
              <p>Chúng tôi chỉ thu thập những thông tin thực sự cần thiết nhằm phục vụ cho quy trình đặt phòng và chăm sóc khách hàng, bao gồm:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Thông tin tài khoản:</strong> Họ và tên, địa chỉ email, số điện thoại, mật khẩu mã hóa (hashed) và ảnh đại diện.</li>
                <li><strong>Thông tin đặt phòng:</strong> Ngày nhận phòng, ngày trả phòng, loại phòng đã chọn, số lượng khách, tổng tiền thanh toán và mã đặt phòng (bookingCode).</li>
                <li><strong>Thông tin đối tác chủ nhà:</strong> Tên homestay, địa chỉ chi tiết, thông tin liên lạc kinh doanh và giấy phép đăng ký lưu trú (nếu có).</li>
                <li><strong>Dữ liệu tự động:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành thiết bị và nhật ký tương tác với trang web.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="purpose" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                3. Mục Đích Sử Dụng Dữ Liệu
              </h2>
              <p>Dữ liệu được thu thập được sử dụng cho các mục đích chính đáng sau:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Xác thực tài khoản và gửi email xác nhận đặt phòng, mã đơn hàng.</li>
                <li>Hỗ trợ chủ nhà liên lạc với du khách trước giờ nhận phòng để sắp xếp đón tiếp chu đáo.</li>
                <li>Giải quyết các sự cố phát sinh, xử lý yêu cầu hủy phòng hoặc hoàn tiền theo quy định.</li>
                <li>Nâng cấp chất lượng dịch vụ, tối ưu hóa công cụ tìm kiếm và phòng chống các hành vi gian lận tài khoản.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                4. Chia Sẻ Thông Tin Với Bên Thứ Ba
              </h2>
              <p className="font-semibold text-gray-900">
                HomeStay cam kết KHÔNG bán, cho thuê hay thương mại hóa thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo độc lập.
              </p>
              <p>Thông tin chỉ được chia sẻ trong các phạm vi giới hạn sau:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Chủ homestay được đặt:</strong> Chia sẻ họ tên, số điện thoại của bạn để phục vụ việc liên lạc nhận phòng.</li>
                <li><strong>Cơ quan pháp luật:</strong> Chỉ cung cấp khi có yêu cầu bằng văn bản hợp pháp từ cơ quan nhà nước có thẩm quyền.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="security" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                5. Lưu Trữ & An Toàn Bảo Mật
              </h2>
              <p>
                Toàn bộ dữ liệu mật khẩu được mã hóa an toàn bằng thuật toán mã hóa một chiều (scrypt) trước khi ghi nhận vào cơ sở dữ liệu. Mọi đường truyền dữ liệu giữa trình duyệt của bạn và máy chủ HomeStay đều được bảo vệ bằng giao thức mã hóa HTTPS/SSL tiêu chuẩn cao.
              </p>
              <p>
                Máy chủ lưu trữ được đặt tại các trung tâm dữ liệu bảo mật, có tường lửa giám sát 24/7 và sao lưu định kỳ nhằm ngăn chặn nguy cơ thất thoát dữ liệu.
              </p>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                6. Cookie & Công Nghệ Theo Dõi
              </h2>
              <p>
                Chúng tôi sử dụng Cookie và bộ nhớ cục bộ (LocalStorage) nhằm duy trì trạng thái đăng nhập, ghi nhớ các điểm đến tìm kiếm gần nhất và cải thiện tốc độ tải trang. Bạn hoàn toàn có thể tùy chỉnh hoặc tắt tính năng Cookie trên trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến khả năng duy trì phiên đăng nhập của bạn.
              </p>
            </section>

            {/* Section 7 */}
            <section id="user-rights" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                7. Quyền Của Người Dùng Đối Với Dữ Liệu
              </h2>
              <p>Bạn có toàn quyền thực hiện các thao tác sau đối với dữ liệu của mình:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Truy cập, tra cứu và chỉnh sửa thông tin tài khoản trực tiếp trong mục 'Hồ sơ cá nhân'.</li>
                <li>Yêu cầu sao lưu hoặc đóng tài khoản, xóa vĩnh viễn dữ liệu cá nhân bằng cách gửi email cho bộ phận bảo mật.</li>
                <li>Từ chối nhận các email tiếp thị bất cứ lúc nào thông qua nút 'Hủy đăng ký' ở chân mỗi email.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="contact" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold font-playfair text-gray-900">
                8. Cập Nhật Chính Sách & Thông Tin Liên Hệ
              </h2>
              <p>
                Chính sách bảo mật này có thể được điều chỉnh theo thời gian để phù hợp với quy định pháp luật và sự phát triển của nền tảng. Các thay đổi quan trọng sẽ được thông báo trực tiếp trên website.
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1 text-xs">
                <p><strong>Bộ phận Bảo mật & Dữ liệu HomeStay</strong></p>
                <p>Email: <a href="mailto:privacy@homestay.vn" className="text-blue-600">privacy@homestay.vn</a></p>
                <p>Hotline: 1900 6868</p>
                <p>Địa chỉ: Tòa nhà Innovation, Cầu Giấy, Hà Nội</p>
              </div>
            </section>

            <div className="pt-4 flex justify-between items-center text-xs text-gray-500">
              <Link to="/cancellation-policy" className="text-blue-600 font-semibold hover:underline">
                ← Xem Quy định hủy phòng
              </Link>
              <Link to="/community-guidelines" className="text-blue-600 font-semibold hover:underline">
                Xem Tiêu chuẩn cộng đồng →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProtection;
