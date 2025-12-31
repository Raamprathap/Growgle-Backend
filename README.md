# Growgle Backend

A comprehensive career development and insights platform backend built with Node.js, Express, and Google Cloud services. Provides AI-powered career insights, personalized learning roadmaps, and news ingestion for career intelligence.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)

## Features

### Career Insights & Intelligence

- **AI-Powered Career Recommendations**: Leverages Google Vertex AI (Gemini) to analyze user profiles and provide personalized career insights
- **Real-Time News Ingestion**: Fetches and analyzes industry news using NewsAPI with automated tagging and categorization
- **Google Trends Integration**: Tracks trending topics and skills in real-time
- **BigQuery Analytics**: Stores and analyzes career-related data at scale

### Learning Roadmaps

- **Personalized Roadmaps**: Create, manage, and track custom learning paths
- **Progress Tracking**: Monitor milestones and achievements
- **CRUD Operations**: Full support for roadmap creation, retrieval, updates, and deletion

### User Management

- **Secure Authentication**: PASETO token-based authentication with Ed25519 cryptography
- **User Profiles**: Comprehensive profile management with education, experience, and skills tracking
- **Password Recovery**: Secure forgot password and reset functionality
- **Email Notifications**: Automated emails for registration, password reset, and welcome messages

### Document Processing

- **LaTeX Compilation**: Built-in LaTeX to PDF conversion using Tectonic
- **Resume Generation**: Dynamic resume compilation from user profiles
- **Cloudinary Integration**: Image and document storage

## Prerequisites

- **Node.js** 22.x or higher
- **Google Cloud Project** with the following APIs enabled:
  - Vertex AI API
  - BigQuery API
  - Firestore API
- **Firebase** project for authentication and database
- **NewsAPI** account and API key
- **Cloudinary** account for media storage (optional)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Raamprathap/Growgle-Backend.git
   cd Growgle-Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Google Cloud Configuration
   PROJECT_ID=your-gcp-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

   # NewsAPI Configuration
   NEWS_API_KEY=your-newsapi-key

   # Firebase Configuration
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
   FIREBASE_UNIVERSE_DOMAIN=googleapis.com

   # Cloudinary Configuration (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration (NodeMailer)
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587

   # LaTeX Warmup (Optional, set to 0 to disable)
   LATEX_WARMUP=1
   ```

4. **Google Cloud Authentication**

   Either use a service account key file:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

   Or use Application Default Credentials:

   ```bash
   gcloud auth application-default login
   ```

5. **Initialize BigQuery**

   Run the setup endpoint to create the necessary dataset and tables:

   ```bash
   curl -X POST http://localhost:3000/api/setup
   ```

## Usage

### Development Mode

```bash
npm run dev
```

Runs the server with nodemon for auto-reloading on file changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Docker Deployment

```bash
docker build -t growgle-backend .
docker run -p 3000:3000 --env-file .env growgle-backend
```

## API Endpoints

### Authentication

| Method | Endpoint                    | Description                 | Auth Required |
| ------ | --------------------------- | --------------------------- | ------------- |
| POST   | `/api/auth/register`        | Register a new user         | No            |
| POST   | `/api/auth/login`           | Login user                  | No            |
| POST   | `/api/auth/forgot-password` | Request password reset      | No            |
| POST   | `/api/auth/reset-password`  | Reset password with token   | No            |
| POST   | `/api/auth/verify-token`    | Verify authentication token | Yes           |
| POST   | `/api/auth/refresh-token`   | Refresh access token        | No            |

### Career Insights

| Method | Endpoint           | Description                            | Auth Required |
| ------ | ------------------ | -------------------------------------- | ------------- |
| POST   | `/api/setup`       | Initialize BigQuery dataset and tables | No            |
| POST   | `/api/ingest/news` | Ingest news articles for a query       | No            |
| GET    | `/api/insights`    | Get career insights (query params)     | No            |
| POST   | `/api/insights`    | Get career insights (request body)     | No            |
| GET    | `/api/status`      | Check system status                    | No            |

### Roadmaps

| Method | Endpoint            | Description            | Auth Required |
| ------ | ------------------- | ---------------------- | ------------- |
| POST   | `/api/roadmaps`     | Create a new roadmap   | Yes           |
| GET    | `/api/roadmaps`     | List all user roadmaps | Yes           |
| GET    | `/api/roadmaps/:id` | Get a specific roadmap | Yes           |
| PATCH  | `/api/roadmaps/:id` | Update a roadmap       | Yes           |
| DELETE | `/api/roadmaps/:id` | Delete a roadmap       | Yes           |

### Profile Management

| Method | Endpoint           | Description         | Auth Required |
| ------ | ------------------ | ------------------- | ------------- |
| GET    | `/api/profile/:id` | Get user profile    | Yes           |
| PUT    | `/api/profile/:id` | Update user profile | Yes           |

### LaTeX Compilation

| Method | Endpoint       | Description          | Auth Required |
| ------ | -------------- | -------------------- | ------------- |
| POST   | `/api/compile` | Compile LaTeX to PDF | No            |

### Health & Utility

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| GET    | `/`              | Database connection check |
| GET    | `/health`        | Health check endpoint     |
| GET    | `/api`           | API information           |
| GET    | `/generate-keys` | Generate Ed25519 key pair |

## Example Requests

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Get Career Insights

```bash
curl -X GET "http://localhost:3000/api/insights?skills=python,javascript&role=software%20engineer&experience=mid-level"
```

### Ingest News Articles

```bash
curl -X POST http://localhost:3000/api/ingest/news \
  -H "Content-Type: application/json" \
  -d '{
    "query": "artificial intelligence",
    "pageSize": 20,
    "includeTrends": true
  }'
