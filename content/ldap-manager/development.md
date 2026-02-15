---
title: Development Guide
description: "Development guide for LDAP Manager contributors: setup, architecture, technology stack, and contribution guidelines."
---

# Development Guide


Complete guide for developers who want to contribute to LDAP Manager.


## Technology Stack


### Frontend

- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **shadcn/ui** - Beautiful UI components built on Radix UI + Tailwind CSS
- **SOLID Services Architecture** - Abstraction-based HTTP client with dependency injection for reusability
- **Axios** - HTTP client library (via IHttpClient abstraction)
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework


### Backend

- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Latest Python features
- **python-ldap** - LDAP client library
- **PyYAML** - YAML configuration parsing
- **Pydantic** - Data validation and settings management
- **cryptography** - Fernet symmetric encryption for password storage
- **Uvicorn** - ASGI server


### Testing

- **Frontend E2E** - Playwright with 95 tests across Chrome, Firefox, Safari
- **Backend Unit/Integration** - pytest with 104 tests (97% pass rate)
- **Coverage Target** - >80% code coverage for backend
- **Security Testing** - Encryption, injection protection, authentication


#### Backend Test Suite

- 24 tests - Password encryption and cache security
- 19 tests - Load balancing and node selection
- 20 tests - LDAP client operations
- 25 tests - API endpoints and security
- 15 tests - Connection pooling


## Project Structure


```
ldap-manager/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── entries.py    # LDAP entries endpoints
│   │   │   ├── monitoring.py # Health monitoring
│   │   │   └── connection.py # Connection management
│   │   ├── core/             # Core functionality
│   │   │   ├── ldap_client.py # LDAP operations
│   │   │   └── config.py     # Configuration loader
│   │   ├── models/           # Data models
│   │   └── main.py           # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ClusterDetails.tsx
│   │   │   ├── DirectoryTable.tsx
│   │   │   ├── CreateUserDialog.tsx
│   │   │   ├── EditUserDialog.tsx
│   │   │   ├── MonitoringView.tsx
│   │   │   └── ReplicationTopology.tsx
│   │   ├── lib/              # Utilities
│   │   ├── services/         # API services
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── tests/                # E2E tests
│   └── package.json          # Node dependencies
├── docs/                     # Documentation
├── config.yml                # Cluster configuration
├── docker-compose.yml        # Docker setup
├── Dockerfile                # Container image
└── README.md                 # Project readme
```


## Local Development Setup


### Prerequisites

- Python 3.11+
- Node.js 20+
- Git
- OpenLDAP server (for testing)


### 1. Clone Repository


```
git clone https://github.com/VibhuviOiO/ldap-manager.git
cd ldap-manager
```


### 2. Backend Setup


```
# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --port 8000
```


Backend will be available at `http://localhost:8000`


### 3. Frontend Setup


```
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```


Frontend will be available at `http://localhost:5173`


### 4. Configuration


Create `config.yml` in the root directory:


```
clusters:
  - name: "Development LDAP"
    host: "localhost"
    port: 389
    bind_dn: "cn=Manager,dc=example,dc=com"
    base_dn: "dc=example,dc=com"
```


## Running Tests


### Backend Tests


```
# Install test dependencies
cd backend
pip install -r requirements-test.txt

# Run all tests with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_password_cache.py -v

# Run tests by category
pytest -m security  # Security tests only
```


View coverage report: `open htmlcov/index.html`


#### Test Categories

- `tests/test_password_cache.py` - Password encryption and TTL
- `tests/test_node_selector.py` - Load balancing and failover
- `tests/test_ldap_client.py` - LDAP operations
- `tests/test_api_entries.py` - API endpoints and security
- `tests/test_connection_pool.py` - Connection pooling
- `tests/test_config_validator.py` - Configuration validation


### Frontend E2E Tests


```
cd frontend
npm run test           # Vitest unit tests
npx playwright test    # E2E tests (all browsers)
npx playwright test --headed  # Watch tests run
```


## Architecture


### Frontend Architecture


```
Browser
   ↓
React App (Port 5173)
   ↓
Services Layer (ClusterService, EntryService, etc.)
   ↓
IHttpClient Interface (SOLID: Dependency Inversion)
   ↓
AxiosHttpClient Implementation
   ↓
Backend API (Port 8000)
   ↓
python-ldap
   ↓
OpenLDAP Server
```


