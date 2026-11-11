# ===========================================================================
# BDF Lab 03 REST API — Docker Deployment (Render.com)
# Aurora University | A.VENKATA SAI (252U1R5010)
# ===========================================================================
#
# ROOT CAUSE ADDRESSED:
#   sqlite3@6.0.1 uses `prebuild-install` (not node-pre-gyp).
#   `prebuild-install` downloads prebuilt .node binaries from GitHub Releases.
#   Those prebuilt binaries were compiled on Ubuntu 24.04 (GLIBC_2.38).
#   Render's Linux environment only has GLIBC_2.35 → ERR_DLOPEN_FAILED.
#
# FIX:
#   1. Use node:22-bookworm-slim (Debian Bookworm, GLIBC_2.36) — compatible
#      with both Node 22 AND with what Render's Docker runtime runs.
#   2. Install C++ build toolchain (python3, make, g++, build-essential).
#   3. Set ENV npm_config_build_from_source=true — this is the CORRECT env
#      var that `prebuild-install` checks before downloading a prebuilt binary.
#      With this set, it falls back to compiling sqlite3 with node-gyp using
#      the system's own GLIBC (2.36) → no version mismatch.
#   4. Verify the sqlite3 native module actually loads before completing build.
#
# RESULT: sqlite3 compiled against GLIBC_2.36, runs on GLIBC_2.36. No crash.
# ===========================================================================

FROM node:22-bookworm-slim

# ---------------------------------------------------------------------------
# Step 1: Install native compilation toolchain
# node-gyp requires: python3, make, g++, build-essential
# libsqlite3-dev provides SQLite3 C headers for source compilation
# ---------------------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---------------------------------------------------------------------------
# Step 2: Copy dependency files first (Docker layer cache optimization)
# ---------------------------------------------------------------------------
COPY package.json package-lock.json ./

# ---------------------------------------------------------------------------
# Step 3: Set the CRITICAL environment variable.
#
# npm_config_build_from_source=true tells prebuild-install to SKIP the
# prebuilt binary download and compile sqlite3 from source using node-gyp.
# This is the correct flag for sqlite3@6.0.1 which uses prebuild-install.
#
# npm_config_build_from_source is different from --build-from-source CLI flag.
# The CLI flag works for node-pre-gyp; the ENV var works for prebuild-install.
# ---------------------------------------------------------------------------
ENV npm_config_build_from_source=true

# ---------------------------------------------------------------------------
# Step 4: Install ALL dependencies.
# prebuild-install sees npm_config_build_from_source=true → compiles from src.
# node-gyp compiles sqlite3 against Bookworm's libsqlite3 (GLIBC_2.36).
# ---------------------------------------------------------------------------
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# Step 5: Verify the native module actually loads in THIS container.
# If this fails, the Docker build fails → we catch the error before deploy.
# ---------------------------------------------------------------------------
RUN node -e "require('sqlite3'); console.log('[Dockerfile] sqlite3 native module loaded successfully — GLIBC compatible.');"

# ---------------------------------------------------------------------------
# Step 6: Copy the application source code
# ---------------------------------------------------------------------------
COPY . .

# ---------------------------------------------------------------------------
# Step 7: Create data directories for SQLite
# /var/data → Render persistent disk mount point
# /app/data → local fallback
# ---------------------------------------------------------------------------
RUN mkdir -p /var/data /app/data

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
EXPOSE 3100
ENV NODE_ENV=production

# Start the Express REST API server
CMD ["node", "app.js"]
