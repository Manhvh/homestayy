import React, { useEffect, useState, useMemo } from 'react';
import Title from './Title';
import { assets, exclusiveOffers } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ExclusiveOffer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [offersList, setOffersList] = useState(exclusiveOffers);

  const { axios } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const fetchPublicOffers = async () => {
      try {
        const { data } = await axios.get('/api/offers');
        if (data.success && data.offers && data.offers.length > 0) {
          setOffersList(data.offers);
        }
      } catch (err) {
        console.warn('Using default exclusive offers fallback:', err.message);
      }
    };
    fetchPublicOffers();
  }, [axios]);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'summer', label: 'Mùa hè' },
    { id: 'couple', label: 'Cặp đôi' },
    { id: 'early', label: 'Đặt sớm' },
    { id: 'weekend', label: 'Cuối tuần' },
    { id: 'longstay', label: 'Dài ngày' },
  ];

  // Helper to format terms array
  const getTermsList = (rawTerms) => {
    if (!rawTerms) return [];
    if (Array.isArray(rawTerms)) return rawTerms;
    if (typeof rawTerms === 'string') {
      try {
        const parsed = JSON.parse(rawTerms);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return rawTerms.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Helper for image url
  const getOfferImage = (img) => {
    if (!img) return assets.exclusiveOfferCardImg1;
    if (img.startsWith('/uploads')) {
      const base = axios.defaults.baseURL || 'http://localhost:4000';
      return `${base}${img}`;
    }
    return img;
  };

  // Filter offers based on category
  const filteredOffers = useMemo(() => {
    if (selectedCategory === 'all') {
      return offersList;
    }
    return offersList.filter(
      (item) => item.category === selectedCategory || item.category === 'all'
    );
  }, [selectedCategory, offersList]);

  // Offers to display (top 3 by default if not showAll and category is 'all')
  const displayedOffers = useMemo(() => {
    if (showAll || selectedCategory !== 'all') {
      return filteredOffers;
    }
    return filteredOffers.slice(0, 3);
  }, [filteredOffers, showAll, selectedCategory]);

  // Copy promo code helper
  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}! Dùng khi đặt phòng.`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Navigate to rooms with discount
  const handleApplyOffer = (offer) => {
    setSelectedOffer(null);
    navigate(`/rooms?discountCode=${offer.code}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-50 py-20 border-t border-gray-100">
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full mb-10 gap-6">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Title
              align="left"
              title="Ưu Đãi Độc Quyền"
              subTitle="Tận hưởng các chương trình ưu đãi đặc quyền, mã giảm giá du lịch và các gói combo homestay hấp dẫn nhất dành cho bạn."
            />
          </div>

          <button
            onClick={() => {
              if (selectedCategory !== 'all') {
                setSelectedCategory('all');
                setShowAll(true);
              } else {
                setShowAll(!showAll);
              }
            }}
            className={`group flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm text-sm whitespace-nowrap self-start md:self-auto ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <span>{showAll && selectedCategory === 'all' ? 'Thu gọn ưu đãi' : 'Xem tất cả ưu đãi'}</span>
            <img
              src={assets.arrowIcon}
              alt="arrow-icon"
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                showAll && selectedCategory === 'all' ? '-rotate-90' : 'group-hover:translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Offer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {displayedOffers.map((item, index) => {
            const offerImg = getOfferImage(item.image);
            return (
              <div
                key={item.id || item._id}
                onClick={() => setSelectedOffer(item)}
                className={`group relative overflow-hidden rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer bg-white border border-gray-100 flex flex-col justify-between ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Card Image Cover */}
                <div
                  className="relative h-72 bg-no-repeat bg-cover bg-center overflow-hidden"
                  style={{ backgroundImage: `url(${offerImg})` }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2">
                    <span className="px-3.5 py-1.5 bg-white/95 text-gray-900 font-extrabold text-xs rounded-full shadow-md backdrop-blur-xs uppercase tracking-wider">
                      GIẢM {item.priceOff}%
                    </span>
                    {item.badge && (
                      <span className="px-3 py-1 bg-red-600/90 text-white font-bold text-[11px] rounded-full shadow-md backdrop-blur-xs tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Content inside Image Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                    <h3 className="text-xl font-bold font-playfair tracking-tight leading-snug group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-200 text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Bar & Voucher Code */}
                <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-3.5">
                  {/* Code Pill & 1-Click Copy */}
                  <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/60 rounded-xl px-3.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-blue-900 uppercase">Mã:</span>
                      <span className="font-mono font-bold text-blue-700 text-sm tracking-wider">
                        {item.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, item.code)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedCode === item.code ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Expiry & CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-gray-400">
                      Hạn: <span className="text-gray-600 font-medium">{item.expiryDate ? item.expiryDate.split('T')[0] : '--'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffer(item);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* POPUP: CHI TIẾT ƯU ĐÃI ĐỘC QUYỀN (OFFER DETAIL MODAL)           */}
      {/* ============================================================== */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Cover Image */}
            <div
              className="relative h-56 bg-no-repeat bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${getOfferImage(selectedOffer.image)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/50 to-transparent"></div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs font-bold text-sm"
              >
                ✕
              </button>

              {/* Discount Pill */}
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 bg-white text-gray-950 font-extrabold text-xs rounded-full shadow-lg">
                  GIẢM {selectedOffer.priceOff}%
                </span>
              </div>

              {/* Title inside cover */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h3 className="text-2xl font-bold font-playfair tracking-tight">
                  {selectedOffer.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Thời hạn ưu đãi: Đến ngày {selectedOffer.expiryDate ? selectedOffer.expiryDate.split('T')[0] : '--'}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedOffer.description}
              </p>

              {/* Code Box with Copy */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-blue-900 font-semibold uppercase tracking-wider">
                    Mã giảm giá độc quyền
                  </p>
                  <p className="font-mono text-xl font-extrabold text-blue-600 tracking-wider mt-0.5">
                    {selectedOffer.code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, selectedOffer.code)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  {copiedCode === selectedOffer.code ? 'Đã sao chép' : 'Sao chép mã'}
                </button>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Điều kiện & Quyền lợi áp dụng
                </h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  {getTermsList(selectedOffer.terms).map((term, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleApplyOffer(selectedOffer)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Khám phá phòng áp dụng</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusiveOffer;
