<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-09: "We locked down the container for security, and now it can't write its logs"

## 🚨 Incident Report

**Severity:** SEV-2
**Summary:** A security review flagged that the app container was running as `root`
inside the container (a real risk — if an attacker ever escapes the app, root-in-container
is one step closer to root-on-host). An engineer fixed that by adding a non-root user.
Right after that change, every request to the app started returning `500` errors.

> "Running as non-root is a security best practice, I don't understand why this broke anything." — the engineer

They're right that it's a best practice — but something else needs to change alongside it.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-09 && ls -la
```

Notice the `logs/` folder already exists on the host, mounted into the container at
`/app/logs` — the app writes an access log line on every request.

## Step 2: Reproduce

```bash
docker compose up -d --build
curl -i localhost:3000/
```

You should get a `500` response with a body like `Logging failed: EACCES: permission
denied, open '/app/logs/access.log'`.

## Step 3: Confirm which user is the problem

```bash
docker compose exec web whoami
docker compose exec web ls -ld /app/logs
ls -ld logs
```

Compare the user the container runs as (from `Dockerfile`'s `USER` instruction) against
the ownership and permissions of the mounted `logs/` directory.

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-09/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

## Step 4: Understand the conflict

The `Dockerfile` correctly switches to a non-root `appuser` for security. But the bind
mount at `./logs:/app/logs` brings in a host directory, and nothing has told the container
that `appuser` is allowed to write there.

## Step 5: Fix it

Edit the `Dockerfile` so the logs directory is created and owned by `appuser` **before**
the `USER` instruction switches away from root (only root can `chown` things):

```dockerfile
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs
USER appuser
```

(Keep the rest of the `Dockerfile` as-is — just make sure this ownership fix happens
before `USER appuser`.)

## Step 6: Verify

```bash
docker compose up -d --build
curl -i localhost:3000/
cat logs/access.log
```

You should get a `200 OK`, and see log lines appear in `logs/access.log` on the host.

## Step 7: Clean up

```bash
docker compose down
rm -rf logs/*
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **non-root permissions incident** — one of the most common side effects of
properly hardening a container. Running as a non-root user is correct and recommended, but
every volume the app needs to write to must be explicitly owned by (or writable by) that
user, or you'll trade a security gap for an outage.

Ready for the next incident? Head to **LAB-10**, the last one in this Easy set.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The `Dockerfile` switches to a non-root user (`appuser`) for security, but
the bind-mounted `logs/` directory is owned by the host user (effectively `root` inside the
container's user namespace by default), so `appuser` gets `EACCES` when it tries to
`fs.appendFileSync` into `/app/logs/access.log`.

**Fix:** create the directory and `chown` it to the non-root user **before** switching to
that user in the `Dockerfile`:
```dockerfile
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app/logs
USER appuser
```
</details>
