FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb to the container
COPY package.json bun.lockb ./

# Install bun globally
RUN npm install -g bun

# Install dependencies using bun
RUN bun install

# Copy the rest of the application files to the container
COPY . .

RUN bun run test

# Expose port 3000
EXPOSE 3000

# Command to run your application
CMD ["bun", "run", "src/index.ts"]