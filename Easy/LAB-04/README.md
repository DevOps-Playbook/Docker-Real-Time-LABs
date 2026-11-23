---
walkthrough-tutorial-difficulty: 1
walkthrough-tutorial-duration: 15
---

<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-04: "The build succeeds, but the app still can't find its own dependencies"

## 🚨 Incident Report

**Severity:** SEV-3
**Summary:** A developer added "live reload" to the dev compose file by mounting the
project folder into the container, so code changes show up without rebuilding. Right
after that change shipped, the container started crashing with
`Error: Cannot find module 'express'` — even though `npm install` clearly succeeds during
the build.

> "I watched `npm install` run in the build logs. Express is DEFINITELY in the image." — the developer

Your job: explain why a package that was installed during the build can vanish at runtime,
and fix it without removing the live-reload convenience.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-04 && ls
```

## Step 2: Reproduce

```bash
docker compose up -d --build
docker compose ps
docker compose logs web
```

You should see `Error: Cannot find module 'express'` in the logs, right after a build that
clearly ran `npm install` with no errors.

## Step 3: Prove the module really was installed in the image

```bash
docker compose run --rm web ls node_modules | grep express || echo "not found in running container"
docker build -t lab04-image-only . 
docker run --rm lab04-image-only ls node_modules | grep express
```

The second check (running the freshly built image **without** compose's volumes) should
find `express` just fine. That's the key clue: the image is fine, something at **runtime**
is hiding it.

## Step 4: Inspect what's mounted

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-04/docker-compose.yml">
Open docker-compose.yml
</walkthrough-editor-open-file>

```bash
grep -A2 volumes docker-compose.yml
```

Think about what `.:/app` does: it replaces the **entire** `/app` directory inside the
container with your host project folder — including overwriting the `node_modules` that
`RUN npm install` created at build time, with whatever (or nothing) exists on the host.

## Step 5: Fix it — keep the bind mount, but protect node_modules

Add a second volume entry so Docker keeps the container's own `node_modules` instead of
letting the host's (missing) one take over:

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

## Step 6: Verify

```bash
docker compose up -d --build
docker compose ps
curl localhost:3000/health
```

## Step 7: Clean up

```bash
docker compose down -v
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **bind-mount-shadowing** incident — one of the single most common "it works
in the image but not at runtime" bugs in Node/Docker projects. A bind mount replaces
*everything* at that path, including things the image generated during the build, unless
you explicitly protect a subpath with its own volume.

Ready for the next incident? Head to **LAB-05**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `volumes: - .:/app` mounts the host project directory over `/app` in the
container at container-start time, which overwrites the `node_modules` folder that was
installed during the image build (the host folder has no `node_modules`).

**Fix:**
```yaml
volumes:
  - .:/app
  - /app/node_modules
```
The second line creates an anonymous volume specifically for `node_modules`, which takes
precedence over the bind mount for that one subdirectory and preserves the image's
installed packages.
</details>
