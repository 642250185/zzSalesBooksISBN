const path = require('path');

const config = {
    zz: {
        PPU: 'TT=61cbb10bf4470684395d4824393e1849d069a049&UID=46028783232276&SF=ZHUANZHUAN&SCT=1540374302117&V=1&ET=1542962702117',
        domain: 'https://zhuan.58.com',
        zzopenRoute: '/zzopen/sellbook',
        homePage: '/homePage?fromChannel=ppzq',
        bookListByCate: '/bookListByCate',
        categoryPath : path.join(__dirname, '..', 'data/category.json'),
        bookPath: path.join(__dirname, '..', 'data/books.json'),
        exportPath: path.join(__dirname, '..', 'download'),
    },
    /**
     * 返回或设置当前环镜
     */
    env: function () {
        global.$config = this;
        return global.$config;
    }
};

module.exports = config.env();