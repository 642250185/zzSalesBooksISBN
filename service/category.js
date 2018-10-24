const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');

const {PPU, domain, zzopenRoute, categoryPath, homePage} = config.zz;

let cookie;
const formatCookie = () => {
    cookie = `PPU="${PPU}"`;
};

const getAllCategory = async () =>{
    try {
        let result = await request.get(`${domain}${zzopenRoute}${homePage}`)
            .set('Cookie', cookie);
        result = JSON.parse(result.text);
        const {respCode, errorMsg, respData} = result;
        const {cates} = respData;
        const categoryList = [];
        for(let group of cates){
            const {cates} = group;
            for(let category of cates){
                categoryList.push({
                    groupId:group.cateId,
                    groupName: group.text,
                    categoryId: category.cateId,
                    categoryName: category.text
                });
            }
        }
        return categoryList;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const crawlCategory = async () =>{
    try {
        await formatCookie();
        const categoryList = await getAllCategory();
        console.info(`分类总数: ${categoryList.length}`);
        await fs.ensureDir(_path.join(categoryPath, '..'));
        fs.writeFileSync(categoryPath, JSON.stringify(categoryList, null, 4));
        return categoryList;
    } catch (e) {
        console.error(e);
        return [];
    }
};


exports.crawlCategory = crawlCategory;