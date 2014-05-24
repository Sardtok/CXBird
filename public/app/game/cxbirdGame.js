﻿window.cxbird = window.cxbird || {};
(function (cxbird) {
    var playerWidth = 10,//must match server size of player for correct crash-detection
        playerHeight = 10,
        playerRadius = playerWidth / 2,
        playerImg = new Image();
    playerImg.src = '../../img/computasLogoMask.png';

    //constructor
    cxbird.Game = function (ctx, gameService) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.timer = null;
        this.gameService = gameService;
        this.background = new cxbird.Background(ctx);
        this.xScale = 6.4;
        this.yScale = 4.8;
        this.time = Date.now();
    };

    cxbird.Game.prototype.start = function () {
        var self = this;
        this.timer = setInterval(function () { self.render() }, 0);
    };

    cxbird.Game.prototype.render = function () {
        var ctx = this.ctx;//.getContext('2d');
        var i, p, pl = this.gameService.players.playing,
            bars = this.gameService.bars,
            dt = Date.now() - this.time;
        //this.renderBackground(ctx);
        this.background.update(dt);
        this.background.draw(ctx);
        for (i = 0; i < pl.length; i++) {
            this.renderPlayer(pl[i], ctx);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'red';
        for (i = 0; i < bars.length; i++) {
            this.renderBar(bars[i], ctx);
        }

    };

    cxbird.Game.prototype.renderBackground = function (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    cxbird.Game.prototype.renderPlayer = function (p, ctx) {
        ctx.fillStyle = p.color;
        if (p.life < 0) {
            ctx.globalAlpha = 1.0 + (p.life % 500) * 0.0025;
        } else {
            ctx.globalAlpha = 1;
        }

        if (!p.canvas) {
            this.addPlayerBlob(p);
        }

        ctx.drawImage(p.canvas, p.x * this.xScale, p.y * this.yScale, playerWidth * this.xScale, playerHeight * this.yScale);


    };

    cxbird.Game.prototype.addPlayerBlob = function (player) {
        player.canvas = document.createElement('canvas');
        player.canvas.width = playerWidth * this.xScale;
        player.canvas.height = playerHeight * this.yScale;
        var ctx = player.canvas.getContext('2d'),
            a = ctx.drawImage(playerImg, 0, 0, player.canvas.width, player.canvas.height),
            c = ctx.getImageData(0, 0, player.canvas.width, player.canvas.height),
            l = playerWidth * this.xScale * playerHeight * this.yScale * 4,
            rgb = new RGBColor(player.color);

        for (var i = 0; i < l; i += 4) {
            c.data[i] = rgb.r;
            c.data[i + 1] = rgb.g;
            c.data[i + 2] = rgb.b;
        }
        ctx.putImageData(c, 0, 0);
    }


    cxbird.Game.prototype.renderBar = function (b, ctx) {
        ctx.fillRect(b.x * this.xScale, 0, b.w * this.yScale, b.hy1 * this.yScale);
        ctx.fillRect(b.x * this.xScale, b.hy2 * this.yScale, b.w * this.yScale, 100 * this.yScale);
    };


    function CXPlayer() {
        this.x = 0;
        this.y = 0;
    }

}(window.cxbird));