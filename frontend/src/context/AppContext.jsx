import axios from 'axios';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthModal from '../components/AuthModal.jsx';
import ProfileModal from '../components/ProfileModal.jsx';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || 'VNĐ';
    const formatCurrency = (val) => `${Number(val || 0).toLocaleString('vi-VN')} ${currency}`;
    const navigate = useNavigate();
    const authSessionRef = useRef(0);

    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const savedUser = (() => {
        try {
            const savedToken = localStorage.getItem('token');
            const saved = localStorage.getItem('user');
            return savedToken && saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    })();

    const [user, setUser] = useState(savedUser);
    const [isOwner, setIsOwner] = useState(() => savedUser?.role === 'hotelOwner');
    const [isAdmin, setIsAdmin] = useState(() => savedUser?.role === 'admin');
    const [userRole, setUserRole] = useState(() => savedUser?.role || 'user');
    const [showHotelRegistration, setShowHotelRegistration] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [searchDates, setSearchDatesState] = useState(() => {
        try {
            const saved = sessionStorage.getItem('homestay_search_dates');
            return saved ? JSON.parse(saved) : { checkIn: '', checkOut: '', guests: 2 };
        } catch {
            return { checkIn: '', checkOut: '', guests: 2 };
        }
    });

    const setSearchDates = useCallback((updater) => {
        setSearchDatesState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
            try {
                sessionStorage.setItem('homestay_search_dates', JSON.stringify(next));
            } catch {
                // ignore storage error
            }
            return next;
        });
    }, []);

    const [rooms, setRooms] = useState([]);
    const [cities, setCities] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [favoriteRoomIds, setFavoriteRoomIds] = useState(() => {
        try {
            const saved = localStorage.getItem('homestay_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const toggleFavoriteRoom = useCallback((roomId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const idStr = String(roomId);
        const exists = favoriteRoomIds.includes(idStr);
        const next = exists
            ? favoriteRoomIds.filter((item) => item !== idStr)
            : [...favoriteRoomIds, idStr];
        setFavoriteRoomIds(next);
        localStorage.setItem('homestay_favorites', JSON.stringify(next));
        toast.success(
            exists
                ? 'Đã bỏ lưu khỏi danh sách yêu thích'
                : 'Đã lưu vào danh sách phòng yêu thích!'
        );
    }, [favoriteRoomIds]);

    const isFavoriteRoom = useCallback((roomId) => {
        return favoriteRoomIds.includes(String(roomId));
    }, [favoriteRoomIds]);

    // Open Login / Register Modal
    const openLoginModal = () => setShowAuthModal(true);
    const closeLoginModal = () => setShowAuthModal(false);

    // Open / Close Profile Modal
    const openProfileModal = () => setShowProfileModal(true);
    const closeProfileModal = () => setShowProfileModal(false);

    // Provide token for API calls
    const getToken = useCallback(async () => {
        return token || localStorage.getItem('token') || '';
    }, [token]);

    // Native Login
    const login = async (email, password) => {
        authSessionRef.current += 1;
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            if (data.success && data.token && data.user) {
                setToken(data.token);
                setUser(data.user);
                setUserRole(data.user.role || 'user');
                setIsOwner(data.user.role === 'hotelOwner');
                setIsAdmin(data.user.role === 'admin');
                setSearchedCities(data.user.recentSearchedCities || []);

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                toast.success(data.message || 'Đăng nhập thành công!');

                if (data.user.role === 'admin') {
                    navigate('/admin');
                }

                return { success: true, role: data.user.role };
            } else {
                setToken('');
                setUser(null);
                setUserRole('user');
                setIsOwner(false);
                setIsAdmin(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error(data.message || 'Đăng nhập thất bại.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            setToken('');
            setUser(null);
            setUserRole('user');
            setIsOwner(false);
            setIsAdmin(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const msg = error.response?.data?.message || error.message || 'Lỗi đăng nhập.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Request verification code before registering
    const sendVerifyCode = async (email, username = '') => {
        try {
            const { data } = await axios.post('/api/auth/send-verify-code', { email, username });
            if (data.success) {
                toast.success(data.message || 'Đã gửi mã xác thực!');
                return { success: true, verifyCode: data.verifyCode, mailSent: data.mailSent };
            } else {
                toast.error(data.message || 'Không thể gửi mã xác thực.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi gửi mã xác thực.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Native Register
    const register = async (username, email, password, role = 'user', phone = '', codeVerify = '') => {
        authSessionRef.current += 1;
        try {
            const { data } = await axios.post('/api/auth/register', { username, email, password, role, phone, codeVerify });
            if (data.success && data.token && data.user) {
                setToken(data.token);
                setUser(data.user);
                setUserRole(data.user.role || 'user');
                setIsOwner(data.user.role === 'hotelOwner');
                setIsAdmin(data.user.role === 'admin');
                setSearchedCities(data.user.recentSearchedCities || []);

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                toast.success(data.message || 'Đăng ký tài khoản thành công!');
                return { success: true };
            } else {
                toast.error(data.message || 'Đăng ký thất bại.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi đăng ký.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Native Logout
    const logout = () => {
        authSessionRef.current += 1;
        setToken('');
        setUser(null);
        setUserRole('user');
        setIsOwner(false);
        setIsAdmin(false);
        setSearchedCities([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Đã đăng xuất.');
        navigate('/');
    };

    // Function to fetch room details with optional query filters
    const fetchRooms = async (params = {}) => {
        try {
            const { data } = await axios.get('/api/rooms', { params });
            if (data.success) {
                setRooms(data.rooms);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Lỗi khi tải danh sách phòng: ' + error.message);
            }
        }
    };

    // Function to fetch categories (amenities & cities)
    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/categories');
            if (data.success) {
                if (data.cities && data.cities.length > 0) {
                    setCities(data.cities.map(c => c.name));
                }
                if (data.amenities && data.amenities.length > 0) {
                    setAmenities(data.amenities);
                }
            }
        } catch (error) {
            console.log('Categories fetch error:', error.message);
        }
    };

    // Function to synchronize current user details
    const fetchCurrentUser = async () => {
        const sessionAtStart = authSessionRef.current;
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            setUser(null);
            setIsOwner(false);
            setIsAdmin(false);
            setUserRole('user');
            localStorage.removeItem('user');
            return;
        }

        try {
            const { data } = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${savedToken}` }
            });

            // Ignore stale response if user triggered login/register/logout in the meantime
            if (sessionAtStart !== authSessionRef.current) {
                return;
            }

            if (data.success) {
                setUser(data.user);
                setUserRole(data.role || 'user');
                setIsOwner(data.role === 'hotelOwner');
                setIsAdmin(data.role === 'admin');
                setSearchedCities(data.recentSearchedCities || []);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.role === 'admin' && !window.location.pathname.startsWith('/admin')) {
                    navigate('/admin', { replace: true });
                }
            } else {
                logout();
            }
        } catch (error) {
            if (sessionAtStart !== authSessionRef.current) {
                return;
            }
            console.log('Auth check error:', error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken('');
                setUser(null);
                setIsOwner(false);
                setIsAdmin(false);
                setUserRole('user');
            }
        }
    };

    // Update current user profile
    const updateUserProfile = async (formDataOrObject) => {
        try {
            const currentToken = await getToken();
            const isFormData = formDataOrObject instanceof FormData;
            const headers = {
                Authorization: `Bearer ${currentToken}`,
            };
            if (isFormData) {
                headers['Content-Type'] = 'multipart/form-data';
            }
            const { data } = await axios.put('/api/user/profile', formDataOrObject, { headers });
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(data.message || 'Cập nhật thông tin cá nhân thành công!');
                return { success: true, user: data.user };
            } else {
                toast.error(data.message || 'Cập nhật thất bại.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi cập nhật thông tin.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Request password reset code
    const sendResetPasswordCode = async (email) => {
        try {
            const { data } = await axios.post('/api/auth/forgot-password', { email });
            if (data.success) {
                toast.success(data.message || 'Đã gửi mã đặt lại mật khẩu!');
                return { success: true, verifyCode: data.verifyCode, mailSent: data.mailSent };
            } else {
                toast.error(data.message || 'Không thể gửi mã.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi gửi mã đặt lại mật khẩu.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Reset password with code
    const resetPassword = async (email, codeVerify, newPassword) => {
        try {
            const { data } = await axios.post('/api/auth/reset-password', { email, codeVerify, newPassword });
            if (data.success) {
                toast.success(data.message || 'Đặt lại mật khẩu thành công!');
                return { success: true };
            } else {
                toast.error(data.message || 'Không thể đặt lại mật khẩu.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi đặt lại mật khẩu.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Change password for logged in user
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const currentToken = await getToken();
            const { data } = await axios.put(
                '/api/auth/change-password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            if (data.success) {
                toast.success(data.message || 'Đổi mật khẩu thành công!');
                return { success: true };
            } else {
                toast.error(data.message || 'Không thể đổi mật khẩu.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi đổi mật khẩu.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchCategories();
        fetchCurrentUser();
    }, []);

    const value = {
        currency,
        formatCurrency,
        navigate,
        user,
        token,
        getToken,
        login,
        register,
        sendVerifyCode,
        sendResetPasswordCode,
        resetPassword,
        changePassword,
        logout,
        favoriteRoomIds,
        toggleFavoriteRoom,
        isFavoriteRoom,
        openLoginModal,
        closeLoginModal,
        showAuthModal,
        setShowAuthModal,
        openProfileModal,
        closeProfileModal,
        showProfileModal,
        setShowProfileModal,
        updateUserProfile,
        isOwner,
        setIsOwner,
        isAdmin,
        setIsAdmin,
        userRole,
        setUserRole,
        axios,
        showHotelRegistration,
        setShowHotelRegistration,
        searchedCities,
        setSearchedCities,
        searchDates,
        setSearchDates,
        rooms,
        setRooms,
        fetchRooms,
        cities,
        amenities,
        fetchCategories,
        toast,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            <AuthModal isOpen={showAuthModal} onClose={closeLoginModal} />
            <ProfileModal isOpen={showProfileModal} onClose={closeProfileModal} />
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
