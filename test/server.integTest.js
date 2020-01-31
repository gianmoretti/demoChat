const expect = require('chai').expect;
const net = require('net');
var sleep = require('sleep');
const ChatServer = require('../src/server');

describe('integration test - when server is started', function() {
  var chatServer;
  var clientSocket;
  var anotherClientSocket;

  this.timeout(0);

  this.beforeEach(() => {
    clientSocket = net.connect(8000, () => {
      clientSocket.write('client A');
    });
    anotherClientSocket = net.connect(8000, () => {
      anotherClientSocket.write('client B');
    });
  });

  this.beforeAll(() => {
    chatServer = new ChatServer(8000, '127.0.0.1');
  });

  this.afterAll(() => {
    chatServer.stopServer();
  });

  this.afterEach(() => {
    clientSocket.end();
    anotherClientSocket.end();
  });

  it('a client should be able to connect', done => {
    const clientSocket = net.createConnection(8000, () => {
      console.log('connected to server');
      expect(clientSocket.address().family).to.be.equal('IPv4');
      clientSocket.end();
      done();
    });
  });

  it('a client should be able to receive a message by another client', done => {
    var sendOneMessage = false;
    anotherClientSocket.on('data', async () => {
      sleep.sleep(1); //wait for the client connection...
      if (!sendOneMessage) {
        await anotherClientSocket.write('Message from B');
        sendOneMessage = true;
      }
    });

    clientSocket.on('data', data => {
      var messageFromServer = data.toString();
      if (messageFromServer.includes('client B')) {
        try {
          expect(messageFromServer).to.have.string('Message from B');
          done();
        } catch (error) {
          done(error);
        }
      }
    });
  });
});
