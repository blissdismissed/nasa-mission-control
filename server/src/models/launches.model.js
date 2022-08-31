const launchesDatabase = require("./launches.mongo");
const planets = require('./planets.mongo');

const launches = new Map(); // local memory

let latestFlightNumber = 200;

const launch = {
  flightNumber: 200,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-452 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true
};

saveLaunch(launch);
// launches.set(launch.flightNumber, launch);

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

async function getAllLaunches() {
  return await launchesDatabase
    .find({}, { '_id':0, '__v':0 });
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  })

  if (!planet) {
    throw new Error('No matching planet was found');
  }

  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  );
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ["ZTM", "NASA"],
      upcoming: true,
      success: true
    })
  );
}

function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById
};
