FROM node:20-alpine

# Buat direktori kerja
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json dulu
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy semua source code
COPY . .

# Build project (NestJS -> compile TS ke JS)
RUN npm run build

# Expose port (hardcode, jangan pakai ${PORT} di sini)
EXPOSE 3004

# Start app
CMD ["npm", "run", "start:prod"]
