# Task Manager App

A professional, production-ready Task Management application built with Next.js, MongoDB, and JWT authentication. Fully configured for CI/CD deployment with Jenkins.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login
- **CRUD Operations**: Full task management (Create, Read, Update, Delete)
- **Task Management**: 
  - Set task priority (low, medium, high)
  - Track task status (pending, in-progress, completed)
  - Set deadlines for tasks
  - Add descriptions to tasks
- **Dashboard**: Real-time statistics (total, completed, pending, overdue tasks)
- **Advanced Filtering**: Filter by status, priority, and date range
- **Responsive Design**: Works seamlessly on all devices
- **Professional UI**: Modern design with animations and icons
- **Health Check**: Built-in health monitoring endpoint

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Animations**: Framer Motion
- **Notifications**: React Toastify
- **Icons**: React Icons
- **Containerization**: Docker
- **CI/CD**: Jenkins

## 📋 Prerequisites

- Node.js 18 or higher
- MongoDB (local or cloud instance)
- Docker (for containerization)
- Jenkins (for CI/CD pipeline)

## 🔧 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Task-Manager-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   # Using Docker
   docker-compose up -d mongodb
   
   # Or start your local MongoDB service
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Docker Build

```bash
# Build image
docker build -t task-manager-app:latest .

# Run container
docker run -d \
  --name task-manager-app \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongodb-host:27017/taskmanager \
  -e JWT_SECRET=your-jwt-secret \
  --restart unless-stopped \
  task-manager-app:latest
```

## 🔄 CI/CD with Jenkins

### Setup Instructions

1. **Configure Jenkins:**
   - Install required plugins (Docker Pipeline, Credentials Binding)
   - Configure Node.js tool (version 18+)
   - Set up credentials (mongodb-uri, jwt-secret, nexus-credentials)

2. **Update Jenkinsfile:**
   - Set `NEXUS_REGISTRY` to your server IP
   - Set `DEPLOY_DIR` to your deployment directory

3. **Create Pipeline:**
   - New Item → Pipeline
   - Point to your Git repository
   - Script Path: `Jenkinsfile`

4. **Run Pipeline:**
   - The pipeline will automatically:
     - Checkout code
     - Install dependencies
     - Run linter
     - Build Next.js app
     - Build Docker image
     - Push to Nexus (if configured)
     - Deploy to server

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Project Structure

```
Task-Manager-App/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── tasks/        # Task CRUD endpoints
│   │   ├── dashboard/    # Dashboard stats
│   │   └── health/       # Health check endpoint
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── tasks/            # Tasks management page
│   └── page.js          # Home page
├── components/           # React components
├── models/              # MongoDB models
├── utils/               # Utility functions
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose (dev)
├── docker-compose.prod.yml  # Docker Compose (prod)
├── Jenkinsfile          # CI/CD pipeline
└── next.config.js       # Next.js configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health
- `GET /api/health` - Health check endpoint

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Secure HTTP headers
- Environment variable protection
- Non-root Docker user
- Input validation

## 📝 Environment Variables

See [.env.example](./.env.example) and [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable configuration.

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key (minimum 32 characters)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Health Check

The application includes a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "task-manager-app",
  "version": "1.0.0"
}
```

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### MongoDB Connection
- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity

### Docker Issues
- Check Docker daemon is running
- Verify Dockerfile syntax
- Check container logs: `docker logs task-manager-app`

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables setup
- [SETUP.md](./SETUP.md) - Local setup instructions
- [CHECKS.md](./CHECKS.md) - Pre-deployment checklist

## 👨‍💻 Developer

**Developed By:** Vivek Kamble  
**Class:** MCA Div A  
**Roll No:** 2401084

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Status:** ✅ Production Ready  
**CI/CD:** ✅ Jenkins Configured  
**Docker:** ✅ Multi-stage Build  
**Security:** ✅ Hardened  
**Documentation:** ✅ Complete
# Task-Manager-App-2401084-CICD
