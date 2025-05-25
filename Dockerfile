FROM oven/bun:1.0.30

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]