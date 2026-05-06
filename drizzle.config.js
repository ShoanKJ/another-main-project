import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_KjAq79RoDHLv@ep-long-truth-a7bnvvm2-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});