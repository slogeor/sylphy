(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TURN_FACTOR = 30; // 方块每一贞旋转的角度值

var isRotating = false;

function Fudge() {
    this.i = 0;
    this.canvas = this.createCanvas();
    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage, true);
    this.stage.autoClear = true;
    this.ctx = this.canvas.getContext('2d');
    this.configDisplayScale();
    this.size = this.canvas.width / 18;
    this.scale = this.canvas.width / 1242;
    this.step = 4 * this.scale;
    this.init();
}

Fudge.prototype.init = function() {
    this.logo = new createjs.Shape();
    this.logo.graphics.beginBitmapFill(loader.getResult("logo"), 'no-repeat');
    this.logo.graphics.drawRect(0, 0, 88, 88);
    this.logo.setTransform(this.canvas.width / 2 - this.size / 2 - 1, this.canvas.height / 2 - this.size / 2 - 1, (this.size + 2) / 88, (this.size + 2) / 88);

    this.center = new createjs.Shape();
    this.center.graphics.beginBitmapFill(loader.getResult("centerBlock"), 'no-repeat');
    this.center.graphics.drawRect(0, 0, 88, 88);
    this.center.setTransform(-this.size / 2 - 1, -this.size / 2 - 1, (this.size + 2) / 88, (this.size + 2) / 88);
    this.createContainer();
    this.createOtherAreas();
    this.reset();
    this.stage.update();
    createjs.Ticker.setFPS(60); // in ms, so 50 fps
}

Fudge.prototype.log = function(msg) {
    $.ajax({
        type: 'POST',
        url: '/errorlog',
        timeout: 10000,
        dataType: "json",
        data: {
            msg: msg
        },
        cache: false,
        success: function() {},
        error: function() {}
    });
}

Fudge.prototype.bomb = function(x, y) {
    var self = this;
    var data = {};

    if (this.displayScale == 1) {
        data = {
            images: [loader.getResult("sprite1")],
            frames: {
                width: 50,
                height: 50,
                count: 6,
                regX: 50,
                regY: 50
            },
            animations: {
                bomb: [1, 5, 'bomb', 0.3]
            }
        };
    } else if (this.displayScale <= 2) {
        data = {
            images: [loader.getResult("sprite2")],
            frames: {
                width: 100,
                height: 100,
                count: 6,
                regX: 100,
                regY: 100
            },
            animations: {
                bomb: [1, 5, 'bomb', 0.3]
            }
        };
    } else {
        data = {
            images: [loader.getResult("sprite")],
            frames: {
                width: 150,
                height: 150,
                count: 6,
                regX: 150,
                regY: 150
            },
            animations: {
                bomb: [1, 5, 'bomb', 0.3]
            }
        };
    }

    var spriteSheet = new createjs.SpriteSheet(data);
    var player = new createjs.Sprite(spriteSheet, "bomb");
    player.x = x;
    player.y = y;
    this.stage.addChildAt(player, 0);
    player.addEventListener('animationend', function(event) {
        self.stage.removeChild(event.target);
    });
}

Fudge.prototype.createOtherAreas = function() {
    var self = this;
    var fontSize = '38';

    self.fingerprint = new createjs.Bitmap(loader.getResult("fingerprint"));
    self.fingerprint.x = self.canvas.width / 2 - self.fingerprint.image.width / 2 * self.scale;
    self.fingerprint.y = self.canvas.height * .8;
    self.fingerprint.scaleX = self.scale;
    self.fingerprint.scaleY = self.scale;
    self.fingerprint.addEventListener("mousedown", function() {
        if (self.tips.alpha) {
            $.ajax({
                type: 'POST',
                url: '/follow',
                timeout: 10000,
                dataType: "json",
                cache: false,
                success: function(res) {},
                error: function(e) {}
            });
            self.tips.alpha = 0;
            self.start();
        } else {
            if (!isRotating) {
                isRotating = true;
            }
        }
    });

    self.tips = new createjs.Text("点击指纹旋转，同色金属块消除\n点击开始", "normal " + parseInt(38 * self.scale, 10) + "px Arial", "#FFFFFF");
    self.tips.textAlign = "center";
    self.tips.x = self.canvas.width / 2;
    self.tips.y = self.canvas.height * .75;


    self.source = new createjs.Bitmap(loader.getResult("source"));
    self.source.scaleX = self.scale;
    self.source.scaleY = self.scale;
    self.source.x = (500 - 391) * self.scale;
    self.source.y = 0;

    self.scoreField = new createjs.Text("得分：0", "bold " + parseInt(38 * self.scale, 10) + "px Arial", "#FFFFFF");
    self.scoreField.textAlign = "center";
    self.scoreField.x = 250 * self.scale;
    self.scoreField.y = 20 * self.scale;

    self.profilePic = new createjs.Shape();
    self.profilePic.graphics.beginBitmapFill(loader.getResult("profilePic"), 'no-repeat');
    self.profilePic.graphics.drawCircle(90, 90, 90);
    self.profilePic.graphics.setStrokeStyle(6).beginStroke("#FFFFFF").drawCircle(90, 90, 90);
    self.profilePic.setTransform(20 * self.scale, -6 * self.scale, self.scale / 2, self.scale / 2);

    var container = this.container = new createjs.Container();
    container.x = self.canvas.width - 500 * self.scale;
    container.y = self.canvas.height * .15;
    container.addChild(self.profilePic, self.scoreField, self.source);
}

Fudge.prototype.reset = function() {
    this.stage.removeAllChildren();
    this.createContainer();
    this.stage.addChild(this.container);
    this.stage.addChild(this.fingerprint, this.tips);
    this.tips.alpha = 1;
    if (this.scoreField) {
        this.scoreField.text = '得分：0';
    }
    this.before = [this.group.y, this.group.x, this.group.y, this.group.x];
    this.after = [this.group.y, this.group.x, this.group.y, this.group.x];
    this.list = [
        [],
        [],
        [],
        []
    ];
    this.stage.update();
}

Fudge.prototype.start = function() {
    var self = this;
    //this.startTime = new Date();
    this.createABlock();

    this.listener = createjs.Ticker.addEventListener("tick", function() {
        self.tick.call(self);
    });
}

Fudge.prototype.gameOver = function(isComplete) {
    var self = this;

    $.ajax({
        type: 'POST',
        url: '/gameover',
        timeout: 10000,
        dataType: "json",
        data: {
            score: this.scoreField.text.match(/\d+/)[0],
            id: globalConfig.items[this.i].id
        },
        cache: false,
        success: function(res) {
            if (res && res.code === 0) {
                Draw.gameover(res.content.score, isComplete);
                if (res.content.score < 10) {
                    $.ajax({
                        type: 'POST',
                        url: '/getScheme',
                        timeout: 10000,
                        dataType: "json",
                        data: {
                            id: 0
                        },
                        cache: false,
                        success: function(res) {
                            if (res && res.code === 0) {
                                if (res.content.length != 0) {
                                    globalConfig.items = res.content;
                                }
                            } else {
                                alert('游戏再次开始时服务器开小差了，请稍后再试');
                                location.reload();
                            }
                        },
                        error: function(e) {
                            alert('网络异常，请稍后再试');
                            location.reload();
                        }
                    });
                }
            } else {
                JSON.stringify && typeof res == 'object' && self.log(JSON.stringify(res));
                alert('游戏结束时服务器开小差了，请稍后再试');
                location.reload();
            }
            // TODO
            self.reset();
        },
        error: function(e) {
            alert('网络异常，请稍后再试');
            location.reload();
        }
    });
    this.i = 0;
    createjs.Ticker.removeEventListener("tick", this.listener);
}

Fudge.prototype.createContainer = function() {
    this.group = new createjs.Container();
    this.group.addChild(this.center);
    this.group.x = this.canvas.width / 2;
    this.group.y = this.canvas.height / 2;
    this.stage.addChild(this.group, this.logo);
}

Fudge.prototype.appendContainer = function(obj) {
    this.group.addChild(obj);
}

Fudge.prototype.removeChildContainer = function(obj) {
    this.group.removeChild(obj);
}

