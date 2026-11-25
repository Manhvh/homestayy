import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import { useAppContext } from '../../context/AppContext';
import { getAvatarUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const AdminUsers = () => {
    const { axios, getToken, user: currentUser } = useAppContext();
    const currentUserId = String(currentUser?.id || currentUser?._id || '');
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
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
    }, [axios, getToken]);

    const handleRoleChange = async (userId, newRole) => {
        if (String(userId) === currentUserId && newRole !== 'admin') {
            toast.error("Bạn không thể tự hạ quyền quản trị viên của chính mình.");
            return;
        }
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
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleToggleBlock = async (userId) => {
        if (String(userId) === currentUserId) {
            toast.error("Bạn không thể tự khóa tài khoản quản trị viên của chính mình.");
            return;
        }
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
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => users.filter(u => {
        const kw = searchTerm.trim().toLowerCase();
        if (kw && !u.username?.toLowerCase().includes(kw) && !u.email?.toLowerCase().includes(kw)) {
            return false;
        }
        if (filterRole !== 'all' && u.role !== filterRole) return false;
        if (filterStatus === 'active' && u.isBlocked) return false;
        if (filterStatus === 'blocked' && !u.isBlocked) return false;
        return true;
    }), [users, searchTerm, filterRole, filterStatus]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, filterStatus]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredUsers, currentPage]);

    return (
        <div className="w-full space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Quản Lý Người Dùng"
                subTitle="Theo dõi danh sách toàn bộ tài khoản khách hàng, chủ nhà và quản trị viên; phân quyền vai trò và xử lý tài khoản vi phạm."
            />

            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email người dùng..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-72 border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="user">Khách hàng</option>
                        <option value="hotelOwner">Chủ homestay</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="blocked">Đã khóa</option>
                    </select>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    Tổng cộng: <strong>{filteredUsers.length}</strong> người dùng
                </span>
            </div>

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải danh sách người dùng...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                                <tr>
                                    <th className="py-3 px-4">Người dùng</th>
                                    <th className="py-3 px-4">Email / SĐT</th>
                                    <th className="py-3 px-4 text-center">Vai trò</th>
                                    <th className="py-3 px-4 text-center">Đơn đã đặt</th>
                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                    <th className="py-3 px-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.map((user) => {
                                    const userId = user.id || user._id;
                                    const isSelf = String(userId) === currentUserId;
                                    return (
                                        <tr key={userId} className={`transition-colors ${isSelf ? 'bg-purple-50/40' : 'hover:bg-gray-50'}`}>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt="avatar"
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-semibold text-gray-900">{user.username}</p>
                                                            {isSelf && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-700 border border-purple-200">
                                                                    Bạn
                                                                </span>
                                                            )}
                                                        </div>
                                                        {user.hotel && (
                                                            <span className="text-[10px] text-blue-600 font-medium">
                                                                Chủ homestay: {user.hotel.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 text-xs">
                                                <p className="font-medium text-gray-800">{user.email}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    SĐT: <span className={user.phone ? "text-blue-600 font-medium" : "text-gray-400"}>{user.phone || "Chưa cập nhật"}</span>
                                                </p>
                                            </td>

                                            <td className="py-3 px-4 text-center">
                                                <select
                                                    value={user.role}
                                                    disabled={isSelf}
                                                    title={isSelf ? "Không thể tự thay đổi vai trò của chính mình" : "Thay đổi vai trò"}
                                                    onChange={e => handleRoleChange(userId, e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <option value="user">Khách hàng</option>
                                                    <option value="hotelOwner">Chủ homestay</option>
                                                    <option value="admin">Admin</option>
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
                                                {isSelf ? (
                                                    <span
                                                        className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                                        title="Không thể tự khóa tài khoản của chính mình"
                                                    >
                                                        Tài khoản hiện tại
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleBlock(userId)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                            user.isBlocked
                                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                                : "border border-red-200 text-red-600 hover:bg-red-50"
                                                        }`}
                                                    >
                                                        {user.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length > 0 && (
                        <div className="px-4 pb-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredUsers.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
