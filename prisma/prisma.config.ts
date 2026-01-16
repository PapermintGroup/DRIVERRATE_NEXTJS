// prisma/prisma.config.ts

import { defineConfig } from "@prisma/cli";

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    db: {
      url: "file:./dev.db", // This is your SQLite DB
    },
  },
});
