# Build stage
FROM gcc:13 AS build

WORKDIR /src
COPY main.cpp .
RUN g++ -O2 -Wall -std=c++17 -o worker main.cpp

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /src/worker .

CMD ["/app/worker"]
