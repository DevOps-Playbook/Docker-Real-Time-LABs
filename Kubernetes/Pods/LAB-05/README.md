<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-05: "Killed, over and over, with no crash in the logs"

## 🎫 K8S-PODS-05
**Type:** Incident · **Priority:** P1 · **Component:** Kubernetes / Pods — Resource Management
**Reported by:** On-call Engineer

> "There's no error in the application logs. It's just... gone, and then it's back, and then
> it's gone again. `kubectl logs` shows nothing useful at all."

**Summary:** A pod keeps restarting. Unlike a typical `CrashLoopBackOff` from a code bug,
`kubectl logs` shows no error message, no stack trace — the container is simply terminated
mid-run with no warning from the application itself.

**Your task:** Find the real reason this container is being killed (hint: it's not the
application's fault) and fix it.

> 💡 **Interview angle:** "What does `OOMKilled` mean, and how is it different from a normal
> application crash?" One of the most practically important Kubernetes interview questions —
> this exact scenario (silent restarts, no app-level errors) is the real-world giveaway.

Click **Start**.

## Step 1: Make sure Minikube is running

```bash
minikube status || minikube start --driver=docker --cpus=2 --memory=3900
```

## Step 2: Open the lab

```bash
cd Kubernetes/Pods/LAB-05 && cat pod.yaml
```

This container deliberately grows a string in memory forever (simulating a memory leak or
just an under-provisioned workload).

## Step 3: Reproduce

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Watch `RESTARTS` start climbing within 10-20 seconds. Press `Ctrl+C`.

## Step 4: Check the logs first (as you would for any restart)

```bash
kubectl logs -l app=incident-app --previous
```

Notice: there's **nothing here**. No stack trace, no error message — a strong early signal
that the application itself isn't choosing to exit; something external is killing it.

## Step 5: Get the real reason from the pod's status, not its logs

```bash
kubectl describe pod -l app=incident-app
```

Look at the `Last State:` block. You should see:
```
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

`OOMKilled` means the Linux kernel's out-of-memory killer terminated the process because the
container tried to use more memory than its `limits.memory` allows. Exit code `137` = `128 +
9` (`SIGKILL`) — confirming it was killed, not a normal exit.

## Step 6: Compare the limit against what the workload actually needs

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Kubernetes/Pods/LAB-05/pod.yaml">
Open pod.yaml
</walkthrough-editor-open-file>

```bash
grep -A2 "limits:" pod.yaml
```

This process doubles a string's size repeatedly — its memory usage grows continuously and
will blow past almost any small limit within seconds.

## Step 7: Fix it

For this lab, raise `resources.limits.memory` (and `requests.memory`) generously, e.g. to
`"64Mi"`, so the container has meaningfully more headroom.

> In a real incident you'd also ask: *should* this container's memory usage be unbounded like
> this? Often the better fix is addressing a genuine memory leak in the app, not just raising
> the limit — but knowing how to confirm `OOMKilled` and size limits appropriately is the
> core skill being tested here.

## Step 8: Verify

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Watch for longer this time — restarts should be far less frequent (the container will still
eventually hit the new, higher limit, since this demo workload intentionally never stops
growing — that's expected for this lab).

## Step 9: Clean up

```bash
kubectl delete -f pod.yaml
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You've now worked through the 5 most common **Pod-level** incidents in Kubernetes:
unschedulable pods, image pull failures, crash loops, missing ConfigMaps, and memory limits.
Notice the pattern across all 5: **`kubectl describe` and `kubectl logs --previous` are
almost always where the real answer lives** — guessing from the YAML alone rarely gets you
there as fast.

That's the full Kubernetes Pods set! 🐳☸️

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The container's workload continuously grows an in-memory string with no
upper bound, while `resources.limits.memory` is set to only `10Mi`. Once the container's
actual memory usage exceeds that limit, the kernel's OOM killer terminates it (`SIGKILL`,
exit code `137`), which Kubernetes reports as `OOMKilled`. Because the process is killed
externally rather than exiting on its own, there is no application-level error to find in
`kubectl logs`.

**Fix:**
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "64Mi"
    cpu: "100m"
```
(And in a real incident: investigate whether the workload should actually have unbounded
memory growth at all — that's usually the deeper, permanent fix.)
</details>
