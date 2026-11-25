import crypto from "crypto";
import { Booking, Hotel, Room, User } from "../models/index.js";
import { sendPaymentSuccessEmail } from "../utils/mailService.js";

const VNP_RESPONSE_MESSAGES = {
    "00": "Giao dịch thanh toán thành công!",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới giao dịch bất thường).",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
    "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
    "12": "Thẻ/Tài khoản của khách hàng bị khóa.",
    "13": "Nhập sai mật khẩu xác thực giao dịch (OTP). Vui lòng thử lại.",
    "24": "Khách hàng đã hủy giao dịch thanh toán.",
    "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
    "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
    "99": "Lỗi không xác định trong quá trình thanh toán.",
};

const hasRealVnpayConfig = () => {
    const tmn = (process.env.VNP_TMN_CODE || "").trim();
    const secret = (process.env.VNP_HASH_SECRET || "").trim();
    return Boolean(tmn && secret && !tmn.startsWith("your_") && !secret.startsWith("your_"));
};

const getVnpayConfig = (req) => {
    const isReal = hasRealVnpayConfig();
    const tmnCode = isReal ? process.env.VNP_TMN_CODE.trim() : "HOMESTAY_SANDBOX";
    const hashSecret = isReal
        ? process.env.VNP_HASH_SECRET.trim()
        : process.env.JWT_SECRET || "homestay_vnpay_sandbox_demo_secret_2026";
    const vnpUrl =
        (process.env.VNP_URL || "").trim() ||
        "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    const envFrontend = (process.env.FRONTEND_URL || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)[0];
    const reqOrigin = req?.headers?.origin || "";
    const frontendBase = (envFrontend || reqOrigin || "http://localhost:5173").replace(/\/+$/, "");

    const returnUrl =
        (process.env.VNP_RETURN_URL || "").trim() || `${frontendBase}/payment/vnpay-return`;

    return { isReal, tmnCode, hashSecret, vnpUrl, returnUrl, frontendBase };
};

// Format date in GMT+7 (Asia/Ho_Chi_Minh) as YYYYMMDDHHmmss per VNPay spec
const formatVnpDateGMT7 = (date = new Date()) => {
    const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const yyyy = gmt7.getUTCFullYear();
    const MM = String(gmt7.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(gmt7.getUTCDate()).padStart(2, "0");
    const HH = String(gmt7.getUTCHours()).padStart(2, "0");
    const mm = String(gmt7.getUTCMinutes()).padStart(2, "0");
    const ss = String(gmt7.getUTCSeconds()).padStart(2, "0");
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
};

// VNPay v2.1.0 canonical parameter sorting & URL-encoding (spaces encoded as '+')
const sortAndEncodeVnpParams = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj)
        .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== "")
        .sort();
    for (const key of keys) {
        sorted[encodeURIComponent(key)] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
    }
    return sorted;
};

const buildSignData = (sortedEncodedObj) =>
    Object.keys(sortedEncodedObj)
        .map((k) => `${k}=${sortedEncodedObj[k]}`)
        .join("&");

const signHmacSha512 = (data, secretKey) =>
    crypto.createHmac("sha512", secretKey).update(Buffer.from(data, "utf-8")).digest("hex");

const safeCompareHex = (a, b) => {
    if (!a || !b) return false;
    const bufA = Buffer.from(String(a).toLowerCase(), "utf-8");
    const bufB = Buffer.from(String(b).toLowerCase(), "utf-8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    let ip =
        (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "") ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1";
    if (ip === "::1") return "127.0.0.1";
    if (ip.startsWith("::ffff:")) ip = ip.slice(7);
    return ip || "127.0.0.1";
};

const verifyVnpCallbackQuery = (query, secretKey) => {
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) {
        return { valid: false, vnpParams: {} };
    }

    const vnpParams = {};
    for (const [key, val] of Object.entries(query)) {
        if (
            key.startsWith("vnp_") &&
            key !== "vnp_SecureHash" &&
            key !== "vnp_SecureHashType" &&
            val !== undefined &&
            val !== ""
        ) {
            vnpParams[key] = Array.isArray(val) ? val[0] : val;
        }
    }

    const sorted = sortAndEncodeVnpParams(vnpParams);
    const signData = buildSignData(sorted);
    const expectedHash = signHmacSha512(signData, secretKey);

    return {
        valid: safeCompareHex(secureHash, expectedHash),
        vnpParams,
    };
};

