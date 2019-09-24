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

        //当选择职务岗位的DIV显示的时候，返回键响应隐藏
        if (!$("#postList").is(":hidden")) {
            $("#postList").hide(300);
            return;
        }

        //当选择发证单位的DIV显示的时候，返回键响应隐藏
        if (!$("#certifyingList").is(":hidden")) {
            $("#certifyingList").hide(300);
            return;
        }

        //选择的DIV全部没有显示，则返回键响应返回个人中心
        window.location.href = "index.html";
    }, false);

    var theme = "ios";
    var mode = "scroller";
    var display = "bottom";
    var lang = "zh";
    var currYear = (new Date()).getFullYear();
    $('#onsetTime').mobiscroll().date({
        theme: theme,
        mode: mode,
        display: display,
        lang: lang,
        startYear: currYear - 20, //开始年份
        endYear: currYear + 20, //结束年份
    });

    $('#failureTime').mobiscroll().date({
        theme: theme,
        mode: mode,
        display: display,
        lang: lang,
        startYear: currYear - 20, //开始年份
        endYear: currYear + 20, //结束年份
    });

    $('#reviewTime').mobiscroll().date({
        theme: theme,
        mode: mode,
        display: display,
        lang: lang,
        startYear: currYear - 20, //开始年份
        endYear: currYear + 20, //结束年份
        cancelText: '清空',
        onClose: function (textVale, inst) { //插件效果退出时执行 inst:表示点击的状态反馈：set/cancel
            if(inst == "cancel"){
                $("#reviewTime").val("");
            }
        }
    });

    $("#onsetTime").bind("change", function (e) {
        $("#onsetTime").val($("#onsetTime").val().replaceAll("/", "-"));
    });

    $("#failureTime").bind("change", function (e) {
        $("#failureTime").val($("#failureTime").val().replaceAll("/", "-"));
    });

    $("#reviewTime").bind("change", function (e) {
        $("#reviewTime").val($("#reviewTime").val().replaceAll("/", "-"));
    });

    getSign();

    var userName = window.localStorage.getItem("user_name");
    var contractorName = window.localStorage.getItem("contractor_name");
    var postId = window.localStorage.getItem("post_id");
    var postName = window.localStorage.getItem("post_name");
    var certificateId = window.localStorage.getItem("certificate_id");
    var certificateName = window.localStorage.getItem("certificate_name");
    var certificateCode = window.localStorage.getItem("certificate_code");
    var onsetTime = window.localStorage.getItem("onset_time");
    var failureTime = window.localStorage.getItem("failure_time");
    var reviewTime = window.localStorage.getItem("review_time");
    var certifyingId = window.localStorage.getItem("certifying_id");
    var certifyingName = window.localStorage.getItem("certifying_name");
    var certificateImage = window.localStorage.getItem("certificate_image");
    var checkTrueLink = window.localStorage.getItem("check_true_link");
    var checkTrueImage = window.localStorage.getItem("check_true_image");

    $("#userName").val(userName);
    $("#contractorName").val(contractorName);

    //如果有值，说明不是新增，而是录入信息
    if (certificateId.length > 0 && certificateName.length > 0 && postId.length > 0 && postName.length > 0) {
        submitType = 2;
        //禁用资质证书的选择
        $("#certificateId").val(certificateId);
        $("#certificateName").val(certificateName);
        $("#certificateName").removeAttr("onclick");
        $("#certificateButton").removeAttr("onclick");
        //禁用职务岗位的选择
        $("#postId").val(postId);
        $("#postName").val(postName);
        $("#postName").removeAttr("onclick");
        $("#postButton").removeAttr("onclick");
    }

    //说明已经是完整证书，直接修改信息
    if (onsetTime.length > 0 && failureTime.length > 0) {
        //修改标题
        $("title").text("证书详情");
        $("#onsetTime").val(onsetTime.substring(0, 10));
        $("#failureTime").val(failureTime.substring(0, 10));
        $("#reviewTime").val(reviewTime.substring(0, 10));
        $("#certificateCode").val(certificateCode);
        $("#certifyingId").val(certifyingId);
        $("#certifyingName").val(certifyingName);
        $("#checkTrueLink").val(checkTrueLink);
        $("#selectButton").hide();
        $("#fullInfo").show();
    }

    if (certificateImage.length > 0) {
        imageId = "addImage";
        var imageList = certificateImage.split(",");
        for (var i = 0; i < imageList.length; i++) {
            setImage(imageList[i]);
        }
    }

    if (checkTrueImage.length > 0) {
        imageId = "addCheckImage";
        var imageList = checkTrueImage.split(",");
        for (var i = 0; i < imageList.length; i++) {
            setImage(imageList[i]);
        }
    }

    openImage();
});

