$('#submitCommet').on('click', function () {
    debugger;
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
            const comments = result.data.comments.reverse();
            $('#commentNum').html(comments.length);
            $('#content').val('');
            let html = '';
            for (let i=0; i<comments.length; i++) {
                html+='<li><div><span class="fl">'+comments[i].username+'</span>' +
                    '<span class="fr">'+ transformTime(comments[i].postTime) +'</span></div>' +
                    '<div>'+comments[i].content+'</div></li>';
            }
            $('#list').html(html);
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
            const comments = result.data.comments.reverse();
            $('#commentNum').html(comments.length);
            let html = '';
            for (let i=0; i<comments.length; i++) {
                html+='<li><div><span class="fl">'+comments[i].username+'</span>' +
                    '<span class="fr">'+ transformTime(comments[i].postTime) +'</span></div>' +
                    '<div>'+comments[i].content+'</div></li>';
            }
            $('#list').html(html);
        }
    }
})


function transformTime(time) {
    const d = new Date(time);
    return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日  ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
}