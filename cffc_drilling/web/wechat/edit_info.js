
$(document).ready(function(){
    //控制返回键
    window.history.pushState(null, null, "#");
    window.addEventListener("popstate", function(e) {

        //将浏览器缓存上一步设置为null，避免返回键直接返回上一个历史界面
        window.history.pushState(null, null, "#");

        //当选择工作单位的DIV显示的时候，返回键响应隐藏
        if(!$("#contractorList").is(":hidden")){
            $("#contractorList").hide(300);
            $("title").text("编辑资料");
            return;
        }

        //当选择职务岗位的DIV显示的时候，返回键响应隐藏
        if(!$("#postList").is(":hidden")){
            $("#postList").hide(300);
            $("title").text("编辑资料");
            return;
        }

        //如果选择工作单位和选择职务岗位的DIV都没有显示，则返回键响应返回个人中心
        window.location.href = "index.html";
    }, false);

    var params = {};
    params.funcId = "hex_wechat_queryWechatUserByUserId";
    request({
        data: [ params ],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                return;
            }
            var item = data.responses[0].items[0];
            var headImg = item.head_img;
            var userName = item.user_name;
            var gender = item.gender;
            var mobilePhone = item.mobile_phone;
            var idCard = item.id_card;
            var contractorName = item.contractor_name;
            var postId = item.post_id;
            var postName = item.post_name;

            $("#headImg").prop("src", headImg);
            $("#userName").val(userName);
            $("#gender").val(gender);
            $("#genderName").val(hait.getDictByCodeAndName("GENDER", gender));
            $("#mobilePhone").val(mobilePhone);
            $("#idCard").val(idCard);
            $("#contractorName").val(contractorName);
            $("#postId").val(postId);
            $("#postName").val(postName.replaceAll(",", "、"));
            drawGender(gender == 1 ? 2 : 1);

            if(gender == 1){
                $("#man").css("color", "#0663DA");
                $("#woman").css("color", "black");
            }else{
                $("#man").css("color", "black");
                $("#woman").css("color", "#0663DA");
            }
        }
    });
});

/**
 * 选择工作单位
 */
function selectContractor() {
    document.getElementById("contractorList").innerHTML = '<object type="text/html" data="contractor.html?v=20190916111" width="100%" height="100%"></object>';
    $("#contractorList").show();
    // $("title").text("选择工作单位");
}

/**
 * 选择职务岗位
 */
function selectPost() {
    var postId = $("#postId").val();
    document.getElementById("postList").innerHTML = "<object type=\"text/html\" data=\"post.html?v=20190909&post_ids=" + postId + "\" width=\"100%\" height=\"100%\"></object>";
    $("#postList").show();
    // $("title").text("选择职务岗位");
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
    params.post_name = postName.replaceAll("、", ",");

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
    $("#man").css("color", "#0663DA");
    $("#woman").css("color", "black");
    selectGender();
}

/**
 * 选择女
 */
function selectWoman(){
    $("#gender").val(2);
    $("#genderName").val("女");
    $("#man").css("color", "black");
    $("#woman").css("color", "#0663DA");
    selectGender();
}

/**
 * 选择性别
 */
function selectGender(){
    $(".cover-div").css("display", "none");
    $(".gender-select").hide(200);
}

function drawGender(gender){
    if(gender == 1){
        $("#topShow").fadeIn("200");
        $("#gender").val(2);
        $("#genderName").val("女");
        $("#centerShowMan").hide();
        $("#centerShowWoman").fadeIn("200");
        $("#bottomShow").fadeOut("200");
    }
    if(gender == 2){
        $("#topShow").fadeOut("200");
        $("#gender").val(1);
        $("#genderName").val("男");
        $("#centerShowMan").fadeIn("200");
        $("#centerShowWoman").hide();
        $("#bottomShow").fadeIn("200");
    }
}