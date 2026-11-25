import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const AdminCategories = () => {
    const { axios, getToken, fetchCategories: refreshGlobalCategories } = useAppContext();
    const [activeTab, setActiveTab] = useState('amenity');
    const [amenities, setAmenities] = useState([]);
    const [cities, setCities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Form inputs for new item
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit Modal state
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [updating, setUpdating] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/categories');
            if (data.success) {
                setAmenities(data.amenities || []);
                setCities(data.cities || []);
            }
        } catch (error) {
            console.error("Load categories error:", error);
            toast.error("Lỗi khi tải danh mục.");
        } finally {
            setLoading(false);
        }
    }, [axios]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setSubmitting(true);
            const token = await getToken();
            const { data } = await axios.post('/api/categories', {
                name: newName.trim(),
                type: activeTab,
                description: newDesc.trim(),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message || "Thêm mới thành công!");
                setNewName('');
                setNewDesc('');
                loadCategories();
                refreshGlobalCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setEditName(item.name || '');
        setEditDesc(item.description || '');
        setEditIcon(item.icon || '');
    };

    const handleCloseEdit = () => {
        if (updating) return;
        setEditingItem(null);
        setEditName('');
        setEditDesc('');
        setEditIcon('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingItem || updating) return;
        if (!editName.trim()) {
            toast.error("Tên danh mục không được để trống.");
            return;
        }

        try {
            setUpdating(true);
            const token = await getToken();
            const itemId = editingItem.id || editingItem._id;
            const { data } = await axios.put(
                `/api/categories/${itemId}`,
                {
                    name: editName.trim(),
                    description: editDesc.trim(),
                    icon: editIcon.trim(),
                    type: editingItem.type || activeTab,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                toast.success(data.message || "Cập nhật danh mục thành công!");
                setEditingItem(null);
                loadCategories();
                refreshGlobalCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi danh mục hệ thống?")) return;

        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                loadCategories();
                refreshGlobalCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const currentList = activeTab === 'amenity' ? amenities : cities;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const paginatedList = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return currentList.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentList, currentPage]);

    return (
        <div className="w-full space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Quản Lý Danh Mục"
                subTitle="Thêm mới, chỉnh sửa và xóa danh mục dịch vụ tiện ích của homestay và danh sách tỉnh thành / điểm đến du lịch trên toàn quốc."
            />

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('amenity')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer ${
                        activeTab === 'amenity'
                            ? 'border-purple-600 text-purple-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Danh mục Tiện ích ({amenities.length})
                </button>
                <button
                    onClick={() => setActiveTab('city')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer ${
                        activeTab === 'city'
                            ? 'border-purple-600 text-purple-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Danh mục Khu vực ({cities.length})
                </button>
            </div>

            {/* Add New Form */}
            <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Tên {activeTab === 'amenity' ? 'tiện ích mới (VD: Bếp BBQ, Bồn tắm massage)' : 'thành phố / khu vực mới (VD: Quy Nhơn, Cát Bà)'}
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tên..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Mô tả ngắn</label>
                    <input
                        type="text"
                        placeholder="Mô tả tóm tắt..."
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                    {submitting ? "Đang thêm..." : "+ Thêm mới"}
                </button>
            </form>

            {/* List */}
            {loading ? (
                <div className="py-12 text-gray-500">Đang tải danh mục...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {paginatedList.map((item) => {
                            const itemId = item.id || item._id;
                            return (
                                <div key={itemId} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description || "Không có mô tả"}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(item)}
                                            title="Sửa danh mục"
                                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(itemId)}
                                            title="Xóa danh mục"
                                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={currentList.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* Edit Category Modal */}
            {editingItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                    onClick={handleCloseEdit}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={handleCloseEdit}
                            disabled={updating}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Chỉnh Sửa Danh Mục
                        </h3>
                        <p className="text-xs text-gray-500 mb-5">
                            Phân loại: <strong>{editingItem.type === 'amenity' ? 'Tiện ích' : 'Khu vực / Tỉnh thành'}</strong>
                        </p>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    rows={3}
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Nhập mô tả..."
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {editingItem.type === 'amenity' && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                                        Mã biểu tượng (Icon - tùy chọn)
                                    </label>
                                    <input
                                        type="text"
                                        value={editIcon}
                                        onChange={(e) => setEditIcon(e.target.value)}
                                        placeholder="VD: wifi, pool, bbq..."
                                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    disabled={updating}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {updating ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
