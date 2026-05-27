FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g "$(node -p 'require("./package.json").packageManager')" && pnpm install --frozen-lockfile

COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "3000"]
