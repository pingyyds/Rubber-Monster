let TABLE = {
    item: {
        path: "texture/public/item",
        type: cc.SpriteFrame,
        list: [
            "emoji_001", "emoji_002", "emoji_003", "emoji_004",
            "emoji_005", "emoji_006", "emoji_007", "emoji_008",
            "emoji_009", "emoji_010", "emoji_011", "emoji_012",
        ],
    }
};

window.g_Res = new class CRes {
    constructor() {
        this.data = {};
        this.loadNum = -1;
    }

    getLoadNum() {
        return this.loadNum;
    }

    loadRes() {
        this.loadNum = 0;
        for (let key in TABLE) {
            this.doLoad(key);
        }
    }

    doLoad(key) {
        let { path, type, list } = TABLE[key];
        let resList = [];
        for (let resName of list) {
            let filePath = path + "/" + resName;
            resList.push(filePath);
        }
        this.loadNum += resList.length;
        let func = () => {
            let tempList = resList.splice(0, 5);
            cc.loader.loadResArray(
                tempList,
                type,
                (err, dataList) => {
                    this.loadNum -= tempList.length;
                    if (resList.length) {
                        func();
                    }
                    if (err) {
                        cc.log(err);
                        return;
                    }
                    for (let res of dataList) {
                        this.data[res.name] = res;
                    }
                },
            );
        };
        func();
    }

    getRes(resName) {
        return this.data[resName];
    }
}