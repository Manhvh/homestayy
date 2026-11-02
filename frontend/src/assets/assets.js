import logo from './logo.svg'
import searchIcon from './searchIcon.svg'
import userIcon from './userIcon.svg'
import calenderIcon from './calenderIcon.svg'
import locationIcon from './locationIcon.svg'
import starIconFilled from './starIconFilled.svg'
import arrowIcon from './arrowIcon.svg'
import starIconOutlined from './starIconOutlined.svg'
import instagramIcon from './instagramIcon.svg'
import facebookIcon from './facebookIcon.svg'
import twitterIcon from './twitterIcon.svg'
import linkendinIcon from './linkendinIcon.svg'
import freeWifiIcon from './freeWifiIcon.svg'
import freeBreakfastIcon from './freeBreakfastIcon.svg'
import roomServiceIcon from './roomServiceIcon.svg'
import mountainIcon from './mountainIcon.svg'
import poolIcon from './poolIcon.svg'
import homeIcon from './homeIcon.svg'
import closeIcon from './closeIcon.svg'
import locationFilledIcon from './locationFilledIcon.svg'
import heartIcon from './heartIcon.svg'
import badgeIcon from './badgeIcon.svg'
import menuIcon from './menuIcon.svg'
import closeMenu from './closeMenu.svg'
import guestsIcon from './guestsIcon.svg'
import roomImg1 from './roomImg1.png'
import roomImg2 from './roomImg2.png'
import roomImg3 from './roomImg3.png'
import roomImg4 from './roomImg4.png'
import regImage from './regImage.png'
import exclusiveOfferCardImg1 from "./exclusiveOfferCardImg1.png";
import exclusiveOfferCardImg2 from "./exclusiveOfferCardImg2.png";
import exclusiveOfferCardImg3 from "./exclusiveOfferCardImg3.png";
import addIcon from "./addIcon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import listIcon from "./listIcon.svg";
import uploadArea from "./uploadArea.svg";
import totalBookingIcon from "./totalBookingIcon.svg";
import totalRevenueIcon from "./totalRevenueIcon.svg";

export const assets = {
    logo,
    searchIcon,
    userIcon,
    calenderIcon,
    locationIcon,
    starIconFilled,
    arrowIcon,
    starIconOutlined,
    instagramIcon,
    facebookIcon,
    twitterIcon,
    linkendinIcon,
    freeWifiIcon,
    freeBreakfastIcon,
    roomServiceIcon,
    mountainIcon,
    poolIcon,
    closeIcon,
    homeIcon,
    locationFilledIcon,
    heartIcon,
    badgeIcon,
    menuIcon,
    closeMenu,
    guestsIcon,
    regImage,
    addIcon,
    dashboardIcon,
    listIcon,
    uploadArea,
    totalBookingIcon,
    totalRevenueIcon,
}


export const cities = [
    "Đà Lạt",
    "Hà Nội", 
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Nha Trang",
    "Sa Pa",
    "Phú Quốc",
    "Hội An",
    "Vũng Tàu",
    "Ninh Bình",
    "Huế",
    "Quy Nhơn",
    "Hạ Long",
    "Phan Thiết",
    "Cần Thơ"
];

