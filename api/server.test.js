const request = require("supertest");
const server = require("./server");

test("sanity", () => {
  expect(true).toBe(true);
});

describe("registering user should succeed", () => {
  it("should succeed registering user", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "password" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("registering user should fail", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "", password: "password" });
    expect(res.status).toBe(400);
  });

  it("login should succeed", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "password" });

    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "password" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("login should fail", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "wronguser", password: "password" });
    expect(res.status).toBe(401);
  });
});

describe("getting jokes", () => {
  it("Getting jokes should succeed", async () => {
    const loginRes = await request(server)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "password" });

    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", loginRes.body.token);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("Getting jokes should fail", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
  });
});
