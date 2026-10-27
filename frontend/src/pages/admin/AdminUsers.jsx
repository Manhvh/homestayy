import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const { axios, getToken } = useAppContext();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/users/${userId}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Quản Lý Người Dùng & Phân Quyền"
                subTitle="Theo dõi danh sách toàn bộ tài khoản khách hàng, chủ nhà và quản trị viên; phân quyền vai trò và xử lý tài khoản vi phạm."
            />

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên hoặc email người dùng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
                <span className="text-xs text-gray-500">
                    Tổng cộng: <strong>{filteredUsers.length}</strong> người dùng
                </span>
            </div>

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải danh sách người dùng...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                                <tr>
                                    <th className="py-3 px-4">Người dùng</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4 text-center">Vai trò</th>
                                    <th className="py-3 px-4 text-center">Đơn đã đặt</th>
                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                    <th className="py-3 px-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.image}
                                                    alt="avatar"
                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.username}</p>
                                                    {user.hotel && (
                                                        <span className="text-[10px] text-blue-600 font-medium">
                                                            Chủ homestay: {user.hotel.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-gray-600 text-xs">
                                            {user.email}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <select
                                                value={user.role}
                                                onChange={e => handleRoleChange(user._id, e.target.value)}
                                                className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <option value="user">User (Khách)</option>
                                                <option value="hotelOwner">Hotel Owner (Chủ nhà)</option>
                                                <option value="admin">Admin (Quản trị viên)</option>
                                            </select>
                                        </td>

                                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                                            {user.bookingCount || 0}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                user.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                            }`}>
                                                {user.isBlocked ? "Đã khóa" : "Hoạt động"}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleBlock(user._id)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                                    user.isBlocked
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "border border-red-200 text-red-600 hover:bg-red-50"
                                                }`}
                                            >
                                                {user.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
