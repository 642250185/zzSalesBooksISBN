const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');
const sleep = require('js-sleep/js-sleep');

const {PPU, domain, zzopenRoute, categoryPath, bookListByCate, bookPath} = config.zz;

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
                groupName       : category.groupName,
                categoryName    : category.categoryName,
                title           : book.title,
                bookId          : book.bookId,
                infoId          : book.infoId,
                metric          : book.metric,
            });
        }
        console.info(`第[${pageNum}]页、blistSize: ${blist.length}`);
        if(total === 20){
            pageNum++;
            // await sleep(1000 * 2);
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
            // break;
        }
        return resultList;
    } catch (e) {
        console.error(e);
        return [];
    }
};


const saveParams = async () =>{
    try {
        const final = await getAllCategoryBooks();
        console.info(`所有的书籍总量: ${final.length}`);
        await fs.ensureDir(_path.join(bookPath, '..'));
        fs.writeFileSync(bookPath, JSON.stringify(final, null, 4));
        return final;
    } catch (e) {
        console.error(e);
        return e;
    }
};


exports.saveParams = saveParams;