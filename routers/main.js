var express = require('express');
var router = express.Router();
var Category = require("../models/category");
var Content = require("../models/content");

router.get('/', function(req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],

        page: Number(req.query.page || 1),
        count: 0,
        limit: 4,
        pages: 0
    };
    var where = {};
    if(data.category){
        where.category = data.category
    }

    // 读取所有分类信息
    Category.find().then(function(categories) {
        data.categories = categories;
        return Content.where(where).count();

    }).then(function(count) {
        data.count = count;
        // 计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        // 取值不能超过pages
        data.page = Math.min(data.page, data.pages);
        // 取值不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        });
    }).then(function(contents) {
        data.contents = contents;
        console.log(data);
        res.render("main/index", data);
    });
});

module.exports = router;