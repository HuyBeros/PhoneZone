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

# Create non-root user and group
RUN groupadd --gid 10001 phonezone && useradd --uid 10001 --gid phonezone --no-create-home phonezone

# Copy built Quarkus fast-jar artifacts
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=phonezone:phonezone /app/target/quarkus-app/quarkus/ /app/quarkus/

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"
USER 10001:10001

CMD ["java", "-jar", "quarkus-run.jar"]
