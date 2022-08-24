const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select
    *
    from 
    cricket_team;`;

  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//get a player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//post player details

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const player = await database.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    update 
    cricket_team
    set
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    where player_id=${playerId};`;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete
    from
    cricket_team
    where player_id=${playerId};`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
