FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Copy .env.production as .env so Next.js reads it during build
RUN if [ -f .env.production ]; then cp .env.production .env; fi
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]