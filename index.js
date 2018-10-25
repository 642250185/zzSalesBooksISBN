const {crawlCategory} = require('./service/category');
const {saveParams} = require('./service/params');
const {getAllBookInfo} = require('./service/books');

const start = async() => {
    try {
        console.info('开始');

        console.info('开始采集分组分类...');
        await crawlCategory();
        console.info('分组分类采集完成...');

        console.info('开始采集获取书籍的基本参数...');
        await saveParams();
        console.info('获取书籍的基本参数采集完成...');

        console.info('开始采集获取书籍信息保存json文件并导出Excel表格...');
        await getAllBookInfo();
        console.info('书籍信息保存json文件并导出Excel表格完成...');

        return null;
    } catch (e) {
        console.error(e);
        return e;
    }
};

start();

