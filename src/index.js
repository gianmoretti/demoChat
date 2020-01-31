const config = require('config');
const ChatServer = require('./server');
const port = process.env.PORT || config.get('app.port');
const address = process.env.ADDRESS || config.get('app.address');
new ChatServer(port, address);
