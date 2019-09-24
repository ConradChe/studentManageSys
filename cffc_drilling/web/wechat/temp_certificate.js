var submitType = 1; // 1新增临时证明，2录入已有资质的临时证明
$(document).ready(function () {

    //控制返回键
    window.history.pushState(null, null, "#");
    window.addEventListener("popstate", function (e) {

        //将浏览器缓存上一步设置为null，避免返回键直接返回上一个历史界面
        window.history.pushState(null, null, "#");

        //当选择资质证书的DIV显示的时候，返回键响应隐藏
        if (!$("#certificateList").is(":hidden")) {
            $("#certificateList").hide(300);
            return;
        }

        //如果选择资质证书的DIV没有显示，则返回键响应返回个人中心
        window.location.href = "index.html";
    }, false);

    var theme = "ios";
    var mode = "scroller";
    var display = "bottom";
    var lang = "zh";
    var currYear = (new Date()).getFullYear();
    $('#startTime').mobiscroll().date({
        theme: theme,
        mode: mode,
        display: display,
        lang: lang,
        startYear: currYear - 20, //开始年份
        endYear: currYear + 20, //结束年份
    });

    $('#endTime').mobiscroll().date({
        theme: theme,
        mode: mode,
        display: display,
        lang: lang,
        startYear: currYear - 20, //开始年份
        endYear: currYear + 20, //结束年份
    });

    $("#startTime").bind("change", function (e) {
        $("#startTime").val($("#startTime").val().replaceAll("/", "-"));
    });

    $("#endTime").bind("change", function (e) {
        $("#endTime").val($("#endTime").val().replaceAll("/", "-"));
    });

    getSign();

    var userName = window.localStorage.getItem("user_name");
    var certificateId = window.localStorage.getItem("certificate_id");
    var certificateName = window.localStorage.getItem("certificate_name");
    var certificateImage = window.localStorage.getItem("certificate_image");
    var startTime = window.localStorage.getItem("start_time");
    var endTime = window.localStorage.getItem("end_time");

    $("#userName").val(userName);

    //如果有值，说明不是新增，而是修改信息
    if (certificateId.length > 0 && certificateName.length > 0) {
        submitType = 2;
        $("#certificateId").val(certificateId);
        $("#certificateName").val(certificateName);
        $("#certificateName").removeAttr("onclick");
        $("#certificateButton").removeAttr("onclick");
    }

    if (startTime.length > 0 && endTime.length > 0) {
        $("#startTime").val(startTime.substring(0, 10));
        $("#endTime").val(endTime.substring(0, 10));
    }

    if (certificateImage.length > 0) {
        var imageList = certificateImage.split(",");
        for (var i = 0; i < imageList.length; i++) {
            setImage(imageList[i]);
        }
    }
});

/**
 * 选择资质证书
 */
function selectCertificate() {
    document.getElementById("certificateList").innerHTML = '<object type="text/html" data="certificate.html?v=20190909" width="100%" height="100%"></object>';
    $("#certificateList").show();
}

/**
 * 提交用户信息
 */
function submitUserInfo() {
    var certificateId = $("#certificateId").val();
    var certificateName = $("#certificateName").val();
    var startTime = $("#startTime").val();
    var endTime = $("#endTime").val();

    if (certificateId == null || certificateId.length == 0 || certificateName == null || certificateName.length == 0) {
        alert("请选择资质证书！");
        return;
    }

    if (startTime == null || startTime.length == 0) {
        alert("请选择开始时间！");
        return;
    }

    if (endTime == null || endTime.length == 0) {
        alert("请选择结束时间！");
        return;
    }

    if (compareDate(startTime, endTime)) {
        alert("开始时间不能大于结束时间！");
        return;
    }

    if ($(".certificate-image").size() <= 0) {
        alert("请上传证书图片！");
        return;
    }

    if(!confirm("确保所填信息与上传图片一致？")){
        return;
    }

    var certificateImage = "";
    $(".certificate-image").each(function () {
        certificateImage += $(this).val() + ",";
    });
    certificateImage = certificateImage.endsWith(",") ? certificateImage.substring(0, certificateImage.length - 1) : certificateImage;

    var params = {};
    params.funcId = submitType == 1 ? "hex_wechat_insertTempCertificateFunction" : "hex_wechat_updateTempCertificate";
    params.onset_time = startTime;
    params.failure_time = endTime;
    params.certificate_id = certificateId;
    params.certificate_name = certificateName;
    params.certificate_image = certificateImage;

    request({
        data: [params],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                return;
            }
            window.location.href = "index.html";
        }
    });
}

