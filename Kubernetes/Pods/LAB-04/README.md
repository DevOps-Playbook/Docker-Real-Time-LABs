<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-04: "The pod won't even create its container"

## 🎫 K8S-PODS-04
**Type:** Incident · **Priority:** P2 · **Component:** Kubernetes / Pods — Configuration
**Reported by:** Platform Team

> "We created the ConfigMap exactly like the runbook says. The pod still won't start."

**Summary:** A `ConfigMap` was applied to the cluster, followed by a `Deployment` meant to
consume it as environment variables. The pod never reaches `Running` — it's stuck in a
status that doesn't even look like a normal crash.

**Your task:** Identify the (very specific) failure status and what it's telling you.

> 💡 **Interview angle:** "What's the difference between `CrashLoopBackOff` and
> `CreateContainerConfigError`?" — a great way to tell candidates who've actually hit this
> apart from ones who've only memorized definitions.

Click **Start**.

## Step 1: Make sure Minikube is running

```bash
minikube status || minikube start --driver=docker --cpus=2 --memory=3900
```

## Step 2: Open the lab

```bash
cd Kubernetes/Pods/LAB-04 && ls
```

## Step 3: Reproduce

```bash
kubectl apply -f configmap.yaml -f pod.yaml
kubectl get pods
```

Notice the status column — it's not `CrashLoopBackOff` and not `ImagePullBackOff`. It's
something else entirely: `CreateContainerConfigError`.

## Step 4: Understand what that status actually means

Unlike a crash (the container started, then died) or an image pull failure, this status
means **Kubernetes couldn't even assemble the container's configuration** — usually because
it references a ConfigMap, Secret, or volume that doesn't exist (or doesn't exist *yet*).

## Step 5: Confirm the exact missing reference

```bash
kubectl describe pod -l app=incident-app
```

Look in `Events:` for a line like `configmap "..." not found`.

## Step 6: Compare what exists vs. what's referenced

```bash
kubectl get configmap
cat pod.yaml | grep -A2 configMapRef
```

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Kubernetes/Pods/LAB-04/pod.yaml">
Open pod.yaml
</walkthrough-editor-open-file>

You should see the ConfigMap name the Deployment is asking for doesn't match the name of the
ConfigMap that actually exists in the cluster.

## Step 7: Fix it

Edit `pod.yaml` so `envFrom.configMapRef.name` matches the ConfigMap's real name
(check `configmap.yaml` for the correct value — don't rename the ConfigMap itself).

## Step 8: Verify

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Press `Ctrl+C` once the pod reaches `1/1 Running`.

```bash
kubectl exec -it deploy/incident-app -- env | grep APP_MODE
```

You should see `APP_MODE=production` — confirming the config actually loaded.

## Step 9: Clean up

```bash
kubectl delete -f pod.yaml -f configmap.yaml
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **missing-reference incident** — `CreateContainerConfigError` almost always
means a `ConfigMap`, `Secret`, or `PersistentVolumeClaim` name referenced in the pod spec
doesn't match what's actually in the cluster (or in the right namespace). It's an easy fix
once you know to check `kubectl describe pod`'s `Events`, but a very confusing status if
you've never seen it before.

Ready for the next incident? Head to **LAB-05**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The `ConfigMap` that actually exists in the cluster is named `app-cfg`, but
the Deployment's `envFrom.configMapRef.name` asks for `app-config`. Kubernetes can't build
the container's environment without that reference resolving, so the pod is stuck in
`CreateContainerConfigError` and never even starts the container.

**Fix:**
```yaml
envFrom:
  - configMapRef:
      name: app-cfg
```
</details>
