# syntax=docker/dockerfile:1

##############################
# 1) Builder (Node + Maven)  #
##############################
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Install Node & npm inside the Maven image (avoids pulling node:* base)
# Debian repos provide Node 18.x which is fine for Vite; if you need Node 20, I can switch to NodeSource.
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm \
  && node -v && npm -v \
  && rm -rf /var/lib/apt/lists/*

# ---- Frontend build (Vite) ----
# Use npm cache efficiently
COPY apps/web-os/package*.json ./apps/web-os/
RUN cd apps/web-os && (npm ci || npm install)

# Build the app
COPY apps/web-os ./apps/web-os
RUN cd apps/web-os && npm run build -- --base=/

# ---- Backend build (Spring Boot) ----
# Warm Maven deps first for better caching
COPY server/snap/pom.xml ./server/snap/pom.xml
RUN mvn -q -f server/snap/pom.xml -DskipTests dependency:go-offline

# Add backend sources
COPY server/snap/src ./server/snap/src

# Place built frontend into Spring Boot static resources BEFORE packaging
RUN mkdir -p server/snap/src/main/resources/static \
  && cp -r apps/web-os/dist/* server/snap/src/main/resources/static/

# Package into a bootable jar
RUN mvn -q -f server/snap/pom.xml -DskipTests package

########## 2) Runtime image ##########
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Non-root user
RUN useradd -r -u 1001 appuser

# Install gosu to drop privileges after fixing permissions
RUN apt-get update && apt-get install -y --no-install-recommends gosu && rm -rf /var/lib/apt/lists/*

# Copy the jar and entrypoint
COPY --from=build /app/server/snap/target/snap-*.jar /app/app.jar
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Data dir (volume) + default env
ENV SNAP_STORAGE_DIR=/app/data/snapshots
VOLUME ["/app/data"]

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

EXPOSE 8080
# Run as root so entrypoint can chown, then gosu → appuser
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
