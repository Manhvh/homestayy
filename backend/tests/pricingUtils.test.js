import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateBookingPrice, validateSeasonalPricing } from "../utils/pricingUtils.js";
import { buildLast6MonthsRevenue } from "../utils/statsUtils.js";

describe("pricingUtils - Seasonal Pricing & Nightly Breakdown", () => {
    const sampleRoom = {
        pricePerNight: 300000,
        seasonalPricing: [
            { name: "Giáng Sinh", startDate: "2026-12-24", endDate: "2026-12-25", pricePerNight: 500000 },
            { name: "Đêm Giao Thừa", startDate: "2026-12-31", endDate: "2026-12-31", pricePerNight: 700000 },
        ],
    };

    it("calculates standard pricing when dates do not match any season", () => {
        const res = calculateBookingPrice(sampleRoom, "2026-12-10", "2026-12-13");
        assert.equal(res.nights, 3);
        assert.equal(res.totalPrice, 900000);
        assert.equal(res.averagePricePerNight, 300000);
    });

    it("applies seasonal pricing per night accurately across mixed standard + seasonal dates", () => {
        // Nights: 2026-12-23 (300k), 2026-12-24 (500k), 2026-12-25 (500k), 2026-12-26 (300k)
        const res = calculateBookingPrice(sampleRoom, "2026-12-23", "2026-12-27");
        assert.equal(res.nights, 4);
        assert.equal(res.totalPrice, 1600000);
        assert.equal(res.breakdown[0].nightRate, 300000);
        assert.equal(res.breakdown[1].nightRate, 500000);
        assert.equal(res.breakdown[1].seasonName, "Giáng Sinh");
        assert.equal(res.breakdown[2].nightRate, 500000);
        assert.equal(res.breakdown[3].nightRate, 300000);
    });

    it("supports single-day holiday seasonal pricing (startDate === endDate)", () => {
        // Nights: 2026-12-31 (700k), 2027-01-01 (300k)
        const res = calculateBookingPrice(sampleRoom, "2026-12-31", "2027-01-02");
        assert.equal(res.nights, 2);
        assert.equal(res.totalPrice, 1000000);
        assert.equal(res.breakdown[0].dateStr, "2026-12-31");
        assert.equal(res.breakdown[0].nightRate, 700000);
        assert.equal(res.breakdown[1].dateStr, "2027-01-01");
        assert.equal(res.breakdown[1].nightRate, 300000);
    });

    it("validates seasonal pricing rules: allows single-day, rejects reversed or overlapping ranges", () => {
        const okSingleDay = validateSeasonalPricing([
            { name: "Quốc Khánh", startDate: "2026-09-02", endDate: "2026-09-02", pricePerNight: 600000 },
        ]);
        assert.equal(okSingleDay.valid, true);

        const reversed = validateSeasonalPricing([
            { name: "Sai ngày", startDate: "2026-09-05", endDate: "2026-09-02", pricePerNight: 600000 },
        ]);
        assert.equal(reversed.valid, false);

        const overlapping = validateSeasonalPricing([
            { name: "Đợt 1", startDate: "2026-07-01", endDate: "2026-07-10", pricePerNight: 450000 },
            { name: "Đợt 2", startDate: "2026-07-10", endDate: "2026-07-15", pricePerNight: 550000 },
        ]);
        assert.equal(overlapping.valid, false);
    });

    it("aggregates 6-month revenue strictly from confirmed bookings only", () => {
        const now = new Date();
        const buckets = buildLast6MonthsRevenue([
            { status: "confirmed", isPaid: true, totalPrice: 1000000, createdAt: now },
            { status: "confirmed", isPaid: false, totalPrice: 500000, createdAt: now },
            { status: "pending", isPaid: false, totalPrice: 900000, createdAt: now },
            { status: "cancelled", isPaid: true, totalPrice: 800000, createdAt: now },
        ]);
        assert.equal(buckets.length, 6);
        const currentBucket = buckets[5];
        assert.equal(currentBucket.totalBookings, 4);
        assert.equal(currentBucket.confirmedBookings, 2);
        assert.equal(currentBucket.cancelledBookings, 1);
        assert.equal(currentBucket.revenue, 1500000);
        assert.equal(currentBucket.paidRevenue, 1000000);
    });
});
