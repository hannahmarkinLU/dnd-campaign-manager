const { db } = require("./database/setup");

beforeAll(async () => {
  // Force recreate database for clean test environment
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});