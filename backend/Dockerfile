# ============================================================
# BDF Lab 03 REST API - Dockerfile (Docker Fallback for Render)
# Aurora University | Student: A.VENKATA SAI (252U1R5010)
# ============================================================
#
# PURPOSE: This Dockerfile guarantees that sqlite3 is compiled
# in the EXACT same Debian Bookworm (GLIBC 2.36) environment
# where it will run, completely eliminating GLIBC version
# mismatches that occur with prebuilt binaries.
#
# Node.js 22 on Bookworm-slim is fully compatible with GLIBC 2.36.
# ============================================================

FROM node:22-bookworm-slim

# Install native build tools required to compile sqlite3 from source.
# node-gyp needs: python3, make, g++
# These are available in Render's native env too, but Docker guarantees them.
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first (layer caching optimization)
COPY package*.json ./
COPY .npmrc ./

# Install all dependencies AND compile sqlite3 from source.
# --build-from-source: tells node-gyp to compile the native .node binary
# inside THIS container (Debian Bookworm / GLIBC 2.36) instead of
# downloading the prebuilt binary from a GLIBC 2.38 machine.
RUN npm install --build-from-source

# Copy the application source code
COPY . .

# Create the data directory for SQLite database
# (For Render persistent disk, mount /var/data externally)
RUN mkdir -p /var/data /app/data

# Expose the application port
EXPOSE 3100

# Production environment
ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
