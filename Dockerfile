# استفاده از نسخه Alpine (سبک و حرفه‌ای) هماهنگ با نسخه CI
FROM node:18-alpine

# directory
WORKDIR /app

# copy dependencies
COPY package*.json ./

# install dependencies
RUN npm install

# copy codes
COPY . .

# declaration
ENV PORT=5000

# port
EXPOSE 5000

# run
CMD ["node", "app.js"]