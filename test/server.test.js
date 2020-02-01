const assert = require('chai').assert;
const ChatServer = require('../src/server');
const sinon = require('sinon');

describe('unit test - when server receives a message...', function() {
  var chatServer;

  this.timeout(0);

  this.beforeEach(() => {
    chatServer = new ChatServer(8000, '127.0.0.1');
  });

  this.afterEach(() => {
    chatServer.stopServer();
  });

  it("should add the user as new if it doesn't know its id", done => {
    idUserAngie = {
      id: 'idUserAngie',
      name: 'Angie',
      write: () => {}
    };
    idUserBob = {
      id: 'idUserBob',
      name: 'Bob',
      write: () => {}
    };
    var stubAddNewUser = sinon.stub(chatServer, 'addNewUser');
    var stubDeliverMessage = sinon.stub(chatServer, 'deliverMessage');
    var connectedUsers = { idUserAngie };

    chatServer.processMessage('a message', idUserBob, connectedUsers);

    assert(stubAddNewUser.called);
    assert(stubDeliverMessage.notCalled);

    done();
  });

  it('should deliver a message if it knows its id', done => {
    idUserAngie = {
      id: 'idUserAngie',
      name: 'Angie',
      write: () => {}
    };
    var stubAddNewUser = sinon.stub(chatServer, 'addNewUser');
    var stubDeliverMessage = sinon.stub(chatServer, 'deliverMessage');
    var connectedUsers = { idUserAngie };

    chatServer.processMessage('a message', idUserAngie, connectedUsers);

    assert(stubAddNewUser.notCalled);
    assert(stubDeliverMessage.called);

    done();
  });

  it('should be able to deliver a message sent by a user to all the other connected users', done => {
    idUserAngie = {
      id: 'idUserAngie',
      name: 'Angie',
      write: () => {}
    };
    idUserBob = {
      id: 'idUserBob',
      name: 'Bob',
      write: () => {}
    };
    idUserCindy = {
      id: 'idUserCindy',
      name: 'Cindy',
      write: () => {}
    };
    var stubWriteUserAngie = sinon.stub(idUserAngie, 'write');
    var stubWriteUserBob = sinon.stub(idUserBob, 'write');
    var stubWriteUserCindy = sinon.stub(idUserCindy, 'write');
    var connectedUsers = { idUserAngie, idUserBob, idUserCindy };

    chatServer.deliverMessage('a sample message', idUserAngie, connectedUsers);

    assert(stubWriteUserAngie.calledWith('[ Angie ] > '));
    assert(stubWriteUserBob.calledWith('\n [ Angie ] > a sample message'));
    assert(stubWriteUserBob.calledWith('[ Bob ] > '));
    assert(stubWriteUserCindy.calledWith('\n [ Angie ] > a sample message'));
    assert(stubWriteUserCindy.calledWith('[ Cindy ] > '));

    done();
  });
});
