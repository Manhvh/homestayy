import { parseLocalDateOnly, formatDateYMD } from "./statsUtils.js";

/**
 * Safely parse seasonalPricing JSON or array into a normalized list.
 */
export const normalizeSeasonalPricing = (raw) => {
    if (!raw) return [];
    let list = raw;
    if (typeof raw === "string") {
        try {
            list = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(list)) return [];
    return list
        .filter((s) => s && s.startDate && s.endDate && Number(s.pricePerNight) > 0)
        .map((s) => ({
            name: String(s.name || "Giá theo mùa").trim(),
            startDate: formatDateYMD(s.startDate),
            endDate: formatDateYMD(s.endDate),
            pricePerNight: Number(s.pricePerNight),
        }))
        .filter((s) => Boolean(s.startDate) && Boolean(s.endDate));
};

/**
 * Validate seasonal pricing entries:
 * - startDate <= endDate (allows single-day holiday pricing)
 * - pricePerNight > 0
 * - no overlapping date ranges
 */
export const validateSeasonalPricing = (raw) => {
    if (!raw) return { valid: true, items: [] };
    let list = raw;
    if (typeof raw === "string") {
        try {
            list = JSON.parse(raw);
        } catch {
            return { valid: false, message: "Định dạng bảng giá theo mùa không hợp lệ." };
        }
    }
    if (!Array.isArray(list)) {
        return { valid: false, message: "Bảng giá theo mùa phải là danh sách hợp lệ." };
    }

    const normalized = [];
    for (const item of list) {
        const name = String(item?.name || "").trim();
        const startDate = formatDateYMD(item?.startDate);
        const endDate = formatDateYMD(item?.endDate);
        const pricePerNight = Number(item?.pricePerNight);

        if (!name || !startDate || !endDate || !Number.isFinite(pricePerNight) || pricePerNight <= 0) {
            return {
                valid: false,
                message: "Mỗi đợt giá theo mùa cần có đủ tên, ngày bắt đầu, ngày kết thúc và giá > 0.",
            };
        }
        if (startDate > endDate) {
            return {
                valid: false,
                message: `Đợt giá "${name}": ngày bắt đầu (${startDate}) không được sau ngày kết thúc (${endDate}).`,
            };
        }

        // Check overlap with previously validated ranges
        const overlap = normalized.find(
            (existing) => startDate <= existing.endDate && endDate >= existing.startDate
        );
        if (overlap) {
            return {
                valid: false,
                message: `Đợt giá "${name}" (${startDate} → ${endDate}) bị trùng ngày với "${overlap.name}" (${overlap.startDate} → ${overlap.endDate}).`,
            };
        }

        normalized.push({ name, startDate, endDate, pricePerNight });
    }

    return { valid: true, items: normalized };
};

/**
 * Calculate total price and nightly breakdown for a stay [checkInDate, checkOutDate)
 * using local calendar YYYY-MM-DD comparisons so timezone offsets never shift nights.
 */
export const calculateBookingPrice = (room, checkInDate, checkOutDate) => {
    const startDay = parseLocalDateOnly(checkInDate);
    const endDay = parseLocalDateOnly(checkOutDate);

    if (!startDay || !endDay || endDay <= startDay) {
        return { nights: 0, totalPrice: 0, averagePricePerNight: Number(room?.pricePerNight) || 0, breakdown: [] };
    }

    const basePrice = Number(room?.pricePerNight) || 0;
    const seasons = normalizeSeasonalPricing(room?.seasonalPricing);
    const breakdown = [];
    let totalPrice = 0;

    const cursor = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
    while (cursor < endDay) {
        const ymd = formatDateYMD(cursor);
        let nightRate = basePrice;
        let seasonName = "Giá tiêu chuẩn";

        const matchedSeason = seasons.find((s) => ymd >= s.startDate && ymd <= s.endDate);
        if (matchedSeason) {
            nightRate = matchedSeason.pricePerNight;
            seasonName = matchedSeason.name;
        }

        breakdown.push({ dateStr: ymd, nightRate, seasonName });
        totalPrice += nightRate;
        cursor.setDate(cursor.getDate() + 1);
    }

    const nights = breakdown.length;
    const averagePricePerNight = nights > 0 ? Math.round(totalPrice / nights) : basePrice;

    return { nights, totalPrice, averagePricePerNight, breakdown };
};
