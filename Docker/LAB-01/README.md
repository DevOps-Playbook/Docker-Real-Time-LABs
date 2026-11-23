<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-01: "The container that won't stay up"

## 🚨 Incident Report

**Severity:** SEV-3
**Reported by:** On-call engineer
**Summary:** The `incident-web` service was deployed 10 minutes ago. It passed the build
step with no errors, but it keeps restarting. Nothing is reachable on port 3000.

> "I built it, I ran it, and it just... dies. No idea why. Please help." — the engineer who wrote this Dockerfile

Your job: **reproduce the incident, find the root cause from the logs, fix it, and prove it's fixed.**

Click **Start** to begin.

## Step 1: Clone in and look around

Cloud Shell should already have this lab open at `~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-01`.

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-01 && ls
```

Take a look at the three files: `server.js`, `Dockerfile`, `docker-compose.yml`. Don't fix
anything yet — just read them.

## Step 2: Reproduce the incident

Build and start the stack exactly like the on-call engineer did:

```bash
docker compose up -d
```

Now check the container's status:

```bash
docker compose ps
```

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-01/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

You should see the container's state is `Exited` or `Restarting` — **not** `Up`. That matches the report.

## Step 3: Investigate (don't guess — read the logs)

This is the single most important habit in Docker debugging: **always check `docker logs` before
touching any file.**

```bash
docker compose logs web
```

Read the error carefully. It should point at a missing file.

## Step 4: Confirm the root cause

Compare what the `CMD` instruction in the `Dockerfile` is trying to run against what files
actually exist in the image:

```bash
cat Dockerfile | grep CMD
ls *.js
```

You should now see the mismatch: the `CMD` runs a filename that isn't in this project.

## Step 5: Apply the fix

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-01/Dockerfile">
Edit the Dockerfile
</walkthrough-editor-open-file>

Fix the `CMD` line so it launches the file that actually exists in this project.

## Step 6: Rebuild and verify

A code/Dockerfile change needs a rebuild, not just a restart:

```bash
docker compose up -d --build
docker compose ps
```

The container should now show `Up`. Confirm the app actually responds:

```bash
curl localhost:3000/health
```

You should get back `{"status":"ok"}`.

## Step 7: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You just fixed a real-world Docker incident: **a container that crash-loops because its
`CMD`/`ENTRYPOINT` points at the wrong file.** This is one of the most common "day 1" Docker
bugs in production — always read `docker logs` first.

Ready for the next incident? Head to **LAB-02**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `Dockerfile` has `CMD ["node", "app.js"]`, but the project's entry point is
`server.js`. Node exits immediately with `Error: Cannot find module '/app/app.js'`, Docker
sees the process exit, and (depending on a restart policy) keeps restarting it.

**Fix:**
```dockerfile
CMD ["node", "server.js"]
```
</details>