// POST /api/payments/vnpay/create
export const createVnpayPaymentUrl = async (req, res) => {
    try {
        const { bookingId, bankCode } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Thiếu mã đơn đặt phòng (bookingId)." });
        }

        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Hotel, as: "hotel" },
                { model: Room, as: "room" },
            ],
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (String(booking.userId) !== String(req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền thanh toán cho đơn đặt phòng này.",
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt phòng đã bị hủy, không thể tiến hành thanh toán.",
            });
        }

        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message: "Đơn đặt phòng này đã được thanh toán trước đó.",
            });
        }

        const amountVnd = Math.round(Number(booking.totalPrice) || 0);
        if (amountVnd <= 0) {
            return res.status(400).json({ success: false, message: "Số tiền thanh toán không hợp lệ." });
        }

        const { isReal, tmnCode, hashSecret, vnpUrl, returnUrl, frontendBase } = getVnpayConfig(req);
        const now = new Date();
        const expireDate = new Date(now.getTime() + 15 * 60 * 1000);
        const txnRef = `HS${booking.id}T${Date.now()}`;
        const codeDisplay = booking.bookingCode || booking.id;

        booking.transactionRef = txnRef;
        booking.paymentMethod = "VNPay";
        await booking.save();

        const vnpParams = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Locale: "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan dat phong HomeStay ${codeDisplay}`,
            vnp_OrderType: "other",
            vnp_Amount: amountVnd * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: getClientIp(req),
            vnp_CreateDate: formatVnpDateGMT7(now),
            vnp_ExpireDate: formatVnpDateGMT7(expireDate),
        };

        if (bankCode && String(bankCode).trim()) {
            vnpParams.vnp_BankCode = String(bankCode).trim();
        }

        const sortedEncoded = sortAndEncodeVnpParams(vnpParams);
        const signData = buildSignData(sortedEncoded);
        const secureHash = signHmacSha512(signData, hashSecret);

        const targetBaseUrl = isReal ? vnpUrl : `${frontendBase}/payment/vnpay-sandbox`;
        const paymentUrl = `${targetBaseUrl}?${signData}&vnp_SecureHash=${secureHash}`;

        res.json({
            success: true,
            mode: isReal ? "vnpay_sandbox" : "local_sandbox_simulator",
            paymentUrl,
            transactionRef: txnRef,
            bookingId: booking.id,
        });
    } catch (error) {
        console.error("Create VNPay URL error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể khởi tạo liên kết thanh toán VNPay: " + error.message,
        });
    }
};

