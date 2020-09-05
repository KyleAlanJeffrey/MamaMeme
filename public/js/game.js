const urlExt = window.location.href.split("/")[3];
// STATES = {
//     LOBBY: 1,
//     START: 2,
//     SUBMISSION: 3,
//     VOTING: 4,
//     SCORE: 5,
//     RESULTS: 6
// }

class Message {
  constructor(event) {
    let me = { ...room.myPlayer };
    me.card = null;
    me.submissionCard = null;
    me.answerCard = null;
    this.event = event;
    this.roomID = urlExt;
    this.playerData = me;
    this.playersData = null;
  }
}

class Player {
  constructor(name, card, lead) {
    this.name = name;
    this.card = card;
    this.lead = lead;
    this.vote = undefined;
    this.answerCard = undefined;
    this.points = 0;
    this.roundVotes = 0;
  }
  addHostPrivilege() {
    console.log("You are the host!");
    let startBtn = ElementCreate.startButton();
    $(".game-content").append(startBtn);
  }
  addPoints(playerData) {
    this.roundVotes = playerData.roundVotes;
  }
  pointAnimation() {
    this.card.addClass("scored");
    this.points += 100;
    const score = "Score: " + this.points;
    this.card.children().text(score);
    document.getElementById("score_audio").play();
    setTimeout(() => {
      this.card.removeClass("scored");
    }, 1000);
  }
  remove() {
    this.card.remove();
  }
  createAnimateResultCard() {
    const MAX_HEIGHT = 700;
    const CARD_ID = "#" + this.name + "result-card";
    let i = this.points / 100,
      score = 0;
    $(".scores").append(ElementCreate.resultCard(this.name));
    this.interval = setInterval(() => {
      if (!i) {
        clearInterval(this.interval);
        return;
      }
      i--;

      const currentHeight = $(CARD_ID).height();
      $(CARD_ID).css("height", currentHeight + 65);
      $(CARD_ID + " h1").text((score += 100));
    }, 500);
  }
}

class Room {
  constructor(socket) {
    this.players = [];
    this.socket = socket;
    this.myPlayer = null;
    this.myUsername = getCookie("mama_meme_username");
    this.$board = $(".game-content");
    this.memes = [];
    this.state = new Lobby(this);
    this.round = 0;
  }
  addPlayer(name, lead) {
    document.getElementById("blip_audio").play();
    const playerCard = ElementCreate.playerCard(name, { host: lead, score: 0 });
    $(".players").append(playerCard);
    let player = new Player(name, playerCard, lead);
    this.players.push(player);
    return player;
  }
  getPlayerByName(name) {
    return this.players.find((player) => {
      return player.name == name;
    });
  }
  removePlayer(name) {
    const player = this.getPlayerByName(name);
    player.remove();
    this.players = this.players.filter((player) => {
      return player.name != name;
    });
  }
  addWaitPrompt() {
    this.waitPrompt = new WaitPrompt();
  }
  startRoundAnimations() {
    const roundIntroString = `round${this.round}_intro`;
    console.log(roundIntroString);
    document.getElementById(roundIntroString).play();
    document.getElementById("wait_music").play();
    $("#round-overlay h1").text(`Round ${this.round}`);
    $("#round-overlay").show().css("left", "0%");
    setTimeout(() => {
      $("#round-overlay").css("left", "100%");
      this.$board.append(ElementCreate.roundTitle(this.round));
    }, 5000);
  }
  displayRoundScore() {
    let t = 2000,
      dt = 2000;
    this.players.forEach((player) => {
      const votes = player.roundVotes;
      for (let i = 0; i < votes; i++) {
        setTimeout(() => {
          player.pointAnimation();
        }, t);
        t += dt;
      }
    });
  }
  displayGameResults() {
    $("#score-overlay").css("display", "flex");
    setTimeout(() => {
      $("#score-overlay").css("top", "0");
    }, 100);
    let t = 1500,
      dt = 2000;
    this.players.forEach((player) => {
      setTimeout(() => {
        player.createAnimateResultCard();
      }, t);
      t += dt;
    });
  }
  requestStart() {
    $("#start-game-button").hide();
    const OUT_MSG = new Message("hostRequestStart");
    this.sendServerMessage(OUT_MSG);
  }
  submitAnswer() {
    const OUT_MSG = new Message("submitAnswer");
    OUT_MSG.answer = $("#user-answer").val();
    $(".card.answer-input").remove();
    this.sendServerMessage(OUT_MSG);
  }
  requestPlayAgain() {
    $("#play-again-button").prop("disabled", true);
    const OUT_MSG = new Message("requestPlayAgain");
    this.sendServerMessage(OUT_MSG);
  }
  parseMessage(message) {
    this.state.parseMessage(message);
  }
  loadSubmissionElements() {
    document.getElementById("woosh_audio").play();
    $("body").addClass("hide-overflow");
    setTimeout(() => {
      $("body").removeClass("hide-overflow");
    }, 1000);
    $(".meme-format-container").append(ElementCreate.meme(this.memes[0]));
    this.$board.append(ElementCreate.answerCard());
  }
  addHiddenSubmission(answer, playerName) {
    document.getElementById("bleep_audio").play();
    let player = this.getPlayerByName(playerName);
    let card = new Card(answer, player, this);
    player.submissionCard = card;
    $(".meme-answer-container").append(card.element);
    $(".vote-prompt").removeClass("hidden");
  }
  loadVotingElements() {
    let t = 2000,
      dt = 4000;
    this.players.forEach((player) => {
      setTimeout(() => {
        player.submissionCard.reveal();
      }, t);
      t += dt;
    });
  }
  clearVotingElements() {
    $(".round-title").remove();
    $(".meme-format").remove();
    $(".reveal-card").remove();
    $(".vote-prompt").addClass("hidden");
    $("#answer-input").remove();
    $("#round-overlay").css("left", "-100%").hide();
  }
  sendServerMessage(OUT_MSG) {
    this.socket.emit("messageFromClient", OUT_MSG);
  }
}
