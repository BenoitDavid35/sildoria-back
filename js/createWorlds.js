const db = require("./dbConnect.js");

function createDataBase(){

  var queryString = 'CREATE TABLE `asteroid_belt` ('+
  '`solar_system` varchar(5) NOT NULL,'+
  '`intra_system` varchar(5) NOT NULL,'+
  '`metal` tinyint(4) NOT NULL,'+
  '`crystal` tinyint(4) NOT NULL,'+
  '`rare` tinyint(4) NOT NULL,'+
  '`object_form` varchar(32) NOT NULL'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `black_hole` (' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`antimatter` tinyint(4) NOT NULL,' +
  '`rare` tinyint(4) NOT NULL,' +
  '`object_form` varchar(32) NOT NULL'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `gas` (' +
  '`gas` tinyint(4) NOT NULL,' +
  '`rare` tinyint(4) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`object_form` varchar(32) NOT NULL'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `nebulae` (' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`metal` tinyint(4) NOT NULL,' +
  '`crystal` tinyint(4) NOT NULL,' +
  '`gas` tinyint(4) NOT NULL,' +
  '`rare` tinyint(4) NOT NULL,' +
  '`object_form` varchar(32) NOT NULL'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `telluric` (' +
  '`mass` varchar(10),' +
  '`temperature` smallint(6),' +
  '`cases` smallint(6),' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`owner` int(11),' +
  '`object_form` varchar(32) NOT NULL,'+
  '`home_planet` tinyint(1) DEFAULT \'0\''+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `user` ('+
  '`Sila_ID` text NOT NULL,'+
  '`Mail` text NOT NULL,'+
  '`id` int(11) NOT NULL AUTO_INCREMENT,'+
  '`Avatar` varchar(64) NOT NULL,'+
  '`password` varchar(128) DEFAULT NULL,'+
  '`role` varchar(32) NOT NULL DEFAULT \'user\','+
  '`validated` tinyint(1) NOT NULL DEFAULT \'0\','+
  'PRIMARY KEY (`id`)'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `validate` ('+
  '`token` varchar(16) NOT NULL,'+
  '`account_mail` varchar(64) NOT NULL,'+
  'UNIQUE KEY `account_mail` (`account_mail`),'+
  'UNIQUE KEY `token` (`token`)'+
  ')';
  // console.log(queryString);
  db.connection.query(queryString ,function(err, rows) {
    if (err) throw err;
  });

  var queryString = 'CREATE TABLE `user_planetary_levels` ('+
  '`user_id` int(11) NOT NULL,'+
  '`solar_system` varchar(5) NOT NULL,'+
  '`intra_system` varchar(5) NOT NULL,'+
  '`metal_mine` tinyint(4) NOT NULL,'+
  '`crystal_mine` tinyint(4) NOT NULL,'+
  '`gas_mine` tinyint(4) NOT NULL,'+
  '`solar_mine` tinyint(4) NOT NULL,'+
  '`fusion_reactor` tinyint(4) NOT NULL,'+
  '`metal_warehouse` tinyint(4) NOT NULL,'+
  '`crystal_warehouse` tinyint(4) NOT NULL,'+
  '`gas_warehouse` tinyint(4) NOT NULL,'+
  '`waste_factory` tinyint(4) NOT NULL,'+
  '`planet_engineering_complex` tinyint(4) NOT NULL,'+
  '`robotic_center` tinyint(4) NOT NULL,'+
  '`spaceport` tinyint(4) NOT NULL,'+
  '`experimental_research_center` tinyint(4) NOT NULL,'+
  '`laboratory` tinyint(4) NOT NULL,'+
  '`rare_ressource_research_center` tinyint(4) NOT NULL,'+
  '`military_factory` tinyint(4) NOT NULL,'+
  '`supercalculator` tinyint(4) NOT NULL,'+
  '`alliance_center` tinyint(4) NOT NULL,'+
  '`design_center` tinyint(4) NOT NULL,'+
  '`missile_silo` tinyint(4) NOT NULL'+
')';
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE `user_technologies_level` (' +
  '`user_id` int(11) NOT NULL,' +
  '`metal` tinyint(4) NOT NULL,' +
  '`crystal` tinyint(4) NOT NULL,' +
  '`gas` tinyint(4) NOT NULL,' +
  '`extraction` tinyint(4) NOT NULL,' +
  '`energy` tinyint(4) NOT NULL,' +
  '`fusion` tinyint(4) NOT NULL,' +
  '`chemical_engine` tinyint(4) NOT NULL,' +
  '`ion_engine` tinyint(4) NOT NULL,' +
  '`microwarp_drive` tinyint(4) NOT NULL,' +
  '`quantum_drive` tinyint(4) NOT NULL,' +
  '`benalite_engine` tinyint(4) NOT NULL,' +
  '`astrophysics` tinyint(4) NOT NULL,' +
  '`intergalactic_research_network` tinyint(4) NOT NULL,' +
  '`ballistic` tinyint(4) NOT NULL,' +
  '`computer` tinyint(4) NOT NULL,' +
  '`design` tinyint(4) NOT NULL,' +
  '`spy` tinyint(4) NOT NULL,' +
  '`weapon` tinyint(4) NOT NULL,' +
  '`laser` tinyint(4) NOT NULL,' +
  '`photon` tinyint(4) NOT NULL,' +
  '`ion` tinyint(4) NOT NULL,' +
  '`plasma` tinyint(4) NOT NULL,' +
  '`neutron` tinyint(4) NOT NULL,' +
  '`electromagnetic` tinyint(4) NOT NULL,' +
  '`antimatter` tinyint(4) NOT NULL,' +
  '`armor` tinyint(4) NOT NULL,' +
  '`shield` tinyint(4) NOT NULL' +
')';
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE IF NOT EXISTS `user_ressources` (' +
  '`user_id` int(11) NOT NULL,' +
  '`metal` int(11) NOT NULL,' +
  '`crystal` int(11) NOT NULL,' +
  '`gas` int(11) NOT NULL,' +
  '`benalite` int(11) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL' +
')'
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE IF NOT EXISTS `building_upgrades` (' +
  '`user_id` int(11) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`building` VARCHAR(32) NOT NULL,' +
  '`level` tinyint(4) NOT NULL,' +
  '`start_timestamp` int(11) NOT NULL,' +
  '`end_timestamp` int(11) NOT NULL' +
')'
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE IF NOT EXISTS `technologies_upgrades` (' +
  '`user_id` int(11) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`technology` VARCHAR(32) NOT NULL,' +
  '`level` tinyint(4) NOT NULL,' +
  '`start_timestamp` int(11) NOT NULL,' +
  '`end_timestamp` int(11) NOT NULL' +
')'
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE IF NOT EXISTS `user_units_entities` (' +
  '`user_id` int(11) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`laser_turret` int(11) NOT NULL,' +
  '`photon_turret` int(11) NOT NULL,' +
  '`ion_turret` int(11) NOT NULL,' +
  '`plasma_turret` int(11) NOT NULL,' +
  '`gauss_turret` int(11) NOT NULL,' +
  '`neutron_turret` int(11) NOT NULL,' +
  '`antimatter_turret` int(11) NOT NULL,' +
  '`small_shield` int(11) NOT NULL,' +
  '`big_shield` int(11) NOT NULL,' +
  '`ballistic_missile` int(11) NOT NULL,' +
  '`spatial_mine` int(11) NOT NULL,' +
  '`defensive_satellite` int(11) NOT NULL,' +
  '`heavy_defensive_satellite` int(11) NOT NULL,' +
  '`fighter` int(11) NOT NULL,' +
  '`improved_fighter` int(11) NOT NULL,' +
  '`light_cruiser` int(11) NOT NULL,' +
  '`bomb_cruiser` int(11) NOT NULL,' +
  '`line_cruiser` int(11) NOT NULL,' +
  '`battleship` int(11) NOT NULL,' +
  '`line_battleship` int(11) NOT NULL,' +
  '`fleet_destructor` int(11) NOT NULL,' +
  '`titan_destructor` int(11) NOT NULL,' +
  '`titan_1` int(11) NOT NULL,' +
  '`titan_2` int(11) NOT NULL,' +
  '`titan_3` int(11) NOT NULL,' +
  '`titan_4` int(11) NOT NULL,' +
  '`spy_probe` int(11) NOT NULL,' +
  '`small_transporter` int(11) NOT NULL,' +
  '`big_transporter` int(11) NOT NULL,' +
  '`planet_extractor` int(11) NOT NULL,' +
  '`nebulae_extractor` int(11) NOT NULL,' +
  '`black_hole_extractor` int(11) NOT NULL,' +
  '`asteroid_field_extractor` int(11) NOT NULL,' +
  '`colonization_ship` int(11) NOT NULL,' +
  '`recycling_ship` int(11) NOT NULL,' +
  '`solar_satellite` int(11) NOT NULL,' +
  '`hunter_carrier` int(11) NOT NULL,' +
  '`shield_destructor` int(11) NOT NULL,' +
  '`boarding_vessel` int(11) NOT NULL,' +
  '`interplanetary_missile` int(11) NOT NULL' +
')';
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});

var queryString = 'CREATE TABLE IF NOT EXISTS `user_fleets` (' +
  '`fleet_ID` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
  '`fleet_name` varchar(64) NOT NULL,' +
  '`user_id` int(11) NOT NULL,' +
  '`solar_system` varchar(5) NOT NULL,' +
  '`intra_system` varchar(5) NOT NULL,' +
  '`solar_system_destination` varchar(5) NOT NULL,' +
  '`intra_system_destination` varchar(5) NOT NULL,' +
  '`mission` varchar(15) NOT NULL,' +
  '`fighter` int(11) NOT NULL,' +
  '`improved_fighter` int(11) NOT NULL,' +
  '`light_cruiser` int(11) NOT NULL,' +
  '`bomb_cruiser` int(11) NOT NULL,' +
  '`line_cruiser` int(11) NOT NULL,' +
  '`battleship` int(11) NOT NULL,' +
  '`line_battleship` int(11) NOT NULL,' +
  '`fleet_destructor` int(11) NOT NULL,' +
  '`titan_destructor` int(11) NOT NULL,' +
  '`titan_1` int(11) NOT NULL,' +
  '`titan_2` int(11) NOT NULL,' +
  '`titan_3` int(11) NOT NULL,' +
  '`titan_4` int(11) NOT NULL,' +
  '`spy_probe` int(11) NOT NULL,' +
  '`small_transporter` int(11) NOT NULL,' +
  '`big_transporter` int(11) NOT NULL,' +
  '`planet_extractor` int(11) NOT NULL,' +
  '`nebulae_extractor` int(11) NOT NULL,' +
  '`black_hole_extractor` int(11) NOT NULL,' +
  '`asteroid_field_extractor` int(11) NOT NULL,' +
  '`colonization_ship` int(11) NOT NULL,' +
  '`recycling_ship` int(11) NOT NULL,' +
  '`hunter_carrier` int(11) NOT NULL,' +
  '`shield_destructor` int(11) NOT NULL,' +
  '`boarding_vessel` int(11) NOT NULL' +
')';
// console.log(queryString);
db.connection.query(queryString ,function(err, rows) {
  if (err) throw err;
});
}

function createTelluricWorld(solar_system,system_position){
  var queryString = 'INSERT INTO telluric (solar_system,intra_system,object_form) VALUES (?,?,?)';
  // console.log(queryString);
  db.connection.query(queryString, [solar_system,system_position,'Telluric World'] ,function(err, rows) {
    if (err) throw err;
  });
}

function createNebulaeWorld(solar_system,system_position){
  var metalprobability = getRandomArbitrary(0,35).toFixed();
  var crystalprobability = getRandomArbitrary(0,35).toFixed();
  var rareprobability = getRandomArbitrary(0,5).toFixed();
  var gasprobability = ((100 - metalprobability) - crystalprobability) - rareprobability;
  var queryString = 'INSERT INTO nebulae (solar_system,intra_system,metal,crystal,gas,rare,object_form) VALUES (?,?,?,?,?,?,?)';
  // console.log(queryString);
  db.connection.query(queryString,
    [
      solar_system,
      system_position,
      metalprobability,
      crystalprobability,
      gasprobability,
      rareprobability,
      'Nebulae'
    ],
    function(err, rows) {
      if (err) throw err;
    });
  }

  function createGasWorld(solar_system,system_position){
    var rareprobability = getRandomArbitrary(0,3).toFixed();
    var gasprobability = 100 - rareprobability;
    var queryString = 'INSERT INTO gas (solar_system,intra_system,gas,rare,object_form) VALUES (?,?,?,?,?)';
    // console.log(queryString);
    db.connection.query(queryString,
      [
        solar_system,
        system_position,
        gasprobability,
        rareprobability,
        'Gas World'
      ],
      function(err, rows) {
        if (err) throw err;
      });
    }

    function createBlackholeWorld(solar_system,system_position){
      var rareprobability = getRandomArbitrary(0,3).toFixed();
      var antimatter = 100 - rareprobability;
      var queryString = 'INSERT INTO black_hole (solar_system,intra_system,antimatter,rare,object_form) VALUES (?,?,?,?,?)';
      // console.log(queryString);
      db.connection.query(queryString,
        [
          solar_system,
          system_position,
          antimatter,
          rareprobability,
          'Black Hole'
        ],
        function(err, rows) {
          if (err) throw err;
        });
      }

      function createAsteroidbeltWorld(solar_system,system_position){
        var crystalprobability = getRandomArbitrary(0,45).toFixed();
        var rareprobability = getRandomArbitrary(0,5).toFixed();
        var metalprobability = (100 - rareprobability) - crystalprobability;
        var queryString = 'INSERT INTO asteroid_belt (solar_system,intra_system,metal,crystal,rare,object_form) VALUES (?,?,?,?,?,?)';
        // console.log(queryString);
        db.connection.query(queryString,
          [
            solar_system,
            system_position,
            metalprobability,
            crystalprobability,
            rareprobability,
            'Asteroid Belt'
          ],
          function(err, rows) {
            if (err) throw err;
          });
        }

        // On renvoie un nombre aléatoire entre une valeur min (incluse)
        // et une valeur max (exclue)
        function getRandomArbitrary(min, max) {
          return Math.random() * (max - min) + min;
        }

        exports.createTelluricWorld = createTelluricWorld;
        exports.createNebulaeWorld = createNebulaeWorld;
        exports.createGasWorld = createGasWorld;
        exports.createBlackholeWorld = createBlackholeWorld;
        exports.createAsteroidbeltWorld = createAsteroidbeltWorld;
        exports.createDataBase = createDataBase;
        exports.getRandomArbitrary = getRandomArbitrary;
