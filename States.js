class Message {
  constructor(event) {
    this.event = event;
    this.playerData = null;
    this.playersData = null;
    this.img = null;
  }
}

class State {
  constructor(state, room) {
    this.timerInterval = null;
    this.duration = null;
    this.state = state;
    this.room = room;
  }
  /**
   * @description Starts a timeout for the state and sends a custom message to the client if specified
   * @param {*} Duration
   * @param {*} Outgoing_Message
   */
  start(duration, OUT_MSG) {
    this.duration = duration;
    if (!OUT_MSG) OUT_MSG = new Message(this.state);
    OUT_MSG.round = this.room.round;
    this.room.sendGameMessage(OUT_MSG);
    if (duration == -1) return;

    this.timerInterval = setInterval(() => {
      this.duration--;
      if (this.duration <= 0) {
        clearInterval(this.timerInterval);
        this.end();
      }
    }, 1000);
  }
  /**
   * @description The supermethod for parsing client messages. Messages parsed here must do the same thing in every state i.e. when a player joins, a card is always added to the lobby.
   * @param {*} Incoming_Message
   */
  parseMessage(IN_MSG) {
    console.log(IN_MSG);
    switch (IN_MSG.event) {
      case "joinedServer": {
        break;
      }
      case "leaveRoom":
        this.room.removePlayer(IN_MSG.playerData.name);
        const OUT_MSG = new Message("playerLeft");
        OUT_MSG.playerData = IN_MSG.playerData;
        this.room.sendGameMessage(OUT_MSG);
        break;
    }
  }
  end() {
    clearInterval(this.timerInterval);
  }
}

class Lobby extends State {
  constructor(room) {
    super("Lobby", room);
  }
  parseMessage(msg, socket) {
    super.parseMessage(msg);
    const playerData = msg.playerData;
    const playersData = msg.playersData;
    const room = this.room;
    switch (msg.event) {
      case "joinedServer":
        if (playerData.name === "") {
          const OUT_MSG = new Message("redirect");
          OUT_MSG.url = "/";
          OUT_MSG.roomExt = "" + this.room.id;
          socket.emit("redirect", OUT_MSG);
          return;
        }
        room.addPlayer(playerData.name, playerData.lead);
        socket.join(room.id);
        // Send player who joined all players
        const msg = new Message("loadPlayers");
        msg.playersData = room.players;
        socket.emit("messageFromServer", msg);
        room.print();
        break;

      case "hostRequestStart":
        this.end();
        break;
    }
  }
  end() {
    super.end();
    this.room.state = new Start(this.room);
    this.room.state.start(5, null);
    this.room.private = true;
  }
}

class Start extends State {
  constructor(room) {
    super("Start", room);
  }
  start(duration, OUT_MSG) {
    this.room.round++;
    super.start(duration, OUT_MSG);
  }
  async end() {
    super.end();
    this.room.state = new Submission(this.room);
    this.room.state.start();
  }
}
class Submission extends State {
  constructor(room) {
    super("Submission", room);
    this.answersSubmitted = 0;
    room.resetVotes();
  }
  async start() {
    const OUT_MSG = new Message("Submission");
    OUT_MSG.img = await this.room.getMeme();
    super.start(100, OUT_MSG);
  }
  parseMessage(IN_MSG) {
    super.parseMessage(IN_MSG);

    switch (IN_MSG.event) {
      case "submitAnswer": {
        const SERVER_PLAYER = this.room.getPlayerByName(IN_MSG.playerData.name);
        SERVER_PLAYER.addAnswer(IN_MSG.answer);
        this.answersSubmitted++;

        const OUT_MSG = new Message("answerSubmitted");
        OUT_MSG.answer = IN_MSG.answer;
        OUT_MSG.playerData = SERVER_PLAYER;
        this.room.sendGameMessage(OUT_MSG);

        if (this.answersSubmitted == this.room.players.length) this.end();
      }
    }
  }
  end() {
    super.end();
    this.room.state = new Voting(this.room);
    this.room.state.start();
  }
}
class Voting extends State {
  constructor(room) {
    super("Voting", room);
    this.votesSubmitted = 0;
  }
  start() {
    const OUT_MSG = new Message("Voting");
    OUT_MSG.playersData = this.room.players;
    super.start(50, OUT_MSG);
  }
  parseMessage(IN_MSG) {
    super.parseMessage(IN_MSG);
    switch (IN_MSG.event) {
      case "submitVote":
        this.votesSubmitted++;
        this.room.addVote(IN_MSG.playerData);
        if (this.votesSubmitted == this.room.players.length) this.end();
        break;
    }
  }
  async end() {
    super.end();
    this.room.state = new Score(this.room);
    this.room.state.start();
  }
}
class Score extends State {
  constructor(room) {
    super("Score", room);
  }
  start() {
    // Get Every player that scored
    const OUT_MSG = new Message("Score");
    OUT_MSG.playersData = this.room.players;
    super.start(10, OUT_MSG);
  }
  end() {
    super.end();
    if (this.room.round == 8) {
      this.room.state = new Results(this.room);
      this.room.state.start();
      return;
    }
    this.room.state = new Start(this.room);
    this.room.state.start(5, null);
  }
}
class Results extends State {
  constructor(room) {
    super("Results", room);
    this.votes = 0;
  }
  start() {
    const OUT_MSG = new Message("Results");
    OUT_MSG.playersData = this.room.players;
    super.start(-1, OUT_MSG);
  }
  parseMessage(IN_MSG) {
    super.parseMessage(IN_MSG);
    switch (IN_MSG.event) {
      case "requestPlayAgain": {
        this.votes++;
        if (this.votes >= this.room.players.length / 2) {
          this.end();
        }
        break;
      }
    }
  }
  end() {
    this.room.state = new Lobby(this.room);
  }
}
module.exports = { State, Lobby, Start, Submission };