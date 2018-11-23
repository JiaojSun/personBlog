var express = require('express');
var router = express.Router();
var Category = require("../models/category");

router.get('/', function(req, res, next) {
    // 读取所有分类信息
    Category.find().then(function(categories) {
        res.render("main/index", {
            userinfo: req.userInfo,
            categories: categories
        });
    })
});

module.exports = router;