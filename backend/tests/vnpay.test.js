import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    sortAndEncodeVnpParams,
    buildSignData,
    signHmacSha512,
    verifyVnpCallbackQuery,
} from "../controllers/paymentController.js";

describe("VNPay Sandbox HMAC-SHA512 Signature Verification", () => {
    const TEST_SECRET = "TEST_VNPAY_HASH_SECRET_2026";

    it("sorts parameters canonically and encodes spaces as '+' per VNPay v2.1.0 spec", () => {
        const sorted = sortAndEncodeVnpParams({
            vnp_TxnRef: "HS1T123",
            vnp_Amount: 50000000,
            vnp_OrderInfo: "Thanh toan dat phong HomeStay",
        });
        const signData = buildSignData(sorted);
        assert.equal(
            signData,
            "vnp_Amount=50000000&vnp_OrderInfo=Thanh+toan+dat+phong+HomeStay&vnp_TxnRef=HS1T123"
        );
    });

    it("verifies authentic VNPay callback signatures and rejects tampered payloads", () => {
        const params = {
            vnp_Amount: "84000000",
            vnp_BankCode: "NCB",
            vnp_OrderInfo: "Thanh toan dat phong HomeStay bk113579",
            vnp_ResponseCode: "00",
            vnp_TmnCode: "HOMESTAY_SANDBOX",
            vnp_TransactionStatus: "00",
            vnp_TxnRef: "HS1T999999",
        };

        const signData = buildSignData(sortAndEncodeVnpParams(params));
        const validHash = signHmacSha512(signData, TEST_SECRET);

        // Authentic callback passes
        const okRes = verifyVnpCallbackQuery({ ...params, vnp_SecureHash: validHash }, TEST_SECRET);
        assert.equal(okRes.valid, true);

        // Tampered amount must fail
        const tamperedAmount = verifyVnpCallbackQuery(
            { ...params, vnp_Amount: "100", vnp_SecureHash: validHash },
            TEST_SECRET
        );
        assert.equal(tamperedAmount.valid, false);

        // Tampered response code must fail
        const tamperedCode = verifyVnpCallbackQuery(
            { ...params, vnp_ResponseCode: "24", vnp_SecureHash: validHash },
            TEST_SECRET
        );
        assert.equal(tamperedCode.valid, false);

        // Missing hash must fail
        const noHash = verifyVnpCallbackQuery(params, TEST_SECRET);
        assert.equal(noHash.valid, false);
    });
});
