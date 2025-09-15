# Stage 1: Build React App
FROM node:20.19.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_REACT_APP_BASEURL
ENV VITE_REACT_APP_BASEURL=$VITE_REACT_APP_BASEURL
ARG VITE_BASEURL
ENV VITE_BASEURL=$VITE_BASEURL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to Nginx webroot
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