/**
 * 选择资质证书
 */
function selectCertificate() {
    document.getElementById("certificateList").innerHTML = '<object type="text/html" data="certificate.html?v=20190909" width="100%" height="100%"></object>';
    $("#certificateList").show();
}

/**
 * 选择职务岗位
 */
function selectPost() {
    var postId = $("#postId").val();
    document.getElementById("postList").innerHTML = "<object type=\"text/html\" data=\"post_single.html?v=20190909&post_ids=" + postId + "\" width=\"100%\" height=\"100%\"></object>";
    $("#postList").show();
}

/**t
 * 选择发证单位
 */
function selectCertifying() {
    document.getElementById("certifyingList").innerHTML = "<object type=\"text/html\" data=\"certifying.html?v=20190916\" width=\"100%\" height=\"100%\"></object>";
    $("#certifyingList").show();
}

/**
 * 提交用户信息
 */
function submitUserInfo() {
    var postId = $("#postId").val();
    var postName = $("#postName").val();
    var certificateId = $("#certificateId").val();
    var certificateName = $("#certificateName").val();
    var certificateCode = $("#certificateCode").val();
    var onsetTime = $("#onsetTime").val();
    var failureTime = $("#failureTime").val();
    var reviewTime = $("#reviewTime").val();
    var certifyingName = $("#certifyingName").val();
    var checkTrueLink = $("#checkTrueLink").val();

    if (postId == null || postId.length == 0 || postName == null || postName.length == 0) {
        alert("请选择职务岗位！");
        return;
    }

    if (certificateId == null || certificateId.length == 0 || certificateName == null || certificateName.length == 0) {
        alert("请选择证书名称！");
        return;
    }

    if (certificateCode == null || certificateCode.length == 0) {
        alert("请输入证书编号！");
        return;
    }
    if (onsetTime == null || onsetTime.length == 0) {
        alert("请选择起效时间！");
        return;
    }

    if (failureTime == null || failureTime.length == 0) {
        alert("请选择失效时间！");
        return;
    }

    if (compareDate(onsetTime, failureTime)) {
        alert("失效时间不能大于起效时间！");
        return;
    }

    if (certifyingName == null || certifyingName.length == 0) {
        alert("请选择发证单位！");
        return;
    }

    if ($(".certificate-image").size() <= 0) {
        alert("请上传证书图片！");
        return;
    }

    if(!confirm("注意所选证书与上传证书图片是否一致，是否确保所填信息无误？")){
        return;
    }

    var certificateImage = "";
    $(".certificate-image").each(function () {
        certificateImage += $(this).val() + ",";
    });
    certificateImage = endWithoutComma(certificateImage);

    var checkImage = $("#checkImage").val();
    if(checkImage == null || checkImage.length == 0){
        if ($(".check-image").size() > 0) {
            $(".check-image").each(function () {
                checkImage += $(this).val() + ",";
            });
            return endWithoutComma(checkImage);
        }
    }

    var params = {};
    params.funcId = submitType == 1 ? "hex_wechat_insertCertificateFunction" : "hex_wechat_updateCertificateFunction";
    params.post_id = postId;
    params.post_name = postName;
    params.certificate_id = certificateId;
    params.certificate_name = certificateName;
    params.certificate_code = certificateCode;
    params.onset_time = onsetTime;
    params.failure_time = failureTime;
    if(reviewTime != null && reviewTime.length > 0){
        params.review_time = reviewTime;
    }
    params.certifying_name = certifyingName;
    params.certificate_image = certificateImage;
    params.check_true_link = checkTrueLink;
    params.check_true_image = checkImage;

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
function openChooseImg(select) {
    var certifyingName = $("#certifyingName").val();
    if (certifyingName == null || certifyingName.length == 0) {
        alert("请先选择发证单位！");
        return;
    }
    imageId = select;
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
    wx.uploadImage({
        localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
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

/**
 * 回显图片
 */
function setImage(imgUrl) {
    var imageClass = "certificate-image";
    var imgClass = "certificate-img";
    var imageUrlId = "imageUrl";
    var showImageId = "showImage";
    if (imageId != 'addImage') {
        imageClass = "check-image";
        imgClass = "check-img";
        imageUrlId = "checkImageUrl";
        showImageId = "showCheckImage";
    }
    $("#" + imageUrlId).append("<input class=\"" + imageClass + "\" value=\"" + imgUrl + "\" type=\"text\" hidden=\"hidden\"/>");
    //拼接完整地址
    imgUrl = HOST_URL + imgUrl;
    var context = "";
    context += "<div style=\"width: 2.4rem;height: 1.5rem;margin-right:.2rem;float: left;position: relative;\">";
    context += "<img class=\"show-img " + imgClass + "\" src=\"" + imgUrl + "\" style=\"width: 2.4rem;height: 1.5rem;\">";
    context += "<img onclick='showDeleteDialog(this)' src=\"img/delete.png\" style=\"width: .3rem;height:.3rem;position: absolute;top:.05rem;left:2.05rem;\">";
    context += "</div>";
    $("#" + showImageId).append(context);
    if ($("." + imgClass).size() == 2) {
        $("#" + imageId).hide();
    }
    openImage();
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
    var imageClass = "certificate-image";
    var imgClass = "certificate-img";
    if (imageId != 'addImage') {
        imageClass = "check-image";
        imgClass = "check-img";
    }
    var index = $("." + imgClass).index($(imgObj).prev());
    $("." + imageClass + ":eq(\"" + index + "\")").remove();
    $(imgObj).parent().remove();
    $("#" + imageId).show();
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

/**
 * 手动输入
 */
function manualInput() {
    var postId = $("#postId").val();
    var certificateId = $("#certificateId").val();
    var certifyingName = $("#certifyingName").val();
    if (postId == null || postId.length == 0) {
        alert("请先选择职务岗位！");
        return;
    }
    if (certificateId == null || certificateId.length == 0) {
        alert("请先选择证书名称！");
        return;
    }
    if (certifyingName == null || certifyingName.length == 0) {
        alert("请先选择发证单位！");
        return;
    }
    $('#fullInfo').show();
    $('#selectButton').hide()
}


/**
 * 自动扫描
 */
function autoScan() {
    var postId = $("#postId").val();
    var certificateId = $("#certificateId").val();
    var certifyingName = $("#certifyingName").val();
    if (postId == null || postId.length == 0) {
        alert("请先选择职务岗位！");
        return;
    }
    if (certificateId == null || certificateId.length == 0) {
        alert("请先选择证书名称！");
        return;
    }
    if (certifyingName == null || certifyingName.length == 0) {
        alert("请先选择发证单位！");
        return;
    }
    wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            console.log(res);
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var localIds = res.localIds;
            uploadScanImg(localIds, 0);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError);
        }
    })
}

/**
 * 上传并返回图片url
 */
function uploadScanImg(localIds, index) {
    if (!localIds) {
        return;
    }
    if (localIds.length <= index) {
        return;
    }
    //显示识别中提醒
    $("#loading").show();
    $("#cover").show();
    wx.uploadImage({
        localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
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
                    imageId = "addImage";
                    setImage(imgUrl);
                    autoScanImg(imgUrl);
                }
            });
        },
        fail: function (error) {
            i++;
            alert(Json.stringify(error));
        }
    })
}

