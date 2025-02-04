const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

describe("Auth Router Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should return a 201 status code when a new user is registered", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });
      expect(res.status).toBe(201);
    });

    it("should return a JSON response when a new user is registered", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser2", password: "password" });
      expect(res.type).toBe("application/json");
    });

    it("should return 400 when username or password is missing", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "username and password required"
      );
    });

    it("should return 400 when username is taken", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });

      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "username taken");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return a 200 status code when a user logs in", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });

      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "password" });
      expect(res.status).toBe(200);
    });

    it("should return a token when a user logs in", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });

      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "password" });
      expect(res.body.token).toBeDefined();
    });

    it("should return 400 when username or password is missing", async () => {
      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "testuser" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "username and password required"
      );
    });

    it("should return 400 when credentials are invalid", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "password" });

      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "wrongpassword" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "invalid credentials");
    });
  });
});

describe("GET /api/jokes", () => {
  it("should return 401 if no token is provided", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "token required");
  });

  it("should return 401 if an invalid token is provided", async () => {
    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", "invalidtoken");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "token invalid");
  });

  it("should return 200 if a valid token is provided", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "password" });

    const loginRes = await request(server)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "password" });

    const token = loginRes.body.token;

    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", token);
    expect(res.status).toBe(200);
  });
});
