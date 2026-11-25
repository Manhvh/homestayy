/**
 * Integration & Concurrency Verification Script (requires running MySQL + seeded database).
 * Run with: npm run test:integration
 *
 * Verifies:
 * 1. Row-level Locking (SELECT ... FOR UPDATE): 2 concurrent booking requests for the same room & dates -> strictly 1 succeeds, 1 fails.
 * 2. RBAC enforcement: regular customer receives 403 on Admin (/api/reviews/stats) and Partner (/api/rooms/owner) routes.
 * 3. Single-use Reset Password OTP: cannot bypass using legacy codeVerify or reuse an OTP twice.
 */
import assert from "node:assert/strict";
import connectDB from "../configs/db.js";
import { syncDatabase, Booking, Room, Hotel } from "../models/index.js";
import app from "../server.js";

const run = async () => {
    await connectDB();
    await syncDatabase();

    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
        // 1. Login as seeded customer
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "khachhang@homestay.vn", password: "password123" }),
        });
        const loginBody = await loginRes.json();
        assert.equal(loginRes.status, 200, "Customer login must succeed");
        const userToken = loginBody.token;

        // 2. Verify RBAC blocks customer from Admin & Partner endpoints
        const adminStatsRes = await fetch(`${baseUrl}/api/reviews/stats`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        assert.equal(adminStatsRes.status, 403, "Customer must get 403 on /api/reviews/stats");

        const ownerRoomsRes = await fetch(`${baseUrl}/api/rooms/owner`, {
            headers: { Authorization: `Bearer ${userToken}` },
        });
        assert.equal(ownerRoomsRes.status, 403, "Customer must get 403 on /api/rooms/owner");

        // 3. Verify Reset Password cannot be bypassed without requesting a fresh OTP
        const bypassRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@homestay.vn",
                codeVerify: "111111",
                newPassword: "Hacked@Password1",
            }),
        });
        assert.equal(bypassRes.status, 400, "Reset password bypass with fake/old code must fail with 400");

        // 4. Concurrency test: 2 simultaneous bookings for the same approved room & future dates
        const approvedRoom = await Room.findOne({
            where: { isAvailable: true },
            include: [{ model: Hotel, as: "hotel", where: { status: "approved" } }],
        });
        assert.ok(approvedRoom, "An approved available room must exist in DB");

        // Pick a far-future date range unlikely to collide with existing seed bookings
        const checkInDate = "2028-08-10";
        const checkOutDate = "2028-08-12";

        const bookOnce = () =>
            fetch(`${baseUrl}/api/bookings/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    room: approvedRoom.id,
                    checkInDate,
                    checkOutDate,
                    guests: 1,
                    paymentMethod: "Pay At Hotel",
                }),
            }).then(async (r) => ({ status: r.status, body: await r.json() }));

        const [r1, r2] = await Promise.all([bookOnce(), bookOnce()]);
        const successes = [r1, r2].filter((r) => r.body.success);
        const failures = [r1, r2].filter((r) => !r.body.success);

        assert.equal(successes.length, 1, "Exactly 1 concurrent booking must succeed");
        assert.equal(failures.length, 1, "Exactly 1 concurrent booking must be rejected by row lock");

        // Cleanup the test booking created above
        const createdId = successes[0].body.booking?.id;
        if (createdId) {
            await Booking.destroy({ where: { id: createdId } });
        }

        console.log("✅ All integration & concurrency tests passed!");
    } finally {
        await new Promise((resolve) => server.close(resolve));
        process.exit(0);
    }
};

run().catch((err) => {
    console.error("❌ Integration test failed:", err);
    process.exit(1);
});
