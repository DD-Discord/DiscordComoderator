FROM node:latest

# Create the directory!
RUN mkdir -p /discordcomoderator
WORKDIR /discordcomoderator

# Copy and Install our bot
COPY package.json /discordcomoderator
COPY package-lock.json /discordcomoderator
RUN npm install

# Our precious bot
COPY . /discordcomoderator

# Start me!
CMD ["node", "index.js"]
