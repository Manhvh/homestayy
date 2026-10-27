import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const { axios, getToken, fetchCategories: refreshGlobalCategories } = useAppContext();
    const [activeTab, setActiveTab] = useState('amenity');
    const [amenities, setAmenities] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs for new item
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadCategories = async () => {
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
    };

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
            toast.error(error.message);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const currentList = activeTab === 'amenity' ? amenities : cities;

    return (
        <div className="max-w-5xl space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Quản Lý Danh Mục (Tiện Ích & Khu Vực)"
                subTitle="Thiết lập danh mục các dịch vụ tiện ích của homestay và danh sách các tỉnh thành / điểm đến du lịch trên toàn quốc."
            />

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('amenity')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition ${
                        activeTab === 'amenity'
                            ? 'border-purple-600 text-purple-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    🛁 Danh mục Tiện ích ({amenities.length})
                </button>
                <button
                    onClick={() => setActiveTab('city')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition ${
                        activeTab === 'city'
                            ? 'border-purple-600 text-purple-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    📍 Danh mục Khu vực / Thành phố ({cities.length})
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
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                    {submitting ? "Đang thêm..." : "+ Thêm mới"}
                </button>
            </form>

            {/* List */}
            {loading ? (
                <div className="py-12 text-gray-500">Đang tải danh mục...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {currentList.map((item) => (
                        <div key={item._id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{item.description || "Không có mô tả"}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(item._id)}
                                title="Xóa danh mục"
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
