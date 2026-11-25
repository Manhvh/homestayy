import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const BLOG_POSTS = [
  {
    id: 1,
    title: "Top 10 Homestay View Đồi Mây Cực Chill Tại Đà Lạt Cho Mùa Thu",
    slug: "top-10-homestay-da-lat-view-doi-may",
    category: "Cẩm nang du lịch",
    date: "08/11/2026",
    readTime: "5 phút đọc",
    author: "Linh San",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Đà Lạt vào thu mang theo tiết trời se lạnh và những buổi sáng bồng bềnh sương khói. Cùng HomeStay khám phá 10 căn homestay săn mây tuyệt đẹp không thể bỏ lỡ.",
    content: [
      "Đà Lạt những ngày cuối thu luôn sở hữu một sức hút kỳ lạ với những tín đồ xê dịch. Khác với sự ồn ào phố thị, trải nghiệm thức giấc giữa lưng chừng đồi, mở rèm cửa là thấy mây luồn qua khung cửa kính mang đến cảm giác an yên khó tả.",
      "Tiêu chí lựa chọn homestay săn mây lý tưởng:",
      "• Vị trí đắc địa: Nằm ở các khu vực như Cầu Đất, Trại Mát hoặc Hoàng Hoa Thám với góc nhìn thung lũng không bị che khuất.",
      "• Không gian ấm cúng: Trang bị hệ thống sưởi, chăn nệm cao cấp cùng ban công uống trà ngắm hoàng hôn.",
      "• Dịch vụ chu đáo: Nhiều homestay có phục vụ cà phê sáng tự pha, bếp nướng BBQ ngoài trời và xe máy cho thuê.",
      "Khi đặt phòng qua HomeStay, bạn luôn được xem trước ảnh chụp thực tế 360 độ và chính sách hủy phòng linh hoạt để hoàn toàn yên tâm trong mọi kế hoạch."
    ]
  },
  {
    id: 2,
    title: "Bí Quyết Đặt Homestay Giá Tốt Và Tránh Bẫy Phòng Không Như Ảnh",
    slug: "bi-quyet-dat-homestay-gia-tot",
    category: "Mẹo đặt phòng",
    date: "05/11/2026",
    readTime: "4 phút đọc",
    author: "Thành Nam",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Làm thế nào để chọn được căn homestay ưng ý, vừa túi tiền mà không gặp cảnh 'ảnh một đằng thực tế một nẻo'? Dưới đây là 5 kinh nghiệm vàng.",
    content: [
      "Việc đặt phòng homestay online mang lại nhiều thuận tiện nhưng cũng tiềm ẩn rủi ro nếu bạn không tìm hiểu kỹ. Dưới đây là các bước giúp bạn luôn chọn được phòng chuẩn xác:",
      "1. Ưu tiên các homestay đã được xác thực (Verified): Trên HomeStay, các homestay gắn nhãn Đã duyệt đều đã được đội ngũ quản trị kiểm duyệt hồ sơ đăng ký kinh doanh và chất lượng cơ sở vật chất.",
      "2. Đọc kỹ đánh giá từ khách thực tế: Chú ý các bình luận chi tiết về áp lực nước, độ cách âm, tốc độ wifi và thái độ phục vụ của chủ nhà.",
      "3. Đặt phòng trước từ 2 - 3 tuần vào mùa cao điểm để hưởng mức giá ưu đãi và giữ được căn có tầm nhìn đẹp nhất.",
      "4. Trao đổi trước với chủ nhà: Nhắn tin hoặc gọi điện kiểm tra chính sách nhận phòng sớm, quy định mang theo thú cưng hoặc phụ thu trẻ em."
    ]
  },
  {
    id: 3,
    title: "Khám Phá Homestay Nhà Vườn Ven Sông Độc Đáo Tại Miền Tây",
    slug: "kham-pha-homestay-nha-vuon-mien-tay",
    category: "Review Homestay",
    date: "01/11/2026",
    readTime: "6 phút đọc",
    author: "Mai Phương",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Tạm rời xa khói bụi thành phố để trở về với sông nước miền Tây, tận hưởng bữa cơm quê mộc mạc và sự đón tiếp nồng hậu của các gia chủ địa phương.",
    content: [
      "Miền Tây sông nước níu chân du khách không chỉ bởi những vườn cây trái trĩu quả mà còn bởi nét đẹp hồn hậu, chân tình của người dân nơi đây.",
      "Mô hình homestay sinh thái tại Cần Thơ, Bến Tre và Vĩnh Long đang ngày càng được đầu tư bài bản nhưng vẫn giữ nguyên vẹn cái hồn quê dân dã: mái lá dừa nước mát rượi, sàn lát gạch bông cổ điển, và võng đung đưa dưới bóng râm rợp mát.",
      "Tại đây, bạn sẽ được tự tay chèo xuồng ba lá len lỏi qua rặng dừa nước, tát mương bắt cá và thưởng thức món cá lóc nướng trui cuốn bánh tráng rau rừng cùng gia chủ. Một trải nghiệm văn hóa bản địa chân thực mà không resort nào có thể thay thế."
    ]
  },
  {
    id: 4,
    title: "Chương Trình Ưu Đãi Mùa Lễ Hội: Giảm Đến 30% Khi Đặt Phòng Sớm",
    slug: "uu-dai-mua-le-hoi-giam-30-phan-tram",
    category: "Ưu đãi & Sự kiện",
    date: "28/10/2026",
    readTime: "3 phút đọc",
    author: "Ban Biên Tập",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Chào đón mùa lễ hội cuối năm, HomeStay tung gói ưu đãi đặc quyền dành cho khách hàng đặt phòng sớm tại Hà Nội, Đà Nẵng, Nha Trang và Phú Quốc.",
    content: [
      "Mùa lễ hội cuối năm đang đến rất gần! Để tri ân hàng triệu du khách đã tin tưởng và đồng hành, HomeStay trân trọng giới thiệu chuỗi ưu đãi đặc biệt:",
      "• Giảm ngay 15% - 30% cho tất cả đơn đặt phòng từ 3 đêm trở lên thực hiện trước ngày 15/12/2026.",
      "• Miễn phí hủy phòng lên đến 48 giờ trước giờ nhận phòng đối với các homestay áp dụng chính sách Linh hoạt.",
      "• Tặng voucher 200.000 VNĐ cho lần đặt phòng tiếp theo khi đánh giá trải nghiệm lưu trú kèm hình ảnh thực tế.",
      "Nhanh tay truy cập mục 'Khách sạn & Phòng' để tìm kiếm và giữ chỗ căn phòng mơ ước cho chuyến đi sắp tới của bạn cùng gia đình!"
    ]
  },
  {
    id: 5,
    title: "Cẩm Nang Du Lịch Sapa: Những Homestay Bản Làng Đậm Sắc Màu Tây Bắc",
    slug: "cam-nang-du-lich-sapa-homestay-tay-bac",
    category: "Cẩm nang du lịch",
    date: "22/10/2026",
    readTime: "5 phút đọc",
    author: "Hoàng Bách",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Ngắm ruộng bậc thang mùa lúa chín hay săn tuyết giữa mây ngàn tại những căn nhà gỗ thông ấm áp ở Tả Van, Bản Hồ, Lao Chải.",
    content: [
      "Rời khỏi trung tâm thị trấn Sapa náo nhiệt, xuôi theo con dốc uốn lượn xuống thung lũng Mường Hoa, bạn sẽ bắt gặp những bản làng bình yên nằm nép mình bên sườn núi.",
      "Các homestay tại đây được xây dựng từ gỗ pơ-mu tự nhiên, mái ngói rêu phong và cửa sổ lớn mở trọn tầm nhìn ra ruộng bậc thang ngút ngàn. Buổi tối, du khách có thể quây quần bên bếp lửa bập bùng, thưởng thức rượu ngô và nghe các điệu khèn truyền thống.",
      "HomeStay hợp tác cùng các chủ nhà người H'Mông, Dao Đỏ để mang đến dịch vụ lưu trú tiện nghi nhưng vẫn gìn giữ vẹn nguyên nét sinh hoạt văn hóa độc đáo của đồng bào vùng cao."
    ]
  },
  {
    id: 6,
    title: "Xu Hướng Nghỉ Dưỡng Staycation: 'Đi Trốn' Ngay Trong Lòng Thành Phố",
    slug: "xu-huong-nghi-duong-staycation",
    category: "Review Homestay",
    date: "15/10/2026",
    readTime: "4 phút đọc",
    author: "Thu Trang",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Không cần di chuyển xa, những căn studio và căn hộ homestay mang phong cách tối giản, vintage ngay trung tâm đang là lựa chọn số 1 cho kỳ nghỉ cuối tuần.",
    content: [
      "Staycation – xu hướng nghỉ dưỡng tại chỗ – đang trở thành phong cách sống được giới trẻ và các gia đình trẻ ưa chuộng. Một kỳ nghỉ 2 ngày 1 đêm trong một căn homestay đầy đủ tiện nghi, có bồn tắm thư giãn, máy chiếu phim mini và bếp xinh để tự nấu ăn là liều thuốc nạp năng lượng tuyệt vời.",
      "Tại Hà Nội và TP. Hồ Chí Minh, HomeStay có hàng trăm lựa chọn homestay boutique tọa lạc ở các khu phố cổ kính hoặc chung cư cao cấp với góc ban công rợp mát cây xanh.",
      "Hãy tự thưởng cho mình một cuối tuần thảnh thơi, tách biệt khỏi bộn bề công việc mà không tốn công di chuyển tàu xe!"
    ]
  }
];

