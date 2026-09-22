const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./services/socketService');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Middleware
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([
  ...configuredOrigins,
  'https://micro-volunteer-match-one.vercel.app',
  'https://micro-volunteer-match-csy0njpdr-vsanvikas-projects.vercel.app',
])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Handle OPTIONS preflight requests explicitly BEFORE any routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Init Socket.IO
initSocket(server, allowedOrigins);

// Core Routes (existing)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/application', require('./routes/applicationRoutes'));
app.use('/api/matches', require('./routes/matchingRoutes'));
app.use('/api/recommendations', require('./routes/matchingRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/leaderboard', require('./routes/gamificationRoutes'));
app.use('/api/reputation', require('./routes/gamificationRoutes'));
app.use('/api/analytics', require('./routes/impactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// New Routes
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/map', require('./routes/impactRoutes'));
app.use('/api/learning', require('./routes/matchingRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'online',
    appName: 'Micro-Volunteer Match API v2.0',
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    features: ['AI Matching', 'Certificates', 'Teams', 'Challenges', 'Organizations', 'Portfolio', 'Impact Map'],
    time: new Date().toISOString(),
  });
});

const frontendDist = path.join(__dirname, 'public');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Micro-Volunteer Match API v2.0]: Running on port ${PORT}`);
  console.log(`[Health Check]: http://localhost:${PORT}/api/health`);
  console.log(`[Features]: AI Matching, Certificates, Teams, Challenges, Organizations, Portfolio`);
  console.log(`=======================================================`);
});
