
function back(){
    $('[class*="-two"]').css('display','none');
    $('.sort_box').css('display','block');
    $('.initials').css('display','block');
    $('.header').css('display','block');
}
$(function(){
    document.documentElement.style.fontSize = window.innerWidth/3.75 + 'px';
    getCertifyingList();
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
        getCertifyingList(search.value);
    }, false);
    search.addEventListener('input', function (e) {
        //输入法正在输入，直接返回不执行查询
        if (isInputZh) return;
        var value = this.value;
        //输入法输入结束，执行查询
        getCertifyingList(value);
    }, false);

})

/**
 * 取消手动录入
 */
function cancelAdd() {
    $("#cover").fadeOut(200);
    $(".add-select").fadeOut(200);
}

/**
 * 使用手动录入的工作单位
 */
function inputCertifying(){
    var certifyingName = $("#certifyingName").val();
    $("#certifyingName", parent.document).val(certifyingName);
    $("#certifyingList", parent.document).hide(300);
    $("#cover").fadeOut(200);
    $(".add-select").fadeOut(200);
    $("#certifyingName").val("");
}

/**
 * 弹出录入发证单位的对话框
 */
function showCertifyingDialog(){
    $("#cover").fadeIn(200);
    $(".add-select").fadeIn(200);
}


/**
 * 获取发证机关
 */
function getCertifyingList(searchText = "") {
    var params = {};
    params.funcId = "hex_wechat_queryCertifyingNameList";
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
                var certifyingId = item.certifying_id;
                var certifyingName = item.certifying_name;
                if(certifyingName.indexOf(searchText) < 0){
                    continue;
                }
                context += "<div class=\"sort_list\" onclick='selectCertifying(this)'>";
                context += "<input type=\"text\" hidden=\"hidden\" class=\"certifying-id\" value='" + certifyingId + "'/>";
                if (searchText.length <= 0) {
                    context += "<div class=\"num_name\">" + certifyingName + "</div>";
                    context += "</div>";
                    continue;
                }
                var nameArr = certifyingName.split(searchText);
                context += "<div class=\"num_name\">" + nameArr[0] + "<span style='color:green;'>" + searchText + "</span>" + nameArr[1] + "</div>";
                context += "</div>";
            }
            context = context.length == 0 ? "<div style='color:#c6c6c6;position: fixed;top:50%;left:50%;transform: translate(-50%, -50%)'>没有找到，<font style='color:blue;text-decoration: underline;' onclick='showCertifyingDialog()'>点击手动录入</font></div>" : context;
            $(".sort_box").html(context);
        }
    });
}

function selectCertifying(row){
    var certifyingId = $(row).find("input").val();
    var certifyingName = $(row).find("div").text();
    $("#certifyingName", parent.document).val(certifyingName);

    var certificateId = $("#certificateId", parent.document).val();
    var params = {};
    params.funcId = "hex_wechat_queryCertifyingCheckLink";
    params.certifdicate_id = certificateId;
    params.certifying_id = certifyingId;
    request({
        data: [ params ],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                $("#certifyingList", parent.document).hide(300);
                return;
            }
            var items = data.responses[0].items;
            if(items == null || items == undefined) {
                $("#certifyingList", parent.document).hide(300);
                return;
            }
            var item = items[0];
            var checkTrueLink = item.check_true_link || "";
            var isCanCopy = item.is_can_copy || 2;
            if(checkTrueLink.length > 0 && parseInt(isCanCopy) == 1){
                //隐藏验真链接、验真图片
                $(".check-true-box", parent.document).hide();
                $("#isCanCopy", parent.document).val(1);
                $("#checkTrueLink", parent.document).val(checkTrueLink);
                //自动爬取验真图片
                autoCopyCheckImage(isCanCopy);
            }else{
                $(".check-true-box", parent.document).show();
                $("#checkTrueLink", parent.document).val("");
            }
            $("#certifyingList", parent.document).hide(300);
        }
    });
}

/**
 * 判断是否需要自动爬取验真图片
 */
function autoCopyCheckImage(isCanCopy = 2){
    var certificateCode = $("#certificateCode", parent.document).val();
    if (parseInt(isCanCopy) == 1) {
        //自动爬取验真图片
        $.ajax({
            url: "http://cdss.chinayunsoft.com:5000/search/training_gugud_com?card_number=" + certificateCode,
            // url: "http://cdss.chinayunsoft.com:5000/search/training_gugud_com?card_number=8120173887",
            type: 'GET',
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                if (result.code != "200") {
                    $("#checkImage", parent.document).val("");
                    return;
                }
                //获取页面截图的Base64
                var base64Img = result.data.img_base64_data;
                request({
                    data: [{"funcId": "hex_wechat_saveBase64imgFunction", "base64_img": base64Img}],
                    func: function (data) {
                        if (data.responses[0].flag <= 0) {
                            return;
                        }
                        var imgUrl = data.responses[0].items[0].img_url;
                        $("#checkImage", parent.document).val(imgUrl);
                        return;
                    }
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr);
                console.log(ajaxOptions);
                console.log(thrownError);
                $("#checkImage", parent.document).val("");
                return;
            }
        });
    }
}
