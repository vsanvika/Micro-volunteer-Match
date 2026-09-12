const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./services/socketService');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Init Socket.IO
initSocket(server);

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
  res.json({
    status: 'online',
    appName: 'Micro-Volunteer Match API v2.0',
    features: ['AI Matching', 'Certificates', 'Teams', 'Challenges', 'Organizations', 'Portfolio', 'Impact Map'],
    time: new Date().toISOString(),
  });
});

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
