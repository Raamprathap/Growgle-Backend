# Base image with Node.js
FROM node:22-bookworm-slim

# Install dependencies and Tectonic (resolve latest asset via GitHub API)
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    ca-certificates curl jq tar findutils \
    fontconfig libgraphite2-3 libharfbuzz0b libicu72 libfreetype6; \
    update-ca-certificates; \
    mkdir -p /tmp/tect; \
    # Prefer static musl build to avoid shared library issues; fall back to gnu if musl is not available
    url=$(curl -fsSL https://api.github.com/repos/tectonic-typesetting/tectonic/releases/latest \
    | jq -r '(.assets[] | select(.name | test("x86_64-unknown-linux-musl.*\\.tar\\.gz$")) .browser_download_url), \
    (.assets[] | select(.name | test("x86_64-unknown-linux-gnu.*\\.tar\\.gz$")) .browser_download_url) | select(.!=null) | .' | head -n1); \
    echo "Downloading Tectonic from: $url"; \
    curl -fsSL -o /tmp/tect/tt.tgz "$url"; \
    tar -xzf /tmp/tect/tt.tgz -C /tmp/tect; \
    TTBIN=$(find /tmp/tect -type f -name tectonic | head -n1); \
    mv "$TTBIN" /usr/bin/tectonic; \
    chmod +x /usr/bin/tectonic; \
    rm -rf /var/lib/apt/lists/* /tmp/tect

# Verify Tectonic is runnable at build time (fail early if not)
RUN /usr/bin/tectonic --version || (echo 'Tectonic not runnable' && exit 1)

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Environment
ENV PORT=3002
ENV TECTONIC_PATH=/usr/bin/tectonic

EXPOSE 3002

CMD ["npm", "start"]