### Component Hierarchy


```
App.tsx
├── Dashboard.tsx
│   └── ClusterCard (for each cluster)
└── ClusterDetails.tsx
    ├── DirectoryTable.tsx
    │   ├── CreateUserDialog.tsx
    │   ├── EditUserDialog.tsx
    │   └── ColumnSettings.tsx
    ├── MonitoringView.tsx
    │   ├── DirectoryStats.tsx
    │   ├── NodeSyncStats.tsx
    │   └── ReplicationTopology.tsx
    └── ActivityLogView.tsx
```


### API Flow


```
Frontend Request
   ↓
/api/entries/search
   ↓
FastAPI Endpoint
   ↓
LDAP Client
   ↓
ldapsearch with pagination
   ↓
Parse Results
   ↓
JSON Response
```


## Key Components


### Dashboard.tsx


Main landing page showing all configured clusters with health status.


### ClusterDetails.tsx


Cluster view with tabs: Users, Groups, OUs, All, Monitoring, Activity.


### DirectoryTable.tsx


Reusable table component with search, pagination, and column customization.


### CreateUserDialog.tsx


Dynamic form for creating users based on config.yml user_creation_form.


### MonitoringView.tsx


Health monitoring dashboard with stats and replication topology.


### ReplicationTopology.tsx


Visual representation of multi-master replication using SVG.


## Development Workflow


### 1. Create Feature Branch


```
git checkout -b feature/your-feature-name
```


### 2. Make Changes

- Follow existing code style
- Add TypeScript types
- Update tests if needed
- Test locally


### 3. Run Tests


```
cd frontend
npm run test:e2e
```


### 4. Commit Changes


```
git add .
git commit -m "feat: add new feature"
```


### 5. Push and Create PR


```
git push origin feature/your-feature-name
```


Then create a Pull Request on GitHub.


## Code Style Guidelines


### TypeScript/React

- Use functional components with hooks
- Define proper TypeScript interfaces
- Use meaningful variable names
- Keep components small and focused
- Extract reusable logic into custom hooks


### Python/FastAPI

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Handle errors gracefully
- Use async/await where appropriate


### Example: Good Component


```
interface UserTableProps {
  entries: LDAPEntry[];
  onEdit: (dn: string) => void;
  onDelete: (dn: string) => void;
}

export function UserTable({ entries, onEdit, onDelete }: UserTableProps) {
  return (
    <table>
      {entries.map(entry => (
        <tr key={entry.dn}>
          <td>{entry.uid}</td>
          <td>{entry.cn}</td>
        </tr>
      ))}
    </table>
  );
}
```


## Adding New Features


### Adding a New API Endpoint

1. Create endpoint in `backend/app/api/`
2. Add LDAP operation in `backend/app/core/ldap_client.py`
3. Create frontend service in `frontend/src/services/`
4. Add UI component in `frontend/src/components/`
5. Write tests in `frontend/tests/e2e/`


### Adding a New UI Component

1. Create component file in `frontend/src/components/`
2. Define TypeScript interfaces
3. Use shadcn/ui components
4. Add to parent component
5. Test in browser


## Building for Production


### Build Docker Image


```
docker build -t ldap-manager:latest .
```


### Test Production Build


```
docker run -d \
  -p 5173:5173 \
  -p 8000:8000 \
  -v ./config.yml:/app/config.yml \
  ldap-manager:latest
```


## Contributing Guidelines


### Before Submitting PR

- ✅ Code follows style guidelines
- ✅ All tests pass
- ✅ No console errors
- ✅ Feature works in Chrome, Firefox, Safari
- ✅ Documentation updated if needed
- ✅ Commit messages are clear


### PR Description Template


```
## What does this PR do?
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes
```


## Getting Help

- **GitHub Issues** - Report bugs or request features
- **GitHub Discussions** - Ask questions
- **Documentation** - Check existing docs
- **Code Comments** - Read inline documentation


## Resources

- React Documentation
- TypeScript Docs
- FastAPI Documentation
- shadcn/ui Components
- Playwright Testing
- python-ldap Docs


## Next Steps

- Learn about testing
- Explore all features
- View source code