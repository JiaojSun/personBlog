/* import { userInfo } from 'os';
import { Promise } from 'mongoose'; */

const userInfo = require("os");
const Promise = require("mongoose");

// import assert from "assert";
// const assert = require("assert");

var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Category = require("../models/category");
var Content = require("../models/content");

router.use(function(req, res, next) {
    if (!req.userInfo.isAdmin) {
        // 如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();
})

/**
 * 首页
 */
router.get('/', function(req, res, next) {
        res.render('admin/index', {
            userinfo: req.userInfo
        });
    })
    /**
     * 用户管理
     */
router.get('/user', function (req, res, next) {
    /**
     * 从数据库读取所有的用户数据
     * 
     * limit(Number):限制获取的数据条数
     * 
     * skip(2):忽略数据的条数
     * skip = (当前页-1）*limit
     */
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    User.count().then(function (count) {
        // 计算总页数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min(page, pages);
        // 取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userinfo: req.userInfo,
                users: users,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})
    /**
     * 分类首页
     */
router.get('/category', function(req, res) {
        var page = Number(req.query.page || 1);
        var limit = 2;
        var pages = 0;
        Category.count().then(function(count) {
            // 计算总页数
            pages = Math.ceil(count / limit);
            // 取值不能超过pages
            page = Math.min(page, pages);
            // 取值不能小于1
            page = Math.max(page, 1);
            var skip = (page - 1) * limit;
            // 1:升序 2:降序
            Category.find()
                .sort({ _id: -1 })
                .limit(limit)
                .skip(skip)
                .then(function(Categories) {
                    res.render("admin/category", {
                        userinfo: req.userInfo,
                        categories: Categories,
                        count: count,
                        pages: pages,
                        limit: limit,
                        page: page
                    });
                });
        });
    })
    /**
     * 分类的添加
     */
router.get('/category/add', function(req, res) {
        res.render('admin/addcategory', {
            userinfo: req.userInfo
        })
    })
    /**
     * 分类的保存
     */
router.post('/category/add', function(req, res) {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userinfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }

    // 数据库中是否已经存在同名分类名称
    Category.findOne({
        name: name
    }).then(function(rs) {
        if (rs) {
            res.render('admin/error', {
                userinfo: userInfo,
                message: '分类已存在'
            })
            return Promise.reject();
        } else {
            // 数据库中存在该分类，可以保存
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory) {
        res.render('admin/success', {
            userinfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    });
})

/**
 * 分类的修改
 */
router.get('/category/edit', function(req, res) {
    // 获取要修改的分类的信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    // 获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function(category) {
        if (!category) {
            res.render('admin/error', {
                userinfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/category_edit', {
                userinfo: req.userInfo,
                category: category
            })
        }
    })
});

/**
 * 分类的修改保存
 */
router.post('/category/edit', function (req, res) {
    // 获取要修改的分类的信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // 获取post提交过来的名称
        var name = req.body.name || '';
        Category.findOne({ _id: id }).then(function (category) {
            if (!category) {
                res.render("admin/error", {
                    userinfo: req.userInfo,
                    message: "分类信息不存在"
                });
                return Promise.reject();
            } else {
                // 当用户没有做任何修改提交的时候
                if (name == category.name) {
                    res.render('admin/success', {
                        userinfo: req.userInfo,
                        message: '修改成功',
                        url: '/admin/category'
                    });
                    return Promise.reject();
                } else {
                    // 要修改的分类名称是否已经存在数据库中
                    return Category.findOne({
                        _id: { $ne: id },
                        name: name
                    });
                }
            }
        }).then(function (sameCategory) {
            if (sameCategory) {
                res.render("admin/error", {
                    userinfo: req.userInfo,
                    message: "数据库中已存在同名分类",
                });
                return Promise.reject();
            } else {
                return Category.update({
                    _id: id
                }, {
                        name: name
                    })
            }
        }).then(function () {
            res.render("admin/success", {
                userinfo: req.userInfo,
                message: "修改成功",
                url: "/admin/category"
            });
        });
    }

});

/**
 * 分类的删除
 */
router.get('/category/delete', function(req, res) {
    // 获取要删除的分类的id
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function() {
        res.render("admin/success", {
            userinfo: req.userInfo,
            message: "删除成功",
            url: "/admin/category"
        });
    })
})

/**
 * 内容首页
 */
router.get('/content', function (req, res, next) {
    /**
     * 从数据库读取所有的用户数据
     * 
     * limit(Number):限制获取的数据条数
     * 
     * skip(2):忽略数据的条数
     * skip = (当前页-1）*limit
     */
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Content.count().then(function (count) {
        // 计算总页数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min(page, pages);
        // 取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        Content.find().limit(limit).skip(skip).populate('category').then(function (contents) {
            res.render('admin/content', {
                userinfo: req.userInfo,
                contents: contents,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });
    })
})

/**
 * 内容添加首页
 */
router.get('/content/add', function(req,res){
    Category.find().sort({_id: -1}).then(function(categories){
        res.render('admin/content_add',{
            userinfo: req.userInfo,
            categories: categories
        })
    })
});

/**
 * 内容保存
 */
router.post('/content/add', function(req,res) {
    if(req.body.category == ''){
        res.render('admin/error',{
            userinfo: req.userInfo,
            message: '内容分类不能为空'
        })
    }

    if(req.body.title == ''){
        res.render('admin/error',{
            userinfo: req.userInfo,
            message: '内容标题不能为空'
        })
    }

    // 保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        description:req.body.description,
        content:req.body.content
    }).save().then(function() {
        res.render("admin/success", {
            userinfo: req.userInfo,
            message: "内容保存成功",
            url: "/admin/content"
        });
    })
})

/**
 * 修改内容
 */
router.get('/content/edit', function(req, res) {
    // 获取要修改的分类的信息，并且用表单的形式展现出来
    var id = req.query.id || '';
    var categories = [];

    Category.find().sort({_id: -1}).then(function(rs){
        // 找到该文章所对应的分类信息
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {
        if (!content) {
            res.render('admin/error', {
                userinfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userinfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    })
});

/**
 * 保存修改内容
 */
router.post('/content/edit', function(req,res) {
    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('admin/error',{
            userinfo: req.userInfo,
            message: '内容分类不能为空'
        })
    }

    if(req.body.title == ''){
        res.render('admin/error',{
            userinfo: req.userInfo,
            message: '内容标题不能为空'
        })
    }
    // 保存数据到数据库
    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function() {
        res.render("admin/success", {
            userinfo: req.userInfo,
            message: "内容保存成功",
            url: "/admin/content/edit?id="+ id
        });
    }).catch(function (error) {//加上catch 
        console.log(error);
    })
})

/**
 * 内容的删除
 */
router.get('/content/delete', function(req, res) {
    // 获取要删除的分类的id
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function() {
        res.render("admin/success", {
            userinfo: req.userInfo,
            message: "删除成功",
            url: "/admin/content"
        });
    })
})

module.exports = router;