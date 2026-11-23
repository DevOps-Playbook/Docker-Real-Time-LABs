<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-06: "Two services, one incident"

## 🚨 Incident Report

**Severity:** SEV-2
**Summary:** `web` and `api` were running as two separate processes on one VM, talking to
each other over `localhost`. Someone containerized both of them into separate containers
under Docker Compose — same code, no changes. Now `web` can never reach `api`.

> "I didn't change a single line of networking code." — the engineer

That's exactly the problem. Containerizing a service changes its network identity, even
if the code doesn't change.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-06 && ls -la
```

Notice there are now two services: `web` (root of this folder) and `api` (in `./api`).

## Step 2: Reproduce

```bash
docker compose up -d --build
curl localhost:3000/
```

You should get back `Failed to reach API service: ...` instead of posts data.

## Step 3: Confirm both containers are actually running

```bash
docker compose ps
```

Both `web` and `api` should show `Up`. So the failure isn't "api is down" — it's
something about how `web` is trying to reach it.

## Step 4: Think about networking, not code

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-06/server.js">
Open server.js
</walkthrough-editor-open-file>

```bash
grep API_HOST server.js
```

On a single VM, `localhost` means "this same machine," so two processes could reach each
other that way. **Inside Docker, every container is its own network namespace** —
`localhost` inside the `web` container only ever means the `web` container itself, never
the `api` container.

Docker Compose solves this by giving every service a DNS name equal to its service name in
`docker-compose.yml`.

```bash
grep -A3 "services:" docker-compose.yml
```

## Step 5: Fix it

Edit `server.js` so `API_HOST` points at the compose **service name** (`api`) instead of
`localhost`.

## Step 6: Verify

```bash
docker compose up -d --build
curl localhost:3000/
```

You should now get back `Got from API: [{"id":1,"title":"Hello from the API service"}]`.

## Step 7: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **cross-container networking incident** — the #1 surprise for anyone moving
from "processes on one box" to "containers on a Docker network." Containers talk to each
other by **service name**, not `localhost`, unless they're explicitly sharing a network
namespace.

Ready for the next incident? Head to **LAB-07**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `server.js` in the `web` service hardcodes `API_HOST = 'localhost'`. Inside
a container, `localhost` refers to that container only — it can never reach a sibling
container that way. Docker Compose's default bridge network gives each service a DNS
entry matching its service name.

**Fix:**
```js
const API_HOST = 'api'; // the compose service name for the API container
```
</details>
