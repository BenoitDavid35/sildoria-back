
const async = require("async");
const db = require("./dbConnect.js");
const func = require("./functions.js");
const unitEntities = require("./units_entities.js");

function updateUnits(values,callback){

  isAlreadyBuildingUnits(values,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
      callback(null,'ERROR_IN_FUNCTION_CONTROL CENTER');
    } else {
      console.log(data);
      if(data == 'TRUE'){
        //know if there is enough ressources on the planet.
        func.isEnoughRessources(values[0],values[1],values[2],values[3],values[4],function(err,data){
          if (err) {
            console.log("ERROR : ",err);
            callback(null,'NOT_ENOUGH_RESSOURCES');
          } else {
            var queryString = 'UPDATE `user_ressources` ' +
            'SET `metal`= ? ,`crystal`= ? ,`gas`= ? ' +
            'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

            db.connection.query(queryString, [
              data[0],
              data[1],
              data[2],
              values[0],
              values[1],
              values[2]
            ],function(err, rows) {
              if (err) {
                throw err
              }else{

                var unitLevel = func.getFinalLevel(values[4],values[5]);

                var queryString = 'INSERT INTO `units_upgrade` ' +
                '(`user_id`, `solar_system`, `intra_system`, `units`, `level`, `start_timestamp`, `end_timestamp`) ' +
                'VALUES (?,?,?,?,?,?,?)';

                var metalConsumption = data[3];
                var crystalConsumption = data[4];

                getIXSAndSpaceportLevels(values[0],values[1],values[2],
                  function(err,data){
                    if (err) {
                      console.log("ERROR : ",err);
                    } else {

                      var endTimestampValues = func.endTimestamp(metalConsumption,crystalConsumption,2,data);

                      db.connection.query(queryString, [
                        values[0],
                        values[1],
                        values[2],
                        values[3],
                        unitLevel,
                        func.getTimestamp(),
                        endTimestampValues
                      ],function(err, rows) {
                        if (err) {
                          throw err
                        }else{
                          callback(null,'UNITS_LEVEL_SUCCESSFULLY_UPDATED');
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }

  function isAlreadyBuildingUnits(values,callback){

    var queryString = 'SELECT * FROM `units_upgrade` ' +
    'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ? ';

    // console.log(queryString);
    db.connection.query(queryString, [
      values[0],
      values[1],
      values[2]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        if( JSON.stringify(rows) == JSON.stringify([]) ){
          // Object is Empty
          callback(null,'TRUE');
        }
        else{
          //Object is Not Empty
          callback(null,'FALSE');
        }
        // callback(null,'TECH_LEVEL_SUCCESSFULLY_ADDED');
      }
    });
  }

  function getIXSAndSpaceportLevels(user_id,solar_system,intra_system,callback){
    //techOrBuilding : 0 is building, 1 is Tech,2 is ships
    // get formulas values from ogame https://ogame.fandom.com/wiki/Formulas
    // Math.floor(Date.now() / 1000) --> Calculates currentTimestamp
    var queryString = 'SELECT upl.`spaceport`, uplhp.`supercalculator` ' +
    'FROM `user_planetary_levels` upl ' +
    'JOIN `user_planetary_levels` uplhp ON upl.`user_id` = upl.`user_id` ' +
    'JOIN `telluric` thp ON thp.`owner` = uplhp.`user_id` ' +
    'AND uplhp.`solar_system` = thp.`solar_system` ' +
    'AND uplhp.`intra_system` = thp.`intra_system` ' +
    'WHERE upl.`user_id` = ? AND thp.`home_planet` = 1 AND upl.solar_system = ? AND upl.intra_system = ?';

    db.connection.query(queryString, [
      user_id,
      solar_system,
      intra_system
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        callback(null,rows);
      }
    });
  }

  function updateControlCentersInConstruction(){

    var queryString = 'SELECT * FROM `units_upgrade` WHERE `end_timestamp` <= ?';

    db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
      if (err) {
        throw err
      }else{
        var unitsUpgradesValues = rows;

        var queryString = 'DELETE FROM `units_upgrade` WHERE `end_timestamp` <= ?';

        db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
          if (err) {
            throw err
          }else{
            for (i = 0; i < unitsUpgradesValues.length; i++) {
              addUnitLevel(unitsUpgradesValues[i]);
            }
          }
        });
      }
    });
  }

  async function addUnitLevel(values,callback){
    var queryString = 'UPDATE `user_units_levels` '

    switch(values.units) {
      case 'laser_turret':
      queryString = queryString + 'SET `laser_turret` = ? '
      break;
      case 'photon_turret':
      queryString = queryString + 'SET `photon_turret` = ? '
      break;
      case 'ion_turret':
      queryString = queryString + 'SET `ion_turret` = ? '
      break;
      case 'plasma_turret':
      queryString = queryString + 'SET `plasma_turret` = ? '
      break;
      case 'gauss_turret':
      queryString = queryString + 'SET `gauss_turret` = ? '
      break;
      case 'neutron_turret':
      queryString = queryString + 'SET `neutron_turret` = ? '
      break;
      case 'antimatter':
      queryString = queryString + 'SET `antimatter` = ? '
      break;
      case 'small_shield':
      queryString = queryString + 'SET `small_shield` = ? '
      break;
      case 'big_shield':
      queryString = queryString + 'SET `big_shield` = ? '
      break;
      case 'ballistic_missile':
      queryString = queryString + 'SET `ballistic_missile` = ? '
      break;
      case 'defensive_satellite':
      queryString = queryString + 'SET `defensive_satellite` = ? '
      break;
      case 'heavy_defensive_satellite':
      queryString = queryString + 'SET `heavy_defensive_satellite` = ? '
      break;
      case 'fighter':
      queryString = queryString + 'SET `fighter` = ? '
      break;
      case 'improved_fighter':
      queryString = queryString + 'SET `improved_fighter` = ? '
      break;
      case 'light_cruiser':
      queryString = queryString + 'SET `light_cruiser` = ? '
      break;
      case 'bomb_cruiser':
      queryString = queryString + 'SET `bomb_cruiser` = ? '
      break;
      case 'line_cruiser':
      queryString = queryString + 'SET `line_cruiser` = ? '
      break;
      case 'battleship':
      queryString = queryString + 'SET `battleship` = ? '
      break;
      case 'line_battleship':
      queryString = queryString + 'SET `line_battleship` = ? '
      break;
      case 'fleet_destructor':
      queryString = queryString + 'SET `fleet_destructor` = ? '
      break;
      case 'titan_destructor':
      queryString = queryString + 'SET `titan_destructor` = ? '
      break;
      case 'titan_1':
      queryString = queryString + 'SET `titan_1` = ? '
      break;
      case 'titan_2':
      queryString = queryString + 'SET `titan_2` = ? '
      break;
      case 'titan_3':
      queryString = queryString + 'SET `titan_3` = ? '
      break;
      case 'titan_4':
      queryString = queryString + 'SET `titan_4` = ? '
      break;
      case 'spy_probe':
      queryString = queryString + 'SET `spy_probe` = ? '
      break;
      case 'small_transporter':
      queryString = queryString + 'SET `small_transporter` = ? '
      break;
      case 'big_transporter':
      queryString = queryString + 'SET `big_transporter` = ? '
      break;
      case 'planet_extractor':
      queryString = queryString + 'SET `planet_extractor` = ? '
      break;
      case 'nebulae_extractor':
      queryString = queryString + 'SET `nebulae_extractor` = ? '
      break;
      case 'black_hole_extractor':
      queryString = queryString + 'SET `black_hole_extractor` = ? '
      break;
      case 'asteroid_field_extractor':
      queryString = queryString + 'SET `asteroid_field_extractor` = ? '
      break;
      case 'colonization_ship':
      queryString = queryString + 'SET `colonization_ship` = ? '
      break;
      case 'recycling_ship':
      queryString = queryString + 'SET `recycling_ship` = ? '
      break;
      case 'solar_satellite':
      queryString = queryString + 'SET `solar_satellite` = ? '
      break;
      case 'hunter_carrier':
      queryString = queryString + 'SET `hunter_carrier` = ? '
      break;
      case 'shield_destructor':
      queryString = queryString + 'SET `shield_destructor` = ? '
      break;
      case 'boarding_vessel':
      queryString = queryString + 'SET `boarding_vessel` = ? '
      break;
      case 'interplanetary_missile':
      queryString = queryString + 'SET `interplanetary_missile` = ? '
      break;
    }

    queryString = queryString + 'WHERE `user_id` = ? AND solar_system = ? AND intra_system = ?';

    var techLevel = func.getFinalLevel(values.level,values.end_timestamp)
    // console.log(queryString);

    db.connection.query(queryString, [
      techLevel,
      values.user_id,
      values.solar_system,
      values.intra_system
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        // callback(null,'TECHNOLOGY_LEVEL_SUCCESSFULLY_UPDATED');
      }
    });
  }

  async function getFightingShips(values,callback){
    var queryString = 'SELECT `fighter`,`improved_fighter`,`light_cruiser`,' +
    '`bomb_cruiser`,`line_cruiser`,`battleship`,`line_battleship`,`fleet_destructor`' +
    ',`titan_destructor`,`titan_1`,`titan_2`,`titan_3`,`titan_4`,`spy_probe` ' +
    'FROM `user_units_levels` ' +
    'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

    db.connection.query(queryString, [
      values[0],
      values[1],
      values[2]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('fighter',rows[0].fighter));
        returnValues.push(func.getConstructionRessource('improved_fighter',rows[0].improved_fighter));
        returnValues.push(func.getConstructionRessource('light_cruiser',rows[0].light_cruiser));
        returnValues.push(func.getConstructionRessource('bomb_cruiser',rows[0].bomb_cruiser));
        returnValues.push(func.getConstructionRessource('line_cruiser',rows[0].line_cruiser));
        returnValues.push(func.getConstructionRessource('battleship',rows[0].battleship));
        returnValues.push(func.getConstructionRessource('line_battleship',rows[0].line_battleship));
        returnValues.push(func.getConstructionRessource('fleet_destructor',rows[0].fleet_destructor));
        returnValues.push(func.getConstructionRessource('titan_destructor',rows[0].titan_destructor));
        returnValues.push(func.getConstructionRessource('titan_1',rows[0].titan_1));
        returnValues.push(func.getConstructionRessource('titan_2',rows[0].titan_2));
        returnValues.push(func.getConstructionRessource('titan_3',rows[0].titan_3));
        returnValues.push(func.getConstructionRessource('titan_4',rows[0].titan_4));
        returnValues.push(func.getConstructionRessource('spy_probe',rows[0].spy_probe));

        callback(null,returnValues);
      }
    });
  }

  async function getTurrets(values,callback){
    var queryString = 'SELECT `laser_turret`, `photon_turret`, `ion_turret`, `plasma_turret`,' +
    ' `gauss_turret`, `neutron_turret`, `antimatter_turret`, `small_shield`,' +
    ' `big_shield`, `ballistic_missile`, `spatial_mine`, `defensive_satellite`,' +
    ' `heavy_defensive_satellite` FROM `user_units_levels` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('laser_turret',rows[0].laser_turret));
        returnValues.push(func.getConstructionRessource('photon_turret',rows[0].photon_turret));
        returnValues.push(func.getConstructionRessource('ion_turret',rows[0].ion_turret));
        returnValues.push(func.getConstructionRessource('plasma_turret',rows[0].plasma_turret));
        returnValues.push(func.getConstructionRessource('gauss_turret',rows[0].gauss_turret));
        returnValues.push(func.getConstructionRessource('neutron_turret',rows[0].neutron_turret));
        returnValues.push(func.getConstructionRessource('antimatter_turret',rows[0].antimatter_turret));
        returnValues.push(func.getConstructionRessource('small_shield',rows[0].small_shield));
        returnValues.push(func.getConstructionRessource('big_shield',rows[0].big_shield));
        returnValues.push(func.getConstructionRessource('ballistic_missile',rows[0].ballistic_missile));
        returnValues.push(func.getConstructionRessource('spatial_mine',rows[0].spatial_mine));
        returnValues.push(func.getConstructionRessource('defensive_satellite',rows[0].defensive_satellite));
        returnValues.push(func.getConstructionRessource('heavy_defensive_satellite',rows[0].heavy_defensive_satellite));

        callback(null,returnValues);
      }
    });
  }

  async function getCivilians(values,callback){
    var queryString = 'SELECT `small_transporter`, `big_transporter`, `planet_extractor`,' +
    ' `nebulae_extractor`, `black_hole_extractor`, `asteroid_field_extractor`,' +
    ' `colonization_ship`, `recycling_ship`, `solar_satellite`' +
    ' FROM `user_units_levels` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('small_transporter',rows[0].small_transporter));
        returnValues.push(func.getConstructionRessource('big_transporter',rows[0].big_transporter));
        returnValues.push(func.getConstructionRessource('planet_extractor',rows[0].planet_extractor));
        returnValues.push(func.getConstructionRessource('nebulae_extractor',rows[0].nebulae_extractor));
        returnValues.push(func.getConstructionRessource('black_hole_extractor',rows[0].black_hole_extractor));
        returnValues.push(func.getConstructionRessource('asteroid_field_extractor',rows[0].asteroid_field_extractor));
        returnValues.push(func.getConstructionRessource('colonization_ship',rows[0].colonization_ship));
        returnValues.push(func.getConstructionRessource('recycling_ship',rows[0].recycling_ship));
        returnValues.push(func.getConstructionRessource('solar_satellite',rows[0].solar_satellite));
        callback(null,returnValues);
      }
    });
  }

  async function getLogistics(values,callback){
    var queryString = 'SELECT `hunter_carrier`, `shield_destructor`,' +
    ' `boarding_vessel`, `interplanetary_missile` FROM `user_units_levels` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('hunter_carrier',rows[0].hunter_carrier));
        returnValues.push(func.getConstructionRessource('shield_destructor',rows[0].shield_destructor));
        returnValues.push(func.getConstructionRessource('boarding_vessel',rows[0].boarding_vessel));
        returnValues.push(func.getConstructionRessource('interplanetary_missile',rows[0].interplanetary_missile));

        callback(null,returnValues);
      }
    });
  }

  async function getShips(values,callback){
    var queryString = 'SELECT `fighter`,`improved_fighter`,`light_cruiser`,' +
    ' `bomb_cruiser`,`line_cruiser`,`battleship`,`line_battleship`,`fleet_destructor`,' +
    ' `titan_destructor`,`titan_1`,`titan_2`,`titan_3`,`titan_4`,`spy_probe`,`hunter_carrier`, ' +
    ' `shield_destructor`,`boarding_vessel`, `interplanetary_missile`,`small_transporter`, ' +
    ' `big_transporter`, `planet_extractor`,`nebulae_extractor`, `black_hole_extractor`, ' +
    ' `asteroid_field_extractor`,`colonization_ship`, `recycling_ship`, `solar_satellite` ' +
    ' `laser_turret`, `photon_turret`, `ion_turret`, `plasma_turret`,' +
    ' `gauss_turret`, `neutron_turret`, `antimatter_turret`, `small_shield`,' +
    ' `big_shield`, `ballistic_missile`, `spatial_mine`, `defensive_satellite`,' +
    ' `heavy_defensive_satellite` ' +
    'FROM `user_units_entities` ' +
    'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

    db.connection.query(queryString, [
      values[0],
      values[1],
      values[2]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push([unitEntities.fighter.metal,unitEntities.fighter.crystal,unitEntities.fighter.gas,'fighter',rows[0].fighter,""]);
        returnValues.push([unitEntities.improved_fighter.metal,unitEntities.improved_fighter.crystal,unitEntities.improved_fighter.gas,'improved_fighter',rows[0].improved_fighter,""]);
        returnValues.push([unitEntities.light_cruiser.metal,unitEntities.light_cruiser.crystal,unitEntities.light_cruiser.gas,'light_cruiser',rows[0].light_cruiser,""]);
        returnValues.push([unitEntities.bomb_cruiser.metal,unitEntities.bomb_cruiser.crystal,unitEntities.bomb_cruiser.gas,'bomb_cruiser',rows[0].bomb_cruiser,""]);
        returnValues.push([unitEntities.line_cruiser.metal,unitEntities.line_cruiser.crystal,unitEntities.line_cruiser.gas,'line_cruiser',rows[0].line_cruiser,""]);
        returnValues.push([unitEntities.battleship.metal,unitEntities.battleship.crystal,unitEntities.battleship.gas,'battleship',rows[0].battleship,""]);
        returnValues.push([unitEntities.line_battleship.metal,unitEntities.line_battleship.crystal,unitEntities.line_battleship.gas,'line_battleship',rows[0].line_battleship,""]);
        returnValues.push([unitEntities.fleet_destructor.metal,unitEntities.fleet_destructor.crystal,unitEntities.fleet_destructor.gas,'fleet_destructor',rows[0].fleet_destructor,""]);
        returnValues.push([unitEntities.titan_destructor.metal,unitEntities.titan_destructor.crystal,unitEntities.titan_destructor.gas,'titan_destructor',rows[0].titan_destructor,""]);
        returnValues.push([unitEntities.titan_1.metal,unitEntities.titan_1.crystal,unitEntities.titan_1.gas,'titan_1',rows[0].titan_1,""]);
        returnValues.push([unitEntities.titan_2.metal,unitEntities.titan_2.crystal,unitEntities.titan_2.gas,'titan_2',rows[0].titan_2,""]);
        returnValues.push([unitEntities.titan_3.metal,unitEntities.titan_3.crystal,unitEntities.titan_3.gas,'titan_3',rows[0].titan_3,""]);
        returnValues.push([unitEntities.titan_4.metal,unitEntities.titan_4.crystal,unitEntities.titan_4.gas,'titan_4',rows[0].titan_4,""]);
        returnValues.push([unitEntities.spy_probe.metal,unitEntities.spy_probe.crystal,unitEntities.spy_probe.gas,'spy_probe',rows[0].spy_probe,""]);
        returnValues.push([unitEntities.small_transporter.metal,unitEntities.small_transporter.crystal,unitEntities.small_transporter.gas,'small_transporter',rows[0].small_transporter,""]);
        returnValues.push([unitEntities.big_transporter.metal,unitEntities.big_transporter.crystal,unitEntities.big_transporter.gas,'big_transporter',rows[0].big_transporter,""]);
        returnValues.push([unitEntities.planet_extractor.metal,unitEntities.planet_extractor.crystal,unitEntities.planet_extractor.gas,'planet_extractor',rows[0].planet_extractor,""]);
        returnValues.push([unitEntities.nebulae_extractor.metal,unitEntities.nebulae_extractor.crystal,unitEntities.nebulae_extractor.gas,'nebulae_extractor',rows[0].nebulae_extractor,""]);
        returnValues.push([unitEntities.black_hole_extractor.metal,unitEntities.black_hole_extractor.crystal,unitEntities.black_hole_extractor.gas,'black_hole_extractor',rows[0].black_hole_extractor,""]);
        returnValues.push([unitEntities.asteroid_field_extractor.metal,unitEntities.asteroid_field_extractor.crystal,unitEntities.asteroid_field_extractor.gas,'asteroid_field_extractor',rows[0].asteroid_field_extractor,""]);
        returnValues.push([unitEntities.colonization_ship.metal,unitEntities.colonization_ship.crystal,unitEntities.colonization_ship.gas,'colonization_ship',rows[0].colonization_ship,""]);
        returnValues.push([unitEntities.recycling_ship.metal,unitEntities.recycling_ship.crystal,unitEntities.recycling_ship.gas,'recycling_ship',rows[0].recycling_ship,""]);
        returnValues.push([unitEntities.solar_satellite.metal,unitEntities.solar_satellite.crystal,unitEntities.solar_satellite.gas,'solar_satellite',rows[0].solar_satellite,""]);
        returnValues.push([unitEntities.hunter_carrier.metal,unitEntities.hunter_carrier.crystal,unitEntities.hunter_carrier.gas,'hunter_carrier',rows[0].hunter_carrier,""]);
        returnValues.push([unitEntities.shield_destructor.metal,unitEntities.shield_destructor.crystal,unitEntities.shield_destructor.gas,'shield_destructor',rows[0].shield_destructor,""]);
        returnValues.push([unitEntities.boarding_vessel.metal,unitEntities.boarding_vessel.crystal,unitEntities.boarding_vessel.gas,'boarding_vessel',rows[0].boarding_vessel,""]);
        returnValues.push([unitEntities.interplanetary_missile.metal,unitEntities.interplanetary_missile.crystal,unitEntities.interplanetary_missile.gas,'interplanetary_missile',rows[0].interplanetary_missile,""]);
        returnValues.push([unitEntities.laser_turret.metal,unitEntities.laser_turret.crystal,unitEntities.laser_turret.gas,'laser_turret',rows[0].laser_turret,""]);
        returnValues.push([unitEntities.photon_turret.metal,unitEntities.photon_turret.crystal,unitEntities.photon_turret.gas,'photon_turret',rows[0].photon_turret,""]);
        returnValues.push([unitEntities.ion_turret.metal,unitEntities.ion_turret.crystal,unitEntities.ion_turret.gas,'ion_turret',rows[0].ion_turret,""]);
        returnValues.push([unitEntities.plasma_turret.metal,unitEntities.plasma_turret.crystal,unitEntities.plasma_turret.gas,'plasma_turret',rows[0].plasma_turret,""]);
        returnValues.push([unitEntities.gauss_turret.metal,unitEntities.gauss_turret.crystal,unitEntities.gauss_turret.gas,'gauss_turret',rows[0].gauss_turret,""]);
        returnValues.push([unitEntities.neutron_turret.metal,unitEntities.neutron_turret.crystal,unitEntities.neutron_turret.gas,'neutron_turret',rows[0].neutron_turret,""]);
        returnValues.push([unitEntities.antimatter_turret.metal,unitEntities.antimatter_turret.crystal,unitEntities.antimatter_turret.gas,'antimatter_turret',rows[0].antimatter_turret,""]);
        returnValues.push([unitEntities.small_shield.metal,unitEntities.small_shield.crystal,unitEntities.small_shield.gas,'small_shield',rows[0].small_shield,""]);
        returnValues.push([unitEntities.big_shield.metal,unitEntities.big_shield.crystal,unitEntities.big_shield.gas,'big_shield',rows[0].big_shield,""]);
        returnValues.push([unitEntities.ballistic_missile.metal,unitEntities.ballistic_missile.crystal,unitEntities.ballistic_missile.gas,'ballistic_missile',rows[0].ballistic_missile,""]);
        returnValues.push([unitEntities.spatial_mine.metal,unitEntities.spatial_mine.crystal,unitEntities.spatial_mine.gas,'spatial_mine',rows[0].spatial_mine,""]);
        returnValues.push([unitEntities.defensive_satellite.metal,unitEntities.defensive_satellite.crystal,unitEntities.defensive_satellite.gas,'defensive_satellite',rows[0].defensive_satellite,""]);
        returnValues.push([unitEntities.heavy_defensive_satellite.metal,unitEntities.heavy_defensive_satellite.crystal,unitEntities.heavy_defensive_satellite.gas,'heavy_defensive_satellite',rows[0].heavy_defensive_satellite,""]);

        callback(null,returnValues);
      }
    });
  }

  async function maxUnits(values,callback){
    var queryString = 'SELECT *' +
    ' FROM `user_units_levels` WHERE' +
    ' `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?'

    db.connection.query(queryString, [
      values[0],
      values[1],
      values[2]
    ],function(err, unitControlCenter) {
      if (err) {
        throw err
      }else{
        var queryString = 'SELECT metal,crystal,gas,benalite' +
        ' FROM `user_ressources` WHERE' +
        ' `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?'
      }

      db.connection.query(queryString, [
        values[0],
        values[1],
        values[2]
      ],function(err, ressources) {
        if (err) {
          throw err
        }else{
          callback(null,getShipAmount(values[3],unitControlCenter[0],ressources[0]));
        }
      })
    })
  }

  function getShipAmount(values,unitControlCenter,ressources){
    switch(values){
      case 'laser_turret':
      return smallShipCalculation(unitControlCenter.laser_turret,unitEntities.laser_turret,ressources);
      break;
      case 'photon_turret':
      return smallShipCalculation(unitControlCenter.photon_turret,unitEntities.photon_turret,ressources);
      break;
      case 'ion_turret':
      return smallShipCalculation(unitControlCenter.ion_turret,unitEntities.ion_turret,ressources);
      break;
      case 'plasma_turret':
      return smallShipCalculation(unitControlCenter.plasma_turret,unitEntities.plasma_turret,ressources);
      break;
      case 'gauss_turret':
      return smallShipCalculation(unitControlCenter.gauss_turret,unitEntities.gauss_turret,ressources);
      break;
      case 'neutron_turret':
      return smallShipCalculation(unitControlCenter.neutron_turret,unitEntities.neutron_turret,ressources);
      break;
      case 'antimatter':
      return smallShipCalculation(unitControlCenter.antimatter,unitEntities.antimatter,ressources);
      break;
      case 'small_shield':
      return smallShipCalculation(unitControlCenter.small_shield,unitEntities.small_shield,ressources);
      break;
      case 'big_shield':
      return smallShipCalculation(unitControlCenter.big_shield,unitEntities.big_shield,ressources);
      break;
      case 'ballistic_missile':
      return smallShipCalculation(unitControlCenter.ballistic_missile,unitEntities.ballistic_missile,ressources);
      break;
      case 'defensive_satellite':
      return smallShipCalculation(unitControlCenter.defensive_satellite,unitEntities.defensive_satellite,ressources);
      break;
      case 'heavy_defensive_satellite':
      return smallShipCalculation(unitControlCenter.heavy_defensive_satellite,unitEntities.heavy_defensive_satellite,ressources);
      break;
      case 'fighter':
      return smallShipCalculation(unitControlCenter.fighter,unitEntities.fighter,ressources);
      break;
      case 'improved_fighter':
      return smallShipCalculation(unitControlCenter.improved_fighter,unitEntities.improved_fighter,ressources);
      break;
      case 'light_cruiser':
      return smallShipCalculation(unitControlCenter.light_cruiser,unitEntities.light_cruiser,ressources);
      break;
      case 'bomb_cruiser':
      return smallShipCalculation(unitControlCenter.bomb_cruiser,unitEntities.bomb_cruiser,ressources);
      break;
      case 'line_cruiser':
      return smallShipCalculation(unitControlCenter.line_cruiser,unitEntities.line_cruiser,ressources);
      break;
      case 'battleship':
      return smallShipCalculation(unitControlCenter.battleship,unitEntities.battleship,ressources);
      break;
      case 'line_battleship':
      return smallShipCalculation(unitControlCenter.line_battleship,unitEntities.line_battleship,ressources);
      break;
      case 'fleet_destructor':
      return smallShipCalculation(unitControlCenter.fleet_destructor,unitEntities.fleet_destructor,ressources);
      break;
      case 'titan_destructor':
      return smallShipCalculation(unitControlCenter.titan_destructor,unitEntities.titan_destructor,ressources);
      break;
      case 'titan_1':
      return smallShipCalculation(unitControlCenter.titan_1,unitEntities.titan_1,ressources);
      break;
      case 'titan_2':
      return smallShipCalculation(unitControlCenter.titan_2,unitEntities.titan_2,ressources);
      break;
      case 'titan_3':
      return smallShipCalculation(unitControlCenter.titan_3,unitEntities.titan_3,ressources);
      break;
      case 'titan_4':
      return smallShipCalculation(unitControlCenter.titan_4,unitEntities.titan_4,ressources);
      break;
      case 'spy_probe':
      return smallShipCalculation(unitControlCenter.spy_probe,unitEntities.spy_probe,ressources);
      break;
      case 'small_transporter':
      return smallShipCalculation(unitControlCenter.small_transporter,unitEntities.small_transporter,ressources);
      break;
      case 'big_transporter':
      return smallShipCalculation(unitControlCenter.big_transporter,unitEntities.big_transporter,ressources);
      break;
      case 'planet_extractor':
      return smallShipCalculation(unitControlCenter.planet_extractor,unitEntities.planet_extractor,ressources);
      break;
      case 'nebulae_extractor':
      return smallShipCalculation(unitControlCenter.nebulae_extractor,unitEntities.nebulae_extractor,ressources);
      break;
      case 'black_hole_extractor':
      return smallShipCalculation(unitControlCenter.black_hole_extractor,unitEntities.black_hole_extractor,ressources);
      break;
      case 'asteroid_field_extractor':
      return smallShipCalculation(unitControlCenter.asteroid_field_extractor,unitEntities.asteroid_field_extractor,ressources);
      break;
      case 'colonization_ship':
      return smallShipCalculation(unitControlCenter.colonization_ship,unitEntities.colonization_ship,ressources);
      break;
      case 'recycling_ship':
      return smallShipCalculation(unitControlCenter.recycling_ship,unitEntities.recycling_ship,ressources);
      break;
      case 'solar_satellite':
      return smallShipCalculation(unitControlCenter.solar_satellite,unitEntities.solar_satellite,ressources);
      break;
      case 'hunter_carrier':
      return smallShipCalculation(unitControlCenter.hunter_carrier,unitEntities.hunter_carrier,ressources);
      break;
      case 'shield_destructor':
      return smallShipCalculation(unitControlCenter.shield_destructor,unitEntities.shield_destructor,ressources);
      break;
      case 'boarding_vessel':
      return smallShipCalculation(unitControlCenter.boarding_vessel,unitEntities.boarding_vessel,ressources);
      break;
      case 'interplanetary_missile':
      return smallShipCalculation(unitControlCenter.interplanetary_missile,unitEntities.interplanetary_missile,ressources);
      break;
    }
  }

  function smallShipCalculation(level,entity,ressources){
    var max = smallShipMaxCalculation(level);
    var metal = Math.round(ressources.metal/entity.metal);
    var crystal = Math.round(ressources.crystal/entity.crystal);
    var gas = Math.round(ressources.gas/entity.gas);
    if(metal <= crystal && metal <= gas && metal <= max){
      return metal;
    }else if(crystal <= metal && crystal <= gas && crystal <= max){
      return crystal;
    }else if(gas <= metal && gas <= crystal && gas <= max){
      return gas;
    }else{
      return max;
    }
  }

  function smallShipMaxCalculation(level){
    var calculation = 1;
    for(var i = 1;i<=level;i++){
      calculation = calculation + Math.pow(i*2,2)/3.6;
      calculation = Math.round(calculation)
    }
    return calculation;
  }

  async function buildUnits(values,callback){
    console.log(values);
    //know if there is enough ressources on the planet.
    isEnoughRessourcesEntities(values[0],values[1],values[2],values[3],values[4],function(err,data){
      if (err) {
        console.log("ERROR : ",err);
        callback(null,'NOT_ENOUGH_RESSOURCES');
      } else {
        var queryString = 'UPDATE `user_ressources` ' +
        'SET `metal`= ? ,`crystal`= ? ,`gas`= ? ' +
        'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

        db.connection.query(queryString, [
          data[0],
          data[1],
          data[2],
          values[0],
          values[1],
          values[2]
        ],function(err, rows) {
          if (err) {
            throw err
          }else{

            var queryString = 'INSERT INTO `units_building` ' +
            '(`user_id`, `solar_system`, `intra_system`, `units`, `start_timestamp`, `end_timestamp`) ' +
            'VALUES (?,?,?,?,?,?)';

            var metalConsumption = data[3];
            var crystalConsumption = data[4];

            getIXSAndSpaceportLevels(values[0],values[1],values[2],
              function(err,data){
                if (err) {
                  console.log("ERROR : ",err);
                } else {

                  var previousEndTimestamp = 0;

                  for(var i = 0;i<values[4];i++){
                    var endTimestampValues = previousEndTimestamp + func.endTimestamp(metalConsumption,crystalConsumption,2,data);
                    var timestamp = func.getTimestamp();
                    db.connection.query(queryString, [
                      values[0],
                      values[1],
                      values[2],
                      values[3],
                      timestamp,
                      endTimestampValues
                    ],function(err, rows) {
                      if (err) {
                        throw err
                      }
                    });
                    previousEndTimestamp = endTimestampValues - timestamp;

                  }
                  callback(null,'UNITS_LEVEL_SUCCESSFULLY_UPDATED');
                }
              });
            }
          });
        }
      });
    }

    function isEnoughRessourcesEntities(clientID,solar_system,intra_position,item,quantity,callback){
      var queryString = 'SELECT `metal`, `crystal`, `gas` ' +
      'FROM `user_ressources` ' +
      'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

      db.connection.query(queryString, [
        clientID,
        solar_system,
        intra_position
      ],function(err, rows) {
        if (err) {
          throw err
        }else{
          var constructionsRessource = getConstructionRessourceEntities(item,quantity);

          var metal = constructionsRessource[0];
          var crystal = constructionsRessource[1];
          var gas = constructionsRessource[2];

          if(rows[0].metal < metal){
            callback('NOT_ENOUGH_RESSOURCES',null);
          }else if(rows[0].crystal < crystal){
            callback('NOT_ENOUGH_RESSOURCES',null);
          }else if(rows[0].gas < gas){
            callback('NOT_ENOUGH_RESSOURCES',null);
          }else{
            callback(null,[rows[0].metal - metal,rows[0].crystal - crystal,rows[0].gas - gas,metal,crystal]);
          }
        }
      });
    }

    function getConstructionRessourceEntities(item,quantity){
      var metal;
      var crystal;
      var gas;
      switch(item) {
        case 'laser_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.laser_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.laser_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.laser_turret.gas,quantity);
        break;
        case 'photon_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.photon_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.photon_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.photon_turret.gas,quantity);
        break;
        case 'ion_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.ion_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.ion_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.ion_turret.gas,quantity);
        break;
        case 'plasma_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.plasma_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.plasma_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.plasma_turret.gas,quantity);
        break;
        case 'gauss_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.gauss_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.gauss_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.gauss_turret.gas,quantity);
        break;
        case 'neutron_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.neutron_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.neutron_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.neutron_turret.gas,quantity);
        break;
        case 'antimatter_turret':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.antimatter_turret.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.antimatter_turret.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.antimatter_turret.gas,quantity);
        break;
        case 'small_shield':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_shield.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_shield.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_shield.gas,quantity);
        break;
        case 'big_shield':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_shield.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_shield.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_shield.gas,quantity);
        break;
        case 'ballistic_missile':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.ballistic_missile.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.ballistic_missile.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.ballistic_missile.gas,quantity);
        break;
        case 'spatial_mine':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.spatial_mine.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.spatial_mine.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.spatial_mine.gas,quantity);
        break;
        case 'defensive_satellite':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.defensive_satellite.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.defensive_satellite.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.defensive_satellite.gas,quantity);
        break;
        case 'heavy_defensive_satellite':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.heavy_defensive_satellite.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.heavy_defensive_satellite.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.heavy_defensive_satellite.gas,quantity);
        break;
        case 'fighter':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.fighter.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.fighter.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.fighter.gas,quantity);
        break;
        case 'improved_fighter':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.improved_fighter.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.improved_fighter.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.improved_fighter.gas,quantity);
        break;
        case 'light_cruiser':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.light_cruiser.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.light_cruiser.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.light_cruiser.gas,quantity);
        break;
        case 'bomb_cruiser':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.bomb_cruiser.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.bomb_cruiser.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.bomb_cruiser.gas,quantity);
        break;
        case 'line_cruiser':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_cruiser.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_cruiser.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_cruiser.gas,quantity);
        break;
        case 'battleship':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.battleship.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.battleship.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.battleship.gas,quantity);
        break;
        case 'line_battleship':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_battleship.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_battleship.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.line_battleship.gas,quantity);
        break;
        case 'fleet_destructor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.fleet_destructor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.fleet_destructor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.fleet_destructor.gas,quantity);
        break;
        case 'titan_destructor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_destructor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_destructor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_destructor.gas,quantity);
        break;
        case 'titan_1':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_1.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_1.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_1.gas,quantity);
        break;
        case 'titan_2':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_2.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_2.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_2.gas,quantity);
        break;
        case 'titan_3':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_3.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_3.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_3.gas,quantity);
        break;
        case 'titan_4':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_4.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_4.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.titan_4.gas,quantity);
        break;
        case 'spy_probe':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.spy_probe.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.spy_probe.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.spy_probe.gas,quantity);
        break;
        case 'small_transporter':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_transporter.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_transporter.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.small_transporter.gas,quantity);
        break;
        case 'big_transporter':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_transporter.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_transporter.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.big_transporter.gas,quantity);
        break;
        case 'planet_extractor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.planet_extractor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.planet_extractor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.planet_extractor.gas,quantity);
        break;
        case 'nebulae_extractor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.nebulae_extractor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.nebulae_extractor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.nebulae_extractor.gas,quantity);
        break;
        case 'black_hole_extractor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.black_hole_extractor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.black_hole_extractor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.black_hole_extractor.gas,quantity);
        break;
        case 'asteroid_field_extractor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.asteroid_field_extractor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.asteroid_field_extractor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.asteroid_field_extractor.gas,quantity);
        break;
        case 'colonization_ship':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.colonization_ship.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.colonization_ship.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.colonization_ship.gas,quantity);
        break;
        case 'recycling_ship':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.recycling_ship.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.recycling_ship.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.recycling_ship.gas,quantity);
        break;
        case 'solar_satellite':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.solar_satellite.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.solar_satellite.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.solar_satellite.gas,quantity);
        break;
        case 'hunter_carrier':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.hunter_carrier.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.hunter_carrier.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.hunter_carrier.gas,quantity);
        break;
        case 'shield_destructor':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.shield_destructor.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.shield_destructor.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.shield_destructor.gas,quantity);
        break;
        case 'boarding_vessel':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.boarding_vessel.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.boarding_vessel.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.boarding_vessel.gas,quantity);
        break;
        case 'interplanetary_missile':
        metal = calculateUpgradeRessourceConsumptionEntities(unitEntities.interplanetary_missile.metal,quantity);
        crystal = calculateUpgradeRessourceConsumptionEntities(unitEntities.interplanetary_missile.crystal,quantity);
        gas = calculateUpgradeRessourceConsumptionEntities(unitEntities.interplanetary_missile.gas,quantity);
        break;
      }

      return [metal.toFixed(0),crystal.toFixed(0),gas.toFixed(0),item];
    }

    function calculateUpgradeRessourceConsumptionEntities(base,multiplier){
      return base*multiplier;
    }

    function updateUnitsInConstruction(){

      var queryString = 'SELECT * FROM `units_building` WHERE `end_timestamp` <= ?';
      // console.log(queryString);
      // console.log(func.getTimestamp());

      db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
        if (err) {
          throw err
        }else{
          var addUnits = rows;
          // console.log(addUnits);
          // console.log(rows);

          var queryString = 'DELETE FROM `units_building` WHERE `end_timestamp` <= ?';

          db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
            if (err) {
              throw err
            }else{
              for (i = 0; i < addUnits.length; i++) {
                addUnitBuilt(addUnits[i]);
              }
            }
          });
        }
      });
    }

    async function addUnitBuilt(values,callback){
      var queryString = 'UPDATE `user_units_entities` '

      switch(values.units) {
        case 'laser_turret':
        queryString = queryString + 'SET `laser_turret` = `laser_turret` + 1 '
        break;
        case 'photon_turret':
        queryString = queryString + 'SET `photon_turret` = `photon_turret` + 1 '
        break;
        case 'ion_turret':
        queryString = queryString + 'SET `ion_turret` = `ion_turret` + 1 '
        break;
        case 'plasma_turret':
        queryString = queryString + 'SET `plasma_turret` = `plasma_turret` + 1 '
        break;
        case 'gauss_turret':
        queryString = queryString + 'SET `gauss_turret` = `gauss_turret` + 1 '
        break;
        case 'neutron_turret':
        queryString = queryString + 'SET `neutron_turret` = `neutron_turret` + 1 '
        break;
        case 'antimatter':
        queryString = queryString + 'SET `antimatter` = `antimatter` + 1 '
        break;
        case 'small_shield':
        queryString = queryString + 'SET `small_shield` = `small_shield` + 1 '
        break;
        case 'big_shield':
        queryString = queryString + 'SET `big_shield` = `big_shield` + 1 '
        break;
        case 'ballistic_missile':
        queryString = queryString + 'SET `ballistic_missile` = `ballistic_missile` + 1 '
        break;
        case 'defensive_satellite':
        queryString = queryString + 'SET `defensive_satellite` = `defensive_satellite` + 1 '
        break;
        case 'heavy_defensive_satellite':
        queryString = queryString + 'SET `heavy_defensive_satellite` = `heavy_defensive_satellite` + 1 '
        break;
        case 'fighter':
        queryString = queryString + 'SET `fighter` = `fighter` + 1 '
        break;
        case 'improved_fighter':
        queryString = queryString + 'SET `improved_fighter` = `improved_fighter` + 1 '
        break;
        case 'light_cruiser':
        queryString = queryString + 'SET `light_cruiser` = `light_cruiser` + 1 '
        break;
        case 'bomb_cruiser':
        queryString = queryString + 'SET `bomb_cruiser` = `bomb_cruiser` + 1 '
        break;
        case 'line_cruiser':
        queryString = queryString + 'SET `line_cruiser` = `line_cruiser` + 1 '
        break;
        case 'battleship':
        queryString = queryString + 'SET `battleship` = `battleship` + 1 '
        break;
        case 'line_battleship':
        queryString = queryString + 'SET `line_battleship` = `line_battleship` + 1 '
        break;
        case 'fleet_destructor':
        queryString = queryString + 'SET `fleet_destructor` = `fleet_destructor` + 1 '
        break;
        case 'titan_destructor':
        queryString = queryString + 'SET `titan_destructor` = `titan_destructor` + 1 '
        break;
        case 'titan_1':
        queryString = queryString + 'SET `titan_1` = `titan_1` + 1 '
        break;
        case 'titan_2':
        queryString = queryString + 'SET `titan_2` = `titan_2` + 1 '
        break;
        case 'titan_3':
        queryString = queryString + 'SET `titan_3` = `titan_3` + 1 '
        break;
        case 'titan_4':
        queryString = queryString + 'SET `titan_4` = `titan_4` + 1 '
        break;
        case 'spy_probe':
        queryString = queryString + 'SET `spy_probe` = `spy_probe` + 1 '
        break;
        case 'small_transporter':
        queryString = queryString + 'SET `small_transporter` = `small_transporter` + 1 '
        break;
        case 'big_transporter':
        queryString = queryString + 'SET `big_transporter` = `big_transporter` + 1 '
        break;
        case 'planet_extractor':
        queryString = queryString + 'SET `planet_extractor` = `planet_extractor` + 1 '
        break;
        case 'nebulae_extractor':
        queryString = queryString + 'SET `nebulae_extractor` = `nebulae_extractor` + 1 '
        break;
        case 'black_hole_extractor':
        queryString = queryString + 'SET `black_hole_extractor` = `black_hole_extractor` + 1 '
        break;
        case 'asteroid_field_extractor':
        queryString = queryString + 'SET `asteroid_field_extractor` = `asteroid_field_extractor` + 1 '
        break;
        case 'colonization_ship':
        queryString = queryString + 'SET `colonization_ship` = `colonization_ship` + 1 '
        break;
        case 'recycling_ship':
        queryString = queryString + 'SET `recycling_ship` = `recycling_ship` + 1 '
        break;
        case 'solar_satellite':
        queryString = queryString + 'SET `solar_satellite` = `solar_satellite` + 1 '
        break;
        case 'hunter_carrier':
        queryString = queryString + 'SET `hunter_carrier` = `hunter_carrier` + 1 '
        break;
        case 'shield_destructor':
        queryString = queryString + 'SET `shield_destructor` = `shield_destructor` + 1 '
        break;
        case 'boarding_vessel':
        queryString = queryString + 'SET `boarding_vessel` = `boarding_vessel` + 1 '
        break;
        case 'interplanetary_missile':
        queryString = queryString + 'SET `interplanetary_missile` = `interplanetary_missile` + 1 '
        break;
      }

      queryString = queryString + 'WHERE `user_id` = ? AND solar_system = ? AND intra_system = ?';

      console.log(queryString);

      db.connection.query(queryString, [
        values.user_id,
        values.solar_system,
        values.intra_system
      ],function(err, rows) {
        if (err) {
          throw err
        }else{
          // callback(null,'TECHNOLOGY_LEVEL_SUCCESSFULLY_UPDATED');
        }
      });
    }

    function calculateExistingUnitsOnPlanet(values,callback){

      var queryString = 'SELECT ' +
      'fighter,improved_fighter,light_cruiser,bomb_cruiser,line_cruiser,battleship,' +
      'line_battleship,fleet_destructor,titan_destructor,titan_1,titan_2,titan_3,' +
      'titan_4,spy_probe,small_transporter,big_transporter,planet_extractor,' +
      'nebulae_extractor,black_hole_extractor,asteroid_field_extractor,colonization_ship,' +
      'recycling_ship,solar_satellite,hunter_carrier,shield_destructor,boarding_vessel' +
      ' FROM `user_units_entities` WHERE `user_id` = ? AND solar_system = ? AND intra_system = ?';

      // console.log(queryString);
      db.connection.query(queryString, [
        values[0],
        values[1],
        values[2]
      ],function(err, rows) {
        if (err) {
          throw err
        }else{
          rows = rows[0];
          var unitTable = [
            ['fighter',rows.fighter,'0'],
            ['improved_fighter',rows.improved_fighter,'0'],
            ['light_cruiser',rows.light_cruiser,'0'],
            ['bomb_cruiser',rows.bomb_cruiser,'0'],
            ['line_cruiser',rows.line_cruiser,'0'],
            ['battleship',rows.battleship,'0'],
            ['line_battleship',rows.line_battleship,'0'],
            ['fleet_destructor',rows.fleet_destructor,'0'],
            ['titan_destructor',rows.titan_destructor,'0'],
            ['titan_1',rows.titan_1,'0'],
            ['titan_2',rows.titan_2,'0'],
            ['titan_3',rows.titan_3,'0'],
            ['titan_4',rows.titan_4,'0'],
            ['spy_probe',rows.spy_probe,'0'],
            ['small_transporter',rows.small_transporter,'0'],
            ['big_transporter',rows.big_transporter,'0'],
            ['planet_extractor',rows.planet_extractor,'0'],
            ['nebulae_extractor',rows.nebulae_extractor,'0'],
            ['black_hole_extractor',rows.black_hole_extractor,'0'],
            ['asteroid_field_extractor',rows.asteroid_field_extractor,'0'],
            ['colonization_ship',rows.colonization_ship,'0'],
            ['recycling_ship',rows.recycling_ship,'0'],
            ['hunter_carrier',rows.hunter_carrier,'0'],
            ['shield_destructor',rows.shield_destructor,'0'],
            ['boarding_vessel',rows.boarding_vessel,'0']
          ]

          callback(null,unitTable);
        }
      });
    }

    exports.getFightingShips = getFightingShips;
    exports.getTurrets = getTurrets;
    exports.getCivilians = getCivilians;
    exports.getLogistics = getLogistics;
    exports.updateControlCentersInConstruction = updateControlCentersInConstruction;
    exports.updateUnits = updateUnits;
    exports.getShips = getShips;
    exports.maxUnits = maxUnits;
    exports.buildUnits = buildUnits;
    exports.updateUnitsInConstruction = updateUnitsInConstruction;
    exports.calculateExistingUnitsOnPlanet = calculateExistingUnitsOnPlanet;
