# Dev image for Metro / Expo (JS only). Native APK/IPA is built with EAS, not here.
FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache git bash \
  && addgroup -S echopass && adduser -S echopass -G echopass

COPY package.json package-lock.json ./
RUN npm ci

COPY docker/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

COPY . .
RUN chown -R echopass:echopass /app
USER echopass

EXPOSE 8081 8082 19000 19001
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npx", "expo", "start", "--dev-client", "--host", "lan", "--port", "8081"]
