var express = require('express');
var app = express();
const func = require("./js/functions.js");
const units = require("./js/units.js");
const techs = require("./js/technologies.js");
const fleets = require("./js/fleets.js");
const ressources = require("./js/ressources.js");
const planets = require("./js/planets.js");
var bodyParser = require("body-parser");
const cron = require('node-cron');

//Partie qui gère les headers des requetes http
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.post('/create-account/', function (req, res) {
  product = func.createAccount(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/connexion/', function (req, res) {
  console.log(req.body);
  login = func.logIn(req.body[0], req.body[1],function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      if(data[0] == ''){
        res.end(JSON.stringify('Mot de passe ou identifiant erroné'));
      }else{
        if(data[0] == null || data[0] == undefined){
          console.log('Connexion Failed, no account');
          console.log(data[0]);
          res.end(JSON.stringify(data[0]));
        }else{
          console.log('Connexion Sucessfull');
          console.log(data[0]);
          res.end(JSON.stringify(data[0]));
        }
      }
      // code to execute on data retrieval
    }
  });
})

app.post('/change-password/', function (req, res) {
  product = func.changePassword(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/createServer/', function (req, res) {
  product = func.createServerAndMap(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/get-map/', function (req, res) {
  product = func.showMap(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/getPlanetInformations/', function (req, res) {
  product = func.planetInformations(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/loadUserPlanets/', function (req, res) {
  product = func.loadUserPlanets(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      res.end( JSON.stringify(data) );
    }
  });
})

app.get('/images-api/:imageName', function (req, res) {
  res.sendFile(__dirname + '/userpictures/' + req.params.imageName);
});

app.post('/new-profile-pic/', function (req, res) {
  product = func.setNewProfilePic(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/production-buildings/', function (req, res) {
  product = func.getProductionBuildingsLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/industry-buildings/', function (req, res) {
  product = func.getIndustryBuildingsLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/update-building/', function (req, res) {
  product = func.updateBuilding(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/update-technologies/', function (req, res) {
  product = techs.updateTechnologies(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/update-units/', function (req, res) {
  product = units.updateUnits(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/economics-technologies/', function (req, res) {
  product = techs.getEconomicsTechnologiesLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/weapon-technologies/', function (req, res) {
  product = techs.getWeaponTechnologiesLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/fighting-ships-control-center/', function (req, res) {
  product = units.getFightingShips(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/turrets-control-center/', function (req, res) {
  product = units.getTurrets(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/civilians-control-center/', function (req, res) {
  product = units.getCivilians(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/logistic-control-center/', function (req, res) {
  product = units.getLogistics(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/getShips/', function (req, res) {
  product = units.getShips(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/maxUnits/', function (req, res) {
  product = units.maxUnits(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/buildUnits/', function (req, res) {
  product = units.buildUnits(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/unitsOnPlanet/', function (req, res) {
  product = units.calculateExistingUnitsOnPlanet(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/propulsion-technologies/', function (req, res) {
  product = techs.getPropulsionTechnologiesLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/player-technologies/', function (req, res) {
  product = techs.getPlayerTechnologiesLevels(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/ressources/', function (req, res) {
  product = ressources.getCurrentRessources(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      res.end( JSON.stringify(data[0]) );
    }
  });
})

app.post('/getObjectInConstruction/', function (req, res) {
  product = func.getObjectInConstruction(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      // console.log(data[0]);
      res.end( JSON.stringify(data[0]) );
    }
  });
})

app.post('/cancelObjectConstruction/', function (req, res) {
  product = func.cancelObjectConstruction(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      res.end( JSON.stringify(data[0]) );
    }
  });
})

app.post('/getFleets/', function (req, res) {
  product = fleets.getFleets(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data);
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/setFleet/', function (req, res) {
  product = fleets.setFleet(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data);
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/getOneFleet/', function (req, res) {
  product = fleets.getOneFleet(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data);
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/getRandomPlanetInformations/', function (req, res) {
  product = planets.getRandomPlanetInformations(req.body,function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data);
      res.end( JSON.stringify(data) );
    }
  });
})

app.post('/upload-api/', func.upload);

// Schedule tasks to be run on the server.
cron.schedule('* * * * * *', function() {
  // console.log('running cron job');
  ressources.addRessources(function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      // res.end( JSON.stringify(data[0]) );
    }
  });
});

// Schedule tasks to be run on the server.
cron.schedule('* * * * * *', function() {
  // console.log('running cron job');
  func.updateBuildingsInConstruction(function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      // res.end( JSON.stringify(data[0]) );
    }
  });
});

// Schedule tasks to be run on the server.
cron.schedule('* * * * * *', function() {
  // console.log('running cron job');
  techs.updateTechsInConstruction(function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      // res.end( JSON.stringify(data[0]) );
    }
  });
});

// Schedule tasks to be run on the server.
cron.schedule('* * * * * *', function() {
  // console.log('running cron job');
  units.updateControlCentersInConstruction(function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      // res.end( JSON.stringify(data[0]) );
    }
  });
});

// Schedule tasks to be run on the server.
cron.schedule('* * * * * *', function() {
  // console.log('running cron job');
  units.updateUnitsInConstruction(function(err,data){
    if (err) {
      console.log("ERROR : ",err);
    } else {
      // code to execute on data retrieval
      console.log(data[0]);
      // res.end( JSON.stringify(data[0]) );
    }
  });
});

var server = app.listen(8888, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Sildoria Stories server listening at http://%s:%s", host, port)
})

server.on('close', function () {
  db.connection.end();
});