Fudge.prototype.createABlock = (function() {

    return function() {

        var block, g, direction;
        var items = globalConfig.items;
        var color;

        if (!items[this.i]) {
            return;
        }

        block = this.block = new createjs.Shape();
        g = block.graphics;
        color = this.getRandomColor(g, items);
        block.step = this.step + items[this.i].speed * this.scale;
        block.direction = direction = this.getRandomDirection();
        block.sign = color; // 添加标示，为区别不同的块
        g.setStrokeStyle(1).beginStroke("#cccccc");
        g.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
        g.endFill();
        switch (direction) {
            case 0:
                block.x = this.canvas.width / 2;
                block.y = this.canvas.height / 2 - 7 * this.size;
                break;
            case 90:
                block.x = this.canvas.width / 2 + 7 * this.size;
                block.y = this.canvas.height / 2;
                break;
            case 180:
                block.x = this.canvas.width / 2;
                block.y = this.canvas.height / 2 + 7 * this.size;
                break;
            case 270:
                block.x = this.canvas.width / 2 - 7 * this.size;
                block.y = this.canvas.height / 2;
                break;
        }

        this.stage.addChild(block);

        if (this.i > 0 && this.i % 50 == 40) {
            $.ajax({
                type: 'POST',
                url: '/getScheme',
                timeout: 10000,
                dataType: "json",
                data: {
                    id: items[items.length - 1].id
                },
                cache: false,
                success: function(res) {
                    if (res && res.code === 0) {
                        if (res.content.length != 0) {
                            globalConfig.items = items.concat(res.content);
                        }
                    } else {
                        JSON.stringify && typeof res == 'object' && self.log(JSON.stringify(res));
                        alert('游戏进行中服务器开小差了，请稍后再试');
                    }
                },
                error: function(e) {
                    alert('网络异常，请稍后再试');
                }
            });
        }

        this.i++;

        return block;
    }

})();

