import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const HELP_TOPICS = [
  {
    id: "booking",
    title: "Đặt Phòng & Nhận Phòng",
    icon: "🧳",
    questions: [
      {
        q: "Làm thế nào để tìm kiếm và đặt phòng trên HomeStay?",
        a: "Bạn chỉ cần nhập điểm đến mong muốn (tỉnh/thành phố hoặc tên homestay), chọn ngày nhận phòng, ngày trả phòng và số lượng khách tại thanh tìm kiếm ở Trang chủ hoặc mục 'Khách sạn & Phòng'. Sau khi chọn được căn phòng ưng ý, bấm 'Xem chi tiết' rồi chọn 'Đặt phòng ngay' để hoàn tất đơn đặt."
      },
      {
        q: "Thời gian nhận phòng (Check-in) và trả phòng (Check-out) là khi nào?",
        a: "Thông thường giờ nhận phòng tiêu chuẩn là từ 14:00 chiều và giờ trả phòng trước 12:00 trưa hôm sau. Tuy nhiên, một số homestay có thể linh hoạt cho phép nhận phòng sớm hoặc trả phòng muộn tùy theo tình trạng phòng trống. Bạn có thể liên hệ trực tiếp số điện thoại của chủ nhà hiển thị trên chi tiết phòng để trao đổi trước."
      },
      {
        q: "Làm sao để biết đơn đặt phòng của tôi đã được xác nhận thành công?",
        a: "Sau khi gửi yêu cầu đặt phòng, bạn sẽ nhận được thông báo trạng thái 'Đang chờ duyệt' hoặc 'Đã duyệt'. Hệ thống sẽ tự động gửi email thông báo chi tiết mã đơn đặt phòng (bookingCode). Bạn cũng có thể kiểm tra trực tiếp bất cứ lúc nào trong mục 'Chuyến đi của tôi' khi đăng nhập tài khoản."
      }
    ]
  },
  {
    id: "payment",
    title: "Thanh Toán & Hóa Đơn",
    icon: "💳",
    questions: [
      {
        q: "HomeStay hỗ trợ những phương thức thanh toán nào?",
        a: "Hiện tại chúng tôi đang chỉ hỗ trợ thanh toán tiền mặt tại quầy lễ tân."
      },
      {
        q: "Giá phòng hiển thị trên website đã bao gồm thuế và phí chưa?",
        a: "Toàn bộ giá phòng niêm yết trên HomeStay là giá trọn gói cơ bản cho số lượng khách tiêu chuẩn của phòng. Nếu bạn có yêu cầu thêm người ngoài sức chứa tiêu chuẩn hoặc sử dụng dịch vụ phụ trợ (bếp BBQ, dịch vụ giặt ủi, thuê xe máy), mức phụ thu sẽ được thỏa thuận trực tiếp cùng chủ nhà."
      },
      {
        q: "Tôi có thể yêu cầu xuất hóa đơn giá trị gia tăng (VAT) không?",
        a: "Đối với khách hàng có nhu cầu xuất hóa đơn VAT cho công ty, vui lòng thông báo cho chủ homestay ngay tại thời điểm đặt phòng hoặc ghi chú thông tin mã số thuế trong đơn để chủ nhà chuẩn bị chứng từ hợp lệ."
      }
    ]
  },
  {
    id: "cancel",
    title: "Hủy Phòng & Hoàn Tiền",
    icon: "🔄",
    questions: [
      {
        q: "Tôi có thể hủy đơn đặt phòng của mình không?",
        a: "Có. Bạn hoàn toàn có thể hủy đơn đặt phòng trong mục 'Chuyến đi của tôi' trước thời điểm nhận phòng. Tùy thuộc vào thời gian bạn bấm hủy so với ngày nhận phòng, mức hoàn tiền sẽ áp dụng theo 'Quy định hủy phòng' cụ thể của từng homestay."
      },
      {
        q: "Thời gian xử lý hoàn tiền là bao lâu?",
        a: "Đối với các đơn đặt đủ điều kiện hoàn tiền, khoản tiền hoàn lại sẽ được hoàn tất chuyển trả vào tài khoản ngân hàng của bạn trong vòng 3 - 5 ngày làm việc kể từ thời điểm yêu cầu hủy được xác nhận."
      },
      {
        q: "Nếu xảy ra thiên tai hoặc hoãn chuyến bay thì có được hoàn 100% không?",
        a: "Trong các trường hợp bất khả kháng (bão lũ, thiên tai, dịch bệnh hoặc hủy chuyến bay có xác nhận của hãng hàng không), HomeStay sẽ hỗ trợ làm việc với chủ nhà để miễn phí hủy 100% hoặc hỗ trợ dời ngày lưu trú miễn phí cho du khách."
      }
    ]
  },
  {
    id: "account",
    title: "Tài Khoản & Bảo Mật",
    icon: "👤",
    questions: [
      {
        q: "Tôi bị quên mật khẩu thì phải làm thế nào?",
        a: "Tại cửa sổ Đăng nhập, bạn bấm vào liên kết 'Quên mật khẩu?'. Nhập địa chỉ email đăng ký tài khoản của bạn, hệ thống sẽ gửi một liên kết hoặc mã OTP để bạn tiến hành đặt lại mật khẩu mới an toàn."
      },
      {
        q: "Làm thế nào để thay đổi họ tên, số điện thoại hoặc ảnh đại diện?",
        a: "Sau khi đăng nhập, bạn nhấp vào biểu tượng ảnh đại diện ở góc phải trên cùng màn hình và chọn 'Hồ sơ cá nhân'. Tại đây bạn có thể cập nhật thông tin cá nhân, số điện thoại liên lạc và tải lên ảnh đại diện mới."
      }
    ]
  }
];

