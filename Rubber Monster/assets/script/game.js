
cc.Class({
    extends: cc.Component,

    properties: {
        normal2: cc.Node,
        normal1: cc.Node,
        clickLayer: cc.Node,
        diciLayer: cc.Node,
        clips: {
            default: [],
            type: cc.AudioClip,
        },
        Score: cc.Label,
        lbtime: cc.Label,
        effectLayer: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    createDici() {
        let dici = cc.instantiate(this.diciItem);
        this.diciLayer.addChild(dici);
        let isLeft, itemID = 0;
        if (this.diciList.length == 0) {
            isLeft = Math.random() < 0.5;
            if (Math.random() < 0.2) {
                itemID = 1001;
            }
            g_Net.send({
                key: "game",
                sub: 2,
                data: {
                    isLeft,
                    itemID,
                }
            });
        }
        else {
            let data = this.diciList.shift();
            isLeft = data.isLeft;
            itemID = data.itemID;
        }
        if (isLeft) {
            dici.x *= -1;
            dici.scaleX *= -1;
        }
        if (itemID) {
            let sf = g_Res.getRes("emoji_" + (itemID % 1000).toString().padStart(3, 0));
            dici.getComponent(cc.Sprite).spriteFrame = sf;
        }
        dici.itemID = itemID;
        let lst = this.diciLayer.children;
        for (let i = 0; i < lst.length; i++) {
            let child = lst[i];
            child.y += 150;
        }
    },

    initGame() {
        let { pList, pid } = initGameData;
        this.id = pid;
        if (pid == pList[0]) {
            this.isLeft = true;
            this.self = this.normal1;
            this.other = this.normal2;
        }
        else {
            this.isLeft = false;
            this.self = this.normal2;
            this.other = this.normal1;
        }
        this.other.color = cc.color(0, 255, 0);
    },
    checkCollision() {
        for (let child of this.diciLayer.children) {
            if (child.y == this.self.y && child.x * this.self.x > 0) {
                if (child.itemID == 0) {
                    this.gameover();
                }
                else {
                    this.doEffect(child.itemID);
                }
                return;
            }
        }

    },

    // addScore(data) {

    //     // this.score++;
    //     // // this.Score.string = this.score;
    //     // g_Net.send({
    //     //     key: "game",
    //     //     sub: 3,
    //     //     data: {
    //     //         num: this.score,
    //     //     }
    //     // });
    //     console.log(data);
    //     let { Score } = data;
    //     this.Score.string = Score['left'] + ':' + Score['right'];
    // },

    // S2CyncScore(data) {
    //     let { num } = data;
    //     let { pList, pid } = initGameData;
    //     if (pid == pList[0]) {
    //         this.Score.string = this.score + ':' + num;
    //     }
    //     else {
    //         this.Score.string = num + ':' + this.score;
    //     }

    // },

    gameover() {
        // cc.audioEngine.playEffect(this.clips[1]);
        // cc.director.loadScene('index');
        g_Net.send({
            key: "game",
            sub: 4,
            data: {},
        });
    },
    doNormalMove(event) {
        let pos = event.getLocation();
        let x = pos.x - cc.winSize.width / 2;

        // let y = pos.y - cc.winSize.height / 2;
        // ccc->js：1、空格删掉，2、首字母改小写
        let isLeft = x < 0;
        g_Net.send({
            key: "game",
            sub: 1,
            data: {
                isLeft,
            }
        });
        if (isLeft) {
            if (this.self.x < 0) {
                let action1 = cc.moveBy(0.05, 50, 0);
                let action2 = cc.moveBy(0.05, -50, 0);
                let action = cc.sequence(action1, action2,
                    cc.callFunc(() => {
                        this.checkCollision();
                    }),
                );
                this.self.runAction(action);
            }
            else {
                this.self.runAction(cc.sequence(
                    cc.moveTo(0.1, -this.self.x, this.self.y),
                    cc.callFunc(() => {
                        this.self.scaleX *= -1;
                        this.checkCollision();
                    }),
                ));
            }

        }
        else {
            if (this.self.x > 0) {
                this.self.runAction(cc.sequence(
                    cc.moveBy(0.05, -50, 0),
                    cc.moveBy(0.05, 50, 0),
                    cc.callFunc(() => {
                        this.checkCollision();
                    }),
                ));
            }
            else {
                this.self.runAction(cc.sequence(
                    cc.moveTo(0.1, -this.self.x, this.self.y),
                    cc.callFunc(() => {
                        this.self.scaleX *= -1;
                        this.checkCollision();
                    }),
                ))
            }
        }

        g_Net.send({
            key: "game",
            sub: 3,
        });

    },

    S2CSyncOP(data) {
        let { isLeft } = data;
        if (isLeft) {
            this.other.x = -222;
            this.other.scaleX = 1;
        }
        else {
            this.other.x = 222;
            this.other.scaleX = -1;
        }
        this.other.y -= 150;
    },

    S2CSyncDici(data) {
        let { isLeft, itemID } = data;
        this.diciList.push({ isLeft, itemID });
    },

    doEffect(itemID) {
        g_Net.send({
            key: "game",
            sub: 6,
            data: {
                itemID,
            }
        })
    },
    S2CRefreshScore(data) {
        let { score } = data;
        let selfscore, otherscore;
        for (let pid in score) {
            if (pid == this.id) {
                selfscore = score[pid];
            }
            else {
                otherscore = score[pid];
            }
        }
        if (this.isLeft) {
            this.Score.string = selfscore + ":" + otherscore;
        }
        else {
            this.Score.string = otherscore + ":" + selfscore;
        }
    },

    S2CGameOver(data) {
        let { failed } = data;
        this.isPlay = false;
        setTimeout(() => {
            cc.audioEngine.stopMusic();
            cc.audioEngine.playEffect(this.clips[1]);
            cc.director.loadScene('index');
        }, 1000);
    },

    S2CSyncTime(data) {
        let { time } = data;
        this.lbtime.string = time;
    },
    S2COnEffect(data) {
        let { itemID, pid } = data;
        if (itemID == 1001) {
            if (this.id != pid) {
                this.eff1001.active = true;
                this.eff1001.scale = 5;
                this.eff1001.stopAllActions();
                this.eff1001.runAction(cc.sequence(
                    cc.scaleTo(1, 4),
                    cc.scaleTo(1, 5),
                    cc.scaleTo(1, 4),
                    cc.scaleTo(1, 5),
                    cc.scaleTo(1, 4),
                    cc.callFunc(() => {
                        this.eff1001.active = false;
                    }),
                ));
            }
        }
    },
    onMessage(res) {
        let { key, sub, data } = res;
        if (sub == 1) {
            this.S2CSyncOP(data);
        }
        if (sub == 2) {
            this.S2CSyncDici(data);
        }
        if (sub == 3) {
            this.S2CRefreshScore(data);
        }
        else if (sub == 4) {
            this.S2CGameOver(data);
        }
        else if (sub == 5) {
            this.S2CSyncTime(data);
        }
        else if (sub == 6) {
            this.S2COnEffect(data);
        }
    },

    onLoad() {
        // app.onmessage = (event) => {
        //     let res = JSON.parse(event.data);
        //     this.onMessage(res);
        // };
        g_Slot.on("game", (res) => {
            this.onMessage(res);
        });
    },
    start() {
        // this.score = 0;
        this.isPlay = true;
        this.diciList = [];
        this.diciItem = this.diciLayer.getChildByName("dici");
        this.diciItem.removeFromParent();
        this.eff1001 = this.effectLayer.getChildByName("eff1001");
        this.clickLayer.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (!this.isPlay) {
                return;
            }
            this.doNormalMove(e);
            this.createDici();
            // this.addScore();
            this.other.y += 150;
            cc.audioEngine.playEffect(this.clips[2]);
        });

        cc.audioEngine.playMusic(this.clips[0], true);
        this.initGame();
    },

    update(dt) { },

    onDestroy() {
        g_Slot.off("game");
    },
});
