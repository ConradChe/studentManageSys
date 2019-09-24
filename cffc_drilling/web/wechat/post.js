
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
 * 获取岗位职务
 */
function getPostList(searchText = "") {
    var params = {};
    params.funcId = "hex_wechat_queryPostNameList";
    if (searchText.length > 0) {
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
            var postIds = getQueryString("post_ids");
            var postIdArr = postIds.toString().split(",");
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var postId = item.post_id;
                var postName = item.post_name;
                if(postName.indexOf(searchText) < 0){
                    continue;
                }
                var flag = postIdArr.indexOf(postId) >= 0;
                context += "<div class=\"sort_list\" onclick=\"selectPost(this)\">";
                context += "<div class=\"num_name\">";
                context += "<input class=\"post-id\" type=\"text\" hidden=\"hidden\" value='" + postId + "'>";
                context += "<input class=\"post-name\" type=\"checkbox\" hidden=\"hidden\"/>&nbsp;&nbsp;";
                context += "<img class=\"post-img\" src=\"";
                context += flag ? "img/checked.png" : "img/notcheck.png";
                context += "\">";
                if (searchText.length <= 0) {
                    context += "<font>" + postName + "</font>";
                    context += "</div>";
                    context += "</div>";
                    continue;
                }
                var nameArr = postName.split(searchText);
                context += "<font>" + nameArr[0] + "<span style='color:green;'>" + searchText + "</span>" + nameArr[1] + "</font>";
                context += "</div>";
                context += "</div>";
            }
            context = context.length == 0 ? "<div style='color:#c6c6c6;position: fixed;top:50%;left:50%;transform: translate(-50%, -50%)'>无搜索结果</div>" : context;
            $(".sort_box").html(context);
            $(".post-id").each(function(index){
                var postId = $(this).val();
                var flag = postIdArr.indexOf(postId) >= 0;
                if(flag) $(this).next().prop("checked", true);
            });
        }
    });
}

function selectPost(row){
    var thisPost = $(row).find("input");
    var img = $(row).find("img");
    var imgSrc = img.prop("src").toString();
    if(thisPost.prop('checked') || imgSrc.indexOf("checked") >= 0){
        thisPost.prop("checked", false);
        img.prop("src", "img/notcheck.png");
    }else{
        thisPost.prop("checked", true);
        img.prop("src", "img/checked.png");
    }
}

function getPost(){
    var postId = "";
    var postName = "";
    $(".post-name").each(function(index){
        if($(this).prop('checked')){
            postId += $(this).prev().val() + ",";
            postName += $(this).next().next().text() + "、";
        }
    })
    if(postId.length == 0 || postName.length == 0){
        alert("请选择职务岗位");
        return;
    }
    postId = postId.substring(0, postId.length - 1);
    postName = postName.substring(0, postName.length - 1);
    $("#postId", parent.document).val(postId);
    $("#postName", parent.document).val(postName);
    $("#postList", parent.document).hide(300);
}

