import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    validatePasswordStrength,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    hashOtp,
    verifyOtpHash,
} from "../utils/authUtils.js";

describe("authUtils - Password, JWT & OTP Security", () => {
    it("validates strong passwords and rejects weak ones", () => {
        assert.equal(validatePasswordStrength("Abc@1234").valid, true);
        assert.equal(validatePasswordStrength("weakpass").valid, false);
        assert.equal(validatePasswordStrength("Short1!").valid, false);
        assert.equal(validatePasswordStrength("NoNumber!").valid, false);
        assert.equal(validatePasswordStrength("NoSpecial123").valid, false);
        assert.equal(validatePasswordStrength("Has Space1!").valid, false);
    });

    it("hashes password with unique random salt using scrypt and verifies securely", () => {
        const h1 = hashPassword("Secret@2026");
        const h2 = hashPassword("Secret@2026");
        assert.notEqual(h1, h2, "Same password must produce different salted hashes");
        assert.equal(verifyPassword("Secret@2026", h1), true);
        assert.equal(verifyPassword("WrongPass@2026", h1), false);
        assert.equal(verifyPassword("Secret@2026", "malformed_hash"), false);
    });

    it("generates and verifies HS256 JWT tokens and rejects tampered or alg:none tokens", () => {
        const token = generateToken("user_123", "admin");
        const decoded = verifyToken(token);
        assert.ok(decoded);
        assert.equal(decoded.userId, "user_123");
        assert.equal(decoded.role, "admin");

        // Tamper payload
        const [header, payload, sig] = token.split(".");
        const fakePayload = Buffer.from(
            JSON.stringify({ userId: "user_123", role: "superadmin", exp: decoded.exp })
        ).toString("base64url");
        assert.equal(verifyToken(`${header}.${fakePayload}.${sig}`), null);

        // Tamper algorithm to "none"
        const noneHeader = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
        assert.equal(verifyToken(`${noneHeader}.${payload}.`), null);

        // Malformed token
        assert.equal(verifyToken("not.a.valid.jwt"), null);
    });

    it("hashes and verifies OTP codes in constant time", () => {
        const otp = "482913";
        const hashed = hashOtp(otp);
        assert.notEqual(hashed, otp);
        assert.equal(verifyOtpHash("482913", hashed), true);
        assert.equal(verifyOtpHash("482914", hashed), false);
        assert.equal(verifyOtpHash("", hashed), false);
    });
});
