exports['clicker'] = require('./clicker.js');
exports['clicker'].canSpectate = false;
exports['clicker'].maxPlayers = 50;

exports['airfight'] = require('./dogfight.js');
exports['airfight'].canSpectate = true;
exports['airfight'].maxPlayers = 10;
