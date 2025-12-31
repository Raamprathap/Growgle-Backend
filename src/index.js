require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic env validation & helpful warnings
const baseRequired = ['NEWS_API_KEY','PROJECT_ID'];
const baseMissing = baseRequired.filter(k => !process.env[k]);
if (baseMissing.length) {
  console.warn('Missing required env vars:', baseMissing.join(', '));
}

// Auth strategy detection
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Auth: service account key file mode');
  console.log('   File:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  console.log('Auth: Application Default Credentials (gcloud login)');
  console.log('Ensure you ran: gcloud auth application-default login');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// DB and custom middleware
const connectDB = require('./config/connectDB');
const { ed25519KeygenMiddleware } = require('./middlewares/rsa/key.js');
const db = connectDB();

// Auth/user routes
const userRouter = require('./routes/auth.route.js');
app.use('/api/auth', userRouter);

// Insights routes
const insightsRoutes = require('./routes/insights.route.js');
app.use('/api', insightsRoutes);

const profileRoutes = require('./routes/profile.route.js');
app.use('/api/profile', profileRoutes);

// Roadmaps routes
const roadmapRoutes = require('./routes/roadmap.route.js');
app.use('/api/roadmaps', roadmapRoutes);

// LaTeX compile route
const compileRoutes = require('./routes/compile.route.js');
app.use('/api/compile', compileRoutes);

// Key generation endpoint
app.get('/generate-keys', ed25519KeygenMiddleware);

// Firestore connection check
app.get('/', async (req, res) => {
  try {
    await db.listCollections();
    console.log('hi dev firestore connected');
    res.send('hi dev firestore connected');
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    console.log('hi dev, backend running but firebase not connected');
    res.send('hi dev, backend running but firebase not connected');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'career-insights-api'
  });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Career Insights API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      setup: '/api/setup',
      ingestNews: 'POST /api/ingest/news',
      insights: 'GET /api/insights?skills=python,js&role=engineer'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || err.statusCode || (err.type === 'entity.too.large' ? 413 : 500);
  const payload = {
    error: status === 413 ? 'Payload Too Large' : 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : (status === 413 ? 'Request entity too large' : 'Internal server error')
  };
  res.status(status).json(payload);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  // Start LaTeX warm-up asynchronously (can be disabled via LATEX_WARMUP=0)
  try {
    const { startLatexWarmup } = require('./utils/latexWarmup');
    startLatexWarmup();
  } catch (e) {
    console.warn('LaTeX warmup not started:', e && e.message ? e.message : String(e));
  }
});
