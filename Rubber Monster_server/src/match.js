let matchList = [];

function gameBegin(uid1, uid2) {

    let pList = [uid1, uid2];
    g_Game.gameBegin(pList);
    g_SE.send(uid1, {
        key: "match",
        sub: 1,
        data: {
            pList,
            pid: uid1,
        }
    });
    g_SE.send(uid2, {
        key: "match",
        sub: 1,
        data: {
            pList,
            pid: uid2,
        }
    });
}

function C2SMatchState(data, uid) {
    let { isMatch } = data;
    if (isMatch == true) {
        let idx = matchList.indexOf(uid);
        if (idx == -1) {
            matchList.push(uid);
            if (matchList.length >= 2) {
                let uid1 = matchList.shift();
                let uid2 = matchList.shift();
                gameBegin(uid1, uid2);
            }
        }
    }
    else {
        //  [].indexOf(x)   在[]中查找x的下标返回，如果没有发现则是-1
        let idx = matchList.indexOf(uid);
        if (idx != -1) {
            // [].splice(a,b)   将[]中以a为起始下标的连续b个元素删除
            matchList.splice(idx, 1);
        }
    }
}

function onMessage(res, uid) {
    let { sub, data } = res;
    if (sub == 1) { // 匹配状态改变
        C2SMatchState(data, uid);
    }
}

module.exports = onMessage;