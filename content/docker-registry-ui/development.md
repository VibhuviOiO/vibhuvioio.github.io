---
title: Development Guide
description: Development Guide for Docker Registry UI
---

# Development Guide

            ## Docker-Based Development (Recommended)
            Develop without installing Python or dependencies locally. All you need is Docker and a code editor.

            ### Setup
            ```
# Clone repository
git clone https://github.com/VibhuviOiO/docker-registry-ui.git
cd docker-registry-ui
```

            ### Development Workflow
            ```
# Build the development environment
docker compose -f docker-compose.dev.yml build

# Start registry and UI in development mode
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f registry-ui

# Stop services
docker compose -f docker-compose.dev.yml down
```

            ### Live Reload
            The development compose file mounts your local code directories:

            
                `app/` - Python backend code
                `templates/` - HTML templates
                `static/` - CSS and JavaScript
            
            Changes to these files are reflected immediately. For Python changes, restart the container:

            ```
docker compose -f docker-compose.dev.yml restart registry-ui
```

            ### Access Points
            
                **UI**: http://localhost:5005
                **Registry**: http://localhost:5001
            

            ## Local Python Development (Alternative)
            If you prefer running Python locally:

            ```
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run application (production-style ASGI server)
python run.py

# Or run Uvicorn directly
uvicorn asgi:app --host 0.0.0.0 --port 5000
```

            ## Project Structure
            ```
docker-registry-ui/
├── run.py                 # Application entrypoint (Uvicorn)
├── asgi.py                # FastAPI ASGI application
├── logging_config.json    # JSON logging configuration
├── app/
│   ├── __init__.py        # FastAPI app factory
│   ├── config.py          # Configuration loader
│   ├── data_store.py      # Scan results and job state storage
│   ├── health.py          # Health check endpoints
│   ├── logger.py          # JSON logging formatter
│   ├── registry.py        # Registry API client
│   ├── routes.py          # API and HTML routes
│   └── scanners/
│       ├── base.py        # Scanner interface
│       ├── factory.py     # Scanner factory
│       └── trivy.py       # Trivy scanner integration
├── static/
│   ├── js/                # JavaScript files
│   └── style.css          # Stylesheets
├── templates/             # Jinja2 HTML templates
├── docker/                # Docker Compose examples
└── data/                  # Runtime data (created on first run)
```

            ## Technology Stack
            
                **Backend**: Python 3.13, FastAPI
                **Frontend**: Vanilla JavaScript, Bootstrap 5
                **Scanner**: Trivy (built-in or remote server)
                **API**: Docker Registry v2 API
                **Server**: Uvicorn (ASGI)
            

            ## Running Tests
            This project currently does not have automated test coverage. Contributions for unit and integration tests are welcome!

            ## Building Production Image
            ```
# Build production image
docker build -t docker-registry-ui:latest .

# Test production image with built-in Trivy
docker run -d -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/trivy-data:/root/.cache/trivy \
  docker-registry-ui:latest
```

            ## Development Tips
            
                **Code Editor**: Use any editor (VS Code, PyCharm, etc.)
                **Debugging**: Check logs with `docker compose logs -f`
                **Database**: No database required - stateless design
                **Hot Reload**: Frontend changes (HTML/CSS/JS) reflect immediately
                **Backend Changes**: Restart container for Python changes
            

            ## Contributing
            
                Fork the repository
                Create a feature branch
                Make your changes
                Write tests
                Submit a pull request
            

            ## Code Style
            
                Follow PEP 8 for Python code
                Use ESLint for JavaScript
                Write descriptive commit messages
                Add comments for complex logic
