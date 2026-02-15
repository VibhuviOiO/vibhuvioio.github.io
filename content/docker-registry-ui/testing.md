---
title: Testing Guide
description: Testing Guide for Docker Registry UI
---

# Testing Guide

            ## Full Feature Testing with Multi-Registry Setup
            Test all features of Docker Registry UI with a realistic multi-registry environment populated with real images.

            ## Quick Setup
            Download the required files and start testing in minutes:

            ### Step 1: Download Files
            ```
# Create a test directory
mkdir docker-registry-ui-test
cd docker-registry-ui-test

# Download multi-registry compose file
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/refs/heads/main/docker/docker-compose-multi-registry.yml

# Download test image population script
wget https://raw.githubusercontent.com/VibhuviOiO/docker-registry-ui/refs/heads/main/docker/populate-test-images.sh

# Make script executable
chmod +x populate-test-images.sh
```

            ### Step 2: Start Multi-Registry Environment
            ```
# Start two registries and the UI
docker-compose -f docker-compose-multi-registry.yml up -d

# Wait for services to be ready (about 10 seconds)
sleep 10
```

            ### Step 3: Populate with Test Images
            ```
# Run the population script
./populate-test-images.sh

# This will:
# - Pull popular images (alpine, nginx, redis, postgres, node, python, etc.)
# - Push them to both test registries
# - Create ~40+ images in Registry 1
# - Create ~10+ images in Registry 2
# - Takes about 5-10 minutes depending on your internet speed
```

            ### Step 4: Access the UI
            ```
# Open in your browser
http://localhost:5003
```

            ## What Gets Created
            ### Registry 1 (localhost:5001)
            
                **alpine**: 3.18, 3.17, 3.16, latest
                **nginx**: 1.25, 1.24, 1.23, alpine, latest
                **redis**: 7.2, 7.0, 6.2, alpine, latest
                **postgres**: 16, 15, 14, 13, alpine
                **node**: 20, 18, 16, 20-alpine, 18-alpine
                **python**: 3.11, 3.10, 3.9, 3.11-slim, 3.10-alpine
                **busybox**: 1.36, 1.35, latest, musl
                **ubuntu**: 22.04, 20.04, 18.04, latest
                **mysql**: 8.0, 5.7, latest
                **mongo**: 7.0, 6.0, 5.0, latest
                **myapp/service-1,2,3**: v1.0.0, v1.1.0, latest
            

            ### Registry 2 (localhost:5002)
            
                **alpine**: 3.18, latest
                **nginx**: 1.25, alpine
                **redis**: 7.2, alpine
                **postgres**: 16, alpine
                **node**: 20, 20-alpine
            

            ## Features to Test

            ### 1. Multi-Registry Management
            
                Switch between Registry 1 and Registry 2 using dropdown
                View different image sets in each registry
                Configure registry settings
            

            ### 2. Repository Browsing
            
                Browse all repositories
                Search for specific repositories
                View repository details and statistics
            

            ### 3. Tag Management
            
                View all tags for each repository
                See tag sizes and creation dates
                View layer information
                Delete individual tags
            

            ### 4. Vulnerability Scanning
            
                Scan any image tag for vulnerabilities
                View CVE details with severity levels
                Filter vulnerabilities by severity
                See which layer introduced each vulnerability
            

            ### 5. Bulk Operations
            
                Delete multiple tags by pattern (e.g., `*-alpine`)
                Age-based cleanup (e.g., older than 30 days)
                Retention policies (keep last N tags)
                Dry run mode to preview deletions
            

            ### 6. Analytics
            
                View storage usage by repository
                See tag distribution
                Analyze disk usage patterns
            

            ## Test Scenarios

            ### Scenario 1: Clean Up Old Alpine Versions
            ```
1. Navigate to Bulk Operations
2. Repository pattern: alpine
3. Tag pattern: 3.*
4. Keep minimum: 2
5. Enable dry run
6. Review what would be deleted
7. Execute deletion
```

            ### Scenario 2: Scan for Vulnerabilities
            ```
1. Navigate to nginx repository
2. Click "Scan" on nginx:latest
3. Wait for scan to complete
4. View vulnerability badges
5. Click badge to see CVE details
6. Filter by severity (Critical, High)
7. Click CVE ID to view in NVD
```

            ### Scenario 3: Layer Inspection
            ```
1. Navigate to postgres repository
2. Click on postgres:16 tag
3. Click "View Layers"
4. See layer sizes and commands
5. View vulnerability counts per layer
```

            ## Cleanup
            When done testing, clean up everything:

            ```
# Stop and remove all containers
docker-compose -f docker-compose-multi-registry.yml down -v

# Remove downloaded images (optional)
docker image prune -a
```

            ## Troubleshooting

            ### Script Fails to Pull Images
            
                Check internet connectivity
                Verify Docker Hub is accessible
                Try running script again (it will skip already pulled images)
            

            ### UI Not Accessible
            
                Check if containers are running: `docker ps`
                Check logs: `docker-compose logs registry-ui`
                Verify port 5003 is not in use
            

            ### Registries Not Showing Images
            
                Ensure populate script completed successfully
                Check registry logs: `docker-compose logs registry-1`
                Verify images were pushed: `curl http://localhost:5001/v2/_catalog`
            

            ## Advanced Testing

            ### Custom Test Images
            Add your own test images:

            ```
# Tag and push custom image
docker tag myapp:latest localhost:5001/myapp:v1.0.0
docker push localhost:5001/myapp:v1.0.0
```

            ### Test with Authentication
            Modify docker-compose-multi-registry.yml to add basic auth to registries and test authentication flow.

            ## Automated Testing
            **Note:** This project currently does not have automated test coverage. Contributions for unit and integration tests are welcome!