```

### Create a Roadmap

```bash
curl -X POST http://localhost:3000/api/roadmaps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Full Stack Development Path",
    "description": "Complete roadmap to become a full stack developer",
    "milestones": [
      {
        "title": "Learn Frontend",
        "description": "Master HTML, CSS, JavaScript",
        "completed": false
      }
    ]
  }'
```

## Project Structure

```
Growgle-Backend/
├── src/
│   ├── index.js                 # Application entry point
│   ├── config/                  # Configuration files
│   │   ├── cloudinary.js        # Cloudinary setup
│   │   └── connectDB.js         # Firebase/Firestore connection
│   ├── controllers/             # Route controllers
│   │   ├── auth.controller.js
│   │   ├── roadmap.controller.js
│   │   ├── profile.controller.js
│   │   └── compile.controller.js
│   ├── routes/                  # API routes
│   │   ├── auth.route.js
│   │   ├── roadmap.route.js
│   │   ├── profile.route.js
│   │   ├── insights.route.js
│   │   └── compile.route.js
│   ├── services/                # Business logic
│   │   ├── careerInsightsService.js
│   │   └── overviewService.js
│   ├── middlewares/             # Custom middleware
│   │   ├── auth/                # Authentication middleware
│   │   ├── mail/                # Email templates and mailer
│   │   └── rsa/                 # Cryptographic key generation
│   ├── Schema/                  # Zod validation schemas
│   │   ├── userSchema.js
│   │   └── roadmapSchema.js
│   ├── gcpclient/               # Google Cloud clients
│   │   └── bigqueryClient.js
│   ├── vertexclient/            # Vertex AI clients
│   │   └── geminiClient.js
│   └── utils/                   # Utility functions
│       ├── googleTrendsClient.js
│       ├── newsApiClient.js
│       └── latexWarmup.js
├── Dockerfile                   # Docker configuration
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## Architecture

### Technology Stack

- **Runtime**: Node.js 22.x (CommonJS)
- **Framework**: Express 5.x
- **Database**: Google Firestore (NoSQL)
- **Analytics**: Google BigQuery
- **AI/ML**: Google Vertex AI (Gemini)
- **Authentication**: PASETO tokens with Ed25519
- **Storage**: Cloudinary
- **Email**: Nodemailer
- **Document Processing**: Tectonic (LaTeX)

### Key Dependencies

- `@google-cloud/bigquery` - BigQuery integration
- `@google-cloud/vertexai` - Vertex AI client
- `firebase-admin` - Firebase services
- `paseto` - Token-based authentication
- `zod` - Schema validation
- `axios` - HTTP client
- `bcryptjs` - Password hashing
- `nodemailer` - Email delivery
- `google-trends-api` - Trends data
- `moment-timezone` - Date/time handling

## Security Features

- **Ed25519 Cryptography**: Strong asymmetric encryption for token generation
- **PASETO Tokens**: Platform-agnostic security tokens (more secure than JWT)
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Environment Variables**: Sensitive data isolated in `.env` files
- **Token Validation Middleware**: Protects sensitive endpoints
- **CORS Protection**: Configurable cross-origin resource sharing

## Development

### Code Style

This project uses CommonJS modules. Follow standard JavaScript conventions and ES6+ features.

### Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Register the route in `src/index.js`
4. Add validation schema in `src/Schema/` if needed

### Testing

Run health checks:

```bash
curl http://localhost:3000/health
```

Check Firestore connection:

```bash
curl http://localhost:3000/
```

## Troubleshooting

### Firebase Connection Issues

- Verify Firebase credentials in `.env`
- Check that the service account has proper permissions
- Ensure Firestore API is enabled in Google Cloud Console

### BigQuery Setup Fails

- Confirm BigQuery API is enabled
- Verify `PROJECT_ID` in `.env`
- Check service account has BigQuery Admin role

### NewsAPI Returns No Results

- Verify `NEWS_API_KEY` is valid
- Check API quota limits
- Ensure the query is properly formatted

### LaTeX Compilation Errors

- Tectonic is automatically installed in Docker
- For local development, install Tectonic manually
- Disable warmup with `LATEX_WARMUP=0` if not needed

## Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/Raamprathap/Growgle-Backend/issues)
- **Repository**: [GitHub Repository](https://github.com/Raamprathap/Growgle-Backend)

## Maintainer

**Raam Prathap**

- GitHub: [@Raamprathap](https://github.com/Raamprathap)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- Code follows existing style conventions
- All tests pass
- New features include appropriate documentation
- Sensitive data is not committed

## License

This project is licensed under the ISC License.

---

**Note**: This project requires access to Google Cloud services and external APIs. Ensure all credentials are properly configured before deployment.
