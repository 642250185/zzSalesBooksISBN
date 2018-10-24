const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');
const xlsx = require('node-xlsx').default;
const sleep = require('js-sleep/js-sleep');
const {crawlCategory} = require('./category');
const {formatDate} = require('../util/dateUtil');

const {PPU, domain, zzopenRoute, categoryPath, bookListByCate, exportPath} = config.zz;

let cookie;
const formatCookie = () => {
    cookie = `PPU="${PPU}"`;
    console.info('cookie: ', cookie);
};

const getBooksInfoByCategoryId = async (category, pageNum, blist) =>{
    try {
        const pageSize = 20;
        if(!blist){
            blist = [];
            pageNum = 1;
        }
        let path = `${domain}${zzopenRoute}${bookListByCate}?cateId2=${category.groupId}&cateId3=${category.categoryId}&sortBy=0&pageSize=${pageSize}&pageNum=${pageNum}`;
        let result = await request.get(path).set('Cookie', cookie);
        result = JSON.parse(result.text);
        const {respCode, respData, errorMsg} = result;
        const {bookList} = respData;
        const {list, total} = bookList;
        for(let book of list){
            blist.push({
                infoId          : book.infoId,
                cover           : book.cover,
                title           : book.title,
                authors         : book.authors.join("、"),
                doubanRate      : book.doubanRate,
                price           : book.price,
                sellPrice       : book.sellPrice,
                conversionPrice : (book.price / 100).toFixed(2),
                sellDiscount    : book.sellDiscount,
                metric          : book.metric,
                stock           : book.stock,
                strInfoId       : book.strInfoId
            });
        }
        console.info(`第[${pageNum}]页、blistSize: ${blist.length}`);
        if(total === 20){
            pageNum++;
            return await getBooksInfoByCategoryId(category, pageNum, blist);
        } else {
            return blist;
        }
    } catch (e) {
        console.error(e);
        return [];
    }
};


const getAllCategoryBooks = async () =>{
    try {
        await formatCookie();
        const categorys = JSON.parse(fs.readFileSync(categoryPath));
        console.info('书籍分类总数: %d ', categorys.length);
        let count = 0, resultList = [];
        for(let category of categorys){
            ++count;
            console.info('count: %d, goupId: %d, groupName: %j, categoryId: %d, categoryName: %j', count, category.groupId, category.groupName, category.categoryId, category.categoryName);
            const blist = await getBooksInfoByCategoryId(category);
            resultList = resultList.concat(blist);
        }
        return resultList;
    } catch (e) {
        console.error(e);
        return [];
    }
};


const exportExcel = async () =>{
    try {
        const final = await getAllCategoryBooks();
        console.info(`所有的书籍总量: ${final.length}`);
        const result = [['bookId','封面','书名','作者','豆瓣评分','原价(单位/分)','二手价(单位/分)', '转换价格(单位/元)', '折扣','Metric','Stock','StrInfoId']];
        for(let book of final){
            let row = [];
            row.push(book.infoId);
            row.push(book.cover);
            row.push(book.title);
            row.push(book.authors);
            row.push(book.doubanRate);
            row.push(book.price);
            row.push(book.sellPrice);
            row.push(book.conversionPrice);
            row.push(book.sellDiscount);
            row.push(book.metric);
            row.push(book.stock);
            row.push(book.strInfoId);
            result.push(row);
        }
        const currentTime = formatDate(new Date(), 'YYYY-MM-DD-HH');
        const filename = `${exportPath}/转转销售数据-${currentTime}.xlsx`;
        fs.writeFileSync(filename, xlsx.build([
            {name: '转转销售书籍', data: result},
        ]));
        console.log(`爬取结束, 成功导出文件: ${filename}`);
    } catch (e) {
        console.error(e);
        return e;
    }
};

const test = async () =>{
    await exportExcel();
};


test();