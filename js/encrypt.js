// generate a hash from string
var crypto = require('crypto');

function generateHash(text){
  var key = '123456789$#@$^@1ERFabcdef';

  // create hahs
  var hash = crypto.createHmac('sha512', key);
  hash.update(text);
  var value = hash.digest('hex');

  // print result
  console.log('accounthash is: ' + value);
  return value;
}

exports.generateHash = generateHash;
