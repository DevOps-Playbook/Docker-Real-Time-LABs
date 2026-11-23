# Docker Real-Time LABs — Easy

Ten "break it on purpose" Docker incidents. Each lab ships in a deliberately broken
state — a real app, a real Dockerfile/compose file, and one specific bug modeled on a
common production incident. You reproduce it, read the logs/inspect output like an
on-call engineer would, find the root cause, and fix it. No solutions are needed up front
— each lab's `README.md` ends with a collapsed `<details>` section if you get stuck.

Each lab folder is a self-contained Cloud Shell walkthrough (same format as the
[MERN-Stack-Application](https://github.com/DevOps-Playbook/MERN-Stack-Application) demo) —
open `README.md` inside a lab via Cloud Shell's tutorial walkthrough to get the guided,
step-by-step version, or just read it directly on GitHub.

| Lab | Incident | Concept |
|---|---|---|
| [LAB-01](./LAB-01) | Container exits immediately after start | `CMD`/entrypoint pointing at the wrong file |
| [LAB-02](./LAB-02) | Container is "Up" but totally unreachable | `ports:` host:container mapping mismatch |
| [LAB-03](./LAB-03) | Crash-loop after a "harmless" config rename | Env var name mismatch between app and compose |
| [LAB-04](./LAB-04) | "Cannot find module" despite a clean build | Bind mount shadowing `node_modules` |
| [LAB-05](./LAB-05) | CI fails before any app code even runs | Typo'd base image tag |
| [LAB-06](./LAB-06) | Two services can't talk to each other | `localhost` vs. Docker Compose service-name networking |
| [LAB-07](./LAB-07) | Every build takes forever for a tiny app | Missing `.dockerignore`, bloated build context |
| [LAB-08](./LAB-08) | App works, but orchestrator marks it unhealthy | `HEALTHCHECK` using a binary not in the base image |
| [LAB-09](./LAB-09) | Hardening the container broke log writes | Non-root user vs. mounted volume permissions |
| [LAB-10](./LAB-10) | Build is green, site is blank | Multi-stage build missing `COPY --from=` |

## How to use these

Each lab is fully runnable on its own:

```bash
cd Docker/LAB-01
docker compose up -d --build
docker compose logs web
# ...debug, fix, re-verify, as described in the lab's README.md...
docker compose down
```

Work through them in order — they build from the simplest possible failure (a crashing
container) up to multi-container networking and multi-stage build issues.
