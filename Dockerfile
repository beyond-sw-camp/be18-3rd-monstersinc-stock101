# 1. 빌드 단계
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 내부 API URL (내부 Docker 네트워크에서 접)
ARG VITE_API_BASE_URL=http://stock-backend:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# 2. 배포 단계
FROM nginx:stable-alpine
# Vue 빌드 결과물인 dist 폴더를 Nginx 경로로 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]