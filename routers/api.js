// import { userInfo } from 'os';

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require("../models/content");

// 统一返回格式
var responseData;

router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }

    next();
});

/**
 * 用户注册
 *  注册逻辑
 *  1.用户不能为空
 *  2.密码不能为空
 *  3.两次输入密码必须一致
 * 
 *  1.用户是否已经被注册了（数据库查询）
 */
router.post('/user/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    // 用于是否为空
    if (username === '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    // 用于是否为空
    if (password === '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    // 两次输入密码必须一致
    if (password === '') {
        responseData.code = 3;
        responseData.message = '两次输入密码不一致';
        res.json(responseData);
        return;
    }

    /**
     * 用户名是否已经被注册了，此处要操作数据
     */
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            // 表示數據庫中有該記錄
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        }
        // 保存用户注册的信息到数据库中
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function (newUserInfo) {
        // console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json();
    });
});

/**
 * 登陆
 */
router.post('/user/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    // 用于是否为空
    if (username === '' || password == '') {
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    // 查询数据库中用户名和密码是否相等
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名和密码错误';
            res.json(responseData);
            return;
        }
        // 用户名和密码正确
        responseData.message = '登陆成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    })
});

/**
 * 退出
 */
router.post('/user/logout', function (req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});
/**
 * 获取指定文章的所有评论
 */
router.get('/comment', function (req, res) {
    // 内容id
    var contentId = req.query.contentId || '';
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.data = content;
        res.json(responseData);
    });

})

/**
 * 评论提交
 */
router.post('/comment/post', function (req, res) {
    // 内容id
    var contentId = req.body.contentId || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };
    // 查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message = "评论成功";
        responseData.data = newContent;
        res.json(responseData);
    }).catch(err => {
        console.log(err);
    });

})

module.exports = router;