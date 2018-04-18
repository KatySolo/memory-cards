const Game = {
    init: function () {
        this.field = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
        this.cardsPlaces = [];
        this.openedCards = 0;
        this.closedCards = 18;
        this.flippedCard = null;
        this.flippedCardPlace = null;
        this.scorePlace = null;
        this.score = 0;
        this.startGame();
    },

    addStyles: function() {
        let head = document.head;
        let linkStyle = document.createElement("link");
        linkStyle.setAttribute("href","game/game.css");
        linkStyle.setAttribute("rel","stylesheet");
        head.appendChild(linkStyle);

    },

    createSetOfCards: function () {
        let suits = ['S', 'H', 'D', 'C'];
        let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'K', 'Q', 'A'];
        let result_set = [];
        let i = 0;
        while (i < 9) {
            let suit = suits[Math.floor(Math.random() * (suits.length))];
            let value = values[Math.floor(Math.random() * (values.length))];
            let address = Game.getCardPath(suit, value);
            let card = {suit: suit, value: value, position: {x: 0, y: 0}, direction: address};
            let card_copy = JSON.parse(JSON.stringify(card));
            result_set.push(card, card_copy);
            values.splice(values.indexOf(value), 1);
            i++;
        }
        return result_set
    },
    getCardPath: function (s, v) {
        let direction = "src/cards/";
        if (v === "10") {
            direction += "0";
        } else {
            direction += v;
        }
        direction += s;
        direction += ".png";
        return direction
    },
    generateCardPairs: function (x, y) {
        let permutations = [];
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                permutations.push({x: i, y: j});
            }
        }
        return permutations;
    },
    setCardsPositions: function () {
        let all_pairs = Game.generateCardPairs(6, 3);
        for (let i = 0; i < this.cards.length; i++) {
            let pair = all_pairs[Math.floor(Math.random() * (all_pairs.length))];
            this.cards[i].position.x = pair.x;
            this.cards[i].position.y = pair.y;
            all_pairs.splice(all_pairs.indexOf(pair), 1);
        }
    },
    placeCardsToField: function () {
        this.setCardsPositions();
        for (let i = 0; i < this.cards.length; i++) {
            this.field[this.cards[i].position.y][this.cards[i].position.x] = this.cards[i];
        }
    },

    generateGUI: function () {
        if (!this.game) {
            this.game = this.createGameContainer();

            this.addStyles();

            let restart_button = document.createElement("input");
            restart_button.type = "button";
            restart_button.value = "Начать снова";
            restart_button.className = "restart-button";
            this.game.appendChild(restart_button);
            restart_button.addEventListener("click", function() {
                Game.init();
            });

            this.scorePlace = document.createElement("span");
            this.scorePlace.textContent = "Очки: 0";
            this.scorePlace.className = "score-place";
            this.game.appendChild(this.scorePlace);

            this.gameCont = document.createElement("table");
            this.displayCards();
            this.game.appendChild(this.gameCont);

        } else {
            this.scorePlace = document.getElementsByClassName("score-place")[0];
            this.scorePlace.textContent = "Очки: 0";
            this.gameCont.remove();
            this.gameCont = document.createElement("table");
            this.displayCards();
            this.game.appendChild(this.gameCont);

        }
    },
    createGameContainer: function () {
        // это, собственно, html-текст, который будет вписан в документ
        let html = '<div id="game" class="game"></div>';

        // вписываем его в документ
        document.writeln(html);
        return document.getElementById('game');
    },
    displayCards: function () {
        for (let i = 0; i < 3; i++) {
            this.gameCont.insertRow(i);
            for (let j = 0; j < 6; j++) {
                let active_cell = this.gameCont.rows[i].insertCell(j);
                let card_place = document.createElement("img");
                card_place.id = 'card';
                card_place.addEventListener("click", function () {
                        Game.flipCard(i, j, card_place);
                });
                card_place.setAttribute("src", this.field[i][j].direction);
                setTimeout(function () {
                    card_place.setAttribute("src", "src/cards/cover.jpg")
                }, 5000);
                active_cell.appendChild(card_place);

            }
        }
    },

    flipCard: function (x, y, card) {
        card.setAttribute("src", this.field[x][y].direction);
        this.openedCards += 1;
        this.closedCards -= 1;

        if (this.flippedCard === null) {
            this.flippedCard = this.field[x][y];
            this.flippedCardPlace = card;
        } else {
            let chosenCard = this.field[x][y];
            if (chosenCard.suit === this.flippedCard.suit 
                && chosenCard.value === this.flippedCard.value
                && chosenCard.position !== this.flippedCard.position) {
                this.addScore();
                this.field[x][y] = null;
                this.flippedCardPlace.setAttribute("src", "src/cards/trp_card.png");
                card.setAttribute("src", "src/cards/trp_card.png");
                this.field[this.flippedCard.position.y][this.flippedCard.position.x] = null;
                this.flippedCard = null;
            } else {
                this.reduceScore();
                this.openedCards -= 2;
                this.closedCards += 2;
                this.flippedCard = null;
                setTimeout(this.flip, 1500, card, this.flippedCardPlace);
            }
            this.scorePlace.textContent = "Очки: " + this.score;
            if (this.checkIfGameIsOver()) {
                this.flip(card, null);
                this.finishGame();
            }
        }

    },
    flip: function (card, flippedCard) {
        if (flippedCard !== null) {
            flippedCard.setAttribute("src", "src/cards/cover.jpg");
        }
        card.setAttribute("src", "src/cards/cover.jpg");

    },

    addScore: function () {
        this.score += ((this.closedCards + 2) / 2) * 42;
    },
    reduceScore: function () {
        let newScore = this.score - ((this.openedCards - 2) / 2) * 42;
        this.score = Math.max(0, newScore);
    },

    startGame: function () {
        this.cards = this.createSetOfCards();
        this.placeCardsToField();
        this.generateGUI();
    },
    checkIfGameIsOver: function () {
        if (this.openedCards === 18) {
            this.finishGame();
        }
    },
    finishGame: function () {
        alert('i will finish game');
        fromGameToFinish(this.score);
    }

};


function createContainer(container) {
    let new_container = document.createElement("div");
    new_container.className = container;
    return new_container;
}

function fromGameToFinish(score) {
    Game.game.remove();
    Game.game = undefined;

    let mainContainer = document.body;
    let parentContainer = createContainer('parent');
    let childImageContainer = createContainer('child');
    let cardImage = document.createElement("img");
    cardImage.className = "exteriorPic";
    cardImage.setAttribute("src", "src/pictures/Group2.png");
    childImageContainer.appendChild(cardImage);
    parentContainer.appendChild(childImageContainer);


    let childLabelContainer = createContainer("child");
    let scoreLabel = document.createElement("label");
    scoreLabel.textContent = "Поздравляем! \n Ваш итоговый счет: " + score;
    scoreLabel.id = "result";
    childLabelContainer.appendChild(scoreLabel);
    parentContainer.appendChild(childLabelContainer);

    let childButtonContainer = createContainer("child");
    let resetButton = document.createElement("button");
    resetButton.id = "buttonShape";

    let resetButtonText = document.createElement("div");
    resetButtonText.id = "buttonText";
    resetButtonText.textContent = "Ещё раз";
    resetButton.appendChild(resetButtonText);    
    
    childButtonContainer.appendChild(resetButton);
    resetButton.addEventListener("click", restartGame);
    parentContainer.appendChild(childButtonContainer);

    mainContainer.appendChild(parentContainer);
}

function restartGame() {
    location.reload(true);
}