const expect = require('chai').expect;
const net = require('net');
const ChatServer = require('../src/server');

describe('integration test - when server is started...', function() {
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

  it('a client should be able to connect to it', done => {
    const clientSocket = net.createConnection(8000, () => {
      expect(clientSocket.address().family).to.be.equal('IPv4');
      clientSocket.end();
      done();
    });
  });

  it('a client should be able to receive a message sent by another client', done => {
    var sendOneMessage = false;
    var messageReceived = false;

    clientSocket.on('data', data => {
      var messageFromServer = data.toString();
      if (messageFromServer.includes('client B') && !messageReceived) {
        try {
          messageReceived = true;
          expect(messageFromServer).to.have.string('Message from B');
          done();
        } catch (error) {
          done(error);
        }
      }
    });

    anotherClientSocket.on('data', async () => {
      if (!sendOneMessage || !messageReceived) {
        await anotherClientSocket.write('Message from B');
        sendOneMessage = true;
      }
    });
  });
});
