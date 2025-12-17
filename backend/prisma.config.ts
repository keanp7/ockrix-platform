import { defineConfig } from 'prisma';

export default defineConfig({
  connection: {
    url: process.env.DATABASE_URL,
  },
});
