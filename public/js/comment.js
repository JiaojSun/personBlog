var prepage = 2;   // 每页条数
var page = 1;      // 起始页
var pages = 0;     // 尾页
var comments = [];

$('#submitCommet').on('click', function () {
    const contentId = $('#contentId').val();
    const content = $('#content').val();

    if (!content) {
        alert('请输入评论');
    }

    $.ajax({
        type: 'post',
        url: 'api/comment/post',
        data: {
            contentId: contentId,
            content: content
        },
        dataType: 'json',
        success: function (result) {
            debugger;
            // 这块之所以要进行翻转，是因为想最新的评论在前面

            $('#content').val('');
            comments = result.data.comments.reverse()
            renderComment();

        }
    })
})

// 每次页面重载的时候获取一下该文章的所有评论
$.ajax({
    type: 'get',
    url: 'api/comment',
    data: {
        contentId: $('#contentId').val()
    },
    dataType: 'json',
    success: function (result) {
        console.log('成功了');
        if(result.data.comments && result.data.comments.length){
            
            $('#content').val('');
            comments = result.data.comments.reverse()
            renderComment();
        }
    }
})


/* 给上一页和下一页添加点击事件 */
$('.pager').delegate('a','click',function() {
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    renderComment();
})

function renderComment() {
    $('#commentNum').html(comments.length);

    // 处理分页
    // 总页数  评论条数/每页条数  向上取整
    pages = Math.max(1, Math.ceil(comments.length / prepage));
    var start = Math.max(0, (page - 1) * prepage);
    var end = Math.min(start + prepage, comments.length);
    var $lis = $('.pager li');
    // 选择第二个 <li> 元素：eq(1)
    $lis.eq(1).html(page + '/' + pages);
    // 处理上一页和下一页
    if (page <= 1) {
        page = 1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    } else {
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }
    if (page >= pages) {
        page = pages;
        $lis.eq(2).html('<span>没有下一页了</span>');
    } else {
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }

    if (comments.length == 0) {
        $('#list').html('<div class="messageBox"><p>还没有评论</p></div>');
    } else {

        let html = '';
        for (let i = start; i < end; i++) {
            html += '<li><div><span class="fl">' + comments[i].username + '</span>' +
                '<span class="fr">' + transformTime(comments[i].postTime) + '</span></div>' +
                '<div>' + comments[i].content + '</div></li>';
        }
        $('#list').html(html);
    }
}


function transformTime(time) {
    const d = new Date(time);
    return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日  ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
}