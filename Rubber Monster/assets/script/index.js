// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        titleNode: cc.Node,
        Lable: cc.Label,
    },

    gameBegin(data) {
        window.initGameData = data;
        cc.director.loadScene("game");
    },
    doMatch() {
        if (this.isMatch) {
            this.Lable.string = "正在匹配";
        }
        else {
            this.Lable.string = "取消匹配";
        }
        this.isMatch = !this.isMatch;
        // let data = JSON.stringify({
        //     key: "match",
        //     sub: 1,
        //     isMatch: this.isMatch,
        // });
        let data = {
            key: "match",
            sub: 1,
            data: {
                isMatch: this.isMatch,
            }
        }
        // app.send(JSON.stringify(data));
        g_Net.send(data);
    },
    onMessage(res) {
        let { key, sub, data } = res;
        if (sub == 1) {
            this.gameBegin(data);
        }
    },
    onLoad() {
        // window.app = new WebSocket("ws://localhost/game");
        // // cc.log(this.app)
        // app.onmessage = (event) => {
        //     // cc.log(event.data);
        //     let data = JSON.parse(event.data);
        //     this.onMessage(data);
        //     // if (data.key == "gameBegin") {
        //     //     this.gameBegin();
        //     // }
        // }
        g_Res.loadRes();
        g_Net.connect();
        g_Slot.on("match", (res) => {
            this.onMessage(res);
        });
    },
    start() {
        this.isMatch = false;
        this.titleNode.runAction(
            cc.moveBy(1, 0, -500).easing(cc.easeBackOut())
        );
    },

    update(dt) { },

    onDestroy() {
        g_Slot.off("match");
    },
});
