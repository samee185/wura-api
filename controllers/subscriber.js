const Subscriber = require('../models/subscriber');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

// Add a new subscriber and send confirmation email
const addSubscriber = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return next(new AppError('Email already subscribed', 400));
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');

    // Create subscriber
    const subscriber = await Subscriber.create({
      email,
      confirmationToken,
    });

    // // Send confirmation email
    // const confirmUrl = `${process.env.FRONTEND_URL}/confirm-subscriber?token=${confirmationToken}`;
    // await sendEmail({
    //   to: email,
    //   subject: 'Confirm your subscription',
    //   html: `<p>Click <a href="${confirmUrl}">here</a> to confirm your subscription.</p>`
    // });

    res.status(201).json({
      success: true,
      message: 'Confirmation email sent',
      data: subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm subscriber
const confirmSubscriber = async (req, res, next) => {
  try {
    const { token } = req.query;
    const subscriber = await Subscriber.findOne({ confirmationToken: token });
    if (!subscriber) {
      return next(new AppError('Invalid or expired token', 400));
    }
    subscriber.confirmed = true;
    subscriber.confirmationToken = undefined;
    await subscriber.save();
    res.status(200).json({ success: true, message: 'Subscription confirmed!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addSubscriber, confirmSubscriber };
