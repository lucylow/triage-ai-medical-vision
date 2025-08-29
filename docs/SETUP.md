# 🚀 GreyGuard Trials - Complete Setup Guide

## 📋 **Prerequisites Installation**

### **System Requirements**
- **Operating System**: macOS 10.15+, Ubuntu 20.04+, Windows 10+
- **Memory**: Minimum 8GB RAM, Recommended 16GB+
- **Storage**: Minimum 10GB free space
- **Network**: Stable internet connection for blockchain sync

### **1. Node.js & npm Installation**

#### **macOS (using Homebrew)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v8.0.0 or higher
```

#### **Ubuntu/Debian**
```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### **Windows**
1. Download Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation in Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

### **2. Python Installation**

#### **macOS**
```bash
# Install Python using Homebrew
brew install python@3.11

# Verify installation
python3 --version  # Should be 3.8 or higher
pip3 --version
```

#### **Ubuntu/Debian**
```bash
# Install Python 3.11
sudo apt update
sudo apt install python3.11 python3.11-pip python3.11-venv

# Verify installation
python3.11 --version
pip3.11 --version
```

#### **Windows**
1. Download Python installer from [python.org](https://python.org/)
2. Run installer with "Add Python to PATH" checked
3. Verify installation in Command Prompt:
   ```cmd
   python --version
   pip --version
   ```

### **3. DFINITY SDK (dfx) Installation**

#### **macOS**
```bash
# Install dfx using Homebrew
brew install dfinity/tap/dfx

# Verify installation
dfx --version
```

#### **Ubuntu/Debian**
```bash
# Download and install dfx
sh -c "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/bin:$PATH"

# Verify installation
dfx --version
```

#### **Windows**
```bash
# Using PowerShell
powershell -c "irm https://internetcomputer.org/install.ps1 | iex"

# Verify installation
dfx --version
```

### **4. Git Installation**

#### **macOS**
```bash
# Install using Homebrew
brew install git

# Verify installation
git --version
```

#### **Ubuntu/Debian**
```bash
sudo apt update
sudo apt install git

# Verify installation
git --version
```

#### **Windows**
1. Download Git installer from [git-scm.com](https://git-scm.com/)
2. Run installer with default settings
3. Verify installation in Command Prompt:
   ```cmd
   git --version
   ```

## 🏗️ **Project Setup**

### **1. Clone Repository**
```bash
# Clone the GreyGuard Trials repository
git clone https://github.com/lucylow/greyguard-trials-quest.git

# Navigate to project directory
cd greyguard-trials-quest

# Verify project structure
ls -la
```

### **2. Frontend Setup**
```bash
# Navigate to frontend directory
cd web3/internet-computer/ic

# Install Node.js dependencies
npm install

# Verify all dependencies are installed
npm list --depth=0

# Start development server
npm run dev

# The application should now be running at http://localhost:8086/
```

### **3. ICP Canister Setup**

#### **Start Local ICP Replica**
```bash
# Navigate to ICP directory
cd ic

# Start local ICP replica in background
dfx start --background

# Wait for replica to start (check logs)
dfx logs

# Verify replica is running
dfx ping
```

#### **Deploy Canisters**
```bash
# Deploy all canisters
dfx deploy

# Verify deployment
dfx canister status greyguard_trials

# Get canister ID
dfx canister id greyguard_trials

# Test canister functionality
dfx canister call greyguard_trials greet '("World")'
```

#### **Configure Network Settings**
```bash
# Check current network
dfx config

# Set network to mainnet (for production)
dfx config networks.mainnet.providers '["https://ic0.app"]'

# Set network to staging (for testing)
dfx config networks.staging.providers '["https://ic0.app"]'
```

### **4. Fetch.ai Agent Setup**

#### **Install Python Dependencies**
```bash
# Navigate to Fetch.ai directory
cd ../fetch

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

#### **Configure Environment Variables**
```bash
# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Required environment variables:
export ASI_ONE_API_KEY="your_api_key_here"
export FETCH_AGENT_ADDRESS="agent1qg4zsqrdmyac8j6nc97nz99dxgauyaer2k8zw8mjcktnjrjh4jjkqfkj8tj"
export ICP_CANISTER_ID="rrkah-fqaaa-aaaaa-aaaaq-cai"
export ICP_NETWORK="mainnet"
```

#### **Start Fetch.ai Agent**
```bash
# Activate virtual environment (if not already active)
source venv/bin/activate

# Start the agent
python3 agent.py

# Verify agent is running
# You should see logs indicating agent startup and registration
```

### **5. Database Setup (if applicable)**

#### **PostgreSQL Setup**
```bash
# Install PostgreSQL
# On macOS:
brew install postgresql

# On Ubuntu:
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
# On macOS:
brew services start postgresql

# On Ubuntu:
sudo systemctl start postgresql

# Create database
createdb greyguard_trials

# Run migrations
python3 manage.py migrate
```

#### **Redis Setup (for caching)**
```bash
# Install Redis
# On macOS:
brew install redis

# On Ubuntu:
sudo apt install redis-server

# Start Redis service
# On macOS:
brew services start redis

# On Ubuntu:
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
```

## 🔧 **Configuration & Environment Setup**

### **1. Environment Configuration**
```bash
# Create main .env file in project root
cd ../..

# Create .env file
cat > .env << EOF
# Frontend Configuration
VITE_APP_TITLE=GreyGuard Trials
VITE_APP_DESCRIPTION=Decentralized Clinical Trial Matching
VITE_APP_VERSION=1.0.0

# ICP Configuration
VITE_ICP_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
VITE_ICP_NETWORK=mainnet
VITE_ICP_HOST=https://ic0.app

# Fetch.ai Configuration
VITE_FETCH_AGENT_ADDRESS=agent1qg4zsqrdmyac8j6nc97nz99dxgauyaer2k8zw8mjcktnjrjh4jjkqfkj8tj
VITE_ASI_ONE_API_KEY=your_api_key_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/greyguard_trials
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# External Services
TRIAL_REGISTRY_API_KEY=your_api_key_here
ML_MODEL_ENDPOINT=https://api.ml-service.com
EOF
```

### **2. Wallet Configuration**
```bash
# Install required browser extensions
# - Plug Wallet (Chrome/Firefox)
# - Internet Identity (Chrome/Firefox)
# - AstroX ME (Chrome/Firefox)
# - Stoic Wallet (Chrome/Firefox)

# Configure wallet connections in frontend
# The application will automatically detect installed wallets
```

### **3. API Key Configuration**

#### **ASI:One API Key**
1. Visit [ASI:One Dashboard](https://dashboard.asi.one)
2. Create account and verify email
3. Generate API key with appropriate permissions
4. Add to environment variables

#### **Trial Registry API Keys**
1. **ClinicalTrials.gov**: Register at [ClinicalTrials.gov](https://clinicaltrials.gov)
2. **WHO ICTRP**: Contact WHO for API access
3. **EU Clinical Trials**: Register at [EudraCT](https://eudract.ema.europa.eu/)

## 🧪 **Testing & Verification**

### **1. Frontend Testing**
```bash
# Navigate to frontend directory
cd web3/internet-computer/ic

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### **2. ICP Canister Testing**
```bash
# Navigate to ICP directory
cd ../../ic

# Run canister tests
dfx test

# Test specific canister
dfx test greyguard_trials

# Check canister status
dfx canister status greyguard_trials

# View canister logs
dfx logs greyguard_trials
```

### **3. Fetch.ai Agent Testing**
```bash
# Navigate to Fetch.ai directory
cd ../../fetch

# Activate virtual environment
source venv/bin/activate

# Run unit tests
python3 -m pytest tests/unit/

# Run integration tests
python3 -m pytest tests/integration/

# Run agent tests
python3 -m pytest tests/agent/

# Check test coverage
python3 -m pytest --cov=agent tests/
```

### **4. End-to-End Testing**
```bash
# Start all services
cd ../..

# Start ICP replica
cd ic && dfx start --background

# Start Fetch.ai agent
cd ../fetch && source venv/bin/activate && python3 agent.py &

# Start frontend
cd ../web3/internet-computer/ic && npm run dev

# Run complete workflow test
npm run test:workflow
```

## 🚀 **Deployment Instructions**

### **1. Production Build**
```bash
# Navigate to frontend directory
cd web3/internet-computer/ic

# Build for production
npm run build

# Verify build output
ls -la dist/

# Test production build locally
npm run preview
```

### **2. ICP Mainnet Deployment**
```bash
# Navigate to ICP directory
cd ../../ic

# Deploy to mainnet
dfx deploy --network mainnet

# Verify deployment
dfx canister status greyguard_trials --network mainnet

# Get mainnet canister ID
dfx canister id greyguard_trials --network mainnet
```

### **3. Fetch.ai Network Deployment**
```bash
# Navigate to Fetch.ai directory
cd ../../fetch

# Activate virtual environment
source venv/bin/activate

# Deploy agent to mainnet
python3 deploy_agent.py --network mainnet

# Verify agent deployment
python3 verify_deployment.py --network mainnet
```

### **4. Environment Configuration**
```bash
# Update production environment variables
# Update .env.production with mainnet values

# Update frontend configuration
# Update VITE_ICP_CANISTER_ID with mainnet canister ID
# Update VITE_ICP_NETWORK to "mainnet"
# Update VITE_FETCH_AGENT_ADDRESS with mainnet agent address
```

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **ICP Replica Won't Start**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
kill -9 <PID>

# Clear dfx cache
dfx cache delete

# Restart replica
dfx start --background
```

#### **Canister Deployment Fails**
```bash
# Check dfx version
dfx --version

# Update dfx
dfx upgrade

# Clear canister state
dfx canister uninstall-code greyguard_trials

# Redeploy
dfx deploy
```

#### **Fetch.ai Agent Connection Issues**
```bash
# Check network connectivity
ping fetch.ai

# Verify API key
echo $ASI_ONE_API_KEY

# Check agent logs
tail -f agent.log

# Restart agent
pkill -f agent.py
python3 agent.py
```

#### **Frontend Build Errors**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall dependencies
npm install

# Try building again
npm run build
```

## 📊 **Performance Monitoring**

### **1. ICP Canister Monitoring**
```bash
# Monitor canister cycles
dfx canister status greyguard_trials

# Check canister memory usage
dfx canister info greyguard_trials

# View canister logs
dfx logs greyguard_trials --follow
```

### **2. Frontend Performance**
```bash
# Build with performance analysis
npm run build:analyze

# Run Lighthouse audit
npx lighthouse http://localhost:8086 --output html

# Check bundle size
npm run build:size
```

### **3. Agent Performance**
```bash
# Monitor agent response times
python3 monitor_agent.py

# Check agent memory usage
ps aux | grep agent.py

# Monitor network requests
python3 network_monitor.py
```

## 🔒 **Security Checklist**

### **Pre-Deployment Security**
- [ ] Environment variables are properly secured
- [ ] API keys are not committed to repository
- [ ] HTTPS is enabled for production
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection protection is active
- [ ] XSS protection is implemented

### **Post-Deployment Security**
- [ ] Canister access controls are verified
- [ ] Agent authentication is working
- [ ] Data encryption is active
- [ ] Privacy features are functional
- [ ] Audit logging is enabled
- [ ] Backup procedures are tested

## 📚 **Additional Resources**

### **Documentation**
- [ICP Documentation](https://internetcomputer.org/docs)
- [Fetch.ai Documentation](https://docs.fetch.ai)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

### **Support Channels**
- [GitHub Issues](https://github.com/lucylow/greyguard-trials-quest/issues)
- [Discord Community](https://discord.gg/fetchai)
- [ICP Forum](https://forum.dfinity.org)
- [Stack Overflow](https://stackoverflow.com)

---

*This setup guide ensures that GreyGuard Trials can be properly configured and deployed for hackathon demonstration and judging. Follow each step carefully and verify functionality at each stage.*
