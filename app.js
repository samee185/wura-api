 const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error');
const { cloudinaryConfig } = require("./utils/cloudinary");

const authRoutes = require('./routes/auth');
const subscriberRoutes = require('./routes/subscriber');
const blogRoutes = require('./routes/blog');
const eventRoutes = require('./routes/event');
const projectRoutes = require('./routes/project');


const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cloudinaryConfig);

// Modular API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/subscriber', subscriberRoutes);



// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({ status: 'fail', message: `Can't find ${req.originalUrl} on this server!` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
 