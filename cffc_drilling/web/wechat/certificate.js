
function back(){
    $('[class*="-two"]').css('display','none');
    $('.sort_box').css('display','block');
    $('.initials').css('display','block');
    $('.header').css('display','block');
}
$(function(){
    document.documentElement.style.fontSize = window.innerWidth/3.75 + 'px';
    getCertificateList();
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
        getCertificateList(search.value);
    }, false);
    search.addEventListener('input', function (e) {
        //输入法正在输入，直接返回不执行查询
        if (isInputZh) return;
        var value = this.value;
        //输入法输入结束，执行查询
        getCertificateList(value);
    }, false);

})

/**
 * 获取资质证书
 */
function getCertificateList(searchText = "") {
    var params = {};
    params.funcId = "hex_wechat_queryCertificateNameList";
    if(searchText.length > 0){
        params.certificate_name = searchText;
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
                var certificateId = item.certificate_id;
                var certificateName = item.certificate_name;
                if(certificateName.indexOf(searchText) < 0){
                    continue;
                }
                context += "<div class=\"sort_list\" onclick='selectCertificate(this)'>";
                context += "<input type=\"text\" hidden=\"hidden\" class=\"certificate-id\" value='" + certificateId + "'/>";
                if (searchText.length <= 0) {
                    context += "<div class=\"num_name\">" + certificateName + "</div>";
                    context += "</div>";
                    continue;
                }
                var nameArr = certificateName.split(searchText);
                context += "<div class=\"num_name\">" + nameArr[0] + "<span style='color:green;'>" + searchText + "</span>" + nameArr[1] + "</div>";
                context += "</div>";
            }
            context = context.length == 0 ? "<div style='color:#c6c6c6;position: fixed;top:50%;left:50%;transform: translate(-50%, -50%)'>无搜索结果</div>" : context;
            $(".sort_box").html(context);
        }
    });
}

function selectCertificate(row){
    var certificateId = $(row).find("input").val();
    var certificateName = $(row).find("div").text();
    $("#certificateId", parent.document).val(certificateId);
    $("#certificateName", parent.document).val(certificateName);
    $("#certificateList", parent.document).hide(300);
}

