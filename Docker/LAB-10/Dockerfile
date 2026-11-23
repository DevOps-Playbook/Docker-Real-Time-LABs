# ---- builder stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY src/package.json .
RUN npm install
COPY src/ .
RUN npm run build

# ---- final stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
