const db = require("./dbConnect.js");

function getFleets(values,callback){
  var queryString = 'SELECT fleet_ID,fleet_name,mission,solar_system,intra_system,solar_system_destination,intra_system_destination, ' +
  'SUM(fighter + improved_fighter + light_cruiser + bomb_cruiser + line_cruiser' +
  ' + battleship + line_battleship + fleet_destructor + titan_destructor + titan_1' +
  ' + titan_2 + titan_3 + titan_4 + spy_probe + small_transporter + big_transporter' +
  ' + planet_extractor + nebulae_extractor + black_hole_extractor + asteroid_field_extractor' +
  ' + colonization_ship + recycling_ship + hunter_carrier + shield_destructor + boarding_vessel) as ship_count ' +
  'FROM `user_fleets` WHERE user_id = ?';

  db.connection.query(queryString, values[0] ,function(err, rows) {
    if (err) {
      console.log('ERROR_LOADING_FLEETS');
      console.log(err);
      callback(null,'FALSE');
    }else{
      console.log(rows[0].fleet_ID);
      if(rows[0].fleet_ID === null){
        callback(null,'NO_FLEETS_FOR_USER');
      }else{
        var returnValues = [];
        for(let i=0;i<rows.length;i++){
          returnValues.push([rows[i].fleet_ID,rows[i].fleet_name,rows[i].mission,
            rows[i].solar_system,rows[i].intra_system,rows[i].solar_system_destination,
            rows[i].intra_system_destination,rows[i].ship_count]);
          }
          callback(null,returnValues);
        }
      }
    });
  }

  function setFleet(values,callback){
    var queryString = 'INSERT INTO `user_fleets` (`fleet_name`, `user_id`, ' +
    '`solar_system`, `intra_system`, `solar_system_destination`, `intra_system_destination`, ' +
    '`mission`, `fighter`, `improved_fighter`, `light_cruiser`, `bomb_cruiser`, ' +
    '`line_cruiser`, `battleship`, `line_battleship`, `fleet_destructor`, `titan_destructor`, ' +
    '`titan_1`, `titan_2`, `titan_3`, `titan_4`, `spy_probe`, `small_transporter`, ' +
    '`big_transporter`, `planet_extractor`, `nebulae_extractor`, `black_hole_extractor`, ' +
    '`asteroid_field_extractor`, `colonization_ship`, `recycling_ship`, `hunter_carrier`, ' +
    '`shield_destructor`, `boarding_vessel`)' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    var valueArray = [];

    for(var i = 0; i<values[3].length;i++){
      valueArray.push(values[3][i][3]);
    }

  db.connection.query(queryString, [
    values[4],
    values[0],
    values[1],
    values[2],
    'NULL',
    'NULL',
    'NULL',
    valueArray[0],
    valueArray[1],
    valueArray[2],
    valueArray[3],
    valueArray[4],
    valueArray[5],
    valueArray[6],
    valueArray[7],
    valueArray[8],
    valueArray[9],
    valueArray[10],
    valueArray[11],
    valueArray[12],
    valueArray[13],
    valueArray[14],
    valueArray[15],
    valueArray[16],
    valueArray[17],
    valueArray[18],
    valueArray[19],
    valueArray[20],
    valueArray[21],
    valueArray[22],
    valueArray[23],
    valueArray[24]
  ] ,function(err, rows) {
    if (err) {
      callback(null,'ERROR_CREATING_FLEET');
      console.log(err);
    }else{
      var queryString = 'UPDATE `user_units_entities` SET `fighter`=`fighter`-?,' +
      '`improved_fighter`=`improved_fighter`-?,`light_cruiser`=`light_cruiser`-?,`bomb_cruiser`=`bomb_cruiser`-?,' +
      '`line_cruiser`=`line_cruiser`-?,`battleship`=`battleship`-?,`line_battleship`=`line_battleship`-?,`fleet_destructor`=`fleet_destructor`-?,' +
      '`titan_destructor`=`titan_destructor`-?,`titan_1`=`titan_1`-?,`titan_2`=`titan_2`-?,`titan_3`=`titan_3`-?,`titan_4`=`titan_4`-?,' +
      '`spy_probe`=`spy_probe`-?,`small_transporter`=`small_transporter`-?,`big_transporter`=`big_transporter`-?,`planet_extractor`=`planet_extractor`-?,' +
      '`nebulae_extractor`=`nebulae_extractor`-?,`black_hole_extractor`=`black_hole_extractor`-?,`asteroid_field_extractor`=`asteroid_field_extractor`-?,' +
      '`colonization_ship`=`colonization_ship`-?,`recycling_ship`=`recycling_ship`-?,`hunter_carrier`=`hunter_carrier`-?,' +
      '`shield_destructor`=`shield_destructor`-?,`boarding_vessel`=`boarding_vessel`-? ' +
      'WHERE `user_id`=? AND `solar_system`=? AND `intra_system`=?';
      db.connection.query(queryString, [
        valueArray[0],
        valueArray[1],
        valueArray[2],
        valueArray[3],
        valueArray[4],
        valueArray[5],
        valueArray[6],
        valueArray[7],
        valueArray[8],
        valueArray[9],
        valueArray[10],
        valueArray[11],
        valueArray[12],
        valueArray[13],
        valueArray[14],
        valueArray[15],
        valueArray[16],
        valueArray[17],
        valueArray[18],
        valueArray[19],
        valueArray[20],
        valueArray[21],
        valueArray[22],
        valueArray[23],
        valueArray[24],
        values[0],
        values[1],
        values[2]
      ] ,function(err, rows) {
        if (err) {
          callback(null,'ERROR_UPDATING_SHIP_ENTITIES_VALUES');
          console.log(err);
        }else{
          callback(null,'FLEET_SUCCESSFULLY_CREATED');
        }
      })
    }
  });
}

