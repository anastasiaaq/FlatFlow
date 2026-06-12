FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g "$(node -p 'require("./package.json").packageManager')" \
    && pnpm install --frozen-lockfile

FROM deps AS dev

COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "3000"]

FROM deps AS build

COPY . .

RUN pnpm build

FROM node:24-alpine AS static-export

COPY --from=build /app/dist /dist

CMD ["sh", "-c", "rm -rf /out/* /out/.[!.]* /out/..?* && cp -r /dist/. /out/ && echo 'Frontend static files exported to /out'"]
