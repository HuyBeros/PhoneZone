# Stage 1: Build the application (Java 21 + Node.js)
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Install Node.js (Required by Quinoa to build React frontend)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
# -DskipTests: Skip tests during build to save time & memory on Render
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built artifacts from the build stage
# Quarkus uses fast-jar by default
COPY --from=build /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build /app/target/quarkus-app/*.jar /app/
COPY --from=build /app/target/quarkus-app/app/ /app/app/
COPY --from=build /app/target/quarkus-app/quarkus/ /app/quarkus/

# Set the port for Render
EXPOSE 8080
ENV QUARKUS_HTTP_PORT=8080
ENV PORT=8080

# Run the Quarkus app
# Pass datasource config as Java system properties (highest priority, bypasses env var resolution issues)
CMD ["sh", "-c", "java \
  -Dquarkus.datasource.jdbc.url=${QUARKUS_DATASOURCE_JDBC_URL} \
  -Dquarkus.datasource.username=${QUARKUS_DATASOURCE_USERNAME} \
  -Dquarkus.datasource.password=${QUARKUS_DATASOURCE_PASSWORD} \
  -jar quarkus-run.jar"]
