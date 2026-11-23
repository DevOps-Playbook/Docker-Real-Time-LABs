# Kubernetes Real-Time LABs — Pods (Minikube)

Five "break it on purpose" incidents, all focused on the single most fundamental Kubernetes
object: the **Pod**. Same philosophy as the Docker labs in this repo — each one ships broken,
modeled on a real production ticket, and doubles as one of the most frequently asked
Kubernetes interview questions. Runs entirely on a **Minikube** cluster inside Cloud Shell.

| Lab | Incident | Concept (and classic interview question) |
|---|---|---|
| [LAB-01](./LAB-01) | Pod stuck `Pending` forever | Unschedulable resource requests |
| [LAB-02](./LAB-02) | Pod never starts, no app error | `ImagePullBackOff` / `ErrImagePull` |
| [LAB-03](./LAB-03) | Restart count climbing forever | `CrashLoopBackOff` + `kubectl logs --previous` |
| [LAB-04](./LAB-04) | Pod won't even create its container | `CreateContainerConfigError` (missing ConfigMap) |
| [LAB-05](./LAB-05) | Silent restarts, no log errors | `OOMKilled` and memory limits |

## Prerequisites

Each lab assumes a running Minikube cluster in Cloud Shell. If you haven't started one yet:

```bash
minikube start --driver=docker --cpus=2 --memory=3900
kubectl get nodes
```

(Every lab's Step 1 repeats this check, so you can safely jump into any lab directly.)

## How to use these

```bash
cd Kubernetes/Pods/LAB-01
kubectl apply -f pod.yaml
kubectl get pods
# ...debug, fix, re-verify, as described in the lab's README.md...
kubectl delete -f pod.yaml
```

Work through them in order — they go from a pod that can't even get scheduled, through
image and crash failures, up to config and memory issues, which is roughly the order
these show up during a real on-call rotation (and in interviews).
