
$(document).ready(function(){
    getSign();
});

/**
 * 选择工作单位
 */
function selectContractor() {
    document.getElementById("contractorList").innerHTML = '<object type="text/html" data="contractor.html?v=20190909" width="100%" height="100%"></object>';
    $("#contractorList").show();
}

/**
 * 选择职务岗位
 */
function selectPost() {
    var postId = $("#postId").val();
    document.getElementById("postList").innerHTML = "<object type=\"text/html\" data=\"post.html?v=20190909&post_ids=" + postId + "\" width=\"100%\" height=\"100%\"></object>";
    $("#postList").show();
}

/**
 * 提交用户信息
 */
function submitUserInfo(){
    var userName = $("#userName").val();
    var gender = $("#gender").val();
    var mobilePhone = $("#mobilePhone").val();
    var idCard = $("#idCard").val();
    var contractorName = $("#contractorName").val();
    var postId = $("#postId").val();
    var postName = $("#postName").val();

    if(userName == null || userName.length == 0){
        alert("姓名不能为空！");
        return;
    }

    if(gender == null || gender.length == 0){
        alert("性别不能为空！");
        return;
    }

    if(mobilePhone == null || mobilePhone.length == 0){
        alert("手机号不能为空！");
        return;
    }

    if(!isMobile(mobilePhone)){
        alert("请输入正确的11位手机号！");
        return;
    }

    if(idCard == null || idCard.length == 0){
        alert("身份证号不能为空！");
        return;
    }

    if(!IdentityCodeValid(idCard)){
        alert("请输入正确的15位或18位身份证号！");
        return;
    }

    if(contractorName == null || contractorName.length == 0){
        alert("工作单位不能为空！");
        return;
    }

    if(postId == null || postId.length == 0 || postName == null || postName.length == 0){
        alert("职务岗位不能为空！");
        return;
    }

    var params = {};
    params.funcId = "hex_wechat_updateWechatUserInfoFunction";
    params.user_name = userName;
    params.gender = gender;
    params.mobile_phone = mobilePhone;
    params.id_card = idCard;
    params.contractor_name = contractorName;
    params.post_id = postId;
    params.post_name = postName;

    request({
        data: [ params ],
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
 * 显示性别选择
 */
function showGenderDialog(){
    $(".cover-div").css("display", "block");
    $(".gender-select").show(200);
}

/**
 * 选择男
 */
function selectMan(){
    $("#gender").val(1);
    $("#genderName").val("男");
    selectGender();
}

/**
 * 选择女
 */
function selectWoman(){
    $("#gender").val(2);
    $("#genderName").val("女");
    selectGender();
}

/**
 * 选择性别
 */
function selectGender(){
    $(".cover-div").css("display", "none");
    $(".gender-select").hide(200);
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
function uploadWeixinImg(localIds, i) {
    if (!localIds) {
        return;
    }
    if (localIds.length <= i) {
        return;
    }
    wx.uploadImage({
        localId: localIds[i], // 需要上传的图片的本地ID，由chooseImage接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
            let mediaId = res.serverId;
            $.ajax({
                type: 'post',
                data: 'mediaId=' + mediaId + "&type=1",
                url: baseUrl + '/cffc/wechat/wxUploadImg.do',
                cache: false,
                async: false,
                dataType: 'json',
                success: function (data) {
                    console.log(data);

                    if(parseInt(data.errcode) == -1){
                        alert("识别出错，请重试！");
                        return;
                    }
                    if(parseInt(parseInt(data.errcode) != 0)){
                        alert("请上传正确的身份证正面图片！");
                        return;
                    }
                    if(data.type != "Front"){
                        alert("请上传正确的身份证正面图片！");
                        return;
                    }
                    if( data.id == undefined || data.id == null || data.id.length == 0){
                        alert("识别出错，请重试！");
                        return;
                    }

                    $("#userName").val(data.name);
                    $("#idCard").val(data.id);
                }
            });
        },
        fail: function (error) {
            i++;
            alert(Json.stringify(error));
        }
    })
}