// Exclusive Offers Data
export const exclusiveOffers = [
    {
        _id: 1,
        code: "SUMMER25",
        title: "Gói Nghỉ Dưỡng Mùa Hè",
        description: "Tặng 1 đêm nghỉ dưỡng kèm bữa sáng tự chọn đặc sản địa phương khi đặt phòng homestay từ 2 đêm.",
        priceOff: 25,
        maxDiscount: 500000,
        minNights: 2,
        expiryDate: "31/08/2026",
        badge: "HOT DEAL",
        category: "summer",
        terms: [
            "Giảm trực tiếp 25% tổng tiền phòng (tối đa 500.000 VNĐ).",
            "Áp dụng cho các đơn đặt từ 2 đêm trở lên trong mùa hè này.",
            "Miễn phí bữa sáng tự chọn đặc sản tại homestay.",
            "Cho phép thay đổi lịch đặt trước 48h miễn phí."
        ],
        image: exclusiveOfferCardImg1
    },
    {
        _id: 2,
        code: "ROMANCE20",
        title: "Kỳ Nghỉ Lãng Mạn Cặp Đôi",
        description: "Gói tuần trăng mật đặc biệt bao gồm liệu trình spa thư giãn, hoa tươi và rượu vang chúc mừng.",
        priceOff: 20,
        maxDiscount: 400000,
        minNights: 1,
        expiryDate: "20/09/2026",
        badge: "LÃNG MẠN",
        category: "couple",
        terms: [
            "Giảm 20% cho phòng đôi, phòng Suite hoặc Villa riêng tư (tối đa 400.000 VNĐ).",
            "Tặng set trà chiều bánh ngọt và hoa tươi chào đón tại phòng.",
            "Ưu đãi giảm 30% gói dịch vụ spa & tiệc tối riêng cho 2 người.",
            "Áp dụng cho mọi homestay trên toàn quốc."
        ],
        image: exclusiveOfferCardImg2
    },
    {
        _id: 3,
        code: "EARLYBIRD30",
        title: "Ưu Đãi Đặt Sớm Homestay",
        description: "Đặt trước 14 ngày để nhận mức giá ưu đãi tốt nhất trên toàn hệ thống homestay Việt Nam.",
        priceOff: 30,
        maxDiscount: 600000,
        minNights: 1,
        expiryDate: "25/09/2026",
        badge: "TIẾT KIỆM 30%",
        category: "early",
        terms: [
            "Giảm 30% tổng hóa đơn khi đặt trước ngày nhận phòng tối thiểu 14 ngày (tối đa 600.000 VNĐ).",
            "Áp dụng cho toàn bộ danh mục homestay và khu nghỉ dưỡng.",
            "Hỗ trợ dời ngày lưu trú 1 lần miễn phí trước 7 ngày.",
            "Không áp dụng đồng thời với các voucher ưu đãi khác."
        ],
        image: exclusiveOfferCardImg3
    },
    {
        _id: 4,
        code: "WEEKEND15",
        title: "Cuối Tuần Thảnh Thơi",
        description: "Nạp năng lượng cuối tuần với không gian xanh mát, tiệc nướng BBQ ngoài trời và trà thảo mộc.",
        priceOff: 15,
        maxDiscount: 300000,
        minNights: 1,
        expiryDate: "31/10/2026",
        badge: "CUỐI TUẦN",
        category: "weekend",
        terms: [
            "Giảm 15% tổng tiền phòng (tối đa 300.000 VNĐ) cho các ngày Thứ 6, Thứ 7 hoặc Chủ Nhật.",
            "Miễn phí sử dụng bếp nướng BBQ và khu sinh hoạt chung.",
            "Hỗ trợ nhận phòng sớm hoặc trả phòng muộn đến 14:00 (nếu còn phòng trống)."
        ],
        image: roomImg2
    },
    {
        _id: 5,
        code: "WELCOME10",
        title: "Chào Mừng Khách Hàng Mới",
        description: "Ưu đãi đặc quyền dành riêng cho lần đầu tiên trải nghiệm dịch vụ lưu trú tại HomeStay.",
        priceOff: 10,
        maxDiscount: 200000,
        minNights: 1,
        expiryDate: "31/12/2026",
        badge: "THÀNH VIÊN",
        category: "all",
        terms: [
            "Giảm ngay 10% (tối đa 200.000 VNĐ) cho đơn đặt phòng đầu tiên của tài khoản.",
            "Không yêu cầu số đêm tối thiểu hay giới hạn địa điểm.",
            "Tự động tích lũy điểm thưởng thành viên sau khi check-out."
        ],
        image: roomImg1
    },
    {
        _id: 6,
        code: "LONGSTAY25",
        title: "Lưu Trú Dài Ngày Siêu Tiết Kiệm",
        description: "Trải nghiệm cuộc sống như người bản địa với mức giá ưu đãi khi lưu trú từ 4 đêm trở lên.",
        priceOff: 25,
        maxDiscount: 800000,
        minNights: 4,
        expiryDate: "15/11/2026",
        badge: "DÀI NGÀY",
        category: "longstay",
        terms: [
            "Giảm 25% tổng tiền phòng cho kỳ nghỉ từ 4 đêm trở lên (tối đa 800.000 VNĐ).",
            "Miễn phí dịch vụ giặt ủi đồ cơ bản và dọn phòng định kỳ.",
            "Cung cấp gói hướng dẫn viên bản địa tư vấn lịch trình khám phá địa phương."
        ],
        image: roomImg4
    }
];

