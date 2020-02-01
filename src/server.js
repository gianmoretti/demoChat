const chalk = require('chalk');
const uniqid = require('uniqid');
const figlet = require('figlet');
const net = require('net');
const logger = require('./utils/logger');

module.exports = class ChatServer {
  constructor(port, address) {
    this.server = net.createServer();
    this.port = port;
    this.address = address;
    this.connectedUsers = {};

    this.server.on('connection', currentUser =>
      this.manageUserOnConnection(currentUser, this.connectedUsers)
    );
    this.server.listen(this.port, this.address, () => {
      logger.info(`PagoPA chat server started!`);
    });
  }

  manageUserOnConnection(currentUser, connectedUsers) {
    currentUser.id = uniqid();
    logger.info(`User connected [id=${currentUser.id}]`);

    currentUser.write(
      chalk.yellow(figlet.textSync('Welcome to PagoPA chat')) + '\n\n'
    );

    currentUser.write("[ PagoPA Chatbot ] > What's your name? ");
    currentUser.on('data', data =>
      this.processMessage(data.toString(), currentUser, connectedUsers)
    );

    currentUser.on('end', () => {
      delete this.connectedUsers[currentUser.id];
      logger.info(
        `A user has just left the chat [id=${currentUser.id}|username=${currentUser.name} ]`
      );
    });
  }

  processMessage(message, currentUser, connectedUsers) {
    if (!connectedUsers[currentUser.id]) {
      this.addNewUser(message, currentUser, connectedUsers);
    } else {
      this.deliverMessage(message, currentUser, connectedUsers);
    }
  }

  addNewUser(message, currentUser, connectedUsers) {
    const username = message.trim();
    currentUser.name = username;

    if (username) {
      connectedUsers[currentUser.id] = currentUser;

      currentUser.write(
        chalk.green(`[ PagoPA Chatbot ] > Welcome ${username}!\n`)
      );
      currentUser.write(`[ ${username} ] > `);
    } else {
      currentUser.end(
        chalk.red.bold('[ PagoPA Chatbot ] > Error: the name is not valid!\n')
      );
    }
  }

  deliverMessage(message, currentUser, connectedUsers) {
    Object.keys(connectedUsers).forEach(id => {
      const otherUser = connectedUsers[id];
      if (currentUser.id !== id) {
        otherUser.write(`\n [ ${currentUser.name} ] > ${message}`);
        otherUser.write(`[ ${otherUser.name} ] > `);
      } else {
        currentUser.write(`[ ${currentUser.name} ] > `);
      }
    });
  }

  stopServer() {
    this.server.close();
  }
};
