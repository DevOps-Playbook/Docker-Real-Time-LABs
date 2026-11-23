<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="10"></walkthrough-tutorial-duration>

# LAB-05: "The pipeline won't even get past build"

## 🚨 Incident Report

**Severity:** SEV-3
**Summary:** CI is red. The build step fails before any application code even runs. The
engineer who wrote the Dockerfile swears it worked on their machine "last week."

> "Nothing changed in the Dockerfile since last week, I promise." — the engineer

(Narrator: something changed in the Dockerfile.)

Click **Start**.

## Step 1: Open the lab

```bash
cd Docker/LAB-05 && ls
```

## Step 2: Reproduce

```bash
docker compose build
```

Read the error at the very bottom of the output carefully — Docker will tell you exactly
which image reference it couldn't resolve.

## Step 3: Diagnose

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Docker/LAB-05/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

Look at the `FROM` line character by character. Compare it against the official tags for
the `node` image on Docker Hub (the valid Alpine variants are things like `18-alpine`,
`20-alpine`, etc.).

## Step 4: Fix it

Correct the base image tag in the `Dockerfile` so it refers to a real, published image tag.

## Step 5: Verify

```bash
docker compose build
docker compose up -d
curl localhost:3000/health
```

## Step 6: Clean up

```bash
docker compose down
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **broken base image reference** — a one-character typo that fails the build
before a single line of your own code is even touched. In CI/CD this is a great reminder
to pin image tags carefully and to read the *first* error in a failing pipeline, not just
the overall "build failed" status.

Ready for the next incident? Head to **LAB-06**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** `FROM node:18-alpin` — the tag is misspelled. `18-alpin` doesn't exist on
Docker Hub, so the Docker daemon fails to pull a manifest for it.

**Fix:**
```dockerfile
FROM node:18-alpine
```
</details>
