<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-10: "The build is green, but the site is blank"

## 🚨 Incident Report

**Severity:** SEV-2
**Summary:** CI shows a fully green pipeline — the frontend build step completes without
a single warning. But when QA opens the deployed site, they get nginx's default welcome
page (or a blank `403 Forbidden`) instead of the actual app.

> "The build logs clearly say 'Build complete'. I don't understand how the site can be
> wrong if the build passed." — the frontend engineer

This is a classic **multi-stage Docker build** incident: a successful build stage doesn't
guarantee its output actually makes it into the final image.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-10 && ls -la
```

This project uses a two-stage `Dockerfile`:
1. A `builder` stage that installs deps and "builds" the static site into `dist/`
2. A final `nginx` stage that's supposed to serve whatever the builder produced

## Step 2: Reproduce

```bash
docker compose up -d --build
curl -s localhost:8081/ | head -20
```

You should see nginx's default welcome page content, or a 403/404 — **not** the
"WanderOps Status Page" content from `src/index.html`.

## Step 3: Confirm the builder stage actually worked

Build and inspect just the builder stage on its own, to rule out the frontend build itself
as the culprit:

```bash
docker build --target builder -t lab10-builder .
docker run --rm lab10-builder ls dist
docker run --rm lab10-builder cat dist/index.html
```

You should see `index.html` present with the expected content — confirming the builder
stage is fine. The bug has to be in how the **final stage** uses the builder's output.

## Step 4: Inspect the final stage

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-10/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

Look at the `# ---- final stage ----` section. In a multi-stage build, files from an
earlier stage are **not** automatically carried into the next stage — each stage starts
from a totally fresh filesystem (here, a clean `nginx:1.27-alpine`). The only way to bring
files across stages is an explicit `COPY --from=<stage>`.

```bash
grep -n "COPY" Dockerfile
```

You should notice the final stage copies `nginx.conf`, but never copies the `dist/`
directory the builder stage produced.

## Step 5: Fix it

Add a line in the final stage to copy the builder's output into nginx's web root:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Step 6: Verify

```bash
docker compose up -d --build
curl -s localhost:8081/ | grep "WanderOps Status Page"
```

You should now see the real page content.

## Step 7: Clean up

```bash
docker compose down
docker rmi lab10-builder 2>/dev/null || true
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **multi-stage build output incident** — a surprisingly common production bug.
Multi-stage builds are great for keeping final images small (no Node.js toolchain in your
nginx image!), but every stage is an isolated filesystem: if you forget the
`COPY --from=<stage>` line, your "build" quietly builds nothing into the image that
actually ships.

That's all 10 Easy labs! You've now debugged crash loops, port mismatches, config drift,
volume shadowing, typo'd base images, container networking, bloated build contexts, broken
health checks, non-root permission issues, and a multi-stage build gap — the most common
real-world Docker incidents. Ready for **Medium**? 🔥

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** The final `nginx` stage in the `Dockerfile` only copies `nginx.conf` — it
never runs `COPY --from=builder /app/dist /usr/share/nginx/html`. Each stage in a
multi-stage build is a separate, isolated filesystem, so the compiled site produced in the
`builder` stage never makes it into the image nginx actually serves.

**Fix:**
```dockerfile
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
</details>