function getOneFleet(values,callback){
  var queryString = 'SELECT * FROM `user_fleets` WHERE `fleet_ID`=? AND `user_id` = ?';

  db.connection.query(queryString, [values[1],values[0]] ,function(err, rows) {
    if (err) {
      callback(null,'ERROR_LOADING_FLEET');
      console.log(err);
    }else{
      // console.log(rows);
      var returnArray = [];
      var intraArray = [];

      returnArray.push(rows[0].fleet_ID);
      returnArray.push(rows[0].user_id);
      returnArray.push(rows[0].solar_system);
      returnArray.push(rows[0].intra_system);
      if(rows[0].solar_system_destination != "NULL"){
        returnArray.push(rows[0].solar_system_destination);
      }else{
        returnArray.push("");
      }
      if(rows[0].intra_system_destination != "NULL"){
        returnArray.push(rows[0].intra_system_destination);
      }else{
        returnArray.push("");
      }
      returnArray.push(rows[0].mission);

      intraArray.push(['fighter',rows[0].fighter]);
      intraArray.push(['improved_fighter',rows[0].improved_fighter]);
      intraArray.push(['light_cruiser',rows[0].light_cruiser]);
      intraArray.push(['bomb_cruiser',rows[0].bomb_cruiser]);
      intraArray.push(['line_cruiser',rows[0].line_cruiser]);
      intraArray.push(['battleship',rows[0].battleship]);
      intraArray.push(['line_battleship',rows[0].line_battleship]);
      intraArray.push(['fleet_destructor',rows[0].fleet_destructor]);
      intraArray.push(['titan_destructor',rows[0].titan_destructor]);
      intraArray.push(['titan_1',rows[0].titan_1]);
      intraArray.push(['titan_2',rows[0].titan_2]);
      intraArray.push(['titan_3',rows[0].titan_3]);
      intraArray.push(['titan_4',rows[0].titan_4]);
      intraArray.push(['spy_probe',rows[0].spy_probe]);
      intraArray.push(['small_transporter',rows[0].small_transporter]);
      intraArray.push(['big_transporter',rows[0].big_transporter]);
      intraArray.push(['planet_extractor',rows[0].planet_extractor]);
      intraArray.push(['nebulae_extractor',rows[0].nebulae_extractor]);
      intraArray.push(['black_hole_extractor',rows[0].black_hole_extractor]);
      intraArray.push(['asteroid_field_extractor',rows[0].asteroid_field_extractor]);
      intraArray.push(['colonization_ship',rows[0].colonization_ship]);
      intraArray.push(['recycling_ship',rows[0].recycling_ship]);
      intraArray.push(['hunter_carrier',rows[0].hunter_carrier]);
      intraArray.push(['shield_destructor',rows[0].shield_destructor]);
      intraArray.push(['boarding_vessel',rows[0].boarding_vessel]);

      returnArray.push(intraArray);

      console.log(intraArray);

      callback(null,returnArray);
    }
  })
}

exports.getFleets = getFleets;
exports.setFleet = setFleet;
exports.getOneFleet = getOneFleet;