/**
 * 自动扫描识别图片内容
 * @param url
 */
function autoScanImg(url) {

    var params = {};
    params.funcId = "hex_cffc_aliyunOcrUtil";
    // params.url = "http://des.dev.chinayunsoft.com/cffc/uploadImg/2019-08-29/test1.png";
    params.url = HOST_URL + url;
    request({
        data: [params],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);

                $("#showImage").html("");
                $("#imageUrl").html("");
                $("#showCheckImage").html("");
                $("#checkImageUrl").html("");

                //隐藏提醒
                $("#loading").hide();
                $("#cover").hide();
                return;
            }
            var items = data.responses[0].items;
            if (items == undefined || items == null || items.length == 0) {
                alert("识别失败，请重试！");

                $("#showImage").html("");
                $("#imageUrl").html("");
                $("#showCheckImage").html("");
                $("#checkImageUrl").html("");

                //隐藏提醒
                $("#loading").hide();
                $("#cover").hide();
                return;
            }
            var result = JSON.parse(items[0].entity).prism_wordsInfo;

            var onsetTime = "";
            var failureTime = "";
            var certificateCode = "";
            var certifyingName = "";
            for (var i = 0; i < result.length; i++) {
                var curWords = result[i].word;

                //识别匹配有效期 数字 + .
                if (/[0-9]/.test(curWords) && /[.]/.test(curWords)) {
                    console.log("有效期间：" + curWords);
                    curWords = curWords.replace(/[^[0-9]/g, "");
                    if (curWords.length == 16) {
                        onsetTime = curWords.substring(0, 4) + "-" + curWords.substring(4, 6) + "-" + curWords.substring(6, 8);
                        failureTime = curWords.substring(8, 12) + "-" + curWords.substring(12, 14) + "-" + curWords.substring(14, 16);
                    }
                    if (curWords.length == 8) {
                        if (onsetTime != null && onsetTime.length > 0) {
                            onsetTime = curWords.substring(0, 4) + "-" + curWords.substring(4, 6) + "-" + curWords.substring(6, 8);
                        } else {
                            failureTime = curWords.substring(0, 4) + "-" + curWords.substring(4, 6) + "-" + curWords.substring(6, 8)
                        }
                    }
                }

                //识别匹配证书编号 字母 + 数字
                if ((/[a-z]/.test(curWords) || /[A-Z]/.test(curWords)) && /[0-9]/.test(curWords)) {
                    console.log("证书编号：" + curWords);
                    curWords = curWords.replace(/[^[a-zA-Z0-9]/g, "");
                    certificateCode = curWords;
                }

                //识别匹配发证机关 川庆 中心 机构 培训
                if (curWords.length > 5 && (curWords.indexOf("川庆") > 0 || curWords.indexOf("中心") > 0 || curWords.indexOf("机构") > 0 || curWords.indexOf("培训") > 0)) {
                    console.log("发证机关：" + curWords);
                    certifyingName = curWords;
                }
            }

            if(onsetTime.length == 0 || failureTime.length == 0 || certificateCode.length == 0){
                alert("识别失败，请重试！");

                $("#showImage").html("");
                $("#imageUrl").html("");
                $("#showCheckImage").html("");
                $("#checkImageUrl").html("");

                //隐藏提醒
                $("#loading").hide();
                $("#cover").hide();
                return;
            }

            $("#onsetTime").val(onsetTime);
            $("#failureTime").val(failureTime);
            $("#certificateCode").val(certificateCode);

            //没有验真链接的，不进行爬取

            $.ajax({
                url: "http://cdss.chinayunsoft.com:5000/search/training_gugud_com?card_number=" + certificateCode,
                // url: "http://cdss.chinayunsoft.com:5000/search/training_gugud_com?card_number=8120173887",
                type: 'GET',
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                success: function (result) {
                    if (result.code != "200") {
                        $("#checkImage").val("");

                        $("#showImage").html("");
                        $("#imageUrl").html("");
                        $("#showCheckImage").html("");
                        $("#checkImageUrl").html("");

                        //隐藏提醒
                        $("#loading").hide();
                        $("#cover").hide();

                        //展开所有内容
                        $('#fullInfo').show();
                        $('#selectButton').hide();
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
                            $("#checkImage").val(imgUrl);
                            imageId = "checkImage";
                            setImage(imgUrl);
                            //隐藏提醒
                            $("#loading").hide();
                            $("#cover").hide();

                            //展开所有内容
                            $('#fullInfo').show();
                            $('#selectButton').hide();
                            return;
                        }
                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr);
                    console.log(ajaxOptions);
                    console.log(thrownError);
                    $("#checkImage").val("");

                    $("#showImage").html("");
                    $("#imageUrl").html("");
                    $("#showCheckImage").html("");
                    $("#checkImageUrl").html("");

                    //隐藏提醒
                    $("#loading").hide();
                    $("#cover").hide();

                    //展开所有内容
                    $('#fullInfo').show();
                    $('#selectButton').hide();
                    return;
                }
            });

            if(certifyingName == null || certifyingName.length == 0){
                $("#certifyingName").val("");
                return;
            }

            var params = {};
            params.funcId = "hex_cffc_queryCertifyingByOcrFunction";
            params.certifying_name = certifyingName;
            request({
                data: [params],
                func: function (data) {
                    if (data.responses[0].flag <= 0) {
                        alert(data.responses[0].message);
                        return;
                    }
                    var items = data.responses[0].items;
                    if (items == undefined || items == null || items.length == 0) {
                        $("#certifyingId").val("");
                        $("#certifyingName").val("");
                        return;
                    }
                    $("#certifyingId").val(items[0].certifying_id);
                    $("#certifyingName").val(items[0].certifying_name);
                }
            });
        }
    });

    // $.ajax({
    //     url: "http://test.dev.chinayunsoft.com/accurate_with_url2?img_url=" + HOST_URL + "/uploadImg/2019-08-29/test1.png",
    //     type: 'POST',
    //     contentType: "application/json;charset=UTF-8",
    //     dataType: "json",
    //     success: function (data) {
    //         console.log(data);
    //     },
    //     error: function (xhr, ajaxOptions, thrownError) {
    //         console.log(xhr);
    //         console.log(ajaxOptions);
    //         console.log(thrownError);
    //     }
    // });
}

/**
 * 点击查看大图
 */
function openImage(){
    var imgObj = $(".show-img");
    var imgs = [];
    for(var i=0; i<imgObj.length; i++){
        imgs.push(imgObj.eq(i).attr('src'));
        imgObj.eq(i).click(function(){
            var nowImgurl = $(this).attr('src');
            WeixinJSBridge.invoke("imagePreview",{
                "urls":imgs,
                "current":nowImgurl
            });
        });
    }
}