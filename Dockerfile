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
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built artifacts
COPY --from=build /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build /app/target/quarkus-app/*.jar /app/
COPY --from=build /app/target/quarkus-app/app/ /app/app/
COPY --from=build /app/target/quarkus-app/quarkus/ /app/quarkus/

EXPOSE 8080
ENV QUARKUS_HTTP_PORT=8080

CMD ["java", "-jar", "quarkus-run.jar"]
