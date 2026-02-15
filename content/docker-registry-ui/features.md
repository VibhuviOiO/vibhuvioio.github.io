---
title: Features
description: Features for Docker Registry UI
---

# Features Overview

            ## Repository Management
            Browse and manage Docker repositories with an intuitive interface:

            ![Repository Management Interface](/img/docker-registry-ui/repositories.png)
            
                **Repository List**: View all repositories in your registry
                **Search**: Quickly find repositories by name
                **Tags View**: See all tags for each repository
                **Tag Details**: View manifest, layers, and metadata
                **Delete Tags**: Remove individual tags (when not in read-only mode)
            

            ## Multi-Registry Support
            Manage multiple Docker registries from a single interface:

            ![Multi-Registry Configuration](/img/docker-registry-ui/registry-configuration-for-multi-registry-support.png)
            
                Switch between registries using the dropdown selector
                Support for local and remote registries
                Basic authentication support
                Independent configuration per registry
            

            ## Image Information
            Detailed information about each image tag:

            
                **Size**: Total image size
                **Created**: Image creation timestamp
                **Digest**: SHA256 digest for verification
                **Architecture**: Platform architecture (amd64, arm64, etc.)
                **OS**: Operating system
                **Layers**: Layer-by-layer breakdown with sizes
            

            ## Layer Inspection
            View detailed layer information:

            ![Layer Inspection View](/img/docker-registry-ui/layer-inspection.png)
            
                Layer digest and size
                Command that created the layer
                Vulnerability count per layer
                Layer order and hierarchy
            

            ## Vulnerability Scanning
            Built-in Trivy integration for security scanning:

            ![Vulnerability Scanning with CVE Details](/img/docker-registry-ui/cves.png)
            
                **On-Demand Scanning**: Scan any image tag
                **Severity Levels**: Critical, High, Medium, Low, Unknown
                **CVE Details**: View detailed vulnerability information
                **NVD Links**: Direct links to National Vulnerability Database
                **Layer Attribution**: See which layer introduced each vulnerability
                **Persistent Results**: Scan results saved for future reference
            

            ## Bulk Operations
            Efficiently manage multiple images:

            
                **Pattern Matching**: Delete tags matching wildcards (e.g., `dev-*`)
                **Age-Based Cleanup**: Remove tags older than specified days
                **Retention Policies**: Keep minimum number of recent tags
                **Dry Run Mode**: Preview deletions before executing
                **Batch Processing**: Delete multiple tags in one operation
            

            ## Read/Write Modes
            Control access levels:

            
                **Read-Only Mode**: Browse and scan without modification
                **Read-Write Mode**: Full access including delete operations
                Toggle via environment variable or UI
                Ideal for production environments
            

            ## User Interface
            Modern, responsive design:

            
                Clean, intuitive layout inspired by Jira/Bitbucket
                Responsive design for mobile and desktop
                Dark mode support
                Fast, client-side rendering
                Real-time updates
            

            ## API Integration
            Full Docker Registry v2 API support:

            
                List repositories and tags
                Get image manifests
                Delete images by digest
                CORS support for browser access
            

            ## Storage Analytics
            Understand registry storage usage:

            ![Storage Analytics Dashboard](/img/docker-registry-ui/analytics-understand-disk-usage.png)
            
                Total repository size
                Per-tag storage breakdown
                Layer deduplication visibility
                Storage trends over time
            

            ## Search and Filter
            Find what you need quickly:

            
                Repository name search
                Tag filtering
                Vulnerability severity filtering
                Sort by name, date, or size