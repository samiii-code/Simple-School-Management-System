import { connectDb } from "./config/db";
import { env } from "./config/env";
import { createApp } from "./app";

async function main() {
  try {
    await connectDb();
    // eslint-disable-next-line no-console
    console.log("✓ MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("✗ MongoDB connection failed:", err);
    // eslint-disable-next-line no-console
    console.error("Make sure MongoDB is running or check MONGODB_URI in .env");
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✓ API listening on http://localhost:${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`✓ CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:4200"}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      // eslint-disable-next-line no-console
      console.error(`✗ Port ${env.PORT} is already in use. Stop the other process or change PORT in .env`);
    } else {
      // eslint-disable-next-line no-console
      console.error("✗ Server error:", err);
    }
    process.exit(1);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("✗ Fatal error:", err);
  process.exit(1);
});

