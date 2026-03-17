---
title: Kubernetes Deployment
description: Why deploying LDAP on Kubernetes is risky, when it makes sense, and how to do it safely with StatefulSets.
---

# Kubernetes Deployment

Deploying OpenLDAP on Kubernetes is technically possible — but it's a decision that deserves careful thought. LDAP is the backbone of authentication for most organizations. Putting it on Kubernetes introduces risks that don't exist with simpler deployment models.

## The Hard Truth About LDAP on Kubernetes

LDAP is not a typical stateless microservice. It's a **stateful, persistent, security-critical service** that every other application depends on. This creates a fundamental tension with Kubernetes.

### Why Teams Hesitate

**LDAP is the foundation of authentication.** If LDAP goes down, nobody can log in — not to Kubernetes itself, not to any application that authenticates against it. Deploying the service that controls access to your infrastructure *inside* that infrastructure creates a circular dependency.

**Stateful workloads on Kubernetes are hard.** Despite StatefulSets, Kubernetes was built for stateless services. Pod rescheduling, node failures, and storage reattachment can cause data corruption if not handled carefully. The MDB database that OpenLDAP uses requires consistent storage — not storage that might disappear during a node drain.

**The blast radius is massive.** A misconfigured Kubernetes upgrade, a storage class issue, or a pod eviction at the wrong time doesn't just break one service — it breaks authentication for everything.

**Multi-master replication adds complexity.** OpenLDAP's syncRepl protocol expects stable network identities and persistent connections. Kubernetes pod IPs change on restart. DNS resolution can be delayed. This can cause replication conflicts or split-brain scenarios.

### What the Industry Does

Most organizations that run LDAP in production keep it **outside Kubernetes**:

- Dedicated VMs or bare metal with Docker / Docker Compose
- Managed directory services (AWS Directory Service, Azure AD DS)
- Standalone containers on long-lived hosts

The applications *inside* Kubernetes connect to LDAP via an external service endpoint. This is the most common and safest pattern.

## When Kubernetes Makes Sense

There are legitimate reasons to run LDAP on Kubernetes:

- **All-in-one clusters** where everything runs on K8s and no external infrastructure is available
- **Development and staging** environments that mirror production topology
- **Edge deployments** where a single K8s cluster is the only compute available
- **Teams with strong K8s expertise** who understand StatefulSet operations deeply

If you decide to proceed, the deployment below is production-hardened.

## StatefulSet Deployment

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ldap
```

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: openldap-credentials
  namespace: ldap
type: Opaque
stringData:
  LDAP_ADMIN_PASSWORD: "changeme"
  LDAP_CONFIG_PASSWORD: "changeme"
```

> **Security:** Use a secrets manager (Vault, Sealed Secrets, External Secrets Operator) instead of plain manifests in production.

### StatefulSet — Single Node

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: openldap
  namespace: ldap
spec:
  serviceName: openldap
  replicas: 1
  selector:
    matchLabels:
      app: openldap
  template:
    metadata:
      labels:
        app: openldap
    spec:
      containers:
        - name: openldap
          image: ghcr.io/vibhuvioio/openldap:latest
          ports:
            - containerPort: 389
              name: ldap
            - containerPort: 636
              name: ldaps
          env:
            - name: LDAP_DOMAIN
              value: "company.com"
            - name: LDAP_ORGANIZATION
              value: "Company Inc"
            - name: INCLUDE_SCHEMAS
              value: "cosine,inetorgperson,nis"
            - name: ENABLE_MONITORING
              value: "true"
          envFrom:
            - secretRef:
                name: openldap-credentials
          volumeMounts:
            - name: ldap-data
              mountPath: /var/lib/ldap
            - name: ldap-config
              mountPath: /etc/openldap/slapd.d
          livenessProbe:
            exec:
              command:
                - ldapsearch
                - "-x"
                - "-H"
                - "ldap://localhost:389"
                - "-b"
                - ""
                - "-s"
                - "base"
            initialDelaySeconds: 30
            periodSeconds: 30
            timeoutSeconds: 5
          readinessProbe:
            exec:
              command:
                - ldapsearch
                - "-x"
                - "-H"
                - "ldap://localhost:389"
                - "-b"
                - ""
                - "-s"
                - "base"
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 5
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "1000m"
  volumeClaimTemplates:
    - metadata:
        name: ldap-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 1Gi
    - metadata:
        name: ldap-config
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 100Mi
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openldap
  namespace: ldap
spec:
  type: ClusterIP
  selector:
    app: openldap
  ports:
    - name: ldap
      port: 389
      targetPort: 389
    - name: ldaps
      port: 636
      targetPort: 636
```

Applications inside the cluster connect to `openldap.ldap.svc.cluster.local:389`.

### External Access (Optional)

To expose LDAP outside the cluster:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openldap-external
  namespace: ldap
spec:
  type: NodePort
  selector:
    app: openldap
  ports:
    - name: ldap
      port: 389
      targetPort: 389
      nodePort: 30389
```

