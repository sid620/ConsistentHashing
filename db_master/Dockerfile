FROM node:18

WORKDIR /usr/src/app

COPY . .

# Build Project
RUN npm install
RUN npx tsc

# Run it
CMD node build/index.js