// POST /api/payments/vnpay/sandbox-simulate
// Only enabled when real VNP_TMN_CODE / VNP_HASH_SECRET are not configured (for local testing/demo)
export const simulateVnpaySandbox = async (req, res) => {
    try {
        if (hasRealVnpayConfig()) {
            return res.status(403).json({
                success: false,
                message: "Hệ thống đang chạy VNPay Sandbox chính thức, không hỗ trợ giả lập nội bộ.",
            });
        }

        const { txnRef, responseCode = "00", bankCode = "NCB" } = req.body;
        if (!txnRef) {
            return res.status(400).json({ success: false, message: "Thiếu mã tham chiếu giao dịch (txnRef)." });
        }

        const booking = await Booking.findOne({ where: { transactionRef: txnRef } });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch tương ứng." });
        }

        if (String(booking.userId) !== String(req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Không có quyền thực hiện thao tác này." });
        }

        const { tmnCode, hashSecret, returnUrl } = getVnpayConfig(req);
        const codeDisplay = booking.bookingCode || booking.id;
        const cleanCode = String(responseCode || "00");

        const returnParams = {
            vnp_Amount: Math.round(Number(booking.totalPrice) * 100),
            vnp_BankCode: bankCode || "NCB",
            vnp_BankTranNo: `VNP${Date.now().toString().slice(-8)}`,
            vnp_CardType: "ATM",
            vnp_OrderInfo: `Thanh toan dat phong HomeStay ${codeDisplay}`,
            vnp_PayDate: formatVnpDateGMT7(new Date()),
            vnp_ResponseCode: cleanCode,
            vnp_TmnCode: tmnCode,
            vnp_TransactionNo: String(Math.floor(10000000 + Math.random() * 90000000)),
            vnp_TransactionStatus: cleanCode === "00" ? "00" : "02",
            vnp_TxnRef: txnRef,
        };

        const sortedEncoded = sortAndEncodeVnpParams(returnParams);
        const signData = buildSignData(sortedEncoded);
        const secureHash = signHmacSha512(signData, hashSecret);

        const redirectUrl = `${returnUrl}?${signData}&vnp_SecureHash=${secureHash}`;
        res.json({ success: true, redirectUrl });
    } catch (error) {
        console.error("Simulate VNPay sandbox error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Shared settlement logic for both VNPay Return & IPN callbacks
const settleVnpayTransaction = async (vnpParams) => {
    const txnRef = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionStatus = vnpParams.vnp_TransactionStatus || responseCode;
    const vnpAmount = Number(vnpParams.vnp_Amount || 0);

    const booking = await Booking.findOne({
        where: { transactionRef: txnRef },
        include: [
            { model: Hotel, as: "hotel" },
            { model: Room, as: "room" },
            { model: User, as: "user", attributes: ["id", "username", "email", "phone"] },
        ],
    });

    if (!booking) {
        return {
            ok: false,
            rspCode: "01",
            message: "Không tìm thấy đơn đặt phòng tương ứng với mã giao dịch.",
            booking: null,
        };
    }

    const expectedAmount = Math.round(Number(booking.totalPrice) * 100);
    if (vnpAmount !== expectedAmount) {
        return {
            ok: false,
            rspCode: "04",
            message: "Số tiền thanh toán không khớp với giá trị đơn đặt phòng.",
            booking,
        };
    }

    const isSuccess = responseCode === "00" && transactionStatus === "00";
    if (!isSuccess) {
        return {
            ok: false,
            rspCode: responseCode || "99",
            message: VNP_RESPONSE_MESSAGES[responseCode] || VNP_RESPONSE_MESSAGES["99"],
            booking,
        };
    }

    if (booking.isPaid) {
        return {
            ok: true,
            alreadyPaid: true,
            rspCode: "02",
            message: "Đơn đặt phòng đã được thanh toán và xác nhận trước đó.",
            booking,
        };
    }

    booking.isPaid = true;
    booking.paidAt = new Date();
    booking.paymentMethod = "VNPay";
    if (booking.status === "pending") {
        booking.status = "confirmed";
    }
    await booking.save();

    // Send confirmation email asynchronously / safely
    const mailSent = await sendPaymentSuccessEmail({
        user: booking.user,
        booking,
        hotel: booking.hotel,
    });
    if (mailSent && !booking.isSendMail) {
        booking.isSendMail = true;
        await booking.save();
    }

    return {
        ok: true,
        alreadyPaid: false,
        rspCode: "00",
        message: VNP_RESPONSE_MESSAGES["00"],
        booking,
    };
};

// GET /api/payments/vnpay/return (Frontend calls this with VNPay return query params)
export const handleVnpayReturn = async (req, res) => {
    try {
        const { hashSecret } = getVnpayConfig(req);
        const { valid, vnpParams } = verifyVnpCallbackQuery(req.query, hashSecret);

        if (!valid) {
            return res.status(400).json({
                success: false,
                code: "97",
                message: "Chữ ký bảo mật VNPay (HMAC-SHA512) không hợp lệ!",
            });
        }

        const result = await settleVnpayTransaction(vnpParams);
        const paymentInfo = {
            transactionRef: vnpParams.vnp_TxnRef,
            transactionNo: vnpParams.vnp_TransactionNo || "",
            bankCode: vnpParams.vnp_BankCode || "",
            cardType: vnpParams.vnp_CardType || "",
            payDate: vnpParams.vnp_PayDate || "",
            amount: Math.round(Number(vnpParams.vnp_Amount || 0) / 100),
            responseCode: vnpParams.vnp_ResponseCode || "",
            orderInfo: vnpParams.vnp_OrderInfo || "",
        };

        res.json({
            success: result.ok,
            code: vnpParams.vnp_ResponseCode || result.rspCode,
            message: result.message,
            payment: paymentInfo,
            booking: result.booking ? result.booking.toJSON() : null,
        });
    } catch (error) {
        console.error("VNPay return verify error:", error);
        res.status(500).json({
            success: false,
            code: "99",
            message: "Lỗi xử lý kết quả thanh toán VNPay: " + error.message,
        });
    }
};

// GET /api/payments/vnpay/ipn (VNPay Server-to-Server IPN Webhook)
export const handleVnpayIpn = async (req, res) => {
    try {
        const { hashSecret } = getVnpayConfig(req);
        const { valid, vnpParams } = verifyVnpCallbackQuery(req.query, hashSecret);

        if (!valid) {
            return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
        }

        const result = await settleVnpayTransaction(vnpParams);
        if (result.rspCode === "01") {
            return res.status(200).json({ RspCode: "01", Message: "Order not found" });
        }
        if (result.rspCode === "04") {
            return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
        }
        if (result.alreadyPaid) {
            return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
        }

        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } catch (error) {
        console.error("VNPay IPN error:", error);
        return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
};
