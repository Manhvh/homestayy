/**
 * Parse a date string or Date object into a local-timezone midnight Date (YYYY-MM-DD)
 * avoiding UTC offset shift bugs on YYYY-MM-DD / MySQL DATETIME strings.
 */
export const parseLocalDateOnly = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        if (isNaN(value.getTime())) return null;
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const str = String(value).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const formatDateYMD = (value) => {
    const d = parseLocalDateOnly(value);
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

/**
 * Aggregate revenue and booking metrics for the last 6 months (inclusive of current month).
 * Only bookings with status === "confirmed" count toward revenue.
 */
export const buildLast6MonthsRevenue = (bookings = []) => {
    const now = new Date();
    const buckets = [];
    const bucketMap = new Map();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        const key = `${year}-${String(monthNum).padStart(2, "0")}`;
        const bucket = {
            key,
            month: `${String(monthNum).padStart(2, "0")}/${year}`,
            label: `Th${monthNum}/${String(year).slice(-2)}`,
            revenue: 0,
            paidRevenue: 0,
            totalBookings: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
        };
        buckets.push(bucket);
        bucketMap.set(key, bucket);
    }

    for (const b of bookings) {
        const refDate = b.createdAt
            ? new Date(b.createdAt)
            : b.checkInDate
            ? new Date(b.checkInDate)
            : null;
        if (!refDate || isNaN(refDate.getTime())) continue;

        const key = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, "0")}`;
        const bucket = bucketMap.get(key);
        if (!bucket) continue;

        bucket.totalBookings += 1;
        const amount = Number(b.totalPrice) || 0;
        if (b.status === "confirmed") {
            bucket.confirmedBookings += 1;
            bucket.revenue += amount;
            if (b.isPaid) {
                bucket.paidRevenue += amount;
            }
        } else if (b.status === "cancelled") {
            bucket.cancelledBookings += 1;
        }
    }

    return buckets;
};
