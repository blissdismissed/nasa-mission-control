const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true
        })
      )
      .on("data", async data => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data); // This pushes to an array in memory
          // TODO: replace below's create statement with insert + update ==> upsert
          savePlanet(data)
        }
      })
      .on("error", err => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        // console.log(
        //   habitablePlanets.map(planet => {
        //     return planet["kepler_name"];
        //   })
        // );
        const planetList = await getAllPlanets();
        const countPlanetsFound = planetList.length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        console.log(`Planets: ${planetList}`);
        
        resolve();
      });
  });
}

/*
const promise = new Promise();
promise.then((result) => {

})

*/

async function getAllPlanets() {
  return await planets.find({}, {
    '_id':0, '__v':0,
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name
    }, {
      keplerName: planet.kepler_name
    }, {
      upsert: true,
    });
  } catch(err) {
    console.error(`Could not save a planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets
};
