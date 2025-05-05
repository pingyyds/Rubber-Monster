class CNet {
    constructor() {
        this.url = "ws://localhost/game";
        this.app = null;
    }

    connect() {
        this.app = new WebSocket(this.url);
        this.app.onmessage = (event) => {
            this.onMessage(JSON.parse(event.data));
        }
    }

    // onMessage(res) {
    //     let { key } = res;
    //     if (key == "match") {
    //         let node = cc.find("Canvas/index");
    //         if (cc.isValid(node)) {
    //             let script = node.getComponent("index");
    //             script.onMessage(res);
    //         }
    //     }
    //     else if (key == "game") {
    //         let node = cc.find("Canvas/game");
    //         if (cc.isValid(node)) {
    //             let script = node.getComponent("game");
    //             script.onMessage(res);
    //         }
    //     }
    // }

    onMessage(res) {
        let { key } = res;
        g_Slot.emit(key, res);
    }

    send(data) {
        this.app.send(JSON.stringify(data));
    }
}
window.g_Net = new CNet();