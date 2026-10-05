const Mess = require("../models/Mess");

const getMyMess = async (req, res) => {
  try {
    const mess = await Mess.findById(req.user.messId._id);

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      });
    }

    res.json({
      success: true,
      mess,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load mess",
      error: error.message,
    });
  }
};

const updateMyMess = async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      upiId,
      qrCode,
    } = req.body;

    const mess = await Mess.findById(req.user.messId._id);

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      });
    }

    if (name) {
      mess.name = name;
    }

    if (address !== undefined) {
      mess.address = address;
    }

    if (contact !== undefined) {
      mess.contact = contact;
    }

    // Payment settings
    if (!mess.paymentSettings) {
      mess.paymentSettings = {
        upiId: "",
        qrCode: "",
      };
    }

    if (upiId !== undefined) {
      mess.paymentSettings.upiId = upiId;
    }

    if (qrCode !== undefined) {
      mess.paymentSettings.qrCode = qrCode;
    }

    await mess.save();

    res.json({
      success: true,
      message: "Mess information updated successfully",
      mess,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update mess",
      error: error.message,
    });
  }
};

module.exports = {
  getMyMess,
  updateMyMess,
};