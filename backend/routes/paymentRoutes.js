import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createVnpayPaymentUrl,
    handleVnpayReturn,
    handleVnpayIpn,
    simulateVnpaySandbox,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/vnpay/create", protect, createVnpayPaymentUrl);
paymentRouter.get("/vnpay/return", handleVnpayReturn);
paymentRouter.get("/vnpay/ipn", handleVnpayIpn);
paymentRouter.post("/vnpay/sandbox-simulate", protect, simulateVnpaySandbox);

export default paymentRouter;
