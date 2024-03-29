const request = require("supertest");
const app = require("../../app");
const { 
  mongoConnect,
  mongoDisconnect,
 } = require("../../services/mongo");
 const {
   loadPlanetsData,
 } = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll( async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll( async () => {
    await mongoDisconnect();
  });

  describe("Test GET/ launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  
  describe("Test POST/ launch", () => {
    const completeLaunchData = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "December 4, 2028",
      target: "Kepler-62 f"
    };
  
    const launchDataWithoutDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      target: "Kepler-62 f"
    };
  
    const launchDataWithBadDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "December",
      target: "Kepler-62 f"
    };
  
    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
  
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
  
      expect(responseDate).toEqual(requestDate);
  
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
  
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: "Missing required launch property!"
      });
    });
  
    test("It should catch missing dates", async () => {
      const response = await request(app)
        .post("/launches")
        .send(launchDataWithBadDate)
        .expect("Content-Type", /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: "Invalid launch date"
      });
    });
  
  });

})
