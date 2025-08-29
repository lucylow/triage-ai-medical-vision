# Clinical Trial Matching System - Deployment Guide

This guide provides comprehensive instructions for deploying the Clinical Trial Matching System in various environments.

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Docker & Docker Compose**: Version 20.10+ and 2.0+
- **Node.js**: Version 18+ 
- **npm**: Version 8+
- **Python**: Version 3.11+
- **DFX SDK**: Version 0.15.0+ (for ICP development)

### 1. Automated Deployment

```bash
# Clone the repository
git clone <repository-url>
cd greyguard-trials-quest

# Make deployment script executable
chmod +x deploy_local.sh

# Run automated deployment
./deploy_local.sh
```

The script will:
- Check prerequisites
- Create environment configuration
- Install dependencies
- Build frontend
- Start all services
- Deploy ICP canisters
- Start uAgents

### 2. Manual Deployment

```bash
# Install frontend dependencies
npm install

# Build frontend
npm run build

# Start services
docker-compose up -d

# Deploy ICP canisters (in separate terminal)
dfx start --background
dfx deploy --network local
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check individual services
curl http://localhost:3000  # Frontend
curl http://localhost:8000  # DFX Local
curl http://localhost:9090  # Prometheus
```

## 🐳 Docker Services Overview

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| Frontend | 3000 | React application | `/api/health` |
| DFX Local | 8000 | ICP local network | `/` |
| Patient Agent | 8002 | Patient management | `/health` |
| Trial Agent | 8003 | Trial management | `/health` |
| Matching Agent | 8004 | Matching engine | `/health` |
| MCP Server | 8005 | Model Context Protocol | `/health` |
| Redis | 6379 | Message broker | `PING` |
| PostgreSQL | 5432 | Data storage | `pg_isready` |
| Prometheus | 9090 | Metrics collection | `/metrics` |
| Grafana | 3001 | Monitoring dashboard | `/` |

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# API Keys (Required)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AGENTVERSE_API_KEY=your_agentverse_api_key_here

# ICP Configuration
DFX_NETWORK=local
DFX_HOST=127.0.0.1:8000

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=clinical_trials
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password_123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Security Configuration
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Monitoring Configuration
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
LOG_LEVEL=INFO

# Development Configuration
NODE_ENV=development
VITE_DFX_NETWORK=local
VITE_DFX_HOST=127.0.0.1:8000
```

### API Key Setup

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account or sign in
3. Navigate to API Keys section
4. Create new API key
5. Copy key to `.env` file

#### Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Navigate to API Keys section
4. Create new API key
5. Copy key to `.env` file

#### Agentverse API Key
1. Visit [Agentverse](https://agentverse.ai/)
2. Create account or sign in
3. Navigate to API Keys section
4. Create new API key
5. Copy key to `.env` file

## 🏗️ Architecture Components

### Frontend (React + TypeScript)
- **Location**: `src/` directory
- **Build**: `npm run build`
- **Development**: `npm run dev`
- **Port**: 3000

### ICP Canisters (Motoko)
- **Location**: `src/backend/main.mo`
- **Deployment**: `dfx deploy --network local`
- **Network**: Local (127.0.0.1:8000)

### uAgents (Python)
- **Location**: `agents/` directory
- **Dependencies**: `requirements.txt`
- **Ports**: 8002-8005

### Services
- **Redis**: Message broker and caching
- **PostgreSQL**: Additional data storage
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboard

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Overall system health
curl http://localhost:3000/api/health

# Individual component health
curl http://localhost:8002/health  # Patient Agent
curl http://localhost:8003/health  # Trial Agent
curl http://localhost:8004/health  # Matching Agent
curl http://localhost:8005/health  # MCP Server
```

### Metrics Access

```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Grafana dashboard
open http://localhost:3001
# Username: admin, Password: admin
```

