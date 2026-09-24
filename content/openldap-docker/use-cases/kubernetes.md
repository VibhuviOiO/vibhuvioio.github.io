---
title: Kubernetes
description: Run the container on k3s with hostPort access, three providers, and the published Helm chart.
---

# Kubernetes

The container runs on Kubernetes, but four things behave differently from Docker Compose. Every one of them has broken this project at least once.

| | Docker Compose | Kubernetes |
|---|---|---|
| Image content in a volume | copied into a fresh named volume | **not** — a claim mounts empty |
| Storage | `./data:/var/lib/ldap` | `PersistentVolumeClaim`, `Pending` until a pod consumes it |
| File mode | host umask | `0400` root-owned is unreadable by uid 55 |
| `/run/secrets` | free | collides with the projected service-account token |

## 1. An empty claim hides cn=config

The image ships `/etc/openldap/slapd.d` with 9 files. Compose copies them into a fresh named volume; a claim mounts empty, so `slapd` finds no configuration and exits at once. Seed it:

```yaml
initContainers:
  - name: seed-config
    image: vibhuvioio/openldap:2.6.10
    command: ["sh", "-c", "cp -a /etc/openldap/slapd.d/. /config/"]
    volumeMounts:
      - { name: config, mountPath: /config }
```

## 2. The process user

`slapd` runs as uid 55. A certificate or password file mounted `0400` and owned by root is unreadable, which surfaces as `TLS negotiation failure` while the certificate looks perfectly valid on the host. Fix with `fsGroup: 55`, `defaultMode: 0440`, or both.

## 3. /run/secrets collides with the service-account token

Kubernetes projects a token into `/var/run/secrets/kubernetes.io/serviceaccount`, inside a read-only mount. Mounting a Secret at `/run/secrets` makes the kubelet try to create that path and fail:

```
create mountpoint .../run/secrets/kubernetes.io: read-only file system
```

Set `automountServiceAccountToken: false` on any pod that never calls the API server.

## 4. A Service named after the image's variables

A Service named `ldap` makes Kubernetes inject `LDAP_PORT=tcp://<cluster-ip>:389`, which collides with the image's own `LDAP_PORT` and misleads the healthcheck:

```
FAILED: ldap://localhost:tcp://10.43.42.148:389 is not answering
```

Set `enableServiceLinks: false`. The server is fine; only the probe reads the wrong value.

## Lab cluster

k3s in one container, publishing the ports the manifests bind with `hostPort`:

```bash
docker run -d --name k3s --privileged \
  -p 6443:6443 -p 1389:1389 -p 1689:1689 \
  rancher/k3s:v1.31.4-k3s1 server \
  --disable=traefik --write-kubeconfig-mode=644 --tls-san=127.0.0.1

until docker exec k3s test -f /etc/rancher/k3s/k3s.yaml; do sleep 2; done
docker exec k3s cat /etc/rancher/k3s/k3s.yaml > /tmp/k3s.yaml
export KUBECONFIG=/tmp/k3s.yaml
kubectl get nodes
```

`hostPort` binds on the node, so no `kubectl port-forward` is needed — a client on the host reaches `ldap://localhost:1389` directly. Below 1024 would need root, hence 1389 rather than 389.

> **k3s, not kind.** kind ships containerd 2.x, where `slapd` grows to ~6.9 GiB and is OOM-killed before it ever listens, at any memory limit. v1.31.4 is the last k3s on containerd 1.7; the pin is deliberate.

## The three use cases

| # | What it proves | Access |
|---|---|---|
| 01 single node | an empty claim gets seeded; data outlives the pod | `hostPort 1389` from the host |
| 02 three nodes | a write on one provider reaches the other two and all three converge on `contextCSN`; a provider that was down catches up | `kubectl exec` |
| 03 Helm chart | the published chart, its `helm test`, and a rollout that keeps the data | `helm test` |

Each is a numbered runbook in the [use-cases repo](https://github.com/VibhuviOiO/openldap-usecases/tree/main/kubernetes), and each ships a `test.sh` that runs the same steps and asserts the outcome — the same one CI runs.

## Helm

```bash
helm repo add vibhuvioio https://VibhuviOiO.github.io/openldap-helmchart
helm repo update

kubectl create namespace directory
kubectl -n directory create secret generic ldap-auth \
  --from-literal=admin-password="$(openssl rand -base64 24)" \
  --from-literal=config-password="$(openssl rand -base64 24)" \
  --from-literal=replication-password="$(openssl rand -base64 24)"

helm install ldap vibhuvioio/openldap -n directory \
  --set auth.existingSecret=ldap-auth --wait

helm test ldap -n directory
```

`--wait` returns only once every provider passes its probe. The chart never generates passwords: Helm would regenerate them on every upgrade and the providers would stop sharing a replication credential.

## Verify from the host

```bash
ldapsearch -x -H ldap://localhost:1389 \
  -D cn=Manager,dc=example,dc=com -W -b dc=example,dc=com -s base dn
# dn: dc=example,dc=com
```

## Keep data across a delete

```bash
kubectl -n ldap-single delete pod -l app=ldap    # claims survive, data survives
kubectl -n ldap-single delete pvc --all          # this is what deletes the data
```

## Troubleshooting

A pod `Pending` with `Events: <none>` for ~20s on first apply is the claims provisioning — normal with `WaitForFirstConsumer`, and there are no pod events yet, only PVC ones.

A `CrashLoopBackOff` whose log stops at `daemon_init: ldap:/// ldaps:/// ldapi:///` is the containerd 2.x `slapd` bug, not a manifest problem. Use k3s.
