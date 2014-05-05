﻿(function(angular){
    Array.prototype.getById=function(id) {
        var i, j;
        for(i = 0; i < this.length; i++){
            if(this[i].id==id) {
                return this[i];
            }
        }
        return null;
    };
    Array.prototype.removeById=function(id) {
        var i, j;
        for(i = 0; i < this.length; i++){
            if(this[i].id == id) {
                this.splice(i,1);
                return;
            }
        }
    };

    angular.module('app')
        .service('$game', ['$socket', function($socket) {


            var game = {
                    me: {
                            id: 0,
                            handle:'',
                            highscore:0,
                            img: ''
                        },
                    players: {
                        all: [],
                        online:[],
                        count: 0,
                    },
                    bars: [],
                    watchGame: function(){
                        $socket.emit('watch');    
                    },
                    fly: function(){
                        $socket.emit('fly',{});
                    }
                };

            $socket.on('join', function(users) {
                var i, u, players = game.players;
                for(i=0;i<users.length;i++){
                    u=players.all.getById(users[i].id);
                    if (u) {
                        u.online=true;
                        if(!players.online.getById(users[i].id)) {
                            players.all.push(users[i]);
                        }
                    } else {
                        players.all.push(users[i]);
                        if(users[i].online){
                            players.online.push(users[i]);
                        }
                    }
                }
            });

            $socket.on('leave', function(users){
                var i, u, players = game.players;
                for(i = 0; i < users.length;i++){
                    u=players.all.getById(users[i].id);
                    if (u) {
                        u.online = false;
                        players.online.removeById(users[i].id);
                    }
                }
            });

            $socket.on('updatePlayer', function(user){
                var players = game.players,
                    u=players.all.getById(users[i].id);
                if(u) {
                    u.handle = user.handle;
                    u.highscore = user.highscore;
                    u.img = user.img;
                }
            });
            $socket.on('move', function(data){
                var i, u, players = game.players,
                    users = data.p,
                    bars = data.b;
                for(i = 0; i < users.length; i++){
                    u=players.online.getById(users[i].id);
                    if (u) {
                        u.x=users[i].x;
                        u.y=users[i].y;
                        u.score = users[i].score;
                        u.life = users[i].life;
                    }
                }
                game.bars = bars;
            });

            return game;
        }]);

}(angular));