FROM node:22-alpine AS build

WORKDIR /app

# Copy dependencies dan install
COPY package*.json ./
RUN npm install

# Copy seluruh kode
COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
