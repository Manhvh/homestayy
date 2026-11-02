import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className=' bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <img src={assets.logo} alt="logo" className='invert mb-3 h-8 md:h-9' />
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
                        <li><a href="/About" className="hover:text-blue-600 transition">Giới thiệu</a></li>
                        <li><a href="/Experience" className="hover:text-blue-600 transition">Trải nghiệm</a></li>
                        <li><a href="/rooms" className="hover:text-blue-600 transition">Danh sách phòng</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Tin tức & Blog</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Đối tác chủ nhà</a></li>
                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800 font-bold'>HỖ TRỢ KHÁCH HÀNG</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#" className="hover:text-blue-600 transition">Trung tâm trợ giúp</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Chính sách bảo mật</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Quy định hủy phòng</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Liên hệ hỗ trợ</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition">Tiêu chuẩn cộng đồng</a></li>
                    </ul>
                </div>

                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800 font-bold'>NHẬN THÔNG TIN MỚI</p>
                    <p className='mt-3 text-sm leading-relaxed'>
                        Đăng ký nhận thông tin khuyến mãi và các ưu đãi homestay mới nhất.
                    </p>
                    <div className='flex items-center mt-4'>
                        <input type="text" className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none text-sm' placeholder='Nhập email của bạn...' />
                        <button className='flex items-center justify-center cursor-pointer bg-blue-600 hover:bg-blue-700 transition h-9 w-9 aspect-square rounded-r'>
                            {/* Arrow icon */}
                            <img src={assets.arrowIcon} alt="arrow-icon" className='  w-3.5 invert'/>
                        </button>
                    </div>
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
