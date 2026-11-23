<walkthrough-tutorial-url url="https://github.com/DevOps-Playbook/Docker-Real-Time-LABs"></walkthrough-tutorial-url>
<walkthrough-tutorial-difficulty difficulty="1"></walkthrough-tutorial-difficulty>
<walkthrough-tutorial-duration duration="15"></walkthrough-tutorial-duration>

# LAB-07: "Why does this 50-line app take 90 seconds to build?"

## 🚨 Incident Report

**Severity:** SEV-4 (annoying, not down — but it's slowing every deploy)
**Summary:** Developers complain that every single `docker build` takes forever, even for
a one-line code change, and CI minutes are quietly climbing. The app itself is tiny.

> "It's just an Express app, why is the build context huge?" — several frustrated developers

Your job: find out what's actually being sent to the Docker daemon on every build, and
stop it.

Click **Start**.

## Step 1: Open the lab

```bash
cd ~/cloudshell_open/Docker-Real-Time-LABs/Easy/LAB-07 && ls -la
```

Notice this folder already has a (committed-by-accident) `node_modules/` and `.git/`
folder sitting next to the source code — a very realistic situation on a real project.

## Step 2: Reproduce — measure the build context size

Every `docker build` starts by sending your project folder (the "build context") to the
Docker daemon, **before** anything in `.dockerignore` style filtering is applied if there
is no `.dockerignore` file.

```bash
time docker compose build
```

Watch the very first lines of output: `=> transferring context:` or `Sending build
context to Docker daemon`. Note the size and the time taken.

## Step 3: Diagnose

```bash
du -sh node_modules .git 2>/dev/null
ls -la
```

<walkthrough-editor-open-file filePath="Docker-Real-Time-LABs/Easy/LAB-07/Dockerfile">
Open the Dockerfile
</walkthrough-editor-open-file>

The `Dockerfile` does `COPY . .` — which copies **everything** in this folder, including
`node_modules` (which gets reinstalled anyway by `RUN npm install`, so it's pure waste) and
`.git` (your entire commit history, which the image never needs).

```bash
ls -a
cat .dockerignore 2>/dev/null || echo "No .dockerignore found!"
```

## Step 4: Fix it

Create a `.dockerignore` file in this folder that excludes at least:
```
node_modules
.git
npm-debug.log
```

## Step 5: Verify

```bash
time docker compose build --no-cache
```

Compare the "transferring context" size and the total build time against Step 2 — it
should be dramatically smaller and faster.

## Step 6: Clean up

```bash
docker compose down
rm -rf node_modules .git
```

## Congratulations 🎉

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You fixed a **bloated build context incident** — a missing `.dockerignore` is one of the
most common silent performance and security problems in real Docker projects (it's also
how secrets in `.env` or `.git` history can accidentally end up baked into an image layer).

Ready for the next incident? Head to **LAB-08**.

---
<details>
<summary>🔎 Stuck? Click for the solution</summary>

**Root cause:** There is no `.dockerignore` file, so `COPY . .` sends the entire project
directory — including a huge `node_modules/` (which `RUN npm install` recreates anyway)
and `.git/` history — to the Docker daemon on every build.

**Fix:** add a `.dockerignore` file:
```
node_modules
.git
npm-debug.log
```
</details>
