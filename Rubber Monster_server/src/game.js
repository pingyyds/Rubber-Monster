global.g_Game = new class CGame {
    constructor() {
        this.game = {};
        this.gameID = 0;
        this.uid2GameID = {};
        // this.left = 0;
        // this.right = 0;
        // this.Score = { 'letf': 0, 'right': 0 };
    }

    gameBegin(pList) {
        let gameID = this.gameID++;
        this.game[gameID] = {
            pList,
            score: {},
            time: 60,
            isPlay: 0,
        };
        for (let tuid of pList) {
            // let ws = g_Client[pid];
            // ws.gameID = gameID;
            this.uid2GameID[tuid] = gameID;
            this.game[gameID].score[tuid] = 0;
        }
    }

    startGame(game) {
        if (game.isPlay != 1) {
            return;
        }
        for (let pid of game.pList) {
            g_SE.send(pid, {
                key: "game",
                sub: 5,
                data: {
                    time: game.time,
                }
            });
        }
        game.time--;
        if (game.time < 0) {
            for (let pid of game.pList) {
                g_SE.send(pid, {
                    key: "game",
                    sub: 4,
                    data: {
                        failed: null,
                    }
                });
            }
        }
        else {
            setTimeout(() => {
                this.startGame(game);
            }, 1000);
        }
    }

    getGame(uid) {
        let gameID = this.uid2GameID[uid];
        return this.game[gameID];
    }

    C2SSyncOP(data, uid) {
        let { isLeft } = data;

        // let gameID = ws.gameID;
        // let game = this.game[gameID];
        // let pList = game.pList;
        // let pid = ws.pid;
        let game = this.getGame(uid);
        let other = uid ^ game.pList[0] ^ game.pList[1];
        g_SE.send(other, {
            key: "game",
            sub: 1,
            data: {
                isLeft,
                // Score: this.Score,
            }
        });
        game.score[uid]++;
        for (let tpid of game.pList) {
            g_SE.send(tpid, {
                key: "game",
                sub: 3,
                data: {
                    score: game['score'],
                }
            });
        }
        if (!game.isPlay) {
            game.isPlay = 1;
            this.startGame(game);
        }
    }

    C2SSyncDici(data, uid) {
        let game = this.getGame(uid);
        let other = uid ^ game.pList[0] ^ game.pList[1];
        g_SE.send(other, {
            key: "game",
            sub: 2,
            data,
        });
    }

    // C2SSyncScore(data, ws) {

    //     let gameID = ws.gameID;
    //     let game = this.game[gameID];
    //     let pList = game.pList;
    //     let pid = ws.pid;
    //     if (pid == pList[0]) {
    //         this.left++;
    //         this.Score['left'] = this.left;
    //     }
    //     else {
    //         this.right++;
    //         this.Score['right'] = this.right;
    //     }

    //     // cc.log('pingyyds');
    //     // cc.log(this.Score);
    //     g_Client[pList[0]].send(JSON.stringify({
    //         key: "game",
    //         sub: 3,
    //         data: {
    //             Score: this.Score,
    //         }

    //     }));
    //     g_Client[pList[1]].send(JSON.stringify({
    //         key: "game",
    //         sub: 3,
    //         data: {
    //             Score: this.Score,
    //         }
    //     }));
    // }

    C2SGameOver(data, uid) {
        let game = this.getGame(uid);
        game.isPlay = 2;
        for (let pid of game.pList) {
            g_SE.send(pid, {
                key: 'game',
                sub: 4,
                data: {
                    failed: pid,
                },
            });
        }
    }
    C2SDoEffect(data, uid) {
        let { itemID } = data;
        let game = this.getGame(uid);
        for (let tPid of game.pList) {
            g_SE.send(tPid, {
                key: "game",
                sub: 6,
                data: {
                    itemID,
                    pid: uid,
                }
            });
        }
    }
    onMessage(res, uid) {
        let { sub, data } = res;
        if (sub == 1) {
            this.C2SSyncOP(data, uid);
        }
        else if (sub == 2) {
            this.C2SSyncDici(data, uid);
        }
        else if (sub == 4) {
            this.C2SGameOver(data, uid);
        }
        else if (sub == 6) {
            this.C2SDoEffect(data, uid);
        }
    }
}


module.exports = (res, uid) => {
    g_Game.onMessage(res, uid);
};