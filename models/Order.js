const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true
    },
    productName: {
      type:     String,
      required: true,
      trim:     true
    },
    amount: {
      type:     Number,
      required: true,
      min:      1
    },
    customerName: {
      type:     String,
      required: true,
      trim:     true
    },
    customerEmail: {
      type: String,
      trim: true
    },
    merchantUPI: {
      type:    String,
      default: 'udhayaraja7777@oksbi'
    },
    status: {
      type:    String,
      enum:    ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
