const async = require("async");
const db = require("./dbConnect.js");

function addRessources(){
  var queryString = 'SELECT `user_id`,`solar_system`,`intra_system` FROM `user_ressources`';

  // console.log(queryString);

  db.connection.query(queryString,function(err, rows) {
    if (err) {
      throw err
    }else{
      var user_ids = rows;

      var i;
      for (i = 0; i < user_ids.length; i++) {
        calculateProduction(user_ids[i]);
      }

    }
  });

}

function calculateProduction(user_ids,callback){

  var queryString = 'SELECT ur.`metal`,ur.`crystal`,ur.`gas`,' +
  'upl.`metal_mine`,upl.`crystal_mine`,upl.`gas_mine`,upl.`metal_warehouse`,' +
  'upl.`crystal_warehouse`,upl.`gas_warehouse`,upl.`waste_factory`,utl.`metal` as tech_metal,' +
  'utl.`crystal` as tech_crystal, utl.`gas` as tech_gas,upl.`solar_mine`,upl.`fusion_reactor`,' +
  'utl.`energy` as tech_energy, utl.`fusion` as tech_fusion,ur.`energy` ' +
  'FROM `user_ressources` ur ' +
  'LEFT JOIN `user_planetary_levels` upl ON ur.user_id = upl.user_id ' +
  'AND ur.`solar_system` = upl.solar_system AND ur.`intra_system` = upl.intra_system ' +
  'LEFT JOIN `user_technologies_level` utl ON ur.user_id = utl.user_id ' +
  'WHERE ur.`user_id` = ? AND ur.`solar_system` = ? AND ur.`intra_system` = ?';

  // console.log(queryString);

  var current_userid = user_ids.user_id;
  var current_solar_system = user_ids.solar_system;
  var current_intra_system = user_ids.intra_system;

  db.connection.query(queryString, [
    current_userid,
    current_solar_system,
    current_intra_system
  ],function(err, rows) {
    if (err) {
      throw err
    }else{
      // console.log('rows is: ');
      // console.log(rows);

      // var j;
      // for (j = 0; j < rows.length; j++) {
      var queryString = 'UPDATE `user_ressources` ' +
      'SET `metal` = ?,' +
      '`crystal` = ?,' +
      '`gas` = ?, ' +
      '`energy` = ? ' +
      'WHERE `user_id` = ? AND solar_system = ? AND intra_system = ?';

      //formula to calculate ressource production or ressource overload is:
      // Un = U0*q^n
      //https://docs.google.com/spreadsheets/d/1SJ7BlFWEtPwfz5bbs2pFkzSMvwkURXrDR7mubMFMrgo/edit#gid=0

      var metal = calculateRessourceProduction(
                      3,
                      rows[0].metal,
                      rows[0].metal_warehouse,
                      rows[0].metal_mine,
                      rows[0].tech_metal,
                      rows[0].waste_factory
                    );

      var crystal = calculateRessourceProduction(
                      2,
                      rows[0].crystal,
                      rows[0].crystal_warehouse,
                      rows[0].crystal_mine,
                      rows[0].tech_crystal,
                      rows[0].waste_factory
                    );

      var gas = calculateRessourceProduction(
                      1,
                      rows[0].gas,
                      rows[0].gas_warehouse,
                      rows[0].gas_mine,
                      rows[0].tech_gas,
                      rows[0].waste_factory
                    );

      var energy = calculateEnergyProduction(
                    rows[0].energy,
                    rows[0].solar_mine,
                    rows[0].fusion_reactor,
                    rows[0].tech_energy,
                    rows[0].tech_fusion
                  );

      db.connection.query(queryString, [
        metal,
        crystal,
        gas,
        energy,
        current_userid,
        current_solar_system,
        current_intra_system
      ],function(err, rows) {
        if (err) {
          throw err
          console.log('RESSOURCES_INPUT_FAILED');
        }else{
          // console.log('RESSOURCES_SUCCESSFULLY_ADDED');
        }
      });
      // }

    }
  });
}

function getCurrentRessources(user_values,callback){
  var queryString = 'SELECT metal,crystal,gas,energy,benalite FROM `user_ressources` ' +
  'WHERE user_id = ? AND solar_system = ? AND intra_system = ?'
  db.connection.query(queryString, [
    user_values[0],
    user_values[1],
    user_values[2]
  ],function(err, rows) {
    if (err) {
      throw err
    }else{
      callback(null,rows);
    }
  });
}

function calculateRessourceProduction(ressource_base_input,previous_ressource,warehouse,mine,technology,waste_factory){

  var ressource;
  if(previous_ressource <= 10000*Math.pow(2,warehouse)){
    ressource = previous_ressource + (ressource_base_input*Math.pow(1.2,mine));
    if(technology != 0){
      ressource = ressource*(1 + ((technology*5)/100));
    }
    if(waste_factory != 0){
      ressource = ressource*(1 + ((waste_factory*10)/100));
    }
    return ressource;
  }else{
    return previous_ressource;
  }
}

function calculateEnergyProduction(energy,solar_mine,fusion_reactor,tech_energy,tech_fusion){

  var energyCalculator = 0;
  var solarMineEnergyOutput = 0;
  var fusionReactorEnergyOutput = 0;

  if(solar_mine != 0){
    solarMineEnergyOutput = 100 * Math.pow(1.2,solar_mine);
  }else{
    solarMineEnergyOutput = 0;
  }

  if(fusion_reactor != 0){
    fusionReactorEnergyOutput = 100 * Math.pow(1.2,fusion_reactor);
  }else{
    fusionReactorEnergyOutput = 0;
  }

  var energyCalculator = fusionReactorEnergyOutput + solarMineEnergyOutput;

  if(tech_energy != 0){
    energyCalculator = energy*((tech_energy*5)/100);
  }
  if(tech_fusion != 0){
    energyCalculator = energy*((tech_fusion*10)/100);
  }

  if(energyCalculator == energy ){
    return energy;
  }else{
    return energyCalculator;
  }
}

exports.addRessources = addRessources;
exports.getCurrentRessources = getCurrentRessources;
