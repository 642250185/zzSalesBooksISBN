const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');
const xlsx = require('node-xlsx').default;
const sleep = require('js-sleep/js-sleep');

const {PPU, domain, zzopenRoute, bookDetail, bookPath, bookDetailExtra, resultPath, exportPath} = config.zz;

let cookie;
const formatCookie = () => {
    cookie = `PPU="${PPU}"`;
};

const getBookISBN = async(infoId) => {
    try {
        const _path = `${domain}${zzopenRoute}${bookDetailExtra}?infoId=${infoId}`;
        let _result = await request.get(_path).set('Cookie', cookie);
        _result = JSON.parse(_result.text);
        const {isbn13} = _result.respData;
        return isbn13;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const getBookInfo = async(item) => {
    try {
        const final = [];
        const path = `${domain}${zzopenRoute}${bookDetail}?bookId=${item.bookId}&infoId=${item.infoId}&metric=${item.metric}`;
        let result = await request.get(path).set('Cookie', cookie);
        result = JSON.parse(result.text);
        const {respCode, respData} = result;
        const {bookId, title, pubdate, publisher} = respData;

        const isbn = await getBookISBN(item.infoId);
        console.info(`${isbn} ${bookId} ${item.groupName} ${item.categoryName} ${title} ${pubdate} ${publisher} `);
        final.push({
            isbn, bookId,
            groupName: item.groupName,
            categoryName: item.categoryName,
            title, pubdate, publisher
        });
        return final;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const saveBooks = async(resultList) => {
    try {
        await fs.ensureDir(_path.join(resultPath, '..'));
        fs.writeFileSync(resultPath, JSON.stringify(resultList, null, 4));
    } catch (e) {
        console.error(e);
        return e;
    }
};

const exportExcel = async(resultList) => {
    try {
        const table = [['ISBN','bookId', '一级分类', '二级分类', '书名', '出版时间', '出版社']];
        for(let book of resultList){
            const row = [];
            row.push(book.isbn);
            row.push(book.bookId);
            row.push(book.groupName);
            row.push(book.categoryName);
            row.push(book.title);
            row.push(book.pubdate);
            row.push(book.publisher);
            table.push(row);
        }
        const random = Math.ceil(Math.random() * 100);
        const filename = `${exportPath}/转转ISBN分类-${random}.xlsx`;
        fs.writeFileSync(filename, xlsx.build([
            {name: '转转分类', data: table},
        ]));
        console.log(`成功导出文件: ${filename}`);
    } catch (e) {
        console.error(e);
        return e;
    }
};

const getAllBookInfo = async() => {
    try {
        let resultList = [];
        await formatCookie();
        const params = JSON.parse(fs.readFileSync(bookPath));
        console.info('书籍参数总数: %d ', params.length);
        for(let item of params){
            const list = await getBookInfo(item);
            resultList = resultList.concat(list);
            // break;
        }
        console.info(`size: ${resultList.length}`);

        await saveBooks(resultList);

        await exportExcel(resultList);

        return resultList;
    } catch (e) {
        console.error(e);
        return e;
    }
};


exports.getAllBookInfo = getAllBookInfo;