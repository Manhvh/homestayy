import axios from 'axios';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const savedUser = (() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
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
    const [rooms, setRooms] = useState([]);
    const [cities, setCities] = useState([]);
    const [amenities, setAmenities] = useState([]);

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
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            if (data.success) {
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
                toast.error(data.message || 'Đăng nhập thất bại.');
                return { success: false, message: data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Lỗi đăng nhập.';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    // Native Register
    const register = async (username, email, password, role = 'user', phone = '') => {
        try {
            const { data } = await axios.post('/api/auth/register', { username, email, password, role, phone });
            if (data.success) {
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
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            setUser(null);
            setIsOwner(false);
            setIsAdmin(false);
            setUserRole('user');
            return;
        }

        try {
            const { data } = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${savedToken}` }
            });

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
            console.log('Auth check error:', error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken('');
                setUser(null);
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
        logout,
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
