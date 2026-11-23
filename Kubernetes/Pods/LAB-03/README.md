<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-03: "CrashLoopBackOff, round and round"

## 🎫 K8S-PODS-03
**Type:** Incident · **Priority:** P2 · **Component:** Kubernetes / Pods — Workloads
**Reported by:** On-call Engineer

> "It keeps restarting itself into oblivion. Restart count is already at 11 and climbing."

**Summary:** A worker pod is stuck in `CrashLoopBackOff`. The container starts, dies almost
immediately, and Kubernetes keeps restarting it with increasing backoff delay.

**Your task:** Find out exactly why the container exits the instant it starts, and fix it.

> 💡 **Interview angle:** "How would you debug a `CrashLoopBackOff` pod?" is asked in almost
> every DevOps/SRE interview. The answer always starts with `kubectl logs --previous`.

Click **Start**.

## Step 1: Make sure Minikube is running

```bash
minikube status || minikube start --driver=docker --cpus=2 --memory=3900
```

## Step 2: Open the lab

```bash
cd Kubernetes/Pods/LAB-03 && cat pod.yaml
```

## Step 3: Reproduce

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Within a few restarts you'll see the status settle into `CrashLoopBackOff`. Press `Ctrl+C`.

## Step 4: Read the logs from the crashed container

This is the key trick most people miss: once a container has restarted, `kubectl logs`
shows the logs of the **current** (freshly restarted, maybe not-yet-crashed) container.
To see why the **previous** attempt died, you need `--previous`:

```bash
kubectl logs -l app=incident-app --previous
```

You should see a shell error about a command not being found.

## Step 5: Confirm with describe

```bash
kubectl describe pod -l app=incident-app
```

Look at `Last State: Terminated` and its `Reason` / `Exit Code` (a non-zero exit code
confirms the process itself failed, rather than being killed externally).

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Kubernetes/Pods/LAB-03/pod.yaml">
Open pod.yaml
</walkthrough-editor-open-file>

## Step 6: Fix it

Look very closely at the `command:` field — there's a typo in the shell command itself.
Fix it (it should be a real shell builtin, not a typo of one).

## Step 7: Verify

```bash
kubectl apply -f pod.yaml
kubectl get pods -w
```

Press `Ctrl+C` once `RESTARTS` stops climbing and status is `Running`.

```bash
kubectl logs -l app=incident-app
```

You should see the "Hello from the incident worker" message, with no more restarts.

## Step 8: Clean up

```bash
kubectl delete -f pod.yaml
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **CrashLoopBackOff incident** — Kubernetes' way of saying "this container keeps
exiting right after I start it." The fastest path to root cause is always
`kubectl logs --previous` followed by `kubectl describe pod` to check the exit code and
termination reason.

Ready for the next incident? Head to **LAB-04**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The container's command is `sh -c "ech Hello ... && sleep 3600"` — `ech` is
not a real command (it should be `echo`). The shell immediately errors out with
`ech: not found` and exits non-zero, so Kubernetes restarts it, over and over, with
increasing backoff delay — the definition of `CrashLoopBackOff`.

**Fix:**
```yaml
command: ["sh", "-c", "echo Hello from the incident worker && sleep 3600"]
```
</details>
