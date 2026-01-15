# 1. 빌드 단계
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 브라우저에서 상대 경로로 API 호출 (Nginx Proxy Manager가 /api를 백엔드로 라우팅)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# 2. 배포 단계
FROM nginx:stable-alpine
# Vue 빌드 결과물인 dist 폴더를 Nginx 경로로 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]