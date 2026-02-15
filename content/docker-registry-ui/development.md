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
docker-compose -f docker/docker-compose.dev.yml build

# Start registry and UI in development mode
docker-compose -f docker/docker-compose.dev.yml up -d

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f registry-ui

# Stop services
docker-compose -f docker/docker-compose.dev.yml down
```

            ### Live Reload
            The development compose file mounts your local code directories:

            
                `app/` - Python backend code
                `templates/` - HTML templates
                `static/` - CSS and JavaScript
            
            Changes to these files are reflected immediately. For Python changes, restart the container:

            ```
docker-compose -f docker/docker-compose.dev.yml restart registry-ui
```

            ### Access Points
            
                **UI**: http://localhost:5003
                **Registry**: http://localhost:5001
            

            ## Local Python Development (Alternative)
            If you prefer running Python locally:

            ```
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run application (recommended)
python run.py

# Or run as ASGI (matches production image)
uvicorn asgi:app --host 0.0.0.0 --port 5000
```

            ## Project Structure
            ```
docker-registry-ui/
├── run.py                 # Application entrypoint (Flask factory)
├── asgi.py                # ASGI wrapper for production (uvicorn)
├── app/
│   ├── data_store.py     # Scan results storage
│   ├── registry.py       # Registry API client
│   └── scanners/
│       └── trivy.py      # Trivy scanner integration
├── static/
│   ├── css/              # Stylesheets
│   └── js/               # JavaScript files
├── templates/            # HTML templates
├── docker/               # Docker configuration
└── docs/                 # Documentation
```

            ## Technology Stack
            
                **Backend**: Python 3.9+, Flask
                **Frontend**: Vanilla JavaScript, Bootstrap 5
                **Scanner**: Trivy
                **API**: Docker Registry v2 API
            

            ## Running Tests
            ```
# Run unit tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=app tests/
```

            ## Building Production Image
            ```
# Build production image
docker build -t docker-registry-ui:latest .

# Test production image
docker run -d -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  docker-registry-ui:latest
```

            ## Development Tips
            
                **Code Editor**: Use any editor (VS Code, PyCharm, etc.)
                **Debugging**: Check logs with `docker-compose logs -f`
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