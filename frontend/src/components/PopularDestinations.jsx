import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";

const DESTINATION_CATALOG = [
  {
    city: "Đà Lạt",
    subtitle: "Thành phố ngàn hoa & săn mây",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop",
    highlight: "Khí hậu se lạnh quanh năm",
  },
  {
    city: "Đà Nẵng",
    subtitle: "Biển xanh Mỹ Khê & cầu Rồng",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop",
    highlight: "Thiên đường nghỉ dưỡng biển",
  },
  {
    city: "Sa Pa",
    subtitle: "Ruộng bậc thang & bản làng Tây Bắc",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop",
    highlight: "Trải nghiệm văn hóa bản địa",
  },
  {
    city: "Phú Quốc",
    subtitle: "Đảo ngọc hoàng hôn & bungalow biển",
    image:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=1000&auto=format&fit=crop",
    highlight: "Biển đảo nhiệt đới trong xanh",
  },
  {
    city: "Hà Nội",
    subtitle: "Phố cổ nghìn năm & ẩm thực truyền thống",
    image:
      "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?q=80&w=1000&auto=format&fit=crop",
    highlight: "Không gian di sản & văn hóa",
  },
  {
    city: "Hội An",
    subtitle: "Phố cổ đèn lồng & làng gốm ven sông",
    image:
      "https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=1000&auto=format&fit=crop",
    highlight: "Bình yên & cổ kính",
  },
];

const PopularDestinations = () => {
  const { rooms, navigate } = useAppContext();

  const destinationsWithCounts = useMemo(() => {
    return DESTINATION_CATALOG.map((dest) => {
      const count = (rooms || []).filter((r) => {
        const roomCity = (r.hotel?.city || "").toLowerCase();
        const roomAddr = (r.hotel?.address || "").toLowerCase();
        const target = dest.city.toLowerCase();
        return roomCity.includes(target) || roomAddr.includes(target);
      }).length;
      return {
        ...dest,
        roomCount: count,
      };
    });
  }, [rooms]);

  return (
    <section className="py-20 bg-gray-50/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Cảm hứng hành trình
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Khám Phá Theo Điểm Đến
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base max-w-2xl">
              Trải nghiệm không gian sống bản địa ấm cúng cùng những chủ nhà thân thiện tại các tọa độ du lịch được yêu thích nhất Việt Nam.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate("/rooms");
              window.scrollTo(0, 0);
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start md:self-end cursor-pointer"
          >
            <span>Xem tất cả điểm đến</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinationsWithCounts.map((item) => (
            <div
              key={item.city}
              onClick={() => {
                navigate(`/rooms?destination=${encodeURIComponent(item.city)}`);
                window.scrollTo(0, 0);
              }}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200"
            >
              <img
                src={item.image}
                alt={item.city}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {item.highlight}
                </span>
                <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {item.roomCount > 0 ? `Còn phòng` : "Khám phá"}
                </span>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="font-playfair text-2xl font-bold tracking-wide group-hover:text-blue-200 transition-colors">
                  {item.city}
                </h3>
                <p className="text-xs text-gray-200 mt-1 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
