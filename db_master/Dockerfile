FROM node:18

WORKDIR /usr/src/app

COPY . .

# Set environment variables
ENV RING_SIZE = 1073741824
ENV REPLICATION_COUNT = 10

# Build Project
RUN npm install
RUN npx tsc

# Run it
CMD node build/index.js