/**
 * 获取签名
 */
var ACCESS_TOKEN = "";

function getSign() {
    let url = encodeURIComponent(location.href.split('#')[0]);
    $.ajax({
        type: 'post',
        data: 'url=' + url,
        url: baseUrl + "/cffc/wechat/wxConfig.do",
        cache: false,
        async: false,
        dataType: 'json',
        success: function (data) {
            wx.config({
                debug: false,
                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: ['openLocation', 'getLocation', 'chooseImage', 'previewImage', 'uploadImage',
                    'downloadImage', 'scanQRCode', 'getLocalImgData']
            });
            ACCESS_TOKEN = data.access_token;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError);
        }
    });
}

/**
 * 拍照或相册选取
 */
function openChooseImg() {
    wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            console.log(res);
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var localIds = res.localIds;
            uploadWeixinImg(localIds, 0);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError);
        }
    })
}

/**
 * 上传图片到服务器
 * @param localIds
 * @param i
 */
function uploadWeixinImg(localIds, index) {
    if (!localIds) {
        return;
    }
    if (localIds.length <= index) {
        return;
    }
    for (var i = 0; i < localIds.length; i++) {
        wx.uploadImage({
            localId: localIds[i], // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function (res) {
                let mediaId = res.serverId;
                $.ajax({
                    type: 'post',
                    data: 'mediaId=' + mediaId,
                    url: baseUrl + '/cffc/wechat/wxUploadImg.do',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    success: function (data) {
                        console.log(data);
                        var imgUrl = data.data;
                        setImage(imgUrl);
                    }
                });
            },
            fail: function (error) {
                i++;
                alert(Json.stringify(error));
            }
        })
    }
}

/**
 * 回显图片
 */
function setImage(imgUrl) {
    $("#imageUrl").append("<input class=\"certificate-image\" value=\"" + imgUrl + "\" type=\"text\" hidden=\"hidden\"/>");
    //拼接完整地址
    imgUrl = HOST_URL + imgUrl;
    var context = "";
    context += "<div style=\"width: 2.4rem;height: 1.5rem;margin-right:.2rem;float: left;position: relative;\">";
    context += "<img class=\"certificate-img\" src=\"" + imgUrl + "\" style=\"width: 2.4rem;height: 1.5rem;\">";
    context += "<img onclick='showDeleteDialog(this)' src=\"img/delete.png\" style=\"width: .3rem;height:.3rem;position: absolute;top:.05rem;left:2.05rem;\">";
    context += "</div>";
    $("#showImage").append(context);
    if ($(".certificate-img").size() == 2) {
        $("#addImage").hide();
    }
}

var imgObj;

function showDeleteDialog(obj) {
    imgObj = obj;
    $("#cover").fadeIn(300);
    $(".delete-img").fadeIn(300);
}

/**
 *  删除图片
 */
function deleteImage() {
    var index = $(".certificate-img").index($(imgObj).prev());
    $(".certificate-image:eq(\"" + index + "\")").remove();
    $(imgObj).parent().remove();
    $("#addImage").show();
    $("#cover").fadeOut(300);
    $(".delete-img").fadeOut(300);
    imgObj = null;
};

/**
 * 取消删除图片
 */
function cancelDelete() {
    $("#cover").fadeOut(300);
    $(".delete-img").fadeOut(300);
}