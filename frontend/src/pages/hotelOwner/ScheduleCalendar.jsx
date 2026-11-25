import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const toDateOnly = (val) => {
    if (!val) return null;
    if (val instanceof Date) {
        return new Date(val.getFullYear(), val.getMonth(), val.getDate());
    }
    const str = String(val).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const toYmdKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const ScheduleCalendar = () => {
    const { axios, getToken, user, currency } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRoom, setFilterRoom] = useState('all');
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'list'
    const [loading, setLoading] = useState(false);

    // Month Calendar Grid states
    const todayDate = useMemo(() => toDateOnly(new Date()), []);
    const [currentMonth, setCurrentMonth] = useState(() => ({
        year: new Date().getFullYear(),
        month: new Date().getMonth(), // 0-indexed
    }));
    const [selectedDayKey, setSelectedDayKey] = useState(() => toYmdKey(new Date()));

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/bookings/hotel', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.dashboardData) {
                setBookings(data.dashboardData.bookings || []);
            }
        } catch (error) {
            console.error("Fetch calendar error:", error);
        } finally {
            setLoading(false);
        }
    }, [axios, getToken]);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user, fetchBookings]);

    // Unique room types for room filter dropdown
    const roomOptions = useMemo(() => {
        const map = new Map();
        bookings.forEach((b) => {
            const rId = b.room?.id || b.roomId;
            const rName = b.room?.roomType || `Phòng #${rId}`;
            if (rId && !map.has(String(rId))) {
                map.set(String(rId), rName);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [bookings]);

    const filtered = useMemo(() => {
        return bookings.filter((b) => {
            if (filterStatus !== 'all' && b.status !== filterStatus) return false;
            if (filterRoom !== 'all' && String(b.room?.id || b.roomId) !== String(filterRoom)) return false;
            return true;
        });
    }, [bookings, filterStatus, filterRoom]);

    // Build calendar cells for currentMonth (Monday-first grid, 6 weeks / 42 or 35 cells)
    const calendarDays = useMemo(() => {
        const { year, month } = currentMonth;
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
        const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const cells = [];

        // Leading days from previous month
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            cells.push({ date: d, key: toYmdKey(d), inCurrentMonth: false });
        }

        // Days in current month
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const d = new Date(year, month, day);
            cells.push({ date: d, key: toYmdKey(d), inCurrentMonth: true });
        }

        // Trailing days from next month to fill full weeks
        while (cells.length % 7 !== 0) {
            const last = cells[cells.length - 1].date;
            const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
            cells.push({ date: d, key: toYmdKey(d), inCurrentMonth: false });
        }

        return cells;
    }, [currentMonth]);

    // Map each date key (YYYY-MM-DD) -> bookings overlapping that date (checkIn <= date < checkOut, or checkIn === date)
    const bookingsByDay = useMemo(() => {
        const map = new Map();
        const visibleStart = calendarDays[0]?.date;
        const visibleEnd = calendarDays[calendarDays.length - 1]?.date;
        if (!visibleStart || !visibleEnd) return map;

        filtered.forEach((b) => {
            const inD = toDateOnly(b.checkInDate);
            const outD = toDateOnly(b.checkOutDate);
            if (!inD || !outD) return;

            // Clamp iteration to visible calendar window
            const iterStart = inD > visibleStart ? new Date(inD) : new Date(visibleStart);
            // A stay covers nights from checkIn up to day before checkOut; also show checkIn if same day
            const lastNight = new Date(outD);
            lastNight.setDate(lastNight.getDate() - 1);
            const effectiveEnd = lastNight >= inD ? lastNight : inD;
            const iterEnd = effectiveEnd < visibleEnd ? new Date(effectiveEnd) : new Date(visibleEnd);

            const cursor = new Date(iterStart);
            while (cursor <= iterEnd) {
                const key = toYmdKey(cursor);
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(b);
                cursor.setDate(cursor.getDate() + 1);
            }
        });

        return map;
    }, [filtered, calendarDays]);

    const selectedDayBookings = useMemo(
        () => bookingsByDay.get(selectedDayKey) || [],
        [bookingsByDay, selectedDayKey]
    );

    const handlePrevMonth = () => {
        setCurrentMonth((prev) => {
            const d = new Date(prev.year, prev.month - 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth((prev) => {
            const d = new Date(prev.year, prev.month + 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };

    const handleGoToday = () => {
        const now = new Date();
        setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() });
        setSelectedDayKey(toYmdKey(now));
    };

    // Group bookings by upcoming, active, and past (for List view)
    const now = new Date();
    const activeStays = filtered.filter((b) => {
        const inDate = new Date(b.checkInDate);
        const outDate = new Date(b.checkOutDate);
        return inDate <= now && outDate >= now && b.status !== 'cancelled';
    });

    const upcomingStays = filtered.filter((b) => {
        const inDate = new Date(b.checkInDate);
        return inDate > now && b.status !== 'cancelled';
    });

    const pastStays = filtered.filter((b) => {
        const outDate = new Date(b.checkOutDate);
        return outDate < now || b.status === 'cancelled';
    });

    const todayKey = toYmdKey(todayDate);
    const monthTitle = `Tháng ${currentMonth.month + 1} / ${currentMonth.year}`;

    return (
        <div className="pb-16 max-w-6xl">
            <Title
                align="left"
                font="outfit"
                title="Theo Dõi Lịch Đặt Phòng"
                subTitle="Quản lý trực quan lịch đặt phòng theo Lịch lưới từng tháng hoặc Danh sách phân nhóm lượt khách đang lưu trú và sắp nhận phòng."
            />

            {/* Top Controls: View Mode Switch + Status & Room Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 my-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="inline-flex bg-gray-100 p-1 rounded-xl mr-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('month')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                viewMode === 'month'
                                    ? 'bg-white text-blue-600 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Lịch lưới theo tháng
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                viewMode === 'list'
                                    ? 'bg-white text-blue-600 shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Danh sách phân nhóm
                        </button>
                    </div>

                    {/* Quick Status Filters */}
                    {['all', 'confirmed', 'pending', 'cancelled'].map((st) => (
                        <button
                            key={st}
                            type="button"
                            onClick={() => setFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                filterStatus === st
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {st === 'all' ? 'Tất cả' : st === 'confirmed' ? 'Đã duyệt' : st === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                        </button>
                    ))}
                </div>

                {/* Room Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Phòng:</label>
                    <select
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả các phòng</option>
                        {roomOptions.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải lịch đặt phòng...</div>
            ) : viewMode === 'month' ? (
                /* ================= MONTH CALENDAR GRID VIEW ================= */
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Calendar Navigation Header */}
                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-700 transition cursor-pointer"
                                    title="Tháng trước"
                                >
                                    ← Trước
                                </button>
                                <h3 className="text-base font-bold text-gray-900 min-w-[140px] text-center">
                                    {monthTitle}
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-700 transition cursor-pointer"
                                    title="Tháng sau"
                                >
                                    Sau →
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleGoToday}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                                Hôm nay
                            </button>
                        </div>

                        {/* Weekday Header */}
                        <div className="grid grid-cols-7 bg-gray-50/70 border-b border-gray-200">
                            {WEEKDAYS.map((wd) => (
                                <div
                                    key={wd}
                                    className="py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                                >
                                    {wd}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Day Cells */}
                        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                            {calendarDays.map((cell) => {
                                const dayBookings = bookingsByDay.get(cell.key) || [];
                                const isToday = cell.key === todayKey;
                                const isSelected = cell.key === selectedDayKey;

                                return (
                                    <div
                                        key={cell.key}
                                        onClick={() => setSelectedDayKey(cell.key)}
                                        className={`min-h-[92px] sm:min-h-[106px] p-1.5 sm:p-2 cursor-pointer transition-colors ${
                                            !cell.inCurrentMonth ? 'bg-gray-50/60 text-gray-400' : 'bg-white'
                                        } ${
                                            isSelected
                                                ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/30'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span
                                                className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                                                    isToday
                                                        ? 'bg-blue-600 text-white'
                                                        : cell.inCurrentMonth
                                                        ? 'text-gray-800'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                {cell.date.getDate()}
                                            </span>
                                            {dayBookings.length > 0 && (
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded-full">
                                                    {dayBookings.length}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            {dayBookings.slice(0, 2).map((b) => {
                                                const chipColor =
                                                    b.status === 'confirmed'
                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                        : b.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                                        : 'bg-rose-100 text-rose-700 border-rose-200 line-through opacity-75';

                                                return (
                                                    <div
                                                        key={b.id || b._id}
                                                        title={`${b.user?.username || 'Khách'} - ${b.room?.roomType || ''}`}
                                                        className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold truncate ${chipColor}`}
                                                    >
                                                        {b.user?.username?.split(' ').slice(-1)[0] || 'Khách'} • {b.room?.roomType || 'Phòng'}
                                                    </div>
                                                );
                                            })}
                                            {dayBookings.length > 2 && (
                                                <p className="text-[10px] font-semibold text-blue-600 pl-1">
                                                    +{dayBookings.length - 2} đơn khác
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
                                Đã duyệt (Confirmed)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
                                Chờ duyệt (Pending)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-rose-200 border border-rose-400" />
                                Đã hủy (Cancelled)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-600" />
                                Hôm nay
                            </span>
                        </div>
                    </div>

                    {/* Selected Day Details Panel */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                Chi tiết lịch ngày
                            </p>
                            <h4 className="text-lg font-bold text-gray-900 mt-0.5">
                                {selectedDayKey
                                    ? new Date(`${selectedDayKey}T00:00:00`).toLocaleDateString('vi-VN', {
                                          weekday: 'long',
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                      })
                                    : ''}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Có <strong>{selectedDayBookings.length}</strong> đơn lưu trú trong ngày này
                            </p>
                        </div>

                        {selectedDayBookings.length === 0 ? (
                            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                                Không có lịch đặt phòng nào vào ngày này.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                {selectedDayBookings.map((b) => (
                                    <div
                                        key={b.id || b._id}
                                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {b.user?.username || 'Khách hàng'}
                                                </p>
                                                <p className="text-blue-600 font-medium">
                                                    {b.room?.roomType || 'Phòng tiêu chuẩn'} • {b.guests || 1} khách
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                                    b.status === 'confirmed'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : b.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {b.status === 'confirmed'
                                                    ? 'Đã duyệt'
                                                    : b.status === 'pending'
                                                    ? 'Chờ duyệt'
                                                    : 'Đã hủy'}
                                            </span>
                                        </div>

                                        <div className="text-gray-600 space-y-0.5 pt-1 border-t border-gray-200/70">
                                            <p>
                                                Mã đơn: <strong className="font-mono">#{b.bookingCode || b.id}</strong>
                                            </p>
                                            {b.user?.phone && <p>SĐT: <strong>{b.user.phone}</strong></p>}
                                            <p>
                                                Nhận / Trả:{' '}
                                                <strong>
                                                    {new Date(b.checkInDate).toLocaleDateString('vi-VN')} →{' '}
                                                    {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}
                                                </strong>
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="font-bold text-gray-900">
                                                    {Number(b.totalPrice).toLocaleString('vi-VN')} {currency}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        b.isPaid
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {b.isPaid ? 'Đã TT VNPay' : b.paymentMethod === 'VNPay' ? 'Chờ TT VNPay' : 'TT tại Homestay'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ================= GROUPED LIST VIEW ================= */
                <div className="space-y-8">
                    {/* Active Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                            <h3 className="font-bold text-gray-900 text-base">Khách đang lưu trú tại homestay ({activeStays.length})</h3>
                        </div>
                        {activeStays.length === 0 ? (
                            <p className="text-xs text-gray-400 bg-white p-4 rounded-xl border border-gray-200">Hiện tại không có phòng nào đang có khách lưu trú.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeStays.map(b => (
                                    <div key={b.id || b._id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{b.user?.username || "Khách hàng"}</p>
                                                <p className="text-xs text-gray-500">{b.room?.roomType} • {b.guests} khách</p>
                                            </div>
                                            <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">Đang ở</span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-600 pt-2 border-t border-green-200 flex justify-between">
                                            <span>Trả phòng: <strong>{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</strong></span>
                                            <span>Tổng: <strong>{Number(b.totalPrice).toLocaleString('vi-VN')} {currency}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                            <h3 className="font-bold text-gray-900 text-base">Khách sắp nhận phòng ({upcomingStays.length})</h3>
                        </div>
                        {upcomingStays.length === 0 ? (
                            <p className="text-xs text-gray-400 bg-white p-4 rounded-xl border border-gray-200">Chưa có lịch nhận phòng sắp tới.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingStays.map(b => (
                                    <div key={b.id || b._id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{b.user?.username || "Khách hàng"}</p>
                                                <p className="text-xs text-gray-500">{b.room?.roomType} • {b.guests} khách</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {b.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-600 pt-2 border-t border-gray-100 flex justify-between">
                                            <span>Nhận phòng: <strong>{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</strong></span>
                                            <span>Trả phòng: <strong>{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past or Cancelled Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                            <h3 className="font-bold text-gray-900 text-base">Lịch sử các chuyến đi trước đây ({pastStays.length})</h3>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-2.5 px-3">Khách hàng</th>
                                        <th className="py-2.5 px-3">Loại phòng</th>
                                        <th className="py-2.5 px-3">Khoảng ngày</th>
                                        <th className="py-2.5 px-3">Doanh thu</th>
                                        <th className="py-2.5 px-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pastStays.slice(0, 15).map(b => (
                                        <tr key={b.id || b._id}>
                                            <td className="py-2 px-3 font-medium">{b.user?.username || "Khách"}</td>
                                            <td className="py-2 px-3">{b.room?.roomType}</td>
                                            <td className="py-2 px-3">{new Date(b.checkInDate).toLocaleDateString('vi-VN')} - {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="py-2 px-3 font-semibold">{Number(b.totalPrice).toLocaleString('vi-VN')} {currency}</td>
                                            <td className="py-2 px-3">
                                                <span className={b.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}>
                                                    {b.status === 'cancelled' ? 'Đã hủy' : 'Hoàn tất'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;
