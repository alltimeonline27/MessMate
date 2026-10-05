const express = require("express");

const {
  createPaymentNotice,
  getPaymentNotices,
  closePaymentNotice,
  submitPayment,
  getMyPayments,
  getMyPaymentSummary,
  getAllPayments,
  verifyPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Payment Notices
router.get("/notices", protect, getPaymentNotices);

router.post(
  "/notices",
  protect,
  adminOnly,
  createPaymentNotice
);

router.put(
  "/notices/:id/close",
  protect,
  adminOnly,
  closePaymentNotice
);

// Member Payments
router.post(
  "/submit",
  protect,
  submitPayment
);

router.get(
  "/my",
  protect,
  getMyPayments
);

// Admin Payments
router.get(
  "/all",
  protect,
  adminOnly,
  getAllPayments
);

router.put(
  "/:id/verify",
  protect,
  adminOnly,
  verifyPayment
);

router.get(
  "/my-summary",
  protect,
  getMyPaymentSummary
);

module.exports = router;