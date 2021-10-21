;
jQuery(function ($) {
    'use strict';

    // Socket IO
    const IO = {
        init: function () {
            IO.socket = io();

            // Bind events
            IO.bindEvents();
        },

        bindEvents: function () {
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('gameJoined', IO.onGameJoined);
            IO.socket.on('gameCreated', IO.onGameCreated);
            IO.socket.on('playersUpdate', IO.onPlayersUpdated);
            IO.socket.on('gameTypeChanged', IO.onGameTypeChanged);
            IO.socket.on('error', IO.onError);
        },

        onConnected: function () {
            console.log('connected!'); // TODO: Remove
        },

        onGameJoined: function (data) {
            console.log(`${data.name} joined game!`); // TODO: Remove
            App.toLobby(data);
        },

        onGameCreated: function (data) {
            console.log(`${data.name} new game with gameId ${data.gameId}`); // TODO: Remove
            App.toLobby(data);
        },

        onPlayersUpdated: function (data) {
            // TODO: Remove
            console.log(`New list of players!`);
            for (let i = 0; i < data.players.length; i++) {
                console.log(data.players[i]);
            }

            const playersList = document.getElementById('playersList');
            if (undefined !== playersList) {
                // Remove previous list
                while (playersList.firstChild) {
                    playersList.removeChild(playersList.firstChild);
                }

                // Add new list
                playersList.appendChild(Util.makeUL(data.players));
            }

            // Tell server game type so new player can see game type
            if ('host' === App.role) {
                IO.socket.emit('gameTypeChanged', { gameId: App.gameId, gameType: App.gameType });
            }
        },

        onGameTypeChanged: function (data) {
            console.log(`game type is now ${data.gameType}`); // TODO: Remove

            if ('player' === App.role) {
                // Remove curGame from all the game buttons
                App.gameButtons.forEach(gameButton => {
                    gameButton.removeAttribute('curGame');
                });

                // Set curGame for clicked game button
                document.getElementById(data.gameType).setAttribute('curGame', true);
            }
        },

        onError: function (data) {
            Swal.fire({
                position: 'top',
                icon: 'error',
                title: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    // App
    const App = {
        gameId: '',
        socketId: '',
        name: '',
        role: '',
        gameType: '',
        gameButtons: [],

        init: function () {
            // Entry page
            this.toHome();

            // Bind events
            App.bindEvents();
        },

        bindEvents: function () {
            document.getElementById('btnJoinGame').addEventListener('click', App.onJoinClick);
            document.getElementById('btnCreateGame').addEventListener('click', App.onCreateClick);
        },

        onJoinClick: function () {
            console.log('Clicked "Join A Game"'); // TODO: Remove

            const name = document.getElementById('name').value;
            if ('' === name) {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Please enter a name.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }
            if ('' === document.getElementById('joinGameCode').value) {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Please enter a game code.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            // Get the game code
            const gameId = document.getElementById('joinGameCode').value

            IO.socket.emit('joinGame', { gameId: gameId, name: name });
        },

        onCreateClick: function () {
            console.log('Clicked "Create A Game"'); // TODO: Remove

            const name = document.getElementById('name').value;
            if ('' === name) {
                Swal.fire({
                    position: 'top',
                    icon: 'error',
                    title: 'Please enter a name.',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            IO.socket.emit('createGame', { name: name });
        },

        onGameButtonClick: function () {
            console.log(`Clicked ${this.id}`); // TODO: Remove

            // Remove curGame from all the game buttons
            App.gameButtons.forEach(gameButton => {
                gameButton.removeAttribute('curGame');
            });

            // Set curGame for clicked game button
            this.setAttribute('curGame', true);

            // Set App gameType
            App.gameType = this.id;

            // Tell server different game type
            IO.socket.emit('gameTypeChanged', { gameId: App.gameId, gameType: App.gameType });
        },

        toHome: function () {
            document.getElementById('currentScreen').innerHTML = document.getElementById('introTemplate').innerHTML
        },

        toLobby: function (data) {
            App.gameId = data.gameId;
            App.socketId = data.socketId;
            App.name = data.name;
            App.role = data.role;

            // Update current html
            document.getElementById('currentScreen').innerHTML = document.getElementById('lobbyTemplate').innerHTML

            // Return home button
            document.getElementById('btnReturnHome').addEventListener('click', () => window.location.reload());

            // Share game code
            document.getElementById('gameCode').value = App.gameId;
            new ClipboardJS('#copyGameCode');

            // Init game buttons
            App.gameButtons = Array.from(document.getElementsByClassName('gameBtn'));

            // Only host can start game
            if ('host' === App.role) {
                // Game button clicks change gameType
                App.gameButtons.forEach(gameButton => {
                    gameButton.addEventListener('click', App.onGameButtonClick);
                });

                // Default game is random
                const defaultGameIndex = Util.getRandomInt(App.gameButtons.length);
                App.gameButtons[defaultGameIndex].click();
            }
            else {
                // Game buttons disabled
                App.gameButtons.forEach(gameButton => {
                    gameButton.disabled = true;
                });

                // Start game disabled
                document.getElementById('btnStartGame').disabled = true;
            }
        },

        toGame: function (data) {
            // TODO: Finish implementing
            // Load game
            // $.getScript("js/games/{GAME}.js", function (data, textStatus, jqxhr) { });
        }
    };

    // Util
    const Util = {
        makeUL: function (array) {
            // Create the list element:
            const list = document.createElement('ul');

            for (var i = 0; i < array.length; i++) {
                // Create the list item:
                var item = document.createElement('li');

                // Set its contents:
                item.appendChild(document.createTextNode(array[i]));

                // Add it to the list:
                list.appendChild(item);
            }

            // Finally, return the constructed list:
            return list;
        },

        // Max is exclusive so it's [0, max)
        // And since it's integer, it's [0, max-1]
        getRandomInt: function (maxExclusive) {
            return Math.floor(Math.random() * maxExclusive);
        }
    };

    IO.init();
    App.init();
}($));
