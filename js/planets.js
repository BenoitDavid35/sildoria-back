const async = require("async");
const db = require("./dbConnect.js");

function getRandomPlanetInformations(values,callback){
  var queryString = 'SELECT object_form FROM `telluric` ' +
  'WHERE `solar_system` = ? AND `intra_system` = ? ' +
  'UNION SELECT object_form FROM `nebulae` ' +
  'WHERE `solar_system` = ? AND `intra_system` = ? ' +
  'UNION SELECT object_form FROM `gas` ' +
  'WHERE `solar_system` = ? AND `intra_system` = ? ' +
  'UNION SELECT object_form FROM `black_hole` ' +
  'WHERE `solar_system` = ? AND `intra_system` = ? ' +
  'UNION SELECT object_form FROM `asteroid_belt` ' +
  'WHERE `solar_system` = ? AND `intra_system` = ? ';

  db.connection.query(queryString, [
    values[0],
    values[1],
    values[0],
    values[1],
    values[0],
    values[1],
    values[0],
    values[1],
    values[0],
    values[1]
  ] ,function(err, rows) {
    if (err) {
      console.log('ERROR_LOADING_PLANET_INFORMATIONS');
      console.log(err);
      callback(null,'ERROR_LOADING_PLANET_INFORMATIONS');
    }else{
      console.log(rows[0].object_form);
      let missionsArray = {
        'mining': false,
        'attack': true,
        'transport': false,
        'espionnage': true,
        'occupation': false,
        'deplacement': false,
        'recycling': true,
        'exploration': false
      };

      switch(rows[0].object_form) {
      case 'Telluric World':
        missionsArray.transport = true;
        missionsArray.espionnage = true;
        missionsArray.occupation = true;
        missionsArray.deplacement = true;
        break;
      case 'Nebulae':
        missionsArray.mining = true;
        break;
      case 'Gas World':
        missionsArray.mining = true;
        break;
      case 'Black Hole':
        missionsArray.mining = true;
        break;
      case 'Asteroid Belt':
        missionsArray.mining = true;
        break;
      default:
        missionsArray.attack = false;
        missionsArray.espionnage = false;
        missionsArray.recycling = false;
        // code block
    }
    console.log(missionsArray);
      callback(null,missionsArray);
    }
  });
}

exports.getRandomPlanetInformations = getRandomPlanetInformations;
