import axios from 'axios';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthModal from '../components/AuthModal.jsx';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || '$';
    const navigate = useNavigate();

    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [showHotelRegistration, setShowHotelRegistration] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [cities, setCities] = useState([]);
    const [amenities, setAmenities] = useState([]);

    // Open Login / Register Modal
    const openLoginModal = () => setShowAuthModal(true);
    const closeLoginModal = () => setShowAuthModal(false);

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
                return { success: true };
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
    const register = async (username, email, password, role = 'user') => {
        try {
            const { data } = await axios.post('/api/auth/register', { username, email, password, role });
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
                toast.error('Failed to load rooms: ' + error.message);
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

    // Test/Demo helper: become Admin
    const becomeAdmin = async () => {
        try {
            const currentToken = await getToken();
            const { data } = await axios.post('/api/user/make-me-admin', {}, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            if (data.success) {
                setIsAdmin(true);
                setUserRole('admin');
                if (user) {
                    const updated = { ...user, role: 'admin' };
                    setUser(updated);
                    localStorage.setItem('user', JSON.stringify(updated));
                }
                toast.success('Bạn đã được cấp quyền Quản trị viên (Admin)!');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchCategories();
        fetchCurrentUser();
    }, []);

    const value = {
        currency,
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
        becomeAdmin,
        toast,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            <AuthModal isOpen={showAuthModal} onClose={closeLoginModal} />
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
