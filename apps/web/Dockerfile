# apps/web/Dockerfile
# apps/web/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Expose the standard Next.js port
EXPOSE 3000

# Start the Next.js server in development mode (just like your local machine)
CMD ["npm", "run", "dev"]