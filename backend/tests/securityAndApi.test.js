import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { imageFileFilter } from "../middleware/uploadMiddleware.js";
import app from "../server.js";

let server;
let baseUrl;

describe("HTTP Security, RBAC, Upload Filter & OpenAPI Docs", () => {
    before(async () => {
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const { port } = server.address();
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    it("imageFileFilter accepts safe raster images and blocks SVG/HTML/JS XSS files", () => {
        const runFilter = (file) =>
            new Promise((resolve) => {
                imageFileFilter({}, file, (err, accepted) => resolve({ err, accepted }));
            });

        return Promise.all([
            runFilter({ originalname: "room.jpg", mimetype: "image/jpeg" }),
            runFilter({ originalname: "cover.webp", mimetype: "image/webp" }),
            runFilter({ originalname: "xss.svg", mimetype: "image/svg+xml" }),
            runFilter({ originalname: "exploit.html", mimetype: "text/html" }),
            runFilter({ originalname: "fake.jpg", mimetype: "application/javascript" }),
        ]).then(([jpg, webp, svg, html, spoof]) => {
            assert.equal(jpg.err, null);
            assert.equal(jpg.accepted, true);
            assert.equal(webp.err, null);
            assert.equal(webp.accepted, true);

            assert.ok(svg.err);
            assert.equal(svg.err.code, "INVALID_FILE_TYPE");
            assert.ok(html.err);
            assert.equal(html.err.code, "INVALID_FILE_TYPE");
            assert.ok(spoof.err);
            assert.equal(spoof.err.code, "INVALID_FILE_TYPE");
        });
    });

    it("GET /api/health returns 200 OK with Helmet security headers", async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200);
        assert.equal(res.headers.get("x-content-type-options"), "nosniff");
        const body = await res.json();
        assert.equal(body.status, "ok");
    });

    it("GET /api-docs.json serves valid OpenAPI 3.0 specification", async () => {
        const res = await fetch(`${baseUrl}/api-docs.json`);
        assert.equal(res.status, 200);
        const spec = await res.json();
        assert.equal(spec.openapi, "3.0.3");
        assert.ok(spec.paths["/api/bookings/book"]);
        assert.ok(spec.paths["/api/payments/vnpay/create"]);
    });

    it("protects Admin and Partner endpoints from unauthenticated requests", async () => {
        const protectedEndpoints = [
            "/api/reviews/stats",
            "/api/admin/stats",
            "/api/admin/users",
            "/api/admin/hotels",
            "/api/hotels/my-hotel",
            "/api/rooms/owner",
            "/api/bookings/hotel",
        ];

        for (const path of protectedEndpoints) {
            const res = await fetch(`${baseUrl}${path}`);
            assert.equal(res.status, 401, `${path} should reject unauthenticated access with 401`);
        }
    });

    it("rejects forged VNPay return and IPN signatures with code 97", async () => {
        const returnRes = await fetch(
            `${baseUrl}/api/payments/vnpay/return?vnp_TxnRef=HS999&vnp_Amount=50000000&vnp_ResponseCode=00&vnp_SecureHash=forged_hash`
        );
        assert.equal(returnRes.status, 400);
        const returnBody = await returnRes.json();
        assert.equal(returnBody.success, false);
        assert.equal(returnBody.code, "97");

        const ipnRes = await fetch(
            `${baseUrl}/api/payments/vnpay/ipn?vnp_TxnRef=HS999&vnp_Amount=50000000&vnp_ResponseCode=00&vnp_SecureHash=forged_hash`
        );
        assert.equal(ipnRes.status, 200);
        const ipnBody = await ipnRes.json();
        assert.equal(ipnBody.RspCode, "97");
    });

    it("returns 404 JSON for unknown API paths", async () => {
        const res = await fetch(`${baseUrl}/api/does-not-exist`);
        assert.equal(res.status, 404);
        const body = await res.json();
        assert.equal(body.success, false);
    });
});
