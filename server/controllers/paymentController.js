const PaymentNotice = require("../models/PaymentNotice");
const Payment = require("../models/Payment");
const Member = require("../models/Member");

// ADMIN: Create Payment Notice
const createPaymentNotice = async (req, res) => {
  try {
    const {
      title,
      amount,
      dueDate,
      description,
    } = req.body;

    if (!title || amount === undefined || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, amount and due date are required",
      });
    }

    const notice = await PaymentNotice.create({
      messId: req.user.messId._id,
      createdBy: req.user._id,
      title,
      amount,
      dueDate,
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Payment notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create payment notice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment notice",
      error: error.message,
    });
  }
};

// ALL USERS: Get Payment Notices
const getPaymentNotices = async (req, res) => {
  try {
    const notices = await PaymentNotice.find({
      messId: req.user.messId._id,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error("Get payment notices error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load payment notices",
      error: error.message,
    });
  }
};

// ADMIN: Close Payment Notice
const closePaymentNotice = async (req, res) => {
  try {
    const notice = await PaymentNotice.findOne({
      _id: req.params.id,
      messId: req.user.messId._id,
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Payment notice not found",
      });
    }

    notice.status = "closed";

    await notice.save();

    res.json({
      success: true,
      message: "Payment notice closed successfully",
      notice,
    });
  } catch (error) {
    console.error("Close payment notice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to close payment notice",
      error: error.message,
    });
  }
};

// MEMBER: Submit Payment
const submitPayment = async (req, res) => {
  try {
    const {
      paymentNoticeId,
      amount,
      paymentMethod,
      transactionId,
      note,
    } = req.body;

    if (
      !paymentNoticeId ||
      amount === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment notice, amount and payment method are required",
      });
    }

    if (!["upi", "cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be UPI or cash",
      });
    }

    const notice = await PaymentNotice.findOne({
      _id: paymentNoticeId,
      messId: req.user.messId._id,
      status: "active",
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Active payment notice not found",
      });
    }

    const member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId._id,
      status: "active",
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Active member profile not found",
      });
    }

    if (paymentMethod === "upi" && !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required for UPI payment",
      });
    }

    const payment = await Payment.create({
      messId: req.user.messId._id,
      paymentNotice: notice._id,
      member: member._id,
      amount,
      paymentMethod,
      transactionId: transactionId || "",
      status:
        paymentMethod === "upi"
          ? "pending_verification"
          : "pending",
      note: note || "",
    });

    res.status(201).json({
      success: true,
      message: "Payment submitted successfully",
      payment,
    });
  } catch (error) {
    console.error("Submit payment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit payment",
      error: error.message,
    });
  }
};

// MEMBER: Get My Payments
const getMyPayments = async (req, res) => {
  try {
    const member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId._id,
      status: "active",
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Active member profile not found",
      });
    }

    const payments = await Payment.find({
      messId: req.user.messId._id,
      member: member._id,
    })
      .populate(
        "paymentNotice",
        "title amount dueDate status"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get my payments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load your payments",
      error: error.message,
    });
  }
};

// ADMIN: Get All Payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      messId: req.user.messId._id,
    })
      .populate(
        "member",
        "name email phone roomNumber"
      )
      .populate(
        "paymentNotice",
        "title amount dueDate status"
      )
      .populate(
        "verifiedBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load payments",
      error: error.message,
    });
  }
};

// ADMIN: Verify / Reject Payment
const verifyPayment = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["successful", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be successful or rejected",
      });
    }

    const payment = await Payment.findOne({
      _id: req.params.id,
      messId: req.user.messId._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = status;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message:
        status === "successful"
          ? "Payment verified successfully"
          : "Payment rejected successfully",
      payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

// MEMBER: Get Payment Summary / Due
const getMyPaymentSummary = async (req, res) => {
  try {
    const member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId._id,
      status: "active",
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Active member profile not found",
      });
    }

    const notices = await PaymentNotice.find({
      messId: req.user.messId._id,
    }).sort({ createdAt: -1 });

    const summary = [];

    for (const notice of notices) {
      const payments = await Payment.find({
        messId: req.user.messId._id,
        paymentNotice: notice._id,
        member: member._id,
        status: "successful",
      });

      const totalPaid = payments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      const noticeAmount = Number(notice.amount || 0);

      const due = Math.max(
        noticeAmount - totalPaid,
        0
      );

      summary.push({
        paymentNoticeId: notice._id,
        title: notice.title,
        noticeAmount,
        totalPaid,
        due,
        status: notice.status,
        dueDate: notice.dueDate,
      });
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(
      "Get payment summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load payment summary",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentNotice,
  getPaymentNotices,
  closePaymentNotice,
  submitPayment,
  getMyPayments,
  getMyPaymentSummary,
  getAllPayments,
  verifyPayment,
};