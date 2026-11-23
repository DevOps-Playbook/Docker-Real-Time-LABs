<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-02: "Deploy succeeded, pod never starts"

## 🎫 K8S-PODS-02
**Type:** Incident · **Priority:** P2 · **Component:** Kubernetes / Pods — Container Images
**Reported by:** Release Engineer

> "`kubectl apply` said it succeeded! Why is nothing running?"

**Summary:** `kubectl apply -f pod.yaml` returns `deployment.apps/incident-app created`
with no errors. But the pod never reaches `Running` — it's stuck showing a strange status
in `kubectl get pods`.

**Your task:** Diagnose the pod's actual status (hint: `kubectl apply` succeeding only means
the manifest was *accepted* by the API server — it says nothing about whether the workload
can actually run) and fix it.

> 💡 **Interview angle:** "What's the difference between `ErrImagePull` and
> `ImagePullBackOff`?" comes up constantly — this lab lets you see both in the wild.

Click **Start**.

## Step 1: Make sure Minikube is running

```bash
minikube status || minikube start --driver=docker --cpus=2 --memory=3900
```

## Step 2: Open the lab

```bash
cd Kubernetes/Pods/LAB-02 && cat pod.yaml
```

## Step 3: Reproduce

```bash
kubectl apply -f pod.yaml
kubectl get pods
```

Keep re-running `kubectl get pods` every few seconds. You'll first see `ErrImagePull`,
then it settles into `ImagePullBackOff`.

## Step 4: Understand what those two statuses mean

- **`ErrImagePull`** — Kubernetes just tried to pull the image and that attempt failed.
- **`ImagePullBackOff`** — Kubernetes is now waiting (with exponential backoff) before
  trying again, because the last attempt(s) failed.

## Step 5: Get the exact error

```bash
kubectl describe pod -l app=incident-app
```

Look in `Events:` for a line like `Failed to pull image ... manifest unknown` or
`not found`.

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Kubernetes/Pods/LAB-02/pod.yaml">
Open pod.yaml
</walkthrough-editor-open-file>

## Step 6: Fix it

Correct the `image:` field to reference a tag that actually exists, e.g. `nginx:1.25-alpine`.

## Step 7: Verify

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Press `Ctrl+C` once it reaches `1/1 Running`.

## Step 8: Clean up

```bash
kubectl delete -f pod.yaml
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed an **image pull incident** — one of the most common root causes of a workload
never starting: a typo'd tag, a private registry needing credentials, or an image that was
deleted/never pushed. `kubectl describe pod` is always the fastest way to find out which one
you're dealing with.

Ready for the next incident? Head to **LAB-03**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `image: nginx:1.99-does-not-exist` references a tag that was never published
to Docker Hub. The kubelet can never successfully pull it, so the pod cycles between
`ErrImagePull` and `ImagePullBackOff` forever.

**Fix:**
```yaml
image: nginx:1.25-alpine
```
</details>
