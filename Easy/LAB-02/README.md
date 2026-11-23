---
walkthrough-tutorial-difficulty: 1
walkthrough-tutorial-duration: 15
---

<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-02: "It's running, but nobody can reach it"

## 🚨 Incident Report

**Severity:** SEV-3
**Summary:** `docker compose ps` shows the container as `Up`. Monitoring agrees the process
is alive. But every request to the app — from the browser, from curl, from the load
balancer — times out or gets connection refused.

> "The container is literally running. I don't get it." — the on-call engineer

This is one of the most common gaps between "the container started" and "the service is
actually usable." Your job: find where the wiring is broken.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-02 && ls
```

## Step 2: Reproduce

```bash
docker compose up -d --build
docker compose ps
```

Notice: status is `Up`. So far, this matches what the on-call engineer said.

## Step 3: Try to reach it

```bash
curl -m 3 localhost:8080/health
```

This should hang or fail with "Connection refused" — reproducing the incident.

## Step 4: Narrow down where the break is

First, confirm the app is actually healthy **inside** its own container (this rules out an
app-level bug):

```bash
docker compose exec web wget -qO- http://localhost:3000/health
```

If that works, the app itself is fine — the problem is entirely in how the container's port
is exposed to the host.

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-02/docker-compose.yml">
Open docker-compose.yml
</walkthrough-editor-open-file>

## Step 5: Compare the three numbers that must agree

Every containerized web app has three port numbers that have to line up:
1. The port the app **listens on** (check `server.js` — it falls back to port 3000)
2. The port `EXPOSE`d in the `Dockerfile`
3. The **container-side** port in the compose `ports:` mapping (`HOST:CONTAINER`)

```bash
grep PORT server.js
grep EXPOSE Dockerfile
grep -A2 ports docker-compose.yml
```

You should spot that the compose file maps `8080:8080`, but the app only listens on `3000`
inside the container — the container-side number doesn't match.

## Step 6: Fix it

Edit `docker-compose.yml` so the mapping is `HOST_PORT:3000` (keep `8080` as the host port
if you like — that part is fine).

## Step 7: Verify

```bash
docker compose up -d
curl localhost:8080/health
```

You should get `{"status":"ok"}`.

## Step 8: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a classic **host:container port mismatch** — a container can be perfectly
healthy and still be completely unreachable if the `ports:` mapping doesn't point at the
port the app is actually listening on inside the container.

Ready for the next incident? Head to **LAB-03**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The app listens on port `3000` inside the container, but
`docker-compose.yml` maps `8080:8080` — there is nothing listening on `8080` inside the
container, so the host-side connection has nowhere to go.

**Fix:**
```yaml
ports:
  - "8080:3000"
```
</details>
