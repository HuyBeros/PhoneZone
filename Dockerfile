# ==============================================================================
# Stage 1: Build the application (Java 21 + Maven + Quinoa frontend build)
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Optimize JVM memory for containerized build environments (e.g. Render 512MB RAM)
ENV MAVEN_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"

# 1. Cache Maven dependencies layer
# By copying pom.xml first, Docker caches this layer so dependencies are not
# re-downloaded every time source code in src/ changes.
COPY pom.xml .
RUN mvn dependency:resolve -B -ntp

# 2. Copy source code (frontend in src/main/webui + backend in src/main/java)
COPY src ./src

# 3. Build application
# -B: Batch mode (non-interactive)
# -ntp: No transfer progress (suppresses progress spam in CI/Render build logs)
# -DskipTests: Skip tests during deployment container packaging
RUN mvn clean package -B -ntp -DskipTests

# ==============================================================================
# Stage 2: Runtime image (Lightweight JRE 21 with non-root security)
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Render runtime Secret Files are readable by group 1000.
# Keep a dedicated application user and grant that supplementary group only.
RUN groupadd --gid 10001 phonezone \
    && (getent group 1000 > /dev/null || groupadd --gid 1000 render-secrets) \
    && useradd --uid 10001 --gid phonezone --groups 1000 --no-create-home phonezone

# Copy built Quarkus fast-jar artifacts
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/quarkus/ /app/quarkus/
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"
# Omitting an explicit group preserves the supplementary group memberships.
USER phonezone

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["java", "-jar", "quarkus-run.jar"]
