import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className=' bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <Link to="/">
                      <img src={assets.logo} alt="logo" className='invert mb-3 h-8 md:h-9 cursor-pointer' />
                    </Link>
                    <p className='text-sm leading-relaxed'>
                        Khám phá những điểm dừng chân tuyệt vời nhất, từ những homestay thơ mộng đến các biệt thự nghỉ dưỡng sang trọng.
                    </p>
                    <div className='flex items-center gap-3 mt-4'>
                        {/* Instagram */}
                        <img src={assets.instagramIcon} alt="instagram" className='w-6'/>
                        {/* Facebook */}
                        <img src={assets.facebookIcon} alt="facebook" className='w-6'/>
                        {/* Twitter */}
                        <img src={assets.twitterIcon} alt="twitter" className='w-6'/>
                        {/* LinkedIn */}
                        <img src={assets.linkendinIcon} alt="linkedIn" />
                    </div>
                </div>

                <div>
                    <p className=' font-playfair text-lg text-gray-800 font-bold'>VỀ CHÚNG TÔI</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><Link to="/about" className="hover:text-blue-600 transition">Giới thiệu</Link></li>
                        <li><Link to="/experience" className="hover:text-blue-600 transition">Trải nghiệm</Link></li>
                        <li><Link to="/rooms" className="hover:text-blue-600 transition">Danh sách phòng</Link></li>
                        <li><Link to="/blog" className="hover:text-blue-600 transition">Tin tức & Blog</Link></li>
                        <li><Link to="/host-partners" className="hover:text-blue-600 transition">Đối tác chủ nhà</Link></li>
                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800 font-bold'>HỖ TRỢ KHÁCH HÀNG</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><Link to="/help-center" className="hover:text-blue-600 transition">Trung tâm trợ giúp</Link></li>
                        <li><Link to="/privacy-policy" className="hover:text-blue-600 transition">Chính sách bảo mật</Link></li>
                        <li><Link to="/cancellation-policy" className="hover:text-blue-600 transition">Quy định hủy phòng</Link></li>
                        <li><Link to="/contact" className="hover:text-blue-600 transition">Liên hệ hỗ trợ</Link></li>
                        <li><Link to="/community-guidelines" className="hover:text-blue-600 transition">Tiêu chuẩn cộng đồng</Link></li>
                    </ul>
                </div>

            </div>
            <hr className='border-gray-300 mt-8' />
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5 text-xs text-gray-500'>
                <p>© {new Date().getFullYear()} HomeStay. Bảo lưu mọi quyền.</p>
                <p> Hệ thống đặt phòng Homestay trực tuyến </p>
            </div>
        </div>
  )
}

export default Footer