const CATEGORIES = ["Tất cả", "Cẩm nang du lịch", "Mẹo đặt phòng", "Review Homestay", "Ưu đãi & Sự kiện"];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);
  const [emailSub, setEmailSub] = useState("");

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchCat = selectedCategory === "Tất cả" || post.category === selectedCategory;
      const matchSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailSub.trim() || !emailSub.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    toast.success("Đăng ký nhận bản tin thành công! Cảm ơn bạn.");
    setEmailSub("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <span>📰 Tin tức & Cẩm nang</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 leading-tight">
            Góc Du Lịch & Cảm Hứng Nghỉ Dưỡng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Cập nhật những xu hướng homestay mới nhất, kinh nghiệm đặt phòng thông minh và gợi ý điểm đến lý tưởng cho chuyến đi sắp tới của bạn.
          </p>
        </div>

        {/* Featured Hero Article */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 grid grid-cols-1 lg:grid-cols-12 hover:shadow-md transition">
          <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[300px]">
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              ★ Bài viết nổi bật
            </span>
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="text-blue-600 font-semibold">{featuredPost.category}</span>
                <span>•</span>
                <span>{featuredPost.date}</span>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-900 leading-snug hover:text-blue-600 transition cursor-pointer"
                  onClick={() => setActiveArticle(featuredPost)}>
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">Tác giả: <strong>{featuredPost.author}</strong></span>
              <button
                onClick={() => setActiveArticle(featuredPost)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 cursor-pointer"
              >
                Đọc bài viết <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500 text-sm">
            Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-gray-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3
                      onClick={() => setActiveArticle(post)}
                      className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition leading-snug line-clamp-2 cursor-pointer"
                    >
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-4 text-xs">
                  <span className="text-gray-400 text-[11px]">Bởi {post.author}</span>
                  <button
                    onClick={() => setActiveArticle(post)}
                    className="font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-sm cursor-pointer transition"
            >
              ✕
            </button>
            <div className="h-64 sm:h-80 w-full relative">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {activeArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-playfair leading-tight">
                  {activeArticle.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-200">
                  <span>Tác giả: {activeArticle.author}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-gray-700 leading-relaxed text-sm">
              <p className="font-semibold text-gray-900 text-base italic border-l-4 border-blue-600 pl-4 py-1 bg-blue-50/50 rounded-r-lg">
                {activeArticle.excerpt}
              </p>
              {activeArticle.content.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <Link
                  to="/rooms"
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Khám phá homestay ngay
                </Link>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
