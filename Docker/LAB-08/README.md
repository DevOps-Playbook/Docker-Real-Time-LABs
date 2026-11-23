<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-08: "The app works fine, but the orchestrator thinks it's dead"

## 🚨 Incident Report

**Severity:** SEV-2
**Summary:** Users report the app is working. Engineers can `curl` it from their laptop
and get a perfect `200 OK`. But `docker ps` shows the container's status as
**`(unhealthy)`**, and your (imaginary) production orchestrator keeps killing and
restarting it because of that status.

> "The app is up! Why does Docker think it's down?!" — a confused engineer

Click **Start**.

## Step 1: Open the lab

```bash
cd Docker/LAB-08 && ls
```

## Step 2: Reproduce

```bash
docker compose up -d --build
```

Wait about 15-20 seconds for a few health check cycles to run, then check status:

```bash
docker compose ps
```

You should see `(unhealthy)` next to the `web` service, even though the app responds fine.

## Step 3: Prove the app itself is fine

```bash
curl localhost:3000/health
```

That should return `{"status":"ok"}` without any problem — confirming the app is not the
issue. The health check mechanism itself is broken.

## Step 4: See exactly what the health check is doing and why it fails

```bash
docker inspect --format='{{json .State.Health}}' incident-web | python3 -m json.tool
```

Look at the `Log` section — it shows the actual command Docker ran for the health check and
its output/exit code.

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Docker/LAB-08/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

```bash
grep -A2 HEALTHCHECK Dockerfile
```

Now check whether that command even exists inside this minimal base image:

```bash
docker compose exec web which curl || echo "curl: not found"
```

## Step 5: Fix it

You have two valid options — pick one:

**Option A — install curl:**
```dockerfile
RUN apk add --no-cache curl
```

**Option B — use wget, which Alpine ships by default:**
```dockerfile
HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1
```

## Step 6: Verify

```bash
docker compose up -d --build
sleep 15
docker compose ps
```

The status should now show `(healthy)`.

## Step 7: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **healthcheck tooling incident** — a very common gotcha with slim base images
like `alpine`: they deliberately don't ship tools like `curl` to stay small, so any
`HEALTHCHECK`, readiness probe, or debugging command that assumes it's there will silently
fail in a way that looks like the app itself is broken.

Ready for the next incident? Head to **LAB-09**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The `HEALTHCHECK` instruction runs `curl`, but the `node:18-alpine` base
image does not include `curl` by default. The health check command itself fails
("exec: curl: not found"), so Docker marks the container `unhealthy` — regardless of
whether the application is actually working.

**Fix (either works):**
```dockerfile
RUN apk add --no-cache curl
```
or switch the check to a tool Alpine already has:
```dockerfile
HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1
```
</details>
