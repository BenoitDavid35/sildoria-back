const async = require("async");
const db = require("./dbConnect.js");
const encrypt = require("./encrypt.js");
const worldGenerator = require("./createWorlds.js");
const techs = require("./technologies.js");
var formidable = require('formidable'); //nécessaire pour l'upload d'images
var fs = require("fs");//nécessaire pour l'upload d'images

async function logIn(login,pwd,callback){

  var queryString = 'SELECT ' +
  'u.Sila_ID as Sila_ID,u.Mail as Mail,u.id as id,u.Avatar as Avatar,u.password as password,u.role as role,' +
  't.mass as mass, t.temperature as temperature,' +
  'upl.solar_system as solar_system,upl.intra_system as intra_system FROM user u ' +
  'JOIN user_planetary_levels upl on u.id = upl.user_id ' +
  'JOIN telluric t on u.id = t.owner ' +
  'WHERE u.Sila_ID = ? AND u.password = ?';
  db.connection.query(queryString, [login,pwd], function(err, rows) {
    if (err) {
      console.log(err);
      callback(err,null)
    };
    // console.log(rows);
    callback(null,rows);
  });
  //res.end( JSON.stringify(rows) );
}

async function changePassword(parameters,callback){
  var queryString = 'UPDATE user ' +
  'SET password = ? WHERE id = ?';

  db.connection.query(queryString, [parameters[0],parameters[1]] ,function(err, rows) {
    if (err) {
      console.log('ERROR changing password');
      callback(null,'FALSE');
    }else{
      // console.log('DONE changing password');
      callback(null,'TRUE');
    }
  });
}