const HelpCenter = () => {
  const [searchKey, setSearchKey] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredTopics = useMemo(() => {
    const kw = searchKey.trim().toLowerCase();
    return HELP_TOPICS.map((topic) => {
      if (activeTab !== "all" && topic.id !== activeTab) {
        return { ...topic, questions: [] };
      }
      const questions = topic.questions.filter((item) => {
        if (!kw) return true;
        return (
          item.q.toLowerCase().includes(kw) ||
          item.a.toLowerCase().includes(kw) ||
          topic.title.toLowerCase().includes(kw)
        );
      });
      return { ...topic, questions };
    }).filter((t) => t.questions.length > 0);
  }, [searchKey, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Search Section */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-lg">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="bg-white/20 text-white text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
              Trung Tâm Hỗ Trợ Khách Hàng
            </span>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold">
              Chúng Tôi Có Thể Giúp Gì Cho Bạn?
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Tìm kiếm nhanh câu trả lời cho các thắc mắc về đặt phòng, thanh toán, chính sách hủy và quyền lợi người dùng.
            </p>
          </div>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Nhập câu hỏi hoặc từ khóa (VD: hủy phòng, đổi ngày, thanh toán...)"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white text-gray-900 text-xs sm:text-sm shadow-md outline-none focus:ring-2 focus:ring-blue-300"
            />
            {searchKey && (
              <button
                onClick={() => setSearchKey("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Tất cả chủ đề
          </button>
          {HELP_TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        {/* Questions List */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500 text-sm space-y-3">
            <p>Không tìm thấy câu trả lời nào phù hợp với từ khóa "{searchKey}".</p>
            <Link
              to="/contact"
              className="inline-block px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Gửi câu hỏi cho đội ngũ hỗ trợ →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                  <span className="text-xl">{topic.icon}</span>
                  <h3 className="font-playfair font-bold text-gray-900 text-lg sm:text-xl">
                    {topic.title}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {topic.questions.map((item, idx) => {
                    const uniqueId = `${topic.id}-${idx}`;
                    const isExpanded = expandedFaq === uniqueId;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs transition"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExpanded ? null : uniqueId)}
                          className="w-full p-4 sm:p-5 text-left font-semibold text-gray-800 text-xs sm:text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                        >
                          <span>{item.q}</span>
                          <span className="text-blue-600 text-base font-bold">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Contact Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900">
              Vẫn Chưa Tìm Thấy Câu Trả Lời?
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Đội ngũ chăm sóc khách hàng của HomeStay luôn sẵn sàng đồng hành cùng bạn 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center space-y-2">
              <span className="text-3xl">📞</span>
              <p className="font-bold text-gray-900 text-sm">Hotline Trực Tiếp</p>
              <p className="text-xs text-gray-500">Hỗ trợ khẩn cấp 24/7</p>
              <a href="tel:19006868" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                1900 6868
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center space-y-2">
              <span className="text-3xl">✉️</span>
              <p className="font-bold text-gray-900 text-sm">Hòm Thư Hỗ Trợ</p>
              <p className="text-xs text-gray-500">Phản hồi trong vòng 2 giờ</p>
              <a href="mailto:support@homestay.vn" className="inline-block text-xs font-bold text-purple-600 hover:underline">
                support@homestay.vn
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-2">
              <span className="text-3xl">💬</span>
              <p className="font-bold text-gray-900 text-sm">Gửi Yêu Cầu Hỗ Trợ</p>
              <p className="text-xs text-gray-500">Gửi biểu mẫu trực tuyến</p>
              <Link to="/contact" className="inline-block text-xs font-bold text-emerald-600 hover:underline">
                Đi đến biểu mẫu liên hệ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
