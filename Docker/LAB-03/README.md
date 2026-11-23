<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-03: "It worked yesterday, it's crash-looping today"

## 🚨 Incident Report

**Severity:** SEV-2
**Summary:** Someone "cleaned up" the compose file yesterday to standardize environment
variable names across services. Since then, the `web` container restarts every few
seconds and never comes up.

> "I only renamed a variable, I didn't touch any code!" — the engineer who made the change

Your job: confirm that claim, find what actually broke, and fix it without touching the
app code (the fix belongs in config, not in `server.js`).

Click **Start**.

## Step 1: Open the lab

```bash
cd Docker/LAB-03 && ls
```

## Step 2: Reproduce

```bash
docker compose up -d --build
docker compose ps
```

Watch the `web` service's status — it should be restarting repeatedly.

## Step 3: Read the logs

```bash
docker compose logs web
```

Look for a line starting with `FATAL:` — that's the application telling you exactly what
it's missing. Note the **exact name** of the environment variable it expects.

## Step 4: Compare expectation vs. reality

```bash
grep MONGO server.js
grep -A3 environment docker-compose.yml
```

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Docker/LAB-03/docker-compose.yml">
Open docker-compose.yml
</walkthrough-editor-open-file>

You should now see two different variable names being used — one in the app, one in the
compose file's `environment:` block.

## Step 5: Fix it

Edit `docker-compose.yml` so the environment variable name matches what `server.js` reads.
(Remember: in this lab, the fix belongs in the compose file, not the app.)

## Step 6: Verify

```bash
docker compose up -d
docker compose ps
curl localhost:3000/health
```

The container should stay `Up`, and `curl` should return a JSON body containing the Mongo
connection string.

## Step 7: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **configuration drift incident** — the app and its environment disagreed on a
variable's name. This class of bug is extremely common after refactors, and it's exactly
why reading the crash log's first line (not just "it's restarting") saves you from
guessing.

Ready for the next incident? Head to **LAB-04**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `server.js` reads `process.env.MONGO_URL`, but `docker-compose.yml` sets
`MONGO_URI` instead. The variable is never set from the app's point of view, so it exits
with code 1, and the container restarts forever.

**Fix:**
```yaml
environment:
  - MONGO_URL=mongodb://mongo:27017/wanderlust
```
</details>