Fudge.prototype.getRandomColor = function(shape, items) {
    if (items[this.i].color == 1) {
        shape.beginLinearGradientFill(["#FFF", "#cc9933", "#FFF"], [0, 0.5, 1], -this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
    } else if (items[this.i].color == 2) {
        shape.beginLinearGradientFill(["#999999", "#FFF", "#999999"], [0, 0.5, 1], -this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
    } else if (items[this.i].color == 3) {
        shape.beginFill('#666666');
    } else if (items[this.i].color == 4) {
        shape.beginLinearGradientFill(["#996666", "#ffcccc", "#996666"], [0, 0.5, 1], -this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
    } else if (items[this.i].color == 5) {
        shape.beginLinearGradientFill(["#996633", "#ffcc99", "#996633"], [0, 0.5, 1], -this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
    }
    return items[this.i].color;
};

Fudge.prototype.getRandomDirection = function() {
    var directions = [0, 90, 180, 270], // 0上 90右 180下 270左
        randomNum = parseInt(Math.random() * directions.length);
    return directions[randomNum];
}

Fudge.prototype.tick = function(event) {

    var temp = 0;
    var self = this;

    if (isRotating) {
        this.group.rotation += TURN_FACTOR;
        if (this.group.rotation % 90 == TURN_FACTOR) {
            temp = this.list[3];
            this.list[3] = this.list[2];
            this.list[2] = this.list[1];
            this.list[1] = this.list[0];
            this.list[0] = temp;
            this.after[0] = this.group.y - this.list[0].length * self.size;
            this.after[1] = this.group.x + this.list[1].length * self.size;
            this.after[2] = this.group.y + this.list[2].length * self.size;
            this.after[3] = this.group.x - this.list[3].length * self.size;
        }
        if (this.group.rotation % 90 == 0) {
            isRotating = false;
            this.stage.removeChild(this.group);
            this.createContainer();

            this.list.forEach(function(item, i) {
                if (i == 0) {
                    item.forEach(function(t, p) {
                        t.x = 0;
                        t.y = -(p + 1) * self.size;
                        self.appendContainer(t);
                    });
                    self.before[0] = self.group.y - self.list[0].length * self.size;
                } else if (i == 1) {
                    item.forEach(function(t, p) {
                        t.x = (p + 1) * self.size;
                        t.y = 0;
                        self.appendContainer(t);
                    });
                    self.before[1] = self.group.x + self.list[1].length * self.size;
                } else if (i == 2) {
                    item.forEach(function(t, p) {
                        t.x = 0;
                        t.y = (p + 1) * self.size;
                        self.appendContainer(t);
                    });
                    self.before[2] = self.group.y + self.list[2].length * self.size;
                } else if (i == 3) {
                    item.forEach(function(t, p) {
                        t.x = -(p + 1) * self.size;
                        t.y = 0;
                        self.appendContainer(t);
                    });
                    self.before[3] = self.group.x - self.list[3].length * self.size;
                }
            });

        }

    }
    if (this.list[0].length < 7 && this.list[1].length < 7 && this.list[2].length < 7 && this.list[3].length < 7) {

        switch (this.block.direction) {
            case 0:
                if (isRotating) {
                    this.block.y = this.block.y + this.block.step;
                } else {
                    if (this.block.y < this.before[0] - this.size) {
                        this.block.y = this.block.y + this.block.step;
                    } else {
                        if (this.list[0].length && this.block.y > this.group.y - this.list[0].length * self.size) {
                            self.gameOver();
                        } else {

                            if (this.list[0].length >= 1 && this.block.sign == this.list[0][this.list[0].length - 1].sign) {
                                this.removeChildContainer(this.list[0].pop());
                                this.stage.removeChild(this.block);
                                this.before[0] = this.before[0] + this.size;
                                this.scoreField.text = this.scoreField.text.replace(/(\d+)/, function(num) {
                                    return ++num;
                                });
                                this.bomb(this.block.x + 1.2 * this.size, this.block.y + this.size);
                                if (this.i >= 299) {
                                    this.gameOver(true);
                                }
                            } else {
                                this.list[0].push(this.block);

                                this.before[0] = this.before[0] - this.size;
                                this.block.x = 0;
                                this.block.y = -this.list[0].length * this.size;

                                this.appendContainer(this.block);
                            }
                            if (this.list[0].length < 7) {
                                this.createABlock();
                            }
                        }
                    }
                }
                break;
            case 90:
                if (isRotating) {
                    this.block.x = this.block.x - this.block.step;
                } else {
                    if (this.block.x > this.before[1] + this.size) {
                        this.block.x = this.block.x - this.block.step;;
                    } else {

                        if (this.list[1].length && this.block.x < this.group.x + this.list[1].length * self.size) {
                            self.gameOver();
                        } else {
                            if (this.list[1].length >= 1 && this.block.sign == this.list[1][this.list[1].length - 1].sign) {
                                this.removeChildContainer(this.list[1].pop());
                                this.stage.removeChild(this.block);
                                this.before[1] = this.before[1] - this.size;
                                this.scoreField.text = this.scoreField.text.replace(/(\d+)/, function(num) {
                                    return ++num;
                                });
                                this.bomb(this.block.x + 1.2 * this.size, this.block.y + this.size);
                                if (this.i >= 299) {
                                    this.gameOver(true);
                                }
                            } else {

                                this.list[1].push(this.block);

                                this.before[1] = this.before[1] + this.size;
                                this.block.x = this.list[1].length * this.size;
                                this.block.y = 0;

                                this.appendContainer(this.block);
                            }
                            if (this.list[1].length < 7) {
                                this.createABlock();
                            }
                        }
                    }
                }

                break;
            case 180:
                if (isRotating) {
                    this.block.y = this.block.y - this.block.step;
                } else {
                    if (this.block.y > this.before[2] + this.size) {
                        this.block.y = this.block.y - this.block.step;
                    } else {
                        if (this.list[2].length && this.block.y < this.group.y + this.list[2].length * self.size) {
                            self.gameOver();
                        } else {
                            if (this.list[2].length >= 1 && this.block.sign == this.list[2][this.list[2].length - 1].sign) {
                                this.removeChildContainer(this.list[2].pop());
                                this.stage.removeChild(this.block);
                                this.before[2] = this.before[2] - this.size;
                                this.scoreField.text = this.scoreField.text.replace(/(\d+)/, function(num) {
                                    return ++num;
                                });
                                this.bomb(this.block.x + 1.2 * this.size, this.block.y + this.size);
                                if (this.i >= 299) {
                                    this.gameOver(true);
                                }
                            } else {

                                this.list[2].push(this.block);

                                this.before[2] = this.before[2] + this.size;
                                this.block.x = 0;
                                this.block.y = this.list[2].length * this.size;

                                this.appendContainer(this.block);
                            }
                            if (this.list[2].length < 7) {
                                this.createABlock();
                            }
                        }
                    }
                }

                break;
            case 270:
                if (isRotating) {
                    this.block.x = this.block.x + this.block.step;
                } else {
                    if (this.block.x < this.before[3] - this.size) {
                        this.block.x = this.block.x + this.block.step;
                    } else {
                        if (this.list[3].length && this.block.x > this.group.x - this.list[3].length * self.size) {
                            self.gameOver();
                        } else {
                            if (this.list[3].length >= 1 && this.block.sign == this.list[3][this.list[3].length - 1].sign) {
                                this.removeChildContainer(this.list[3].pop());
                                this.stage.removeChild(this.block);
                                this.before[3] = this.before[3] + this.size;
                                this.scoreField.text = this.scoreField.text.replace(/(\d+)/, function(num) {
                                    return ++num;
                                });
                                this.bomb(this.block.x + 1.2 * this.size, this.block.y + this.size);
                                if (this.i >= 299) {
                                    this.gameOver(true);
                                }
                            } else {
                                this.list[3].push(this.block);

                                this.before[3] = this.before[3] - this.size;
                                this.block.x = -this.list[3].length * this.size;
                                this.block.y = 0

                                this.appendContainer(this.block);
                            }
                            if (this.list[3].length < 7) {
                                this.createABlock();
                            }
                        }
                    }

                }
                break;
        }

    } else {
        self.gameOver();
    }

    this.stage.update(event);
}

Fudge.prototype.displayScale = 1;
Fudge.prototype.createCanvas = function() {
    var viewport = document.getElementsByClassName('viewport')[0];
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', window.innerWidth < viewport.clientWidth ? window.innerWidth : viewport.clientWidth);
    canvas.setAttribute('height', window.innerHeight);
    viewport.appendChild(canvas);
    return canvas;
}


Fudge.prototype.configDisplayScale = function() {
    var backingStorePixelRatio, devicePixelRatio, height, prevDisplayScale, width;
    prevDisplayScale = this.displayScale;
    devicePixelRatio = window.devicePixelRatio || 1;
    backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 1;
    this.displayScale = devicePixelRatio / backingStorePixelRatio;
    if (this.displayScale !== prevDisplayScale) {
        width = this.canvas.G__width || this.canvas.width;
        height = this.canvas.G__height || this.canvas.height;
        this.canvas.width = width * this.displayScale;
        this.canvas.height = height * this.displayScale;
        this.canvas.style.width = "" + width + "px";
        this.canvas.style.height = "" + height + "px";
        this.canvas.G__width = width;
        this.canvas.G__height = height;
    }
    return this;
};



module.exports = {
    Fudge: Fudge
}
},{}],2:[function(require,module,exports){
var Fudge = require('./Fudge.js').Fudge
var fingerprintbase64;
$(function() {
    var manifest = [{
            src: "images/bg.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "bg"
        }, {
            src: fingerprintbase64,
            type: createjs.AbstractLoader.IMAGE,
            id: "fingerprint"
        }, {
            src: "images/source-bitmap.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "source"
        }, {
            src: "images/block_center.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "centerBlock"
        }, {
            src: "images/logo.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "logo"
        }, {
            src: globalConfig.profilePic,
            type: createjs.AbstractLoader.IMAGE,
            id: "profilePic"
        },
        {
            src: "images/redenvelope.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/bottom.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/fingerprint.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/likeimage.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/crymitu.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/close.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/hmddc.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/hmjs.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/hszw.png",
            type: createjs.AbstractLoader.IMAGE
        }, {
            src: "images/sprite.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "sprite"
        }, {
            src: "images/sprite_2.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "sprite2"
        }, {
            src: "images/sprite_1.png",
            type: createjs.AbstractLoader.IMAGE,
            id: "sprite1"
        },
    ];
    window.loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", function() {
        $('.loadingmask').hide()
        window.fudge = new Fudge();
    });
    loader.addEventListener("progress", function(e) {
        var count = e.loaded * 100;
        $('.loadingmask .meter span').css('width', count + "%")
    });
    loader.loadManifest(manifest);

});
fingerprintbase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAAFACAMAAAASzuCzAAADAFBMVEUAAAAAAADh4uXi4+Xx8fHa2t3e3+LCwsW6u77f4OOys7Z+f4DDxMeOj5Hd3uHLzM9ycnS/v8LV1tnQ0dSqq64kJCS3uLu5ur2wsbShoqXV1tmIiYvNztGenqGamp3R0tXIycw/P0BPT1Db3N/Q0dPJys3ExcjW19rW19pnZ2msrbDa2t3S09bKy86Tk5bNzc28vL+kpaheX2C1trnv7+/m5ubS0tLt7e3u7u7q6urZ2t0vLzDn6Ojp6enb3N7s7Ozi4uKioqSAf4Ht7u7o6OhQUFDq6uru7u5ubnDu7u+9vb5CQkN/f4Kura9qaWzt7e6Ojo9jY2Sbmpzv7/Dx8vKlpaakpKbp6ep5eXvq6+udnJ7s7Oz09fbv7/Do6Ono6Onx8fGurq+jo6Wurq/MzM3GxseDg4VfX2H7/P2JiIv6+/xpaGtLS02xsbLY2Nni4+Pt7u6CgoSNjY/u7+9jY2ZsbG5/foHt7u6bm52RkZPV1daampze3t6JiYp7e33h4uLR0dLi4uKtra94eHuKioyoqKmampzq6+vP0NFsa26JiYuXlpl2dXjo6Oi6urutra5ram3Ozs/W1taRkZJ5eXvV1dZsa2+pqKrDxMW/v8Cnp6iurrCdnZ/c3d7Gxsfb29x/f4G0tLaSkpOjo6SZmZqysrSNjI+srK2op6rExMZ3d3r3+fq6uryTk5aSkZTPz9DMzM2lpaehoKK4uLtsbG/ExMa3uLl4eHt0dHe1tbby8vP9/v+zs7SqqauwsLKsrK6ysbOlpaeurrB0c3enp6l5eHvv7/B2dnmGhYi0tbbo6erU1dWLi43W1tfKysyYmJqTk5WQkJObm51/f4Jra26jo6WIiIvIyMnNzs/S0tTZ2tppaWz7/f7t7e6OjZBxcHR7en7r6+zk5OXg4OGWlZiBgYSdnZ99fIBubXD5+/uhoaPm5+f19vfx8fHi4uPd3d7Q0NHFxsfAwcK8vL6Dg4bb29yfn6He39/Dw8X2+Pm5ubtnZmm3t7nY2NlvbnK+vsBxGAgZAAAAunRSTlMaAI2Ka3iDVk+HSjBZNoBjLFNxaUMeS01IP24zZTw6a10hJX9mXlt2cylGfG1gOARRQSZKZR4IcFwXfiRNDHpSE7cQjkAsJHZBno8v1dOIR0M1GOm4pd/YcTmSLs7HmjTz4cvJkoNhT/Hw5qM96t/UrpGCf2dc7t3Vua6mmFc57NmurqahfXwp7NDJx8bCu7u5opNvTfLy7eqkVff0ysC+uZtkX1D22pX39ufb1PHkyHZwKfPk2Xr51Gkael4rAAA0J0lEQVR42tTZz4sSYRjA8XeK6BD9ggaKqHsRSB267MkFQdCRdcAQbyqsSHlQcllZtoO/IF0wUFhoOyyWawQt5GU7uGZrUQtBtUseq0PbQuelc8/sy+uMvq5I77wz4/dP+PA+zzuvIsFayY0rz6r5wIJdKTR/WLGYWlgI5KvPZhqyYK2swidfehrwhe68xX077M9hf6HfuJ2dnc/zxYVEdcYqjObzyc9yvtDzzc3Nd0rD+KAenyKo9LKYTcxMC+ZmMt/tmzl7cJNE8RE9iOgRPugXtJ4y1dBEPvlpPfwG2qT5Rh8+4FP9vkBr2VmTZtkcPqDzBbe23uAovdF8n3dUPNDDfV3LLppwCs3gu5oLb0Hj8UH06sP18SkVEqcEYzOaz3ahHmy1WpTeUD6Ae6L0m159NJ/S9+9r8RnBwAzls133xVpKIw7f8p1QyA4feYFEolyeJZUTiUR2IZUqzs8/GckHRbPGCRrId7UOdkfrLYNaoDxb8TrQiBzeyqw/kU0V14FPq0f4oE+fonGDptgovulXUrvdOoLvjh3cnA4RjZ/DmfTHU2vU4cN8UMFvxE1iDN/NdK09XG85FJh1eqfQfyW6nMl46iXFh4tmHwjc4883nQs2AY/iW1m25ysOkGNryhVJpNZfamcX1+123byPIHe+Rr3WHKIXDAUWQU6vxEi8sE7xQdH4LYFjnPkulZrQIJ9kz3uR7rn82QLF1/34cZXjDHPlexxu0nqSr+xAnJpKxguEr0v4ALAicIoj32Npm9ILBqq87FTBNe3hwxU4AXLjAzyiR/hW0lUvMiBXMhtV+XAHbi6AnPhuhrcH9FakvFdERuXyF6L9fAcHPHYgF75GaXtAL1ZaFJGhiZGMAkj0oL291XOCznHgk+vNAT0p4EQm5Iq7+/n2duO6fgdy4LPlatv9euG8A5mU6F/V8kFzfpugUzz4rgcxXk+vVBaRmSUzfXy7u26noEsc+OS0igcBHjwtzC6SwXqYD8roMME8+J7W+vXCFsCDxMiqeviU5pICYxz4GiWMR5KqIrJIALin8u3v768yvYR15qOvDMDLI0uVdKt80JxfYEh3vka4Dy8WsMTY9uV3Ax/2U1piOIB6872qAZ269HxOZMFcnl0N30/2DcjORy7cpqbSIrJokQzRA76fPxmuYB35rse0eLG89ea2l3jfTQ4f9P6FU2CLnc9W1+LV0l5k6VyZOZXv/YaH6RHCzieHNXjtYBlZvqS7xwctMQwwKx8ZXPJC81n86OFED+gRPoYBZufLYTiMF6yiCSnpJnrQhp8BgIXvdrqtyepbr38DEj7oQ2aMBag/nyxp8Gp5yzzRxur+i/c9vg9LsjAyHnxXYho9qYImrHtLRA964RVGxIPvcU2j53Ogycuz0ePrbFSEI+PBl9PgrVjs54HxB7jH1/lwXxg7dr46hsN/3lr2kTbGAIMe9ut4hKFx4LOlW2qlCbpxB5vKYL6O0l2bQMWD73ZJo+ez8BN3jDyED3pE+fHgmw6reJO69rQLkPCBH/WC059PllS92MQ8NI4u8lrRwz2k/HTmI3oTfmlou/e6g/vR+UH5MfLReltKLSXJibgmXj6NjMi1RPx+UH6sfLQe4Qs7EJeuXb148uyNE2eOH4POIwMS/9FyZqFNBGEAHjYk2Wy2uYlpepiaq4lJ0zYgIli1T0VBPDCI+ODtgygIoqioiCiK4oFaRcEHFY9HD0TEq1q8rbdWpWrriUett4jXpO2mm2T2mJntB74EC9lv//n/f/7Z7EZBn5w/en3QXoZh2tszR0Nev47JohLkY48bi7T1N0uwJ+2PXl/t1B57GjcsZs5ao2MQmEAuHkvn5157Qe/4Q9dfen2JDSJ7Gg5YiuwxEyNJP5CDvketMxkBGjEro+/vxkRv6EsMO6O9veposYGRpSw3Tpks9HazRg20YO/v31m9oW/cGYFz4zQqEmyYUSIGcqhgcvEbbZr4y+h7M1J7fSvPZNDGHnSnjKUQ5GBjEISTWvgT7L2B/jTWd0hkT4OVG3UwMuj8Ya8zYHU6fCAfK/pPAiX0+a9bH2SetvqqdmbsDaOuuTafSSrYYiGu1FYGZClm0PhZen+Cvvo6LfUd3paxR93vFXrRFx9g1XYinrhehw7BEG3/0m0P+qvWTt+YFPzdaJe9KZTjvWQNKuisrn643Y47gCzZxQVUA8CNgr676tpnoKplOSWwjc5en/75ERNz20iTAOdEZIFABc3+d03G30at9E3osVdHJc+f587rAXRUhCyaChxxtEvem7t3R2qjb0fG3gGaCZUnr1FxcNrsWvg8g3GK+VW3P8hMOn1C2cjo2wyIKenLZGPgbUAzKqy5tcRIPn+u77QHqa+m11ebytibAIjx5fa5UaAxrD/n9rDE7bOgD5YPan09ZYO84WN1yuWRnlInk0W5i7T9E/Q9nkWr71CjYC9FWnQLY0wWQaBEP3MJZw/BXUc4rPf79eGwt681xEZLFZd7KPs+hUjbl7vd+h7Po9NXcKARkn5JDXHRtTNZ+OR7kcJKa9gkswd2BDnZ0DVmCTS4Cctvt73H9REafQNSjQKEZaPKq7YkRqp4h4lRRX9rUjoQeUSo4zKzvtMeZE2CQt+EjL3FhFmPERMrBGiqXVY/g4fB6YkANFb6ABzZpQ8yklzf3gbB3hSyKYs1K2YkLqSA78+QUWNHB6HLQZ0BZ0F9XdSR6huTaoBAeYSJL2lR7sSq4LSZhv7oaTNroizBI9ZAc50Kj9YS6lvcIECU+CoZEX1LUb201cTQo+8DEMQZESxB+hOqh2z3AuSWroBi4iP6/ry6uDMpK9ahGkm3gWoBC+kP/qsj0VebEuylSPplcfpxAgRhSRn6mNXudpWaI/2EwWlZWSRiLnW5+WKHhHMHYoEGxdEPsOnq/uAKllm+QHnp3iMYFHDiq7QDBDzKm9PoKagG8pQVuXgvQqKeyx/xiCswhz08qO/0Jxx94OkrbBCYQDCaQlyW7MjdVO7zmAEGtmg8r17785JgVBzifbCHB2/SwAH009G4+hKZpTsFf+lWquhbjYyApdhtBiREPE5dTgR65GYVduxnX9LqIOePJzD1rWoQmAFwMSKfUUE+LWAIcDZAQ1Ug26C3SqZxD+Eu3/NQHeTixfF4+sYcIK+6IVHCSQJpeCevyeTFUy67qU6ayMeoI6E5+PT9s2fza7H0jWuEwJa5IYV7sCaud+UgC7MbuUrpMfvEIahjc8qYXjQqw1y+6+Cvt16/vnPn5VwcfaWZVwHvptinFSMyIgt6B7tBvIJz9tYxcQ+Fxcz5UN3Xr5cu3Tdj6Jva/UbgxmEU9njktN4GegnWIl0lAsT+Vny9dP/+tWtPbi1Ur29P16tt4dlQHflWw44uxh7Qa1QaJAMwTupvxD6o7tbNmy9uLFGrb8Ds9A+G0gYnkOc9FtHlYeirLir0sEZjMBgMGY2sp6Qoombmw4vbPCl/AYDD+LS627dffU8lVOpb+Tv9ShZocDJm3eAlvnxSFBY25Ud0+b5+HXLSHO9TgXHeEZTyZ8WqHmuhurf3GhpPHVKnr/bIr1+/f6cVbibu99xS43pe/uqN5TrlSbPaAW25SzIrY7Alre7MudNnZw9QpW/4v39fvnyBBqfizUhZCXtxdaNfG+uVVac6enoCUOdG1A/s/ce4M6dPn7z8+9eXY2r0jTn48+fnz9DgEbymxS1hz6HmmMhm1zPqqVRoYiT+p5ds/1s3G6r79+/zz+0DVOgb3vTgwadPUOF6gAOHtsdZELGA2DdgoNz8Jg3oGbefycAB9eyH6j49aGpqnq6sb+jqjuamJqjw4F6AwyDknU2qaBh82CPnIFAihox4TpRGgHqWbn/Q1Nzc8fDq1sGK+qZdv/qwo6O5uWkXwMGJXC9uxXRdEZCbIltqwmGHN31YbhDnxRKc9j2OvpteoJ7hUN31P4++fRykpG/on0ePrkODDzv2krUsRvTYj5XqM1AYvD53VVF1duUqs5V6eGfNIMbixvtGfcWdNVH5tc358+3jxx/t7csGK+jzP//x8dujR3+ubyIbj/qQn+qQzUZBAHV8yxaUAVLQBWQQJ2rsicrHtB/P29va3r27UiOvb/Cytvb2ToOjgHpcojuNWrl+TtW43iScfOMR9djQ9xQ5qBdVeBdQS2QZVHeltaVl7ABZfforV969a2trf74IYJApnHpknilXPImFGHwVABvBR/8+8v50Pf48TAYHRvi1trZcuHDhw4mBcvoSC1paW69AhW0cUeLjUFXOofy0pMlaAgiJdwsyyvozcaIPCdJf0SSoDvJ+opy+IR8+XLjQAhUux9hwuJENn0XOnl3ijIzmQFT3n7YzC22miuL46DjZ1yatzdKkaVKTNqm2dd+q4IaCqCiIuIOC+KCCD4LggiD6oqAguKDi8iIKKqLggooPgoq+uqAP6lNxV0Qrik4zd2y+87uZ795Ejy912qYz/3vPOf/zP+fOV4y6tZw2/JkfRrrMh863nZ1TI+C71Ad4iKBNVyCmS7oz8NxxJztKjYlgo5YjUrLYal2urJ9UzAPsLnQ72zs7F4yH7+JdgF/z7Z7WBAJpXXfR28/UVb427VhzdDlS1Hzv8Ancd/aGne3ATh8L35k7vu1CODOB6x6nu+lcisEK4E1nC0GFgcIQgTmjy/mrxjxoiN3nn39+yjj4Trxme3tn125amsB1U7qQk+LxBCjC0xi3c4bewdDcFj5tYLOX+tjt2rVHjYHvILU9dy6z0pepASVxw4hFKEQw3twozx+cSCTmVzcahVmLOcLSWFrl6orJdWN29rmyY8bAd4n/vV34rimbR1TdTXcIKTNufjxyC3FM6ca8UnyjYDYVspWKIPXA2zXmLs8OwXv99Uv18F0cwnuBDWHmTayjWGcDPTmubq0s9iMGcpuJtME5zWQK4RlbbYLp5zN97Hbt8yO18J0y/J5vdYuow/qxEl7rw8XENoCVm9CbCWG+Mm64AXyOXYQFjXbQME0e17we2I06+A67Vn33WXPWktR44gBpA5pWXJtB6xHYiRolG7mWxK/Jdevbdy4vCQHSwXfq68pOsRY1knwIxuQByAWa3MamL3JT7jg1eWFEZmH2MCUA7c8VQpdr4DszhM/8uJlL11XXmBpKkI9wGsjKknENfv1x8S9BlblprZwWQv88hfAdFnr2JUu2o1R5zbUk0GMJTBaLfDtTHVS7HnYmilx2gzxR2yFwNOy58w0KomsJ3znh5tsyFsHCvz46biecBFmjwwigbYl3Eo2V0YVvHNxpE95ERNOgCU8JTFMt90zVnRCjiwBf6LvXbNhWm+ua1a9zn+pZQsrjCfNiQ+8Am/MdyQd7ZeKnH4ZM4Bayex9j+MxL8F5H+u4FxlJVYa/sAXuld+q58iKS6n7ieEXO42aIn94Dqri3Nevod6b0Xkf6rmerFc1rGqlF0C6t587lcLrAahJN3wkY6FNqhWx+70OyhmMo0nsd6btlm4Eq98CZDY2D9PVuM8BMzKi5y2nj3spoW521YU+/qTIR0a9jm3sFfOH1S+3mWvZl2DmdUnD4uJzb2Qc8OKEFgKUoAZckf1ET/Sy999l94bs43JWsoO3blVU+C/v6qTYimJXN9cc7cErPnhMo0Eu2Q0P1EKcj94HvRnV1Oz4FfMch5Iyv4Q7HOd/pjqkfzIUk++tLrtBgLyTaGmGGPXof+C4JOTPqXftubxPPyOebG/VbFGDWkyHMVlr3nQNWnqVwMBsy5wtG4TtxW10905ncepoJlDJIGOS5wfThgkA5TS0snrzFlG3y2ApT7GEj8J2gLn5edSa2mg6OHng9n3oyo8yXQZ5AWpnHxaSlbJrYHqUuCr5TQjpo3+kHCa3olNMyfAhJGlZbLeZL1d5MtbRcLKcN5qkPwR/BLHpbYpXBnUTbyiX7iH7OvqHPFjMut6crNIsiL0J9wa46pOuilstGSLbcf8u67HEwsMIwhCF1uXQPvhNDIeuyKU6WaRb7EK3r5vZTqhfmx4nOsWWBoBxgLeoY08GaRe5pZocnCX7OaMW2XZ9mWILsTuu6Td16c9fQONBBCBL6PMuUjORmeuLk8GtGg58zGvquSZumiXhenoaE/wRAIDtkuPdIOWh8nwmWBH+ro+uIunJLJu10g9kw0J3xL3yXWoa+Od7VnMYDEHw4tEODqkfrrkY0ehNU1NoOMe1hkU1z7wjzU/BdY8n6XKpkM1zB8L5SCEi4jB+wnQ3XD9Vk4JZ7dS4umIrOsZClhPDd9bqyqt1MWJ07rUyQO9ETE/TDPct1Sx3/VFunijfl8nxNXbepXULq9CWkbbvDvplwsx2r4DsmhG/DrkPUhU+6Go5wKFw3skRfyAVPLN6UtlI5xINMqqu4PV3JWCHRKTHaxuxEqxMC+PZI86ZjYllN5mxy/foaP8uZ9FYP6XRWl/TvuO+j2MNyrYuV5s9KrNI4rhhto8TZGckcF7TsCs0ibrPi4Ka0WdWd/g2RfDNLca/yIE9h7KnRe+esiPMFCr5rjfrjlDnTe0/F7mRGU0hRXrK3RnNsxZddLzYQaHgb83KbZuzmDbY+V5JpAN+JYeiL/G16YBtYlfhTIMSQtKxtLmexDGtj2XyV0Shpdmh9W+krh/nwjUxnpMz0eU2F7oEgZEmNa9DWJrU1c/zSmuTRUwGEzNlo2DUdpt6Lh/AdHdYcZnLLoQRhiREmTsa1pk+a5V7OejcWzXWSLh0jISlBx+qc5eyzCrBjhvCFNPqSFavM4WICx6MwqeM7LgUTz1onNT5bMM8/WpDBb97uNTkXhFXGEL4wEd9gOElP2hKHN29SFMjsJWzisGCNnzFZc+kHObkhUbJE2il7qdfZS7yGio3H4ryK+FImCYvpNt8cQpM1fhkzolDFDojhmQwJVS/sVg7hC+Xnnl3NsYDQyzhXA6DB4yJor+ijTCFdS6+09hP/9qfnE5lV+UfjVtMG8TBZ7MJ3bJh4F+3mqpZkdvNQQcVELYsFro8fsm/EB7nQPwfxbEQUwX0LvF0IAgUpeTSsiHMjVJdP9OE79XNlZpx7gaV5GXF3ienO3etowXXzyO55jNbH9QSUHhdPHpgsakSIDgJJRjfUaWDpaxViF/vwHaG+vnbBKuY0o0hKA5vKT25UELbofqHr09wEhN/xcmyGvZUkGsQDvki1a9YuUpCd5MN3ivr6koLVOZgMljeNDluWwwZth5AWBSqxUdDciNe3LlOjKlA5KzCuFcXvYSg20loXbAd2hg/fDeprw8G+KrXFHHyohCu6npsnnE+KWr25tH9Ps+lUVYgEknBUmKHqdPIiIlCLU7FGotNlCrIzffguVV/fYDfIUpNVXB9i1ZZmtL3AeuoQjPcwQy9GHtgocYqvG0ldNuV+XLFKve5OYBf48D2r4LvMircw8XbwQx04B6R0qmwxvfKb2tKWVUm5f9PwQq2Wm5SLEbNpt3kKvkt8+K5VX5tRxk3yjwoCeBre4ml8t69rV+bHitFNXZFRRCTh8jqH0jG7kvJUbWZG6t8G9qwPn39Ketv/b+c4q0mW45CLVwHoBlWaGgnkqkNCmxjTYqEm58qLJXphi3+8LlNvxqbfUVTwXXGAc9iOsqrVFFoPcSkLQNOgpTFdLU99JB4VN4qa3eqKBRCrkkNnsChpQNlmVCOl4HvtAOfYb5XVrWhfCbxlE4AuYVSoQzcdsMDqRh9A1HnDAjZ1nCOaCYDMmNk22kOvKTvKuSuEL2PWpmOn1ds/bylpaqItXnKa0eF7oKkMujJ7t+mFy6juGii1XQvRoHKFgu9Y51SF3ncJK7kqI5NWDHJum1OxNabwNNyzub+CMUt32MId9rhtm6DSDU43LJkoxucr+O5yTgjDYMqKNcclDl1ww5nIpU1raH4Z2h+2H8O7fOp5liJlcMEWAmTTollZu8l/W8uuXeQco4A8P+pAB4vDdSkPDMCqOhDzu9SRZrC1+/vVK1xNQq5EdUgPZeICP1q04M3pC98N7ATniBA+M8WgDYmpAK1iVikwYDtrdKhFSCjr0V0+/EhKBj+X9Y2GN8sInrAQbgvXv/vF0E5yjlbw3WTWKIqhqZJF6bUkr2xo+mLLrMI26T2F8oKGJnsUIHuYp26QYi7JbdAkpdgwkVzu+SKwY5yj1T68sGYEH2cJGwiGBXUFt9YgmViQ/hyTed6do6CygpkfFwXi/Kg7IE15ch3KFr3KzXu+DKzqJEP40kZNOg6MboBU1SR8cQ18XUbqdVlVFFnn9kltlgU0qyR+Lv5+F/kF+S4CvkffD8xzkmofmsHX4u6bxzMqdy5CMMhQuWmJzKHrLpXAO+PM12W5emssO1ZlwnHliLRnNGS29PgQvG++8Rz3yy8t4NtkQ3luHHxxOIZHrQQ5tMK1ajuS73ZYeMTlr1WpLB6MOaF9NM75ouGp/Nbj3wS25cMX2MTwJbCyCyp1UAbhmBjSao0yMSd+e7ynptxrWxyqiuPKijOJLQ3h++qrrzwz+PhECQlfGfAtciirIoPoFmqOTSdSp3E8jJDOSgmoyt4GKk1MqdnYyqNfBeY5MRUFzTJvmhPshK8CJrgBYblFd24pd6KyvYqqkUqMCwY8i0KuA3ZDtmaWOr4PrOvkvvkmgO9QK/gWZVrl7usw9XUlfF04IdrAeBc0nC4nLqWQ1A9BOPRAkq1239eBVZ0tFQVva1g5b37/zjvD4ONiCAafLRQqpN4GSytPsJIGdlYRe93DXVtY4dHfAhs41RC+DavUMYiA71D2jtZlRdkifGnA19Bk7BU+dlV4eAH1wxxSeA58wcLS1/0Q2JrTVFHwtlUr+LqypOBoZFKj8ScinDeL2LekG+xwMRbZETRzFkriKvJ8DGTfwm697tfATnBOUlHwt4eNUjbPBKUUSWaAXOIsUEmmDsDX0lXYmzKfZKhBrslfY1/XRfE5KXyfBXaqc+r3yuJWRZsr4SuxQq9RJ8yJ+z8O8K3oDuBk5bU8m8BNWZEts9c2K7bBhIexz/0wQO+vi53Lv1b2qmGbV26tMuJKa6+wQ9nb2veDYoAvLYBBqCuhQxKXcaAkF7Qmb7owJXzKjnSO/E3ZK2aCFajsQggMMF6E0DmSDmPUn6k1H65pD6+hm7Sufy94j+GkIC5MCN/THyg70TnxB2VXOybWh+SSpYPl2G7YlJIfJYN0mAvpdHm519qciklKntKPCCcViBg29vCngT1wlHPYbQq+q+xeEV+UfpCClpfUbNv8eMGqED4QH7sqeXNMM/0tN22MGe/Q/wa+VxV8d/tTBrtZ5NdfP/v1PrtXxOflrS1ybrZA3D3RmjlUPmNJhFpQyDLo4QbmpSSesxgonsp5X/kxsNuH8AV2s90/LuHh2B19bp7ivCtGIFflM3q6ea4komgLV0ZydgOBAUp8AuhZ2FmfBPa8D9/jfwX2fMvoRBSZS5udQc3ASEJQuDhn75Nsow0k4wixWWGETO8lWqhRSSzWwVvJ49YnQ2/2IQXfzT58N6skfHvBdLRZ3FyPqlyfal5FhJ/DeV61PZ65FKL4TVbmrgJaGzHE5yns+Mc+GtrH9/nw3a+S8N3nGg7WS0dYYyOmw2ycFg5d4cBtlxNXCX5QFpQccy4txNU2iowp7LSXPw7sah++3qfKnrbjzRlJzipUCOJMfpkQTiaFEodNy/zsGoS6NJp2+CUP/HEKO+/BIXg//VT34TshhO8pw0NFkkzUdC9e5+iBEJ9aVAMWIcLoklAaQl0apUlSXuhhOaewW3/atd9///1yH77Tf1T2it0/DpNEkUFPzZH4dcX/F6SnxoS+iDYoyrgVwNeWka4KmjeFPfW7bz///PMzx/rwnXy3yiNnWZ5lLIhRsyZ4VmQ66cHDNijUtEhvs4BvE/B5EvMmVngKu/PnwB7cPVV02O0KvntnDadzpUPVKT7lNH19gega/KmmGdJJommbBaXchIP35Ed38DFT2BN/B/by8Ejg8x8F9vJpZrkDdUecNGWGEyM9oXocjD3bCmHgnu1I6pQCfKOXZmQSqoOITmH3/hLYY0P47lPwPXOr2YQfFNNVcts1vlF8RmzIrC48qk0D0Ad28DXlXsv/h/DNPqfge2gI33EfKwPx01oCxDnLU6VFzvA2JYVzEepm+IwDiDcVA/hK8oMWsdWn4C0v/RHYC0P4TvhJ2YtmfRK8hWozBIbH1Zqk0gvoFUYxF8bVMggw4FO/Vfp/4LvlpT8Du2gI3+nPKPiesPx3oEt4JRiInwcg9hJkHrkjxeH2RbDrFHYfM29dgpXRwldYOHSSxOsj955vLx0ZvMfl5d8Du/d4x8TiYH4xtLayPMhRkrrgOrS8LPtqcUTIdQP48vKT4+Pewr5lXwbf8d57b+zac0cFbxF6LOQxZqm3gPexoCTSTfc0JXwbFKNI/A4GfBnAB9rMKBDXTFIXwRfM7Oy33xzaveolTPf5HGaIH3KH3nryvR1V3Zs0JBQDeSgyzYZcGyrrPHbxMthNGrFjUTaPihr4krhrs8xx5TuBnaXga/6t7E7Tt7wK1+ygI7HEA6g9uftaLMgG4M1lbNEOqg5KBosy8CZC+HiLfUv4nnzkrcD+Ye1cYmOKwjjuqqHTebU6qu2MTmmrtOrdUlqPpETaIhbEYyEeJQ0WhIaIDUI8goVIhIhuEEEkCAtvmlYiaat0I1ELj8ZWY0PEmTtnivs7Zu499Wc1mU6nv/u9zndeRRLf2q9S++1eGWWBU4SpXsXasjlWfGxTyw/KYZvQjY0IxOezj0/+ei3vXS3pnTss8VXekYXMNadnqMgHPhZfbgRPavJjztaP758Kx8xDDC2Vnwt8oeT4XMqTJJxp/oOY1s2T+CZdkPhuLXJ4q6zvn4GZF7akYBznAr6gzOBM4daQ5eN70u3hgzuMcNYrXfE8phP9R79u/CGFwjlx128O1n8BVhDRMM+aTPzW9l5GInwjJCu+Z6o1CJQmxleM7GZH+648iamhH1/VC6nlts8I9/95MgO/HPd/eHhoYiZ+DFO9xDcGfzMPdpBlsz8xvlxkNzva8Uaqph/fwlsS32IHdwrnT/5dyTKHYQl5zmAs5ghjPDsGXTng89DjRuEl4MtS4MvE87SjvZLeivJ+fNXXHt+/L/7f34bgZ0scGhDfSJ7REEbmHYGuHPCFmC6DKL/D1uVbaQp8YQzVbWjB7i8xbaiQ+ITOPpQ69J/wjcahUEXcVVn2j6OawsSXYulqBViH+mFYrsTWF9DBt+mTVK3xG1/ZU6n5WvjGAt8YWN9w7qoMc6rXDXyw2Wlu69g1C2giCTIv5pAnOgp9r6Sq/sB3eJusBRcv0MFXBHzpwOfmnFmYs4dDLfi4FVfI2idJRTtguBN8o5zMkO+R9FYs/ANf9YlHUvt08BUidXj6M6+V53g0EaZZS9kI04I/YexADCi2M+rwauBbdL49ppMVEp+phgdSq3Xw5eLZTrQuAwxyhBnHlwN8HLS5kht/GcrSYuIDdYf4Vn6Qumn8ia/mynNTD9bP1sBXjC8XtI46stkfiIfDiVZ8hciqxMcUmoFB+fD/jm/EQUnv/Kq/8JUvFnV0lN+T0xr4/PEKhKNiHzIopi7TE8W+NPzd1ATEgKHWH8r4P/jqrnfEtL7yL3yTzr6R2qGBLwUNKy/GGAE5oCD10cy8vN8gef8xB18oAlQDxbepU6rZcsVnOI5Pw3vHcClAIdulReY7SN2Nl8r4NwaSr7f2od9TmASf87rvYBxflQXfmnVfpBx6L7cMyWjIwZVHuTN9DraN5PMcTraE4arpeJ5hoJqAwsURvrobne9M7T5swVd99pvUDu3LKadw/4I7+ZxJBHbs5cA0I3nsGI3JjyIU9hEVvpD9vCvIvYyqucKCzyj8JLV7ttaYjQdKJj3ThoMODxbsjkNtCI3Ag/LAZFXzvEWOOy4XX0pV4Wr3NSteSTn23kz0UkLceEmlsZTJA6tSGDY0HjFgImaQA4oMFMaGuSTa2tgd0+7DwFd9tl3qoFN8BRhYlfBKK8rLxFcCVimoDaEQHhTORsESITx1O9reLdVcAXxGYXv7B1PX65zRG829K14792lE6DsjrfMYYxQOljFu+Ege+lfGvVzZQBVW7fCxXTPXt0lVGcR3eIUJT9SEK53hy2PdkjvYRk1VykLaa43lISZwr9Xjs5FcMuDxEdQ/mGpJql1xescWKvBVnO0w1dl5VO/ukVFMvIwr6KgW0J/SMeTF2WdD8ftL2EDLw/PMV+5YsqkDfVK1k4BPaO71TiFR2TRu1mkYpCjaVe7k1WImDWI0G034bBQgPiaFEBx1rKLYj9hNHE0fY2pcaqjwLVwv2JmVDZNH4vqDDQOEQyob6ZFHijBjyqzqR7tsPB9oOhx12AAWaSzpkppfrsQ3qSFWFHZ3N251gC/CMUeRnatI8lmSTIU7F8PppvCUDvYiMBtXqqi+hzkadNTVx/HdNIDPVM2NblNtfdsd4BvKBDaHk+RUsWLCFmjceDRZyAGzJHN8JXYnUjHHYPvKuJ3vP8d0adU/8M1rFuja2kRwrK9zjC8XUSVJTZDCxDvNWl2M52b8YTxdDmGC+catvM0klB203aU//l6quRr4pOY2RuGJ6Ni103GnfuRfxS8i/pRAwPzuvMgN/YFhXKTqsb4nzfqwirhccg6ADmBL4OYWoSi9pnjRR3yH5/d9FBL+fXyEw2ZpBED/ApGFSJgqAzdjVjZH00gLo6wD3FTm9FxW9iXa+E61tsTUnziIb9K4KDrTw3c5mSny+/PpzkI+S+wJccgUpD9PRAotSLRrNYeHeKLdNxVBwKG2tkrdzTWIL65VxwQ808Nhfvbl4xVqqfz2bmYOD3cxs/GQYk2qWficLKT9dFT2DrXlmanW1j1rE+CrbnhvShjpLm18+ewXuOQwAA7mZiXoTnghylT82FguJ0c0Dg0Q39YzPUJRgA0VxPdbSy+1SOmbH303nSFssqLkD3BpBc/HUq8omKVYfTGF86Y+XeP7+bPH1NEaIxG+ytooOtPLkXxtdxBwpYf3nyfSTWbjK4D4yNvyMq1FZkTRSvExg4c0je92708hgbB2XkJ8xtz6VqnjgxyJeXey1R6zOV73cRCaitCXAsf0Wj5JOYM3nqWUR9P4Xve+ft0rVL/USIyvvNmMkM/EP03z40WoQVLo39PB1/Lgci48nDRrMCxRFeScdh6vGfnevn0dVW9tJfDB/J7JLHNPK/ql8vbj4cq7TuBzuCTFiyOYeFKkZBziLpkC1QFkesb3ViiKr36ukQxfea3Eh+inYXxIe9jGhdDn557qafj4P6woDVwmMtIWoevqQJvfxlVbSXw0v54YvdZ79ke+XBvktVraUMW70jlvmcn60WMpZXh+hF/RCStTxGOtU1tOfZf06qsM4qP59Uh+LUv0866bl9PTGmahXyAzhwTDABlEMJzA4/yY1HPxSfa187vU24ZKJT5Gvx7T+lqu2u37sUeSirjjoe+OVfQNfZgwmQA0uEHRqyz70O7z6xjfkTg+GB/wydpPOm9LywHddc6ZMD6XwkTzEubLUjwJYWvWrudojmWL//m4SjXwLXkbx9cwT4mP5ndU0DPxvd+swc89OKUwDxNJabQPt+IS52Lu6yKHHNWJVryrGh9VrFW0SHpHlxr28FUW343jO66zWtJMgyh9+VpY4XJe9OgiCA1IvCmK9V4FinIgV6NRJVKGSe+Ma54aH7V0vpk5RHvwM7OH3ixmmfJgKiLN430yCXdw5GPtqS8eMYkv03neeB3Ht7fGsIuvenqToGfia0L20CsDPUnyYB6NNGcopmbz0aHmMcQlcTNmwyXfed4Q+Ex+t6dX2MZnrG2W9Lq6Lg6I3jDV1Y+qe8ADivf5wq5xkxU7EfOtRpuFX4n90noHqG3p7ZXmd3mNYR/fpJn1kt7Hjys1yXEXKm8u4pSanY/LttbaPkvLAtlkFn6jLW0+89PkJ4qWmZMS4IMWNrwX9D4Len1NzsceGLViGlG+xjkhOzPyHsU5sLwyk2vhvI5dt6fnZ+/rqP01lBsJ8FFzj8WMr6+v7aJ+31610Cqo8qRMW3XtWMRML8o53vlogi90DU91XPI9eyb57akynOGbN6PJdN2+trZubfcNYNJDaByTBI8AVMuF+MjMkY5P0tWu1tYoPsHv6vTqxPioVc3S+MSajUUD7DtPVmTBTPURpRAqOvZKs9A1xJSkhurutbQ+M/n9rF1rJMPH7HFMGt/Ll0c1imc5ioVLBpg4eDSiWiUoFz1swWegl6OpA+9bovwEvqPIG8BHlbsaJb1375yseWG/bqTCTeeg0k3ucZkYjU1jGChEfNTTyq7Pkt/VGei0EB+1tDlKL4qvs3PXAPAVqHJxlsa+bjd6DwFmiVK94RlX83VF+bUKfrU1hg6+iunHBD6TXseNZfqZI9VifEyxKeSckxrEldY00QIsP8f973qaXd/3seuzyW8PXBf41Cqf0RilF8X3YY9O9VKKwacXyUQog6VMQLERK4zQh2kinCikq+1tbVF+YsFAE12X+NSqqRWrJU16H9q1wl/YX5AP20CO4ArBILgoJ9CCzBJFeJOOVnZ3x/k1rDLs4mP2PWnS6/jQ/uoVqj89d6Y/p2FczJNvhUq4oq0MjwKLq7S0uVEssRX4BL/lcF37+IzKIbtN42sX+M5rVn9JF7O7sPxppGo1Xi4HK7Mw2ZmF2KChukvv3sX4dV0aMs/Qx2esLb0u6EWN79O33XrVH7q+qHPh0AWqAMZ1FlOJaiRGxRra09Ep+EXdt9G1xnCAj5q7sSNqfILety96p5TQ0CK4vudvV52sGtaNZcrOJuQQ3uRcBz90iC0GL6P8aqsMZ/jYOd0fp/fmyeqB4ss2sYxSjexSkrTW3SxbwoRsoh/6i7t7eW0iiAM4PitrtL5FRfFtfZ00iJtsfMRG0CoBSTwoiAfRqjc9eAxagqAGhEiiYqqSSxUtVIMHBaE1NeRSQqMI4qZ/gIeekhakhEr87W5mF/vbU34T6fqF3psPMzvZCbuzgBG68eWL4QfT93bAT+KDfPIlY+qC3ufiXUZs8/L1e5wfx9yDvtwscn7lnZ3HXkrsFu+n3e5e/fYNnu0zpu99+YBE44MuqGd1PeArDg8/ZILbhH9Ps4cjvivejibqEia0R89/cr+36nmJygdFDj439YrD+Se3mNi2oA2Y5U57+WsdTrbag7Ye6J08O/HL8Pv69c3BiCSCzx/og6mrD758vnDxJBMQfnxrLxqOG9BuO3paEI1RascvfZ/Q/fTLXzjgpfHxQkrSnLr5QmHk4mlGDi+7q9D7iXc6Db75aCneLVav+Pn7xC/D77YSlIh8vG61p6n3aWT0lEC/deiNnOscr3weh4PftiJlaofgra7gZ0zfHtkn0fms5eMi6OVBb2h0tIfqh5fdjegWZK3TRkMHmvcAKqw1R/P54aLpdwotGxQ+KaJe0/Vg8I3OzPQcFz13l87etV/uuOm/Ev2GvESg3plPBe53Vj0mieTzdi27pusNgV69nuxkYto4a7NgqeP7S1ahwccPPFgsUm/kU0H3A74nRw5LND68/Hqecb2pqSRl/OEd0P2zz3db5Hg60kLWvg7BOQiGH1z+Xm/v8tL4cEEl/RIufIbeVGNQkN/av+fkSs6JLnLo/kKw3gM4g2NoxJi+r7fDvRqRDxdS0kNcrzE52MvEtG81On9yIRqiaPdUcMeTdeAz/Z5dVkISmQ93QEmbU9c4nmIwytrQQqfloANdDwV3OjlV535cj8qH8ympGa43Pf3+BWtHS5uDEf0cuYi1q144+srySyt8n4DKh/3kFPCZetO1TD/7R23YtWPXBtauooONhuWXUnwSj8iH65ZToNfkq9XusP+gF5nJScsvJSM9Ah/qnpxqcD042S3MXN+7gelJyy8ld0soCh/2S5t6wAf1bWPu7hUcFMv96mmkR+bD8zc9YOmVy9le5uI6+2o12w/rieeD9Tc9wPWgeD9zbdHsD50PAr5MB1o1hPBhv44BSw/6wFxafwY+BB9+GQ/WE8GHO6B4MpxPg7++TubC1oR/QNwvs8z5+x6dDxdSTsSt4adpWjbKXFdvsly2/d6rgZDkGJ0PFwyoOT76NCjxkbms/rhWtv1yaiAoOSeeD/J3ybGykWbmsgkc1qrVMmTyxeQuf2sOTGotb0S+aQ0+qBJ/ylxTNFuFtKZf7aZ8zNsCAYEPuiB3JKzBVy2VHoddMgC3fUhUjUy+hEc+L7UQiQ/qhgVEa1YqjY2N5VwxAKPZSqVi++XUFr6w0PmgUECNNacu8EG/L69gc7xtHx5X9KrN6Rtrbcml80H+w/LNhD51KyUI+H7H5/gS/DRXAjvLLzFPjvgpAkwidU4+EQc9i298PDWHb4I7Lz+G/9Pmi58gXPbofJBPUWMm35jJN379yho2N/sYL0E2X0xt4U4D8dEK/mnWfl6UCOM4jjfrd+k3FRUdavuhULQLSTHOjxgZYUTxZDCCyKbOwa6OMAdBhmxOdfESeAnMf8Fr+wd4MPwDWvCgHmXck3gKenTacHw8VI/POO/z7rK8+DzzKCpB4BPi65/zzWatL34EfPP1++8cvk8BkIgOrsNH3DHwbRff2VnNd+/i3pea/f4qX5snOLhEfPgNDGbTxTeflXwF+P4d+v9W+dCdQXDjYnxkheNogC6++bheun7BJz1/V/7Zd/Gh6eXCDHkOH3kRAfbKLr7xWPfHq8Dguw+nP1185QAIpHcGOR82QKvv4ptO9RLxd3jI8cqnpy6+HzXi6eF85IkCXC67+Uajuvlwl7fw1VJ5NnPzfTBAJnzqUeFjwkWAQnOVD/mNprXDHX0ad/dNqXk2c/M1TWDJL1wafKiYDHz71OFDLfkmk571dAcPweCX2nx+5uZrWjxIUWY74XzkJQRIttb5ej29dHjB09502uPxOl87CUKE2VJU+NAJZiGgu/lQQ9W67d0Z/larT8frfK0AsMUws81wPvKiaYA9fZ1vOBzo5qULHvTysz4dTdf5ynsAcY7ZdjgfeTEJQNExvsFAze7dobrBJwevW/XJaLTOt8BLx5ith/hoJMoLQIyv2+1q+dAhpYvk1cNOY9TrTTC+BZ4sMhRCfHSKyIsj7OJz/GzbzppPD7b9avDFxc+N4bDXw/laAWp49PgcQKMxda3P4Ts5OVErr29tbYTBKx2rOhgMN/DNWgZFPIp8KFECSFbqOJ9T1gpdI35Td/PWkZXXut3BJr66lQRI08OjyoeKxVngCzrGd55WbRQ6V4L/eU8cPjIbWc3uLsL55rrJAxuPMRRDfHTjiiyAUVFxvvNstZq3Qo8Pgn/9OLz75MW1/UKjqtrot+3NfMvhCUWOoRrio15EAjTB/HCFD0/T1GzFfP3g0sH9qzdfPbmLkwWfX73/8N6NfdPKq5p2/kc28k11hQdIRxjqIT76RYsCQDKVHWzmw9fYsArm59DR/tGzztH+fuiyaVqNfFbt4j+N8430Ar8YXpShH+LzpkiaXQpifCThfBM9lQRg0fA8CfF5FZeQYCGY12jxqXnHLhFmPArxeRj3cSHIKxnV3jpftaHwyE7y0I7B+GiHBNPscoSZqr01PrWBZrfcHcd4GuLzvHAkJwAqqWSqxAdZq2YKSUDJOZHxPMS3k7hEXAYUb6Qyb7X/2qGtZjMpgweUEEez20WIb2eFI0WZBWeHlcxb1f4XuIqShEWsnItwzK5CfLstlshJAoCzRCVVyeSzVXXTHG1NrWbzmUoKuTkJUi4RY3bZ7vmWceJxHCGulDQMQ1GUwjJFMQzH7A9c/KPIMT7IF3y/i4qJ41xckgUWNsQKshTPHSfEKOOf/MS3EheNxURRjCwTxVjUF1vD+wXmWHlsr/RtfAAAAABJRU5ErkJggg=='
},{"./Fudge.js":1}]},{},[2])