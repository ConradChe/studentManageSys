
function back(){
    $('[class*="-two"]').css('display','none');
    $('.sort_box').css('display','block');
    $('.initials').css('display','block');
    $('.header').css('display','block');
}
$(function(){
    document.documentElement.style.fontSize = window.innerWidth/3.75 + 'px';
    getPostList();
    window.onresize=function(){
        if($(window).height()<400){
            $('.nav').hide();
        }else{
            $('.nav').show();
        }
    }

    var isInputZh = false;
    var search = document.getElementById('searchInput');

    //输入法开始输入之前
    search.addEventListener('compositionstart', function (e) {
        isInputZh = true;
    }, false);
    //输入法输入结束之后
    search.addEventListener('compositionend', function (e) {
        isInputZh = false;
        //等待输入法输入完成后，再进行查询
        getPostList(search.value);
    }, false);
    search.addEventListener('input', function (e) {
        //输入法正在输入，直接返回不执行查询
        if (isInputZh) return;
        var value = this.value;
        //输入法输入结束，执行查询
        getPostList(value);
    }, false);

})

/**
 * 获取资质证书
 */
function getPostList(searchText = "") {
    var params = {};
    params.funcId = "hex_wechat_queryPostNameList";
    if(searchText.length > 0){
        params.post_name = searchText;
    }
    request({
        data: [ params ],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                return;
            }
            var items = data.responses[0].items;
            if(items == null || items == undefined){
                items = {};
            }
            var context = "";
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var postId = item.post_id;
                var postName = item.post_name;
                if(postName.indexOf(searchText) < 0){
                    continue;
                }
                context += "<div class=\"sort_list\" onclick='selectPost(this)'>";
                context += "<input type=\"text\" hidden=\"hidden\" class=\"post-id\" value='" + postId + "'/>";
                if (searchText.length <= 0) {
                    context += "<div class=\"num_name\">" + postName + "</div>";
                    context += "</div>";
                    continue;
                }
                var nameArr = postName.split(searchText);
                context += "<div class=\"num_name\">" + nameArr[0] + "<span style='color:green;'>" + searchText + "</span>" + nameArr[1] + "</div>";
                context += "</div>";
            }
            context = context.length == 0 ? "<div style='color:#c6c6c6;position: fixed;top:50%;left:50%;transform: translate(-50%, -50%)'>无搜索结果</div>" : context;
            $(".sort_box").html(context);
        }
    });
}

function selectPost(row){
    var postId = $(row).find("input").val();
    var postName = $(row).find("div").text();
    $("#postId", parent.document).val(postId);
    $("#postName", parent.document).val(postName);
    $("#postList", parent.document).hide(300);
}