### Log Monitoring

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f dfx-local
docker-compose logs -f uagents-dev
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check port usage
lsof -i :3000
lsof -i :8000

# Stop conflicting services
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

#### 2. Services Not Starting

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service_name]

# Restart specific service
docker-compose restart [service_name]

# Restart all services
docker-compose restart
```

#### 3. API Key Issues

```bash
# Verify environment variables
cat .env

# Check if keys are loaded in containers
docker-compose exec frontend env | grep API_KEY

# Restart services after updating .env
docker-compose down
docker-compose up -d
```

#### 4. DFX Issues

```bash
# Check DFX status
dfx ping

# Reset DFX local network
dfx stop
dfx start --clean --background

# Redeploy canisters
dfx deploy --network local
```

#### 5. uAgent Issues

```bash
# Check agent logs
docker-compose logs uagents-dev

# Restart agents
docker-compose restart uagents-dev

# Check agent endpoints
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### Performance Issues

#### High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart memory-intensive services
docker-compose restart postgres redis
```

#### Slow Response Times
```bash
# Check service health
curl http://localhost:3000/api/health

# Monitor metrics
open http://localhost:3001

# Check Redis performance
docker exec redis redis-cli info memory
```

## 🚀 Production Deployment

### Production Environment Variables

```bash
# Production configuration
NODE_ENV=production
DFX_NETWORK=ic
DFX_HOST=https://ic0.app

# Production database
POSTGRES_HOST=your_production_db_host
POSTGRES_PASSWORD=your_secure_password

# Production Redis
REDIS_HOST=your_production_redis_host
REDIS_PASSWORD=your_redis_password

# Security
JWT_SECRET=your_production_jwt_secret
ENCRYPTION_KEY=your_production_encryption_key
```

### Production Docker Compose

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

### Load Balancer Configuration

```nginx
# Nginx configuration example
upstream frontend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔐 Security Considerations

### Encryption Keys
- Generate strong encryption keys (32+ characters)
- Store keys securely (not in version control)
- Rotate keys regularly (every 30 days)

### Network Security
- Use HTTPS in production
- Configure firewall rules
- Implement rate limiting
- Monitor for suspicious activity

### Data Privacy
- Encrypt sensitive data at rest
- Use secure communication protocols
- Implement access controls
- Regular security audits

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale frontend instances
docker-compose up -d --scale frontend=3

# Scale agent instances
docker-compose up -d --scale patient_agent=2
docker-compose up -d --scale trial_agent=2
```

### Database Scaling

```bash
# Use connection pooling
# Configure read replicas
# Implement database sharding
```

### Cache Scaling

```bash
# Redis cluster setup
# Implement cache invalidation
# Use CDN for static assets
```

## 🔄 Updates & Maintenance

### System Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Migrations

```bash
# Run database migrations
docker-compose exec postgres psql -U admin -d clinical_trials -f migrations/latest.sql
```

### Backup & Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U admin clinical_trials > backup.sql

# Restore database
docker-compose exec -T postgres psql -U admin -d clinical_trials < backup.sql
```

## 📚 Additional Resources

### Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Security Guide](docs/SECURITY.md)

### Support
- [GitHub Issues](https://github.com/your-org/clinical-trial-matching/issues)
- [Discussions](https://github.com/your-org/clinical-trial-matching/discussions)
- [Wiki](https://github.com/your-org/clinical-trial-matching/wiki)

### Community
- [Discord Server](https://discord.gg/your-server)
- [Telegram Group](https://t.me/your-group)
- [Twitter](https://twitter.com/your-handle)

---

## 🎯 Next Steps

After successful deployment:

1. **Test all features** through the frontend interface
2. **Monitor system health** using Grafana dashboards
3. **Configure alerts** for critical issues
4. **Set up logging** for production debugging
5. **Plan scaling** based on usage patterns
6. **Schedule regular maintenance** windows

For additional support or questions, please refer to the troubleshooting section or create an issue in the GitHub repository.
