const async = require("async");
const db = require("./dbConnect.js");
const func = require("./functions.js");

function updateTechnologies(values,callback){

  isAlreadyBuildingTech(values,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
      callback(null,'ERROR_IN_FUNCTION_RESSOURCES')
    } else {
      if(data == 'TRUE'){
        //know if there is enough ressources on the planet.
        func.isEnoughRessources(values[0],values[1],values[2],values[3],values[4],function(err,data){
          if (err) {
            console.log("ERROR : ",err);
            callback(null,'NOT_ENOUGH_RESSOURCES')
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

                var techsLevel = func.getFinalLevel(values[4],values[5]);

                var queryString = 'INSERT INTO `technologies_upgrades` ' +
                '(`user_id`, `solar_system`, `intra_system`, `technology`, `level`, `start_timestamp`, `end_timestamp`) ' +
                'VALUES (?,?,?,?,?,?,?)';

                var metalConsumption = data[3];
                var crystalConsumption = data[4];

                getLabAndERCLevels(values[0],
                  function(err,data){
                    if (err) {
                      console.log("ERROR : ",err);
                    } else {

                      var endTimestampValues = func.endTimestamp(metalConsumption,crystalConsumption,1,data);

                      db.connection.query(queryString, [
                        values[0],
                        values[1],
                        values[2],
                        values[3],
                        techsLevel,
                        func.getTimestamp(),
                        endTimestampValues
                      ],function(err, rows) {
                        if (err) {
                          throw err
                        }else{
                          callback(null,'TECH_LEVEL_SUCCESSFULLY_UPDATED');
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

  function isAlreadyBuildingTech(values,callback){

    var queryString = 'SELECT * FROM `technologies_upgrades` ' +
    'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ? ' +
    'AND `technology` = ? AND `level` = ?';

    // console.log(queryString);
    db.connection.query(queryString, [
      values[0],
      values[1],
      values[2],
      values[3],
      func.getFinalLevel(values[4],values[5])
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var isEmpty=true;
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

  function getLabAndERCLevels(user_id,callback){
    //techOrBuilding : 0 is building, 1 is Tech
    // get formulas values from ogame https://ogame.fandom.com/wiki/Formulas
    // Math.floor(Date.now() / 1000) --> Calculates currentTimestamp
    var queryString = 'SELECT SUM(upl.`laboratory`) AS laboratory, uplhp.`experimental_research_center` ' +
    'FROM `user_planetary_levels` upl ' +
    'JOIN `user_planetary_levels` uplhp ON upl.`user_id` = upl.`user_id` ' +
    'JOIN `telluric` thp ON thp.`owner` = uplhp.`user_id` ' +
    'AND uplhp.`solar_system` = thp.`solar_system` ' +
    'AND uplhp.`intra_system` = thp.`intra_system` ' +
    'WHERE upl.`user_id` = ? AND thp.`home_planet` = 1';

    db.connection.query(queryString, [
      user_id
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        callback(null,rows);
      }
    });
  }

  function updateTechsInConstruction(){

    var queryString = 'SELECT * FROM `technologies_upgrades` WHERE `end_timestamp` <= ?';

    db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
      if (err) {
        throw err
      }else{
        var techsUpgradesValues = rows;

        var queryString = 'DELETE FROM `technologies_upgrades` WHERE `end_timestamp` <= ?';

        db.connection.query(queryString, [func.getTimestamp()],function(err, rows) {
          if (err) {
            throw err
          }else{
            for (i = 0; i < techsUpgradesValues.length; i++) {
              addTechLevel(techsUpgradesValues[i]);
            }
          }
        });
      }
    });
  }

  async function addTechLevel(values,callback){
    var queryString = 'UPDATE `user_technologies_level` '

    switch(values.technology) {
      case 'metal':
      queryString = queryString + 'SET `metal` = ? '
      break;
      case 'crystal':
      queryString = queryString + 'SET `crystal` = ? '
      break;
      case 'gas':
      queryString = queryString + 'SET `gas` = ? '
      break;
      case 'extraction':
      queryString = queryString + 'SET `extraction` = ? '
      break;
      case 'energy':
      queryString = queryString + 'SET `energy` = ? '
      break;
      case 'fusion':
      queryString = queryString + 'SET `fusion` = ? '
      break;
      case 'chemical_engine':
      queryString = queryString + 'SET `chemical_engine` = ? '
      break;
      case 'ion_engine':
      queryString = queryString + 'SET `ion_engine` = ? '
      break;
      case 'microwarp_drive':
      queryString = queryString + 'SET `microwarp_drive` = ? '
      break;
      case 'quantum_drive':
      queryString = queryString + 'SET `quantum_drive` = ? '
      break;
      case 'benalite_engine':
      queryString = queryString + 'SET `benalite_engine` = ? '
      break;
      case 'astrophysics':
      queryString = queryString + 'SET `astrophysics` = ? '
      break;
      case 'intergalactic_research_network':
      queryString = queryString + 'SET `intergalactic_research_network` = ? '
      break;
      case 'ballistic':
      queryString = queryString + 'SET `ballistic` = ? '
      break;
      case 'computer':
      queryString = queryString + 'SET `computer` = ? '
      break;
      case 'design':
      queryString = queryString + 'SET `design` = ? '
      break;
      case 'spy':
      queryString = queryString + 'SET `spy` = ? '
      break;
      case 'weapon':
      queryString = queryString + 'SET `weapon` = ? '
      break;
      case 'laser':
      queryString = queryString + 'SET `laser` = ? '
      break;
      case 'photon':
      queryString = queryString + 'SET `photon` = ? '
      break;
      case 'ion':
      queryString = queryString + 'SET `ion` = ? '
      break;
      case 'plasma':
      queryString = queryString + 'SET `plasma` = ? '
      break;
      case 'neutron':
      queryString = queryString + 'SET `neutron` = ? '
      break;
      case 'electromagnetic':
      queryString = queryString + 'SET `electromagnetic` = ? '
      break;
      case 'antimatter':
      queryString = queryString + 'SET `antimatter` = ? '
      break;
      case 'armor':
      queryString = queryString + 'SET `armor` = ? '
      break;
      case 'shield':
      queryString = queryString + 'SET `shield` = ? '
      break;
    }

    queryString = queryString + 'WHERE `user_id` = ?';

    var techLevel = func.getFinalLevel(values.level,values.end_timestamp)

    // console.log(queryString);

    db.connection.query(queryString, [
      techLevel,
      values.user_id
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        // callback(null,'TECHNOLOGY_LEVEL_SUCCESSFULLY_UPDATED');
      }
    });
  }

  async function getEconomicsTechnologiesLevels(values,callback){
    var queryString = 'SELECT `metal`,`crystal`,`gas`,`extraction`,`energy`,`fusion` ' +
    'FROM `user_technologies_level` WHERE `user_id` = ?';

    // console.log(queryString);

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('metal',rows[0].metal));
        returnValues.push(func.getConstructionRessource('crystal',rows[0].crystal));
        returnValues.push(func.getConstructionRessource('gas',rows[0].gas));
        returnValues.push(func.getConstructionRessource('extraction',rows[0].extraction));
        returnValues.push(func.getConstructionRessource('energy',rows[0].energy));
        returnValues.push(func.getConstructionRessource('fusion',rows[0].fusion));

        callback(null,returnValues);
      }
    });
  }

  async function getWeaponTechnologiesLevels(values,callback){
    var queryString = 'SELECT `weapon`,`laser`,`photon`,`ion`,`plasma`,`neutron`,' +
    '`electromagnetic`,`antimatter`,`armor`,`shield` ' +
    'FROM `user_technologies_level` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('weapon',rows[0].weapon));
        returnValues.push(func.getConstructionRessource('laser',rows[0].laser));
        returnValues.push(func.getConstructionRessource('photon',rows[0].photon));
        returnValues.push(func.getConstructionRessource('ion',rows[0].ion));
        returnValues.push(func.getConstructionRessource('plasma',rows[0].plasma));
        returnValues.push(func.getConstructionRessource('neutron',rows[0].neutron));
        returnValues.push(func.getConstructionRessource('electromagnetic',rows[0].electromagnetic));
        returnValues.push(func.getConstructionRessource('antimatter',rows[0].antimatter));
        returnValues.push(func.getConstructionRessource('armor',rows[0].armor));
        returnValues.push(func.getConstructionRessource('shield',rows[0].shield));

        callback(null,returnValues);
      }
    });
  }

  async function getPropulsionTechnologiesLevels(values,callback){
    var queryString = 'SELECT `chemical_engine`,`ion_engine`,`microwarp_drive`,`quantum_drive`,`benalite_engine` ' +
    'FROM `user_technologies_level` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('chemical_engine',rows[0].chemical_engine));
        returnValues.push(func.getConstructionRessource('ion_engine',rows[0].ion_engine));
        returnValues.push(func.getConstructionRessource('microwarp_drive',rows[0].microwarp_drive));
        returnValues.push(func.getConstructionRessource('quantum_drive',rows[0].quantum_drive));
        returnValues.push(func.getConstructionRessource('benalite_engine',rows[0].benalite_engine));

        callback(null,returnValues);
      }
    });
  }

  async function getPlayerTechnologiesLevels(values,callback){
    var queryString = 'SELECT `astrophysics`,`intergalactic_research_network`,' +
    '`ballistic`,`computer`,`design`,`spy` ' +
    'FROM `user_technologies_level` WHERE `user_id` = ?';

    db.connection.query(queryString, [
      values[0]
    ],function(err, rows) {
      if (err) {
        throw err
      }else{
        var returnValues = [];
        returnValues.push(func.getConstructionRessource('astrophysics',rows[0].astrophysics));
        returnValues.push(func.getConstructionRessource('intergalactic_research_network',rows[0].intergalactic_research_network));
        returnValues.push(func.getConstructionRessource('ballistic',rows[0].ballistic));
        returnValues.push(func.getConstructionRessource('computer',rows[0].computer));
        returnValues.push(func.getConstructionRessource('design',rows[0].design));
        returnValues.push(func.getConstructionRessource('spy',rows[0].spy));

        callback(null,returnValues);
      }
    });
  }

  exports.getPlayerTechnologiesLevels = getPlayerTechnologiesLevels;
  exports.getPropulsionTechnologiesLevels = getPropulsionTechnologiesLevels;
  exports.getEconomicsTechnologiesLevels = getEconomicsTechnologiesLevels;
  exports.getWeaponTechnologiesLevels = getWeaponTechnologiesLevels;
  exports.updateTechsInConstruction = updateTechsInConstruction;
  exports.updateTechnologies = updateTechnologies;
