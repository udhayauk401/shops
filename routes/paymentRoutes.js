const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// ──────────────────────────────────────────────────
// POST /api/payment/generate-upi
// ──────────────────────────────────────────────────
router.post('/generate-upi', async (req, res) => {
  try {
    console.log('📩 Payment request received:', req.body);

    const { productName, amount, customerName, customerEmail } = req.body;

    // ── Validation ──
    if (!productName || productName.trim() === '') {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!customerName || customerName.trim() === '') {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const merchantUPI = process.env.MERCHANT_UPI_ID || 'udhayaraja7777@oksbi';
    const merchantName = process.env.MERCHANT_NAME || 'DressLux Store';
    const orderId = 'DLX' + Date.now();
    const note = `DressLux: ${productName}`;
    const amountNum = Number(amount).toFixed(2);

    // ── Generate UPI Links ──
    const baseUPI = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}`;
    const gpayURL = `intent://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
    const phonepeURL = `intent://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}#Intent;scheme=upi;package=com.phonepe.app;end`;
    const paytmURL = `intent://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amountNum}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}#Intent;scheme=upi;package=net.one97.paytm;end`;

    // ── Create Order in Database ──
    const newOrder = new Order({
      orderId,
      productName,
      amount: amountNum,
      customerName,
      customerEmail: customerEmail || '',
      merchantUPI,
      status: 'pending'
    });

    await newOrder.save();
    console.log('✅ Order created:', orderId);

    res.status(200).json({
      success: true,
      orderId,
      merchantUPI,
      baseUPI,
      gpayURL,
      phonepeURL,
      paytmURL,
      note,
      message: 'UPI links generated successfully'
    });

  } catch (err) {
    console.error('❌ Generate UPI error:', err.message);
    res.status(500).json({
      message: 'Failed to generate payment links',
      error: err.message
    });
  }
});

// ──────────────────────────────────────────────────
// PATCH /api/payment/confirm/:orderId
// ──────────────────────────────────────────────────
router.patch('/confirm/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('✅ Confirming payment for:', orderId);

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('✅ Payment confirmed for:', orderId);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed ✅',
      order
    });

  } catch (err) {
    console.error('❌ Confirm payment error:', err.message);
    res.status(500).json({
      message: 'Confirmation failed',
      error: err.message
    });
  }
});

// ──────────────────────────────────────────────────
// GET /api/payment/orders (Admin view all orders)
// ──────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: orders.length,
      orders 
    });
  } catch (err) {
    console.error('❌ Orders fetch error:', err.message);
    res.status(500).json({ 
      message: 'Failed to fetch orders', 
      error: err.message 
    });
  }
});

// ──────────────────────────────────────────────────
// GET /api/payment/order/:orderId (Get single order)
// ──────────────────────────────────────────────────
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ 
      success: true, 
      order 
    });
  } catch (err) {
    console.error('❌ Order fetch error:', err.message);
    res.status(500).json({ 
      message: 'Failed to fetch order', 
      error: err.message 
    });
  }
});

module.exports = router;
