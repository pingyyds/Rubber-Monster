let express = require("express");
let expressWs = require("express-ws");
// let app = express();
// expressWs(app);


// let g_Data = {};
let modMatch = require("./src/match");
let modGame = require("./src/game");
// app.get(
//     "/register",
//     (req, res) => {
//         let account = req.query.account;
//         let password = req.query.password;
//         res.send('sasa');
//     }
// )
// let g_ID = 0;
// global.g_Client = [];
// app.ws(
//     "/game",
//     (ws) => {
//         ws.pid = g_ID++;
//         g_Client[ws.pid] = ws;
//         console.log("用户连接");
//         ws.on("message", (data) => {
//             data = JSON.parse(data);
//             console.log("收到消息：", data);
//             if (data.key == "match") {
//                 modMatch(data, ws);
//             }
//             else if (data.key == 'game') {
//                 modGame(data, ws);
//             }
//             // if (data.isMatch == true) {
//             //     let idx = matchList.indexOf(ws.pid);
//             //     if (idx == -1) {
//             //         matchList.push(ws.pid);
//             //         if (matchList.length >= 2) {
//             //             let pid1 = matchList.shift();
//             //             let pid2 = matchList.shift();
//             //             gameBegin(pid1, pid2);
//             //         }
//             //     }
//             // }
//             // else {
//             //     let idx = matchList.indexOf(ws.pid);
//             //     if (idx != -1) {
//             //         matchList.splice(idx, 1);
//             //     }
//             // }
//             // console.log(matchList);
//             // ws.send("你好");
//         });
//     }
// )

global.g_SE = new class CServerEngine {
    constructor() {
        this.uid = 0;
        this.client = {};

        this.app = express();
        expressWs(this.app);
        this.app.ws(
            "/game",
            (ws) => {
                ws.uid = this.uid++;
                this.client[ws.uid] = ws;
                console.log("用户连接");
                ws.on("message", (data) => {
                    data = JSON.parse(data);
                    console.log("收到消息：", data);
                    if (data.key == "match") {
                        modMatch(data, ws.uid);
                    }
                    else if (data.key == 'game') {
                        modGame(data, ws.uid);
                    }
                });
            }
        );
        this.app.listen(80);
    }
    send(uid, data) {
        let ws = this.client[uid];
        if (ws && ws.readyState == ws.OPEN) {
            ws.send(JSON.stringify(data));
        }
        else {
            console.log("uid不存在或为连接：", uid);
        }
    }
}

