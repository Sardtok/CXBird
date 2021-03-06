﻿window.cxbird = window.cxbird || {};

//RequestAnimationFrame polyfill
(function (window) {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}(window));

(function (cxbird, window) {
    var barSpeed = 0.01,
        g = 0.00015,
        floor = 92,
        playerWidth = 10,//must match server size of player for correct crash-detection
        playerHeight = 10,
        playerRadius = playerWidth / 2,
        playerImg = new Image();
    playerImg.src = '../../img/cxLogo.png';

    //constructor
    cxbird.Game = function (ctx, gameService) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.timer = null;
        this.gameService = gameService;
        this.background = new cxbird.Background(gameService.theme);
        this.xScale = 8.0;
        this.yScale = 6.0;
        this.time = Date.now();
    };

    cxbird.Game.prototype.start = function () {
        var self = this;
        this.render();
        //setInterval(function () { self.render() }, 0);
    };

    cxbird.Game.prototype.stop = function () {
        window.cancelAnimationFrame(this.timer);
        //clearInterval(this.timer);
    };

    cxbird.Game.prototype.render = function () {
        var ctx = this.ctx,//.getContext('2d');
            i, p, pl = this.gameService.players.playing,
            bars = this.gameService.bars,
            now = Date.now(),
            dt = now - this.time,
            self = this;
        this.timer = window.requestAnimationFrame(function() { self.render(); });

        this.time = now;
        //this.renderBackground(ctx);
        this.background.update(dt);
        this.background.draw(ctx);
        for (i = 0; i < pl.length; i++) {
            pl[i].ys += dt * g;
            pl[i].y += dt * pl[i].ys;
            pl[i].life += dt;
            if (pl[i].y < 0) {
                pl[i].y = 0;
                pl[i].ys = 0;
            } else if (pl[i].y > floor - playerHeight) {
                pl[i].y = floor - playerHeight;
                pl[i].ys = 0;
            }
            this.renderPlayer(pl[i], ctx, dt);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'red';
        for (i = 0; i < bars.length; i++) {
            bars[i].x -= dt * barSpeed;
            this.renderBar(bars[i], ctx);
        }
    };


    cxbird.Game.prototype.renderPlayer = function (p, ctx, dt) {
        var x = p.x * this.xScale,
            y = p.y * this.yScale,
            w = playerWidth * this.xScale,
            h = playerHeight * this.yScale;
        ctx.fillStyle = p.color;
        if (p.life < 0) {
            ctx.globalAlpha = 1.0 + (p.life % 500) * 0.0025;
        } else {
            ctx.globalAlpha = 1;
        }

        if (!p.canvas) {
            this.addPlayerBlob(p);
        }

        //leader shirt
        if (p.rank == 1) {
            ctx.save();
            ctx.translate(x + w/2,y + h/2);
            ctx.scale(w / h, 1);
            ctx.beginPath();
            ctx.arc(0, 0, h / 2 -1, 0, 2 * Math.PI, false);
            ctx.strokeStyle = 'rgba(255,255,0,0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        if(p.score>1) {
            if(!p.flame) {
                p.flame = new cxbird.Flame(x, y, w/2);
            }
            p.flame.x = x+w/2;
            p.flame.y = y+h/2;
            p.flame.update(dt);
            p.flame.draw(ctx);
        }
        ctx.drawImage(p.canvas, x, y, w, h);

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
            c.data[i] = Math.floor(c.data[i] * rgb.r / 256);
            c.data[i + 1] = Math.floor(c.data[i + 1] * rgb.g / 256);
            c.data[i + 2] = Math.floor(c.data[i + 2] * rgb.b / 256);
        }
        ctx.putImageData(c, 0, 0);
    }


    var leafRight = "'",
        leafLeft = ",",
        floralBase = "}",
        rose = "@",
        blur = 1,

        green = '#3d9943',
        greenShadow = '#335d36',
        darkGreen = '#054b0a',
        darkGreenShadow = '#033507',
        red = '#a71a1a',
        redShadow = '#7b0e0e';

    function drawRose(ctx) {
        var posX = 0, posY=0;
        ctx.fillStyle = red;
        ctx.shadowColor = redShadow;
        ctx.fillText(rose, posX, posY);
        posX += ctx.measureText(rose).width;

        ctx.fillStyle = darkGreen;
        ctx.shadowColor = darkGreenShadow;
        ctx.fillText(floralBase, posX, posY);
        posX += ctx.measureText(floralBase).width;

        ctx.fillStyle = green;
        ctx.shadowColor = greenShadow;
        ctx.fillText('-', posX, posY);
        posX += ctx.measureText('-').width;

        ctx.fillStyle = darkGreen;
        ctx.shadowColor = darkGreenShadow;
        ctx.fillText(leafRight, posX, posY);
        posX += ctx.measureText(leafRight).width;

        ctx.fillStyle = green;
        ctx.shadowColor = greenShadow;
        ctx.fillText('--', posX, posY);
        posX += ctx.measureText('--').width;

        ctx.fillStyle = darkGreen;
        ctx.shadowColor = darkGreenShadow;
        ctx.fillText(leafLeft, posX, posY);
        posX += ctx.measureText(leafLeft).width;

        ctx.fillStyle = green;
        ctx.shadowColor = greenShadow;
        ctx.fillText('--', posX, posY);
        posX += ctx.measureText('--').width;

        ctx.fillStyle = darkGreen;
        ctx.shadowColor = darkGreenShadow;
        ctx.fillText(leafRight, posX, posY);
        posX += ctx.measureText(leafRight).width;

        ctx.fillStyle = green;
        ctx.shadowColor = greenShadow;
        ctx.fillText('----', posX, posY);
        posX += ctx.measureText('----').width;
    }

    cxbird.Game.prototype.renderBar = function (b, ctx) {
        var posX = 0,
            posY = 0;
        ctx.shadowOffsetX = posX + 2;
        ctx.shadowBlur = blur;
        ctx.font = "70px Georgia";
        //ctx.fillRect(b.x * this.xScale, 0, b.w * this.yScale, b.hy1 * this.yScale);
        //ctx.fillRect(b.x * this.xScale, b.hy2 * this.yScale, b.w * this.yScale, 100 * this.yScale);

        //
        ctx.save();
        ctx.translate(b.x * this.xScale + 48, b.hy1 * this.yScale + 5);
        ctx.rotate(-Math.PI/2);
        drawRose(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(b.x * this.xScale + 10, b.hy2 * this.yScale - 5);
        ctx.rotate(Math.PI/2);
        drawRose(ctx);
        ctx.restore();
    };


    function CXPlayer() {
        this.x = 0;
        this.y = 0;
    }

}(window.cxbird, window));