> **Warning:** Exposing LDAP externally without TLS sends passwords in plaintext. Always enable TLS for external access.

## Multi-Master on Kubernetes

Running multi-master replication on Kubernetes requires a headless service for stable DNS names:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openldap-headless
  namespace: ldap
spec:
  clusterIP: None
  selector:
    app: openldap-cluster
  ports:
    - name: ldap
      port: 389
```

Each pod gets a stable DNS name: `openldap-cluster-0.openldap-headless.ldap.svc.cluster.local`.

The StatefulSet for multi-master needs each pod to know its `SERVER_ID` and peers. This typically requires an init container or startup script that derives the server ID from the pod ordinal:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: openldap-cluster
  namespace: ldap
spec:
  serviceName: openldap-headless
  replicas: 3
  selector:
    matchLabels:
      app: openldap-cluster
  template:
    metadata:
      labels:
        app: openldap-cluster
    spec:
      containers:
        - name: openldap
          image: ghcr.io/vibhuvioio/openldap:latest
          ports:
            - containerPort: 389
          env:
            - name: LDAP_DOMAIN
              value: "company.com"
            - name: LDAP_ORGANIZATION
              value: "Company Inc"
            - name: INCLUDE_SCHEMAS
              value: "cosine,inetorgperson,nis"
            - name: ENABLE_REPLICATION
              value: "true"
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          envFrom:
            - secretRef:
                name: openldap-credentials
          command:
            - /bin/sh
            - -c
            - |
              # Derive SERVER_ID from pod ordinal (openldap-cluster-0 → 1)
              ORDINAL=${POD_NAME##*-}
              export SERVER_ID=$((ORDINAL + 1))
              
              # Build peer list excluding self
              PEERS=""
              for i in 0 1 2; do
                if [ "$i" != "$ORDINAL" ]; then
                  PEER="openldap-cluster-${i}.openldap-headless.ldap.svc.cluster.local"
                  PEERS="${PEERS:+${PEERS},}${PEER}"
                fi
              done
              export REPLICATION_PEERS="$PEERS"
              
              # Start OpenLDAP
              exec /docker-entrypoint.sh
          volumeMounts:
            - name: ldap-data
              mountPath: /var/lib/ldap
            - name: ldap-config
              mountPath: /etc/openldap/slapd.d
          livenessProbe:
            exec:
              command: ["ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
            initialDelaySeconds: 45
            periodSeconds: 30
          readinessProbe:
            exec:
              command: ["ldapsearch", "-x", "-H", "ldap://localhost:389", "-b", "", "-s", "base"]
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "1000m"
  volumeClaimTemplates:
    - metadata:
        name: ldap-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 1Gi
    - metadata:
        name: ldap-config
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 100Mi
```

## Known Risks on Kubernetes

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Pod eviction** | LDAP unavailable during reschedule | Use `PodDisruptionBudget` with `minAvailable: 2` |
| **Storage loss** | Data corruption or loss | Use reliable StorageClass with `reclaimPolicy: Retain` |
| **DNS delay** | Replication peers can't find each other | Use headless service, increase retry intervals |
| **Node drain** | All LDAP pods may land on same node | Use `podAntiAffinity` to spread across nodes |
| **Circular dependency** | K8s can't authenticate if LDAP is down | Consider external LDAP or bootstrap credentials |

### Pod Disruption Budget

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: openldap-pdb
  namespace: ldap
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: openldap-cluster
```

### Pod Anti-Affinity

Add to the StatefulSet pod spec to spread pods across nodes:

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: openldap-cluster
        topologyKey: kubernetes.io/hostname
```

## The Recommended Pattern

For most organizations, the safest approach is:

1. **Run LDAP outside Kubernetes** — Docker Compose on dedicated hosts
2. **Create an ExternalName Service** in Kubernetes pointing to the LDAP host
3. **Applications inside K8s** connect via the service name

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openldap
  namespace: ldap
spec:
  type: ExternalName
  externalName: ldap.internal.company.com
```

Or use Endpoints for IP-based external services:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: openldap
  namespace: ldap
spec:
  ports:
    - port: 389
---
apiVersion: v1
kind: Endpoints
metadata:
  name: openldap
  namespace: ldap
subsets:
  - addresses:
      - ip: 10.0.1.50
    ports:
      - port: 389
```

This gives Kubernetes workloads a stable service name (`openldap.ldap.svc.cluster.local`) while keeping LDAP safely outside the cluster.

## Next Steps

- [Single Node Deployment](/openldap-docker/deployment/single-node) — simpler Docker Compose deployment
- [Multi-Master Cluster](/openldap-docker/deployment/multi-master) — Docker Compose cluster
- [Security](/openldap-docker/security) — TLS and ACL hardening
- [Monitoring](/openldap-docker/monitoring) — health checks and alerting
