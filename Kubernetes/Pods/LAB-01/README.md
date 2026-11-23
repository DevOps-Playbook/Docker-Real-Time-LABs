<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-01: "The pod that never schedules"

## 🎫 K8S-PODS-01
**Type:** Incident · **Priority:** P2 · **Component:** Kubernetes / Pods — Scheduling
**Reported by:** On-call Engineer

> "kubectl says my pod exists, but it's been `Pending` for twenty minutes. Nothing's wrong with my YAML, I checked it three times."

**Summary:** A `Deployment` was applied to the cluster. `kubectl get pods` shows the pod stuck in `Pending` — it was never even scheduled onto a node, let alone started.

**Your task:** Find out *why* the scheduler refuses to place this pod, and fix it.

> 💡 **Interview angle:** "What are the possible reasons a Pod stays `Pending`?" is one of the most common Kubernetes interview questions. This lab covers the single most common cause.

Click **Start**.

## Step 1: Make sure your Minikube cluster is up

```bash
minikube status || minikube start --driver=docker --cpus=2 --memory=3900
kubectl get nodes
```

You should see one `Ready` node.

## Step 2: Open the lab and look at the manifest

Cloud Shell should already have this repo cloned with your terminal sitting in its root
folder. Move into this lab from there:

```bash
cd Kubernetes/Pods/LAB-01 && cat pod.yaml
```

## Step 3: Reproduce the incident

```bash
kubectl apply -f pod.yaml
kubectl get pods
```

Wait ~15 seconds and run `kubectl get pods` again. The pod should still show `Pending`.

## Step 4: Investigate like an SRE — don't guess, describe

`kubectl describe` is the single most useful debugging command in Kubernetes. It shows an
**Events** section at the bottom explaining exactly what the scheduler tried and why it failed.

```bash
kubectl describe pod -l app=incident-app
```

Scroll to the `Events:` section at the bottom. Look for a line mentioning `Insufficient cpu`
or `FailedScheduling`.

## Step 5: Confirm what the node actually has available

```bash
kubectl describe node minikube | grep -A5 "Allocated resources"
```

Compare the CPU this pod is requesting against what's actually available on the node.

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Kubernetes/Pods/LAB-01/pod.yaml">
Open pod.yaml
</walkthrough-editor-open-file>

## Step 6: Fix it

Edit `pod.yaml` and lower the `resources.requests.cpu` (and `limits.cpu`) to
something realistic for a tiny nginx container — e.g. `250m` (a quarter of one CPU core).

## Step 7: Verify

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Press `Ctrl+C` once you see the pod reach `Running` / `1/1 Ready`.

## Step 8: Clean up

```bash
kubectl delete -f pod.yaml
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **scheduling incident** — a Pod that could never be placed because it asked
for more CPU than any node could give it. This is one of the top reasons (along with taints,
node selectors/affinity, and insufficient memory) that a Pod gets stuck `Pending` instead of
`Running`, and it's a question you should expect in almost any Kubernetes interview.

Ready for the next incident? Head to **LAB-02**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The pod's `resources.requests.cpu` is set to `"4"` — 4 full CPU cores — which
exceeds what a typical Minikube node has available. The scheduler can never find a node with
enough allocatable CPU, so the pod sits in `Pending` forever. `kubectl describe pod` shows
`0/1 nodes are available: 1 Insufficient cpu` under `Events`.

**Fix:**
```yaml
resources:
  requests:
    cpu: "250m"
    memory: "128Mi"
  limits:
    cpu: "250m"
    memory: "128Mi"
```
</details>
