# Tiny mock API used by the "real" repositories during local development.
FROM node:22-alpine

WORKDIR /app
RUN addgroup -S echopass && adduser -S echopass -G echopass

COPY mock-api/package.json ./
RUN npm install --omit=dev && chown -R echopass:echopass /app

COPY --chown=echopass:echopass mock-api/src ./src
USER echopass

EXPOSE 4000
CMD ["node", "src/index.js"]