// Testimonials Dummy Data
export const testimonials = [
    { id: 1, name: "Nguyễn Minh Tuấn", address: "Hà Nội", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", rating: 5, review: "HomeStay giúp chuyến đi Đà Lạt của gia đình tôi vô cùng trọn vẹn. Homestay đẹp đúng như ảnh, không gian ấm cúng và chủ nhà rất thân thiện!" },
    { id: 2, name: "Trần Thị Mai Anh", address: "TP. Hồ Chí Minh", image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200", rating: 5, review: "Tôi đã trải nghiệm nhiều ứng dụng đặt phòng nhưng HomeStay mang lại sự tiện lợi và tin cậy nhất. Giá cả minh bạch, không phí ẩn." },
    { id: 3, name: "Lê Hoàng Long", address: "Đà Nẵng", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", rating: 5, review: "Dịch vụ tuyệt vời, kiểm tra phòng trống chính xác và nhận phòng cực kỳ nhanh gọn. Chắc chắn tôi sẽ tiếp tục sử dụng HomeStay cho các chuyến đi tới!" }
];

// Facility Icon
export const facilityIcons = {
    "Free WiFi": assets.freeWifiIcon,
    "Free Breakfast": assets.freeBreakfastIcon,
    "Room Service ": assets.roomServiceIcon,
    "Mountain View": assets.mountainIcon,
    "Pool Access": assets.poolIcon,
};

// For Room Details Page
export const roomCommonData = [
    { icon: assets.homeIcon, title: "Không gian sạch sẽ & An toàn", description: "Không gian được dọn dẹp vệ sinh và khử trùng kỹ càng trước mỗi lượt khách." },
    { icon: assets.badgeIcon, title: "Tiêu chuẩn vệ sinh cao cấp", description: "Chủ nhà tuân thủ quy chuẩn vệ sinh và giữ gìn không gian nghỉ ngơi đạt chuẩn." },
    { icon: assets.locationFilledIcon, title: "Vị trí đắc địa & Thuận tiện", description: "Hơn 95% khách lưu trú đánh giá vị trí 5 sao, gần trung tâm và danh lam thắng cảnh." },
    { icon: assets.heartIcon, title: "Nhận phòng nhanh chóng", description: "Thủ tục check-in đơn giản, linh hoạt và được chủ homestay hỗ trợ chu đáo." },
];

// User Dummy Data
export const userDummyData = {
    "_id": "user_2unqyL4diJFP1E3pIBnasc7w8hP",
    "username": "Aditya",
    "email": "user.abinash.das.dev@gmail.com",
    "image": "https://avatars.githubusercontent.com/u/119941550?v=4",
    "role": "hotelOwner",
    "createdAt": "2025-03-25T09:29:16.367Z",
    "updatedAt": "2025-04-10T06:34:48.719Z",
    "__v": 1,
    "recentSearchedCities": [
        "New York"
    ]
}

// Hotel Dummy Data
export const hotelDummyData = {
    "_id": "67f76393197ac559e4089b72",
    "name": "Urbanza Suites",
    "address": "Main Road  123 Street , 23 Colony",
    "contact": "+0123456789",
    "owner": userDummyData,
    "city": "New York",
    "createdAt": "2025-04-10T06:22:11.663Z",
    "updatedAt": "2025-04-10T06:22:11.663Z",
    "__v": 0
}

// Rooms Dummy Data
export const roomsDummyData = [
    {
        "_id": "67f7647c197ac559e4089b96",
        "hotel": hotelDummyData,
        "roomType": "Phòng đôi",
        "pricePerNight": 399000,
        "amenities": ["Room Service", "Mountain View", "Pool Access"],
        "images": [roomImg1, roomImg2, roomImg3, roomImg4],
        "isAvailable": true,
        "createdAt": "2025-04-10T06:26:04.013Z",
        "updatedAt": "2025-04-10T06:26:04.013Z",
        "__v": 0
    },
    {
        "_id": "67f76452197ac559e4089b8e",
        "hotel": hotelDummyData,
        "roomType": "Phòng đôi",
        "pricePerNight": 299000,
        "amenities": ["Room Service", "Mountain View", "Pool Access"],
        "images": [roomImg2, roomImg3, roomImg4, roomImg1],
        "isAvailable": true,
        "createdAt": "2025-04-10T06:25:22.593Z",
        "updatedAt": "2025-04-10T06:25:22.593Z",
        "__v": 0
    },
    {
        "_id": "67f76406197ac559e4089b82",
        "hotel": hotelDummyData,
        "roomType": "Phòng đôi",
        "pricePerNight": 249000,
        "amenities": ["Free WiFi", "Free Breakfast", "Room Service"],
        "images": [roomImg3, roomImg4, roomImg1, roomImg2],
        "isAvailable": true,
        "createdAt": "2025-04-10T06:24:06.285Z",
        "updatedAt": "2025-04-10T06:24:06.285Z",
        "__v": 0
    },
    {
        "_id": "67f763d8197ac559e4089b7a",
        "hotel": hotelDummyData,
        "roomType": "Phòng đơn",
        "pricePerNight": 199000,
        "amenities": ["Free WiFi", "Room Service", "Pool Access"],
        "images": [roomImg4, roomImg1, roomImg2, roomImg3],
        "isAvailable": true,
        "createdAt": "2025-04-10T06:23:20.252Z",
        "updatedAt": "2025-04-10T06:23:20.252Z",
        "__v": 0
    }
]



// User Bookings Dummy Data
export const userBookingsDummyData = [
    {
        "_id": "67f76839994a731e97d3b8ce",
        "user": userDummyData,
        "room": roomsDummyData[1],
        "hotel": hotelDummyData,
        "checkInDate": "2025-04-30T00:00:00.000Z",
        "checkOutDate": "2025-05-01T00:00:00.000Z",
        "totalPrice": 299,
        "guests": 1,
        "status": "pending",
        "paymentMethod": "Stripe",
        "isPaid": true,
        "createdAt": "2025-04-10T06:42:01.529Z",
        "updatedAt": "2025-04-10T06:43:54.520Z",
        "__v": 0
    },
    {
        "_id": "67f76829994a731e97d3b8c3",
        "user": userDummyData,
        "room": roomsDummyData[0],
        "hotel": hotelDummyData,
        "checkInDate": "2025-04-27T00:00:00.000Z",
        "checkOutDate": "2025-04-28T00:00:00.000Z",
        "totalPrice": 399,
        "guests": 1,
        "status": "pending",
        "paymentMethod": "Pay At Hotel",
        "isPaid": false,
        "createdAt": "2025-04-10T06:41:45.873Z",
        "updatedAt": "2025-04-10T06:41:45.873Z",
        "__v": 0
    },
    {
        "_id": "67f76810994a731e97d3b8b4",
        "user": userDummyData,
        "room": roomsDummyData[3],
        "hotel": hotelDummyData,
        "checkInDate": "2025-04-11T00:00:00.000Z",
        "checkOutDate": "2025-04-12T00:00:00.000Z",
        "totalPrice": 199,
        "guests": 1,
        "status": "pending",
        "paymentMethod": "Pay At Hotel",
        "isPaid": false,
        "createdAt": "2025-04-10T06:41:20.501Z",
        "updatedAt": "2025-04-10T06:41:20.501Z",
        "__v": 0
    }
]

// Dashboard Dummy Data
export const dashboardDummyData = {
    "totalBookings": 3,
    "totalRevenue": 897,
    "bookings": userBookingsDummyData
}