async function createAccount(account_parameters,callback){

  //  account_parameters[2], is never called while creating an account

  var queryString = 'SELECT * FROM user WHERE Name = ? AND Mail = ?';
  var queryStringInsert;
  var queryStringValues;
  var requestParametersInOrder = [];
  if(account_parameters[0] != null || account_parameters[0] != undefined){
    queryStringInsert = 'INSERT INTO user (Sila_ID,';
    queryStringValues = 'VALUES (?,';
    requestParametersInOrder[0] = account_parameters[0];
  }else{
    console.log('Sila_ID is missing');
    callback(null,'SILAID_MISSING');
  }

  if(account_parameters[1] != null || account_parameters[1] != undefined){
    queryStringInsert = queryStringInsert + 'Mail,';
    queryStringValues = queryStringValues + '?,';
    requestParametersInOrder[1] = account_parameters[1];
  }else{
    console.log('Mail is missing');
    callback(null,'MAIL_MISSING');
  }

  queryStringInsert = queryStringInsert + 'Avatar,';
  queryStringValues = queryStringValues + '?,';
  if(account_parameters[3] != null || account_parameters[3] != undefined){
    requestParametersInOrder[2] = account_parameters[3];
  }else{
    requestParametersInOrder[2] = 'default.jpg';
    console.log('No Avatar given for user ' + account_parameters[2] + ', added default one');
  }

  if(account_parameters[2] != null || account_parameters[2] != undefined){
    queryStringInsert = queryStringInsert + 'password,';
    queryStringValues = queryStringValues + '?,';
    requestParametersInOrder[3] = account_parameters[2];
  }else{
    console.log('password is missing');
    callback(null,'PASSWORD_MISSING');
  }

  queryStringInsert = queryStringInsert + 'validated) ';
  queryStringValues = queryStringValues + '?)';
  requestParametersInOrder[4] = '0';

  db.connection.query(queryString, [account_parameters[0],
    account_parameters[3]] ,function(err, rows) {
      console.log('Check si le compte existe déjà');
      if (rows === undefined || rows.length == 0) {
        var queryString = queryStringInsert + queryStringValues;
        db.connection.query(queryString, requestParametersInOrder,function(err, rows) {
          if (err) {
            console.log('ERROR creating account');
            console.log(err);
            callback(null,'ERROR creating account');
          }else{
            var uniqueIdentifier = account_parameters[2] + ',' + account_parameters[0] + ',' + account_parameters[1];
            uniqueIdentifier = encrypt.generateHash(uniqueIdentifier).substr(1,16);
            console.log('UID is: ' + uniqueIdentifier);

            var queryString = 'INSERT INTO validate (token, account_mail) ' +
            'VALUES (?, ?)';

            db.connection.query(queryString, [uniqueIdentifier,account_parameters[1]] ,function(err, rows) {
              if (err) {
                console.log('ERROR setting up unique link in DB');
                console.log(err);
                callback(null,'ERROR_UNIQUE_LINK');
              }else{
                console.log('Unique link got successfully added in database');
              }
            });
            console.log('test UID ' + uniqueIdentifier);
            // var mailOptions = {
            //   from: 'trocglisse@gmail.com',
            //   to: account_parameters[3],
            //   subject: 'Inscription à trocGlisse',
            //   //text: 'That was easy!'
            //   html: 'Bonjour ' + account_parameters[0] + ' ' + account_parameters[1] + ' !<br>' +
            //   'Merci pour ton inscription à TrocGlisse, nous espérons que tu y trouvera ton bonheur !<br>' +
            //   'Clique sur le lien suivant afin de confirmer ton compte: https://localhost:7777/mail_confirmation/' +
            //   uniqueIdentifier + ' <br>' +
            //   'Ajouter ICI footer TrocGlisse'
            // };

            // mail.sendAccountCreationMail(mailOptions,function(err,data)
            // {
            //   console.log('err: ' + err);
            //   console.log('data: ' + data);
            //   if(err != null){
            //     console.log('ERROR sending mail');
            //     callback(null,'ERROR_SENDING_MAIL');
            //   }
            //   if(data == 'TRUE') {
            //     console.log('DONE creating account');
            //     callback(null,data);
            //   }
            // });

            var queryString = 'SELECT * FROM user WHERE Sila_ID = ? AND Mail = ? AND password = ?';

            db.connection.query(queryString, [account_parameters[0],account_parameters[1],account_parameters[2]] ,function(err, rows) {
              if (err) {
                console.log('ERROR retrieving user informations');
                console.log(err);
                callback(null,'ERROR_USER_INFORMATION_RETRIEVAL');
              }else{
                var user_informations = rows[0];
                // console.log('user information:');
                // console.log(user_informations);

                //    ---- Revoir cette partie, risque de destruction de planète déjà utilisée par un joueur ----
                //    ---- Risque également qu'il n'y aies aps de planète tellurique ----

                var queryString = 'SELECT * FROM telluric WHERE solar_system = ? ';
                var randomSolarSystem = worldGenerator.getRandomArbitrary(0,500).toFixed();
                db.connection.query(queryString, randomSolarSystem ,function(err, rows) {
                  if (err) {
                    console.log('ERROR in retrieving planet information for home planet generation');
                    callback(null,'ERROR_HOME_PLANET_GENERATION');
                  }else{
                    var length = rows.length;
                    var randomPositionInSolar = worldGenerator.getRandomArbitrary(0,length).toFixed();
                    // console.log('rows is:')
                    // console.log(rows);
                    var row = rows[randomPositionInSolar];
                    // console.log('row is:')
                    // console.log(row);

                    var queryString = 'UPDATE telluric ' +
                    'SET `owner` = ?, ' +
                    '`mass` = ?, ' +
                    '`temperature` = ?, '+
                    '`cases` = ?, ' +
                    '`home_planet` = ? '+
                    'WHERE `solar_system` = ? ' +
                    'AND `intra_system` = ?';

                    console.log(row);
                    var solar_system = row.solar_system;
                    var intra_system = row.intra_system;

                    db.connection.query(queryString, [
                      user_informations.id,
                      'medium',
                      '10',
                      '250',
                      '1',
                      solar_system,
                      intra_system] ,function(err, rows) {
                        if (err) {
                          console.log('ERROR Creating new user home planet');
                          console.log(err);
                          callback(null,'ERROR_HOME_PLANET_CREATION');
                        }else{
                          console.log('Home Planet creation successfull');
                          generateNewOwnedPlanet(user_informations.id,solar_system,intra_system);
                          generateNewTechLine(user_informations.id,solar_system,intra_system);
                          generateNewControlCenterLine(user_informations.id,solar_system,intra_system);
                          generateNewUnitEntityLine(user_informations.id,solar_system,intra_system);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }else{
          console.log('Account already exist');
          callback(null,'ALREADY_EXIST');
        }
      });
    }

    function generateNewOwnedPlanet(user_id){
      var queryString = 'INSERT INTO user_planetary_levels ' +
      '(`user_id`,'+
      '`metal_mine`,'+
      '`crystal_mine`,'+
      '`gas_mine`,'+
      '`solar_mine`,'+
      '`fusion_reactor`,'+
      '`metal_warehouse`,'+
      '`crystal_warehouse`,'+
      '`gas_warehouse`,'+
      '`waste_factory`,'+
      '`planet_engineering_complex`,'+
      '`robotic_center`,'+
      '`spaceport`,'+
      '`experimental_research_center`,'+
      '`laboratory`,'+
      '`rare_ressource_research_center`,'+
      '`military_factory`,'+
      '`supercalculator`,'+
      '`alliance_center`,'+
      '`design_center`,'+
      '`missile_silo`) '+
      'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';

      db.connection.query(queryString, [
        user_id,
        '1',
        '1',
        '1',
        '1',
        '0',
        '1',
        '1',
        '1',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0'] ,function(err, rows) {
          if (err) {
            console.log('ERROR while generating technologies');
            console.log(err);
            // callback(null,'ERROR_PLANET_BUILDINGS_GENERATION');
          }else{
            console.log('Planet first technologies successfully added');
          }
        });
      }

      async function generateNewTechLine(user_id,solar_system,intra_system){
        var queryString = 'INSERT INTO `user_technologies_level` ' +
        '(`user_id`, `metal`, ' +
        '`crystal`, `gas`, `extraction`, `energy`, `fusion`, ' +
        '`chemical_engine`, `ion_engine`, `microwarp_drive`, ' +
        '`quantum_drive`, `benalite_engine`, `astrophysics`, ' +
        '`intergalactic_research_network`, `ballistic`, ' +
        '`computer`, `design`, `spy`, `weapon`, `laser`, ' +
        '`photon`, `ion`, `plasma`, `neutron`, `electromagnetic`, ' +
        '`antimatter`, `armor`, `shield`) ' +
        'VALUES (?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0) ';

        db.connection.query(queryString, [
          user_id,
          solar_system,
          intra_system] ,function(err, rows) {
            if (err) {
              console.log('ERROR Creating new user Tech row');
              console.log(err);
              callback(null,'ERROR_TECHS_CREATION');
            }else{
              console.log('Tech Row creation successfull');
            }
          });
        }

        async function generateNewControlCenterLine(user_id,solar_system,intra_system,callback){
          var queryString = 'INSERT INTO `user_units_levels`(`user_id`, `solar_system`,' +
          '`intra_system`, `laser_turret`, `photon_turret`, `ion_turret`, `plasma_turret`,' +
          '`gauss_turret`, `neutron_turret`, `antimatter_turret`, `small_shield`,' +
          '`big_shield`, `ballistic_missile`, `spatial_mine`, `defensive_satellite`,' +
          '`heavy_defensive_satellite`, `fighter`, `improved_fighter`, `light_cruiser`,' +
          '`bomb_cruiser`, `line_cruiser`, `battleship`, `line_battleship`,' +
          '`fleet_destructor`, `titan_destructor`, `titan_1`, `titan_2`, `titan_3`,' +
          '`titan_4`, `spy_probe`, `small_transporter`, `big_transporter`, `planet_extractor`,' +
          '`nebulae_extractor`, `black_hole_extractor`, `asteroid_field_extractor`,' +
          '`colonization_ship`, `recycling_ship`, `solar_satellite`, `hunter_carrier`,' +
          '`shield_destructor`, `boarding_vessel`, `interplanetary_missile`) ' +
          'VALUES (?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)';

          db.connection.query(queryString, [
            user_id,
            solar_system,
            intra_system] ,function(err, rows) {
              if (err) {
                console.log('ERROR Creating new user Unit Control Center row');
                console.log(err);
                callback(null,'ERROR_CONTROL_CENTERS_CREATION');
              }else{
                console.log('Tech Row creation successfull');
              }
            });
          }

          async function generateNewUnitEntityLine(user_id,solar_system,intra_system,callback){
            var queryString = 'INSERT INTO `user_units_entities`(`user_id`, `solar_system`,' +
            '`intra_system`, `laser_turret`, `photon_turret`, `ion_turret`, `plasma_turret`,' +
            '`gauss_turret`, `neutron_turret`, `antimatter_turret`, `small_shield`,' +
            '`big_shield`, `ballistic_missile`, `spatial_mine`, `defensive_satellite`,' +
            '`heavy_defensive_satellite`, `fighter`, `improved_fighter`, `light_cruiser`,' +
            '`bomb_cruiser`, `line_cruiser`, `battleship`, `line_battleship`,' +
            '`fleet_destructor`, `titan_destructor`, `titan_1`, `titan_2`, `titan_3`,' +
            '`titan_4`, `spy_probe`, `small_transporter`, `big_transporter`, `planet_extractor`,' +
            '`nebulae_extractor`, `black_hole_extractor`, `asteroid_field_extractor`,' +
            '`colonization_ship`, `recycling_ship`, `solar_satellite`, `hunter_carrier`,' +
            '`shield_destructor`, `boarding_vessel`, `interplanetary_missile`) ' +
            'VALUES (?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)';

            db.connection.query(queryString, [
              user_id,
              solar_system,
              intra_system] ,function(err, rows) {
                if (err) {
                  console.log('ERROR Creating new Unit Entities row');
                  console.log(err);
                  callback(null,'ERROR_ENTITIES_CREATION');
                }else{
                  console.log('Tech Row creation successfull');
                }
              });
            }

        async function createServerAndMap(data,callback){
          worldGenerator.createDataBase();
          //generate solar system
          var serverTable = new Array();
          for (let i = 0; i < worldGenerator.getRandomArbitrary(500,1000).toFixed(); i++) {
            // serverTable[i] = i;
            serverTable[i] = new Array();
            var k = worldGenerator.getRandomArbitrary(10,19).toFixed();
            for (let j = 0; j <= k; j++) {
              slotEnvironment = worldGenerator.getRandomArbitrary(0,1);
              if(slotEnvironment <= 0.3){
                //generate telluric world
                serverTable[i][j] = '"telluric"';
                worldGenerator.createTelluricWorld(i,j);
              }

              if(slotEnvironment <= 0.7){
                if(slotEnvironment > 0.3){
                  //generate gas world
                  serverTable[i][j] = '"gasWorld"';
                  worldGenerator.createGasWorld(i,j);
                }
              }

              if(slotEnvironment <= 0.85){
                if(slotEnvironment > 0.7){
                  //generate asteroid belt
                  serverTable[i][j] = '"asteroidBelt"';
                  worldGenerator.createAsteroidbeltWorld(i,j);
                }
              }

              if(slotEnvironment <= 0.925){
                if(slotEnvironment > 0.85){
                  //generate black hole
                  serverTable[i][j] = '"blackHole"';
                  worldGenerator.createBlackholeWorld(i,j);
                }
              }

              if(slotEnvironment <= 1){
                if(slotEnvironment > 0.925){
                  //generate nebulae
                  serverTable[i][j] = '"nebulae"';
                  worldGenerator.createNebulaeWorld(i,j);
                }
              }
              // console.log(serverTable);
              if(k == j){
                if(k < 20){
                  for (let j = k; j < 20; j++) {
                    serverTable[i][j] = '""';
                    // console.log(j);
                  }
                }
              }
            };
          };

          // cDB = worldGenerator.createDataBase(serverTable);
          callback(null,"OK");
        }

        function showMap(map_coordinates,callback) {

          var queryString = 'SELECT * FROM asteroid_belt WHERE solar_system = ? ' +
          'ORDER BY intra_system';
          db.connection.query(queryString, map_coordinates ,function(err, rows) {
            if (err) {
              console.log(err);
            }else{
              saveResultAB(rows);
            }
          });

          var queryString = 'SELECT * FROM black_hole WHERE solar_system = ? ' +
          'ORDER BY intra_system';
          db.connection.query(queryString, map_coordinates ,function(err, rows) {
            if (err) {
              console.log(err);
            }else{
              saveResultBH(rows);
            }
          });

          var queryString = 'SELECT * FROM gas WHERE solar_system = ? ' +
          'ORDER BY intra_system';
          db.connection.query(queryString, map_coordinates ,function(err, rows) {
            if (err) {
              console.log(err);
            }else{
              saveResultG(rows);
            }
          });

          var queryString = 'SELECT * FROM nebulae WHERE solar_system = ? ' +
          'ORDER BY intra_system';
          db.connection.query(queryString, map_coordinates ,function(err, rows) {
            if (err) {
              console.log(err);
            }else{
              saveResultN(rows);
            }
          });

          var queryString = 'SELECT * FROM telluric WHERE solar_system = ? ' +
          'ORDER BY intra_system';
          db.connection.query(queryString, map_coordinates ,function(err, rows) {
            if (err) {
              console.log(err);
            }else{
              saveResultT(rows);
              callback(null,analyzeResult());
            }
          });

        }

        var resultab;
        function saveResultAB(rows){
          this.resultab = rows;
        }

        var resultbh;
        function saveResultBH(rows){
          this.resultbh = rows;
        }

        var resultg;
        function saveResultG(rows){
          this.resultg = rows;
        }

        var resultn;
        function saveResultN(rows){
          this.resultn = rows;
        }

        var resultt;
        function saveResultT(rows){
          this.resultt = rows;
        }

        function analyzeResult(){

          valueArray = this.resultab;
          valueArray = valueArray.concat(this.resultbh);
          valueArray = valueArray.concat(this.resultg);
          valueArray = valueArray.concat(this.resultn);
          valueArray = valueArray.concat(this.resultt);

          valueArray.sort(function(a, b) {
            return parseFloat(a.intra_system) - parseFloat(b.intra_system);
          });

          return valueArray;
        }

        async function upload(req, res, next){
          // console.log('uploading picture');
          var form = new formidable.IncomingForm();
          //Formidable uploads to operating systems tmp dir by default
          form.uploadDir = "./userpictures";       //set upload directory
          form.keepExtensions = true;     //keep file extension

          form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});

            //Formidable changes the name of the uploaded file
            //Rename the file to its original name
            fs.rename(files.file.path, './userpictures/' + files.file.name, function(err) {
              if (err)
              throw err;
            });
            res.end();
          });
        }

        async function planetInformations(nestedInformations){
          /*nestedInformations array is like userID,planetSystem,planetIntraLocation*/
        }

        async function loadUserPlanets(nestedInformations, callback){
          var queryString = 'SELECT * FROM telluric WHERE owner = ?';
          db.connection.query(queryString, nestedInformations[0] ,function(err, rows) {
            if (err) {
              console.log(err);
              callback(null,'ERROR_LOADING_PLANETS');
            }else{
              // console.log(rows);
              callback(null,rows);
            }
          });
        }

        async function setNewProfilePic(picture_change,callback){
          var queryString = 'UPDATE user SET Avatar = ? WHERE id = ?';

          db.connection.query(queryString, [
            picture_change[0],
            picture_change[1]
          ],function(err, rows) {
            if (err) {
              throw err
            }else{
              callback(null,'TRUE');
            }
          });
        }

        async function getProductionBuildingsLevels(values,callback){
          var queryString = 'SELECT `metal_mine`,`crystal_mine`,`gas_mine`,`solar_mine`,' +
          '`fusion_reactor`,`metal_warehouse`,`crystal_warehouse`,`gas_warehouse`,`waste_factory` ' +
          'FROM `user_planetary_levels` WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

          db.connection.query(queryString, [
            values[0],
            values[1],
            values[2]
          ],function(err, rows) {
            if (err) {
              throw err
            }else{
              var returnValues = [];
              returnValues.push(getConstructionRessource('metal_mine',rows[0].metal_mine));
              returnValues.push(getConstructionRessource('crystal_mine',rows[0].crystal_mine))
              returnValues.push(getConstructionRessource('gas_mine',rows[0].gas_mine))
              returnValues.push(getConstructionRessource('solar_mine',rows[0].solar_mine))
              returnValues.push(getConstructionRessource('fusion_reactor',rows[0].fusion_reactor))
              returnValues.push(getConstructionRessource('metal_warehouse',rows[0].metal_warehouse))
              returnValues.push(getConstructionRessource('crystal_warehouse',rows[0].crystal_warehouse))
              returnValues.push(getConstructionRessource('gas_warehouse',rows[0].gas_warehouse))
              returnValues.push(getConstructionRessource('waste_factory',rows[0].waste_factory))

              callback(null,returnValues);
            }
          });
        }

        async function getIndustryBuildingsLevels(values,callback){
          var queryString = 'SELECT `planet_engineering_complex`,`robotic_center`,' +
          '`spaceport`,`experimental_research_center`,`laboratory`,`rare_ressource_research_center`,' +
          '`military_factory`,`supercalculator`,`alliance_center`,`design_center`,`missile_silo` ' +
          'FROM `user_planetary_levels` WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

          db.connection.query(queryString, [
            values[0],
            values[1],
            values[2]
          ],function(err, rows) {
            if (err) {
              throw err
            }else{
              var returnValues = [];
              returnValues.push(getConstructionRessource('planet_engineering_complex',rows[0].planet_engineering_complex));
              returnValues.push(getConstructionRessource('robotic_center',rows[0].robotic_center))
              returnValues.push(getConstructionRessource('spaceport',rows[0].spaceport))
              returnValues.push(getConstructionRessource('experimental_research_center',rows[0].experimental_research_center))
              returnValues.push(getConstructionRessource('laboratory',rows[0].laboratory))
              returnValues.push(getConstructionRessource('rare_ressource_research_center',rows[0].rare_ressource_research_center))
              returnValues.push(getConstructionRessource('military_factory',rows[0].military_factory))
              returnValues.push(getConstructionRessource('supercalculator',rows[0].supercalculator))
              returnValues.push(getConstructionRessource('alliance_center',rows[0].alliance_center))
              returnValues.push(getConstructionRessource('design_center',rows[0].design_center))
              returnValues.push(getConstructionRessource('missile_silo',rows[0].missile_silo))

              callback(null,returnValues);
            }
          });
        }

        function updateBuilding(values,callback){

          isAlreadyBuildingBuilding(values,function(err, data) {
            if (err) {
              throw err
            }else{
              if(data == 'TRUE'){
                //know if there is enough ressources on the planet.
                isEnoughRessources(values[0],values[1],values[2],values[3],values[4],function(err,data){
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

                        var buildingLevel = getFinalLevel(values[4],values[5]);

                        var queryString = 'INSERT INTO `building_upgrades` ' +
                        '(`user_id`, `solar_system`, `intra_system`, `building`, `level`,`start_timestamp`, `end_timestamp`) ' +
                        'VALUES (?,?,?,?,?,?,?)';

                        var metalConsumption = data[3];
                        var crystalConsumption = data[4];

                        getRoboticAndIXSLevels(values[0],values[1],values[2],
                          function(err,data){
                            if (err) {
                              console.log("ERROR : ",err);
                            } else {

                              var endTimestampValues = endTimestamp(metalConsumption,crystalConsumption,0,data)

                              db.connection.query(queryString, [
                                values[0],
                                values[1],
                                values[2],
                                values[3],
                                buildingLevel,
                                getTimestamp(),
                                endTimestampValues
                              ],function(err, rows) {
                                if (err) {
                                  throw err
                                }else{
                                  callback(null,'BUILDING_LEVEL_SUCCESSFULLY_UPDATED');
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

          function getRoboticAndIXSLevels(user_id,solar_system,intra_system,callback){
            //techOrBuilding : 0 is building, 1 is Tech
            // get formulas values from ogame https://ogame.fandom.com/wiki/Formulas
            // Math.floor(Date.now() / 1000) --> Calculates currentTimestamp
            var queryString = 'SELECT upl.`robotic_center`, uplhp.`supercalculator` ' +
            'FROM `user_planetary_levels` upl ' +
            'JOIN `user_planetary_levels` uplhp ON upl.`user_id` = upl.`user_id` ' +
            'JOIN `telluric` thp ON thp.`owner` = uplhp.`user_id` ' +
            'AND uplhp.`solar_system` = thp.`solar_system` ' +
            'AND uplhp.`intra_system` = thp.`intra_system` ' +
            'WHERE upl.`user_id` = ? AND upl.`solar_system` = ? ' +
            'AND upl.`intra_system` = ? AND thp.`home_planet` = 1';

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

          function isEnoughRessources(clientID,solar_system,intra_position,item,currentLevel,callback){
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
                var constructionsRessource = getConstructionRessource(item,currentLevel);

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

          function getConstructionRessource(item,currentLevel){
            var metal;
            var crystal;
            var gas;
            switch(item) {
              case 'metal_mine':
              metal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(25,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(15,1.5,currentLevel);
              break;
              case 'crystal_mine':
              metal = calculateUpgradeRessourceConsumption(75,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(35,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(25,1.5,currentLevel);
              break;
              case 'gas_mine':
              metal = calculateUpgradeRessourceConsumption(100,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(30,1.5,currentLevel);
              break;
              case 'solar_mine':
              metal = calculateUpgradeRessourceConsumption(75,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(35,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(20,1.5,currentLevel);
              break;
              case 'fusion_reactor':
              metal = calculateUpgradeRessourceConsumption(125,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(55,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(40,1.5,currentLevel);
              break;
              case 'metal_warehouse':
              metal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(25,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(10,1.5,currentLevel);
              break;
              case 'crystal_warehouse':
              metal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(25,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(10,1.5,currentLevel);
              break;
              case 'gas_warehouse':
              metal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(25,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(10,1.5,currentLevel);
              break;
              case 'waste_factory':
              metal = calculateUpgradeRessourceConsumption(750000,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(600000,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(450000,1.5,currentLevel);
              break;
              case 'planet_engineering_complex':
              metal = calculateUpgradeRessourceConsumption(2000000,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1500000,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000000,1.5,currentLevel);
              break;
              case 'robotic_center':
              metal = calculateUpgradeRessourceConsumption(50,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(30,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(15,4,currentLevel);
              break;
              case 'spaceport':
              metal = calculateUpgradeRessourceConsumption(100,2.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(60,2.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(30,2.5,currentLevel);
              break;
              case 'laboratory':
              metal = calculateUpgradeRessourceConsumption(50,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(30,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(15,3,currentLevel);
              break;
              case 'experimental_research_center':
              metal = calculateUpgradeRessourceConsumption(500000,10,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(250000,10,currentLevel);
              gas = calculateUpgradeRessourceConsumption(150000,10,currentLevel);
              break;
              case 'rare_ressource_research_center':
              metal = calculateUpgradeRessourceConsumption(500000,20,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(250000,20,currentLevel);
              gas = calculateUpgradeRessourceConsumption(150000,20,currentLevel);
              break;
              case 'military_factory':
              metal = calculateUpgradeRessourceConsumption(50,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(25,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(15,3,currentLevel);
              break;
              case 'supercalculator':
              metal = calculateUpgradeRessourceConsumption(500000,10,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(250000,10,currentLevel);
              gas = calculateUpgradeRessourceConsumption(150000,10,currentLevel);
              break;
              case 'alliance_center':
              metal = calculateUpgradeRessourceConsumption(100,2.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(60,2.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(30,2.5,currentLevel);
              break;
              case 'design_center':
              metal = calculateUpgradeRessourceConsumption(100,2.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(60,2.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(30,2.5,currentLevel);
              break;
              case 'missile_silo':
              metal = calculateUpgradeRessourceConsumption(50,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(30,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(15,4,currentLevel);
              break;
              case 'metal':
              metal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              break;
              case 'crystal':
              metal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              break;
              case 'gas':
              metal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              break;
              case 'extraction':
              metal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              break;
              case 'energy':
              metal = calculateUpgradeRessourceConsumption(250,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(250,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(250,2,currentLevel);
              break;
              case 'fusion':
              metal = calculateUpgradeRessourceConsumption(1500,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1500,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1500,2,currentLevel);
              break;
              case 'chemical_engine':
              metal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              break;
              case 'ion_engine':
              metal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              break;
              case 'microwarp_drive':
              metal = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(5000,2,currentLevel);
              break;
              case 'quantum_drive':
              metal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(4000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(10000,2,currentLevel);
              break;
              case 'benalite_engine':
              metal = calculateUpgradeRessourceConsumption(10000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(20000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(50000,2,currentLevel);
              break;
              case 'astrophysics':
              metal = calculateUpgradeRessourceConsumption(1500,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1500,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1500,4,currentLevel);
              break;
              case 'intergalactic_research_network':
              metal = calculateUpgradeRessourceConsumption(500,6,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,6,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,6,currentLevel);
              break;
              case 'ballistic':
              metal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              break;
              case 'computer':
              metal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              break;
              case 'design':
              metal = calculateUpgradeRessourceConsumption(100000,10,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(200000,10,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100000,10,currentLevel);
              break;
              case 'spy':
              metal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(750,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              break;
              case 'weapon':
              metal = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              break;
              case 'laser':
              metal = calculateUpgradeRessourceConsumption(400,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(400,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              break;
              case 'photon':
              metal = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(300,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              break;
              case 'ion':
              metal = calculateUpgradeRessourceConsumption(300,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(800,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(300,4,currentLevel);
              break;
              case 'plasma':
              metal = calculateUpgradeRessourceConsumption(400,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(800,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(600,4,currentLevel);
              break;
              case 'neutron':
              metal = calculateUpgradeRessourceConsumption(500,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(750,4,currentLevel);
              break;
              case 'electromagnetic':
              metal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,4,currentLevel);
              break;
              case 'antimatter':
              metal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              break;
              case 'armor':
              metal = calculateUpgradeRessourceConsumption(2000,4,currentLevel);
              crystal = 0;
              gas = 0;
              break;
              case 'shield':
              metal = calculateUpgradeRessourceConsumption(500,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,4,currentLevel);
              gas = 0;
              break;
              case 'laser_turret':
              metal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(50,2,currentLevel);
              break;
              case 'photon_turret':
              metal = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              break;
              case 'ion_turret':
              metal = calculateUpgradeRessourceConsumption(800,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              break;
              case 'plasma_turret':
              metal = calculateUpgradeRessourceConsumption(1200,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(800,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(400,3,currentLevel);
              break;
              case 'gauss_turret':
              metal = calculateUpgradeRessourceConsumption(2400,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1600,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(800,3,currentLevel);
              break;
              case 'neutron_turret':
              metal = calculateUpgradeRessourceConsumption(4800,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(3200,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1600,4,currentLevel);
              break;
              case 'antimatter_turret':
              metal = calculateUpgradeRessourceConsumption(9600,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(6400,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(3200,4,currentLevel);
              break;
              case 'small_shield':
              metal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              break;
              case 'big_shield':
              metal = calculateUpgradeRessourceConsumption(2000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(4000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2000,4,currentLevel);
              break;
              case 'ballistic_missile':
              metal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(4000,2,currentLevel);
              break;
              case 'spatial_mine':
              metal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(800,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              break;
              case 'defensive_satellite':
              metal = calculateUpgradeRessourceConsumption(3000,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(3000,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(3000,3,currentLevel);
              break;
              case 'heavy_defensive_satellite':
              metal = calculateUpgradeRessourceConsumption(6000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(6000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(6000,4,currentLevel);
              break;
              case 'fighter':
              metal = calculateUpgradeRessourceConsumption(100,1.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(50,1.5,currentLevel);
              break;
              case 'improved_fighter':
              metal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              break;
              case 'light_cruiser':
              metal = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              break;
              case 'bomb_cruiser':
              metal = calculateUpgradeRessourceConsumption(800,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(400,2,currentLevel);
              break;
              case 'line_cruiser':
              metal = calculateUpgradeRessourceConsumption(1200,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(600,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(600,2,currentLevel);
              break;
              case 'battleship':
              metal = calculateUpgradeRessourceConsumption(1200,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(600,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(600,3,currentLevel);
              break;
              case 'line_battleship':
              metal = calculateUpgradeRessourceConsumption(1600,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1000,3,currentLevel);
              break;
              case 'fleet_destructor':
              metal = calculateUpgradeRessourceConsumption(3000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1300,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(1300,4,currentLevel);
              break;
              case 'titan_destructor':
              metal = calculateUpgradeRessourceConsumption(5000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2500,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2500,4,currentLevel);
              break;
              case 'titan_1':
              metal = calculateUpgradeRessourceConsumption(10000,5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(5000,5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(5000,5,currentLevel);
              break;
              case 'titan_2':
              metal = calculateUpgradeRessourceConsumption(15000,5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(7500,5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(7500,5,currentLevel);
              break;
              case 'titan_3':
              metal = calculateUpgradeRessourceConsumption(12500,5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(10000,5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(7500,5,currentLevel);
              break;
              case 'titan_4':
              metal = calculateUpgradeRessourceConsumption(15000,6,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(12500,6,currentLevel);
              gas = calculateUpgradeRessourceConsumption(10000,6,currentLevel);
              break;
              case 'spy_probe':
              metal = 0;
              crystal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              gas = 0;
              break;
              case 'small_transporter':
              metal = calculateUpgradeRessourceConsumption(300,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(150,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(100,2,currentLevel);
              break;
              case 'big_transporter':
              metal = calculateUpgradeRessourceConsumption(1000,2.5,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,2.5,currentLevel);
              gas = calculateUpgradeRessourceConsumption(750,2.5,currentLevel);
              break;
              case 'planet_extractor':
              metal = calculateUpgradeRessourceConsumption(3000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(750,2,currentLevel);
              break;
              case 'nebulae_extractor':
              metal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(3000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(750,2,currentLevel);
              break;
              case 'black_hole_extractor':
              metal = calculateUpgradeRessourceConsumption(6000,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(6000,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(5000,3,currentLevel);
              break;
              case 'asteroid_field_extractor':
              metal = calculateUpgradeRessourceConsumption(3000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              break;
              case 'colonization_ship':
              metal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              break;
              case 'recycling_ship':
              metal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(750,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              break;
              case 'solar_satellite':
              metal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(200,2,currentLevel);
              break;
              case 'hunter_carrier':
              metal = calculateUpgradeRessourceConsumption(5000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(5000,4,currentLevel);
              break;
              case 'shield_destructor':
              metal = calculateUpgradeRessourceConsumption(1000,4,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(4000,4,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2000,4,currentLevel);
              break;
              case 'boarding_vessel':
              metal = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(500,2,currentLevel);
              gas = calculateUpgradeRessourceConsumption(2000,2,currentLevel);
              break;
              case 'interplanetary_missile':
              metal = calculateUpgradeRessourceConsumption(2000,3,currentLevel);
              crystal = calculateUpgradeRessourceConsumption(1000,3,currentLevel);
              gas = calculateUpgradeRessourceConsumption(3000,3,currentLevel);
              break;
            }

            return [metal.toFixed(0),crystal.toFixed(0),gas.toFixed(0),item,currentLevel];
          }

          function updateBuildingsInConstruction(){

            var queryString = 'SELECT * FROM `building_upgrades` WHERE `end_timestamp` <= ?';

            db.connection.query(queryString, [getTimestamp()],function(err, rows) {
              if (err) {
                throw err
              }else{
                var buildingUpgradesValues = rows;

                var queryString = 'DELETE FROM `building_upgrades` WHERE `end_timestamp` <= ?';

                db.connection.query(queryString, [getTimestamp()],function(err, rows) {
                  if (err) {
                    throw err
                  }else{
                    for (i = 0; i < buildingUpgradesValues.length; i++) {
                      addBuildingLevel(buildingUpgradesValues[i]);
                    }
                  }
                });
              }
            });
          }

          function addBuildingLevel(values){

            var queryString = 'UPDATE `user_planetary_levels` '

            switch(values.building) {
              case 'metal_mine':
              queryString = queryString + 'SET `metal_mine` = ? '
              break;
              case 'crystal_mine':
              queryString = queryString + 'SET `crystal_mine` = ? '
              break;
              case 'gas_mine':
              queryString = queryString + 'SET `gas_mine` = ? '
              break;
              case 'solar_mine':
              queryString = queryString + 'SET `solar_mine` = ? '
              break;
              case 'fusion_reactor':
              queryString = queryString + 'SET `fusion_reactor` = ? '
              break;
              case 'metal_warehouse':
              queryString = queryString + 'SET `metal_warehouse` = ? '
              break;
              case 'crystal_warehouse':
              queryString = queryString + 'SET `crystal_warehouse` = ? '
              break;
              case 'gas_warehouse':
              queryString = queryString + 'SET `gas_warehouse` = ? '
              break;
              case 'waste_factory':
              queryString = queryString + 'SET `waste_factory` = ? '
              break;
              case 'planet_engineering_complex':
              queryString = queryString + 'SET `planet_engineering_complex` = ? '
              break;
              case 'robotic_center':
              queryString = queryString + 'SET `robotic_center` = ? '
              break;
              case 'spaceport':
              queryString = queryString + 'SET `spaceport` = ? '
              break;
              case 'laboratory':
              queryString = queryString + 'SET `laboratory` = ? '
              break;
              case 'experimental_research_center':
              queryString = queryString + 'SET `experimental_research_center` = ? '
              break;
              case 'rare_ressource_research_center':
              queryString = queryString + 'SET `rare_ressource_research_center` = ? '
              break;
              case 'military_factory':
              queryString = queryString + 'SET `military_factory` = ? '
              break;
              case 'supercalculator':
              queryString = queryString + 'SET `supercalculator` = ? '
              break;
              case 'alliance_center':
              queryString = queryString + 'SET `alliance_center` = ? '
              break;
              case 'design_center':
              queryString = queryString + 'SET `design_center` = ? '
              break;
              case 'missile_silo':
              queryString = queryString + 'SET `missile_silo` = ? '
              break;
            }

            queryString = queryString + 'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

            // console.log(queryString);
            db.connection.query(queryString, [
              values.level,
              values.user_id,
              values.solar_system,
              values.intra_system
            ],function(err, rows) {
              if (err) {
                throw err
              }else{
                // callback(null,'BUILDING_LEVEL_SUCCESSFULLY_ADDED');
              }
            });
          }

          function isAlreadyBuildingBuilding(values,callback){

            var queryString = 'SELECT * FROM `building_upgrades` ' +
            'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ? ' +
            'AND `building` = ? AND `level` = ?';

            // console.log(queryString);
            db.connection.query(queryString, [
              values[0],
              values[1],
              values[2],
              values[3],
              getFinalLevel(values[4],values[5])
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

          function calculateUpgradeRessourceConsumption(base,multiplier,currentLevel){
            return (base*Math.pow(multiplier,currentLevel))
          }

          function getTimestamp(){
            return Math.floor(Date.now() / 1000);
          }

          function endTimestamp(metalConsumed,crystalConsumed,techOrBuilding,levels){
            var timestamp = getTimestamp();
            var formula = metalConsumed+crystalConsumed;
            if(techOrBuilding == 0){
              var currentRoboticLevel = levels[0].robotic_center;
              var currentIXSLevel = levels[0].supercalculator;
              formula = formula/(2500*(1+currentRoboticLevel)*Math.pow(2,currentIXSLevel));
            }
            if(techOrBuilding == 1){
              var currentLaboratoryLevel = levels[0].laboratory;
              var currentERCLevel = levels[0].experimental_research_center;
              formula = formula/(1000*(1+currentLaboratoryLevel)*Math.pow(2,currentERCLevel));
            }
            if(techOrBuilding == 2){
              var currentSpaceportLevel = levels[0].spaceport;
              var currentIXSLevel = levels[0].supercalculator;
              formula = (formula/36)/((5000*(1+currentSpaceportLevel))*Math.pow(2,currentIXSLevel));
            }
            formula = (formula*3600) + timestamp;
            return formula;
          }

          function getFinalLevel(buildingLevel,upOrDown){
            if(upOrDown == 1){
              buildingLevel = buildingLevel + 1;
            }
            if(upOrDown == 0){
              buildingLevel = buildingLevel - 1;
              if(buildingLevel <= 0){
                buildingLevel = 0;
              }
            }
            return buildingLevel;
          }

          function getObjectInConstruction(values,callback){
            var queryString = '';
            switch (values[3]){
              case 'building':
              queryString = 'SELECT * FROM `building_upgrades` '
              break
              case 'technology':
              queryString = 'SELECT * FROM `technologies_upgrades` '
              break;
              case 'units_control_center':
              queryString = 'SELECT * FROM `units_upgrade` '
              break;
              case 'units_building':
              queryString = 'SELECT *,COUNT(*) AS count FROM `units_building` '
              break;
            }

            queryString = queryString + 'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?';

            // console.log(queryString);
            db.connection.query(queryString, [
              values[0],
              values[1],
              values[2]
            ],function(err, rows) {
              if (err) {
                throw err
              }else{
                callback(null,rows);
                // callback(null,'TECH_LEVEL_SUCCESSFULLY_ADDED');
              }
            });
          }

          function cancelObjectConstruction(values,callback){
            var queryString = '';
            var endQuery = '';

            switch (values[4]){
              case 'building':
              queryString = 'DELETE FROM `building_upgrades` '
              endQuery =  ' AND `building` = ?';
              break
              case 'technology':
              queryString = 'DELETE FROM `technologies_upgrades` '
              endQuery =  ' AND `technology` = ?';
              break;
              case 'units':
              queryString = 'DELETE FROM `units_upgrade` '
              endQuery =  ' AND `units` = ?';
              break;
            }
            queryString = queryString + 'WHERE `user_id` = ? AND `solar_system` = ? AND `intra_system` = ?' + endQuery;

            // console.log(queryString);
            db.connection.query(queryString, [
              values[0],
              values[1],
              values[2],
              values[3]
            ],function(err, rows) {
              if (err) {
                throw err
              }else{
                callback(null,rows);
                // callback(null,'TECH_LEVEL_SUCCESSFULLY_ADDED');
              }
            });
          }

          exports.logIn = logIn;
          exports.changePassword = changePassword;
          exports.createAccount = createAccount;
          exports.createServerAndMap = createServerAndMap;
          exports.showMap = showMap;
          exports.upload = upload;
          exports.planetInformations = planetInformations;
          exports.loadUserPlanets = loadUserPlanets;
          exports.setNewProfilePic = setNewProfilePic;
          exports.getProductionBuildingsLevels = getProductionBuildingsLevels;
          exports.getIndustryBuildingsLevels = getIndustryBuildingsLevels;
          exports.updateBuilding = updateBuilding;
          exports.updateBuildingsInConstruction = updateBuildingsInConstruction;
          exports.getTimestamp = getTimestamp;
          exports.isEnoughRessources = isEnoughRessources;
          exports.getFinalLevel = getFinalLevel;
          exports.endTimestamp = endTimestamp;
          exports.getObjectInConstruction = getObjectInConstruction;
          exports.cancelObjectConstruction = cancelObjectConstruction;
          exports.getConstructionRessource = getConstructionRessource;
