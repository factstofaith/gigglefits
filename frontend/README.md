# TAP Integration Platform

A modern web application for integration management and workflow orchestration.

## 🚀 Features

- **Integration Management**: Create, configure, and manage integrations
- **Workflow Builder**: Visual interface for building data workflows
- **Monitoring Dashboard**: Track performance and execution metrics
- **Multi-tenant Architecture**: Support for multiple organizations
- **Extensible Design System**: Consistent UI components

## 📋 Requirements

- Node.js 14+
- npm 7+
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Technologies

- **Frontend**: React.js with custom design system
- **Backend**: Python with FastAPI
- **Storage**: PostgreSQL, S3-compatible storage
- **Authentication**: OAuth 2.0 / OpenID Connect

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/tap-integration-platform.git
cd tap-integration-platform
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test
npm run test:e2e  # Run E2E tests with Cypress
```

### Backend Tests

```bash
cd backend
pytest
```

## 📄 Project Structure

```
├── frontend/                # React frontend application
│   ├── archive/             # Archived and deprecated files
│   │   ├── backups/         # Backup files
│   │   ├── deprecated/      # Deprecated components and utilities
│   │   ├── logs/            # Build and error logs
│   │   └── reports/         # Analysis reports
│   ├── public/              # Static files
│   ├── scripts/             # Build and utility scripts
│   │   ├── cleanup.js       # Project cleanup script
│   │   └── design-system-cleanup.js # Design system cleanup
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── design-system/   # Design system components
│   │   │   ├── adapted/     # Framework adapter components
│   │   │   ├── components/  # Core design system components
│   │   │   └── foundations/ # Design tokens and primitives
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── technical-debt/      # Technical debt tracking
│   └── validation-reports/  # Build and test validation
├── backend/                 # Python backend application
│   ├── adapters/            # External service adapters
│   ├── core/                # Core application logic
│   ├── db/                  # Database models and migrations
│   ├── modules/             # Feature modules
│   │   ├── admin/           # Admin functionality
│   │   ├── integrations/    # Integration management
│   │   └── users/           # User management
│   ├── utils/               # Utility functions
│   └── test/                # Backend tests
├── project/                 # Project management
│   └── sunlight/            # Code optimization tooling
└── documentation/           # Documentation files
```

## 🌐 Environment Configuration

Frontend environment variables are stored in `.env` files:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

Backend environment variables are managed through:

- `.env` - Local development
- Environment variables in deployment environments

## 🚀 Deployment

### Frontend Deployment

```bash
cd frontend
npm run build
```

### Backend Deployment

```bash
cd backend
docker build -t tap-integration-platform-backend .
docker run -p 8000:8000 tap-integration-platform-backend
```

## 🔍 Code Quality Tools

- ESLint for JavaScript linting
- Prettier for code formatting
- TypeScript for type checking
- Pytest for Python testing
- Jest for JavaScript testing
- Project Sunlight for code standardization
- Automated cleanup scripts for project maintenance

### Code Standardization

This project follows a 10-phase approach to code standardization:

1. **Initial Setup & Direct Fixes** - Project structure and immediate issues
2. **Component Standardization** - Remove duplicates, standardize patterns
3. **Hook & Context Standardization** - Fix React hooks issues
4. **Service & Utility Standardization** - Optimize services and utilities
5. **Test & Documentation Standardization** - Improve test coverage
6. **Build & Deployment Optimization** - Improve webpack configuration
7. **Performance Optimization** - React optimizations (memo, lazy loading)
8. **Accessibility & SEO** - Add ARIA attributes, improve SEO
9. **Final Polishing** - Error boundaries, feature flags, documentation
10. **Zero Technical Debt** - Eliminate all remaining issues

For more information on the cleanup process, see:
- [CLEANUP-PROGRESS.md](./CLEANUP-PROGRESS.md) - Current progress of cleanup
- [CLEANUP-SUMMARY.md](./CLEANUP-SUMMARY.md) - Summary of completed cleanup

## 📚 Documentation

- API Documentation: `/api/docs`
- Component Documentation: `/frontend/src/docs`
- User Guide: `/documentation`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the [INSERT LICENSE] - see the LICENSE file for details.

## 🙏 Acknowledgments

- List any third-party libraries or resources you want to acknowledge
