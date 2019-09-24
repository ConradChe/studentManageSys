$(document).ready(function () {

    //控制返回键
    window.history.pushState(null, null, "#");
    window.addEventListener("popstate", function (e) {

        //将浏览器缓存上一步设置为null，避免返回键直接返回上一个历史界面
        window.history.pushState(null, null, "#");

        //关闭整个页面，回到对话窗口
        WeixinJSBridge.call('closeWindow');
    }, false);

    initialization();
});

/**
 * 初始化
 */
function initialization() {
    var params = {};
    params.funcId = "hex_wechat_queryWechatUserByUserIdFunction";
    request({
        data: [params],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                return;
            }
            var item = data.responses[0].items[0];
            var headImg = item.head_img;
            var userId = item.user_id;
            var userName = item.user_name;
            var contractorId = item.contractor_id;
            var contractorName = item.contractor_name;

            window.localStorage.setItem("user_id", userId);
            window.localStorage.setItem("user_name", userName);
            window.localStorage.setItem("contractor_id", contractorId);
            window.localStorage.setItem("contractor_name", contractorName);

            //获取绑定的证书
            var certificateList = data.responses[0].items[1].certificate_list;
            var expireDay = data.responses[0].items[1].expire_day;//到期预警天数
            expireDay = expireDay.length == 0 ? 7 : expireDay;
            var todayDate = getNowFormatDate();//当前日期
            var messageText = "";
            var context = "";
            for (var i = 0; i < certificateList.length; i++) {
                var certificate = certificateList[i];
                var checkState = parseInt(certificate.check_state);//录入状态
                var certificateName = certificate.certificate_name;//证书名称
                var onsetTime = certificate.onset_time;//起效时间
                var failureTime = certificate.failure_time;//失效时间
                var expireDate = getAfterDate(failureTime, -expireDay);//到期预警日期
                var timeScope = "";

                if ((checkState == 1 || checkState == 2 || checkState == 3) && onsetTime != null && onsetTime.length > 0 && failureTime != null && failureTime.length > 0) {
                    //已过期
                    if (compareDate(todayDate, failureTime)) {
                        messageText += certificateName + "已过期，请尽快去培训中心重新获取！";
                    }
                    //即将到期
                    if (compareDate(todayDate, expireDate) && !compareDate(todayDate, failureTime)) {
                        var day = parseInt(getDateDays(failureTime, todayDate));
                        day = day > 1 ? day - 1 : 1;
                        messageText += certificateName + "还有" + day + "天到期，请尽快去培训中心重新获取！";
                    }
                    timeScope = onsetTime.substring(0, 10) + " ~ " + failureTime.substring(0, 10)
                }


                //已录入
                if (checkState == 1 || checkState == 2) {
                    context += "<div class=\"certificate-list\" onclick='showFullAddDialog(" + JSON.stringify(certificate) + ")'>";
                    context += "<div style=\"float: left;width:70%;text-align: left;\">";
                    context += "<div style=\"float: left;\"><img src=\"img/entering.png\" style=\"height: .4rem;margin-top:.4rem;\"></div>";
                    context += "<div style=\"float: left;width:80%;padding-top: .2rem;padding-left:.1rem;\">";
                    context += "<div style=\"white-space: nowrap;overflow: hidden;font-size: .28rem;line-height: .4rem;\">" + certificateName + "</div>";
                    context += "<div style=\"white-space: nowrap;overflow: hidden;font-size: .22rem;color: #999999;line-height: .4rem;\">" + timeScope + "</div>";
                    context += "</div>";
                    context += "</div>";
                    context += "<div style=\"float: left;width: 23%;text-align: center;color:#0663DA;height:1.2rem;line-height:1.2rem;\">";
                    context += "<span style=\"font-size: .22rem;\">&nbsp;</span>";
                    context += "</div>";
                    context += "<div style=\"float: left;width:7%;text-align: left;height:1.2rem;line-height:1.17rem;\">";
                    context += "<img src=\"img/right.png\" style=\"width: .12rem;height: .24rem;\">";
                    context += "</div>";
                    context += "</div>";
                }
                //未录入
                if (checkState == 5) {
                    context += "<div class=\"certificate-list\" onclick='showExistAddDialog(" + JSON.stringify(certificate) + ")'>";
                    context += "<div style=\"float: left;width:70%;text-align: left;\">";
                    context += "<div style=\"float: left;\"><img src=\"img/no_entry.png\" style=\"height: .4rem;margin-top:.4rem;\"></div>";
                    context += "<div style=\"float: left;width:80%;padding-top: .2rem;padding-left:.1rem;\">";
                    context += "<div style=\"white-space: nowrap;overflow: hidden;font-size: .28rem;line-height: .8rem;\">" + certificateName + "</div>";
                    context += "</div>";
                    context += "</div>";
                    context += "<div style=\"float: left;width: 23%;text-align: center;color:#999999;height:1.2rem;line-height:1.2rem;\">";
                    context += "<span style=\"font-size: .22rem;\">未录入</span>";
                    context += "</div>";
                    context += "<div style=\"float: left;width:7%;text-align: left;height:1.2rem;line-height:1.17rem;\">";
                    context += "<img src=\"img/right.png\" style=\"width: .12rem;height: .24rem;\">";
                    context += "</div>";
                    context += "</div>";
                }
                //临时证明
                if (checkState == 3) {
                    context += "<div class=\"certificate-list\" onclick='showTempAddDialog(" + JSON.stringify(certificate) + ")'>";
                    context += "<div style=\"float: left;width:70%;text-align: left;\">";
                    context += "<div style=\"float: left;\"><img src=\"img/entering.png\" style=\"height: .4rem;margin-top:.4rem;\"></div>";
                    context += "<div style=\"float: left;width:80%;padding-top: .2rem;padding-left:.1rem;\">";
                    context += "<div style=\"white-space: nowrap;overflow: hidden;font-size: .28rem;line-height: .4rem;\">" + certificateName + "</div>";
                    context += "<div style=\"white-space: nowrap;overflow: hidden;font-size: .22rem;color: #999999;line-height: .4rem;\">" + timeScope + "</div>";
                    context += "</div>";
                    context += "</div>";
                    context += "<div style=\"float: left;width: 23%;text-align: center;color:#F64744;height:1.2rem;line-height:1.2rem;\">";
                    context += "<span style=\"font-size: .22rem;\">临时证明</span>";
                    context += "</div>";
                    context += "<div style=\"float: left;width:7%;text-align: left;height:1.2rem;line-height:1.17rem;\">";
                    context += "<img src=\"img/right.png\" style=\"width: .12rem;height: .24rem;\">";
                    context += "</div>";
                    context += "</div>";
                }

            }

            $("#certificateList").html(context);
            $("#userName").html(userName);
            $("#contractorName").html(contractorName);
            $("#headImg").prop("src", headImg);
            $("#userInfo").show();


            //没有预警消息，不需要显示警告
            if (messageText == null || messageText == "" || messageText.length == 0) {
                var titleHeight = document.getElementById("certificate");
                var buttonHeight = document.getElementById("certificateButton");
                $("#certificateList").css("height", buttonHeight.offsetTop - titleHeight.offsetTop - titleHeight.offsetHeight - 20);
                return;
            }
            var scrollMessage = document.getElementById('scrollMessage');
            var scrollMessageWidth = scrollMessage.offsetWidth;//div宽度
            var message = document.getElementById("message");
            message.innerText = messageText;
            var messageWidth = message.offsetWidth;//文字宽度
            //显示文字宽度没有超过div宽度，不需要滚动
            if (messageWidth < scrollMessageWidth) {
                return;
            }
            //显示警告
            $(".my-message").show();

            var titleHeight1 = document.getElementById("certificate");
            var buttonHeight1 = document.getElementById("certificateButton");
            $("#certificateList").css("height", buttonHeight1.offsetTop - titleHeight1.offsetTop - titleHeight1.offsetHeight - 20);

            //每 20 毫秒滚动 1 像素
            setInterval("scrollMessage(document.getElementById('scrollMessage'))", 20);
        }
    });
}

/**
 * 消息提醒内容自动滚动
 */
function scrollMessage(obj) {
    var tmp = (obj.scrollLeft)++;
    //当滚动条到达右边顶端时，自动追加内容，不间断滚动
    if (obj.scrollLeft == tmp) {
        var size = parseInt($(".message").size());
        //避免无限叠加div中的消息提醒内容
        if (size > 1) {
            obj.scrollLeft = obj.scrollLeft - document.getElementById("message").offsetWidth - 22;
        } else {
            obj.innerHTML += obj.innerHTML;
        }
    }
    //当滚动条滚动了初始内容的宽度时滚动条回到最左端
    if (obj.scrollLeft >= obj.firstChild.offsetWidth) {
        obj.scrollLeft = 0;
    }

}

/**
 *  选择录入证书性质
 */
function showAddDialog() {
    //临时证明单击事件
    $("#tempButton").click(function () {
        window.localStorage.setItem("certificate_id", "");
        window.localStorage.setItem("certificate_name", "");
        window.localStorage.setItem("certificate_image", "");
        window.localStorage.setItem("start_time", "");
        window.localStorage.setItem("end_time", "");
        window.location.href = 'temp_certificate.html';
    });

    //资质证书单击事件
    $("#fullButton").click(function () {
        window.localStorage.setItem("post_id", "");
        window.localStorage.setItem("post_name", "");
        window.localStorage.setItem("certificate_id", "");
        window.localStorage.setItem("certificate_name", "");
        window.localStorage.setItem("certificate_code", "");
        window.localStorage.setItem("onset_time", "");
        window.localStorage.setItem("failure_time", "");
        window.localStorage.setItem("review_time", "");
        window.localStorage.setItem("certifying_id", "");
        window.localStorage.setItem("certifying_name", "");
        window.localStorage.setItem("certificate_image", "");
        window.localStorage.setItem("check_true_link", "");
        window.localStorage.setItem("check_true_image", "");
        window.location.href = 'full_certificate.html';
    });

    //显示选择框
    $("#cover").fadeIn(200);
    $(".add-select").fadeIn(200);
}

/**
 *  未录入的证书，选择录入证书性质
 */
function showExistAddDialog(certificate) {
    //临时证明单击事件
    $("#tempButton").click(function () {
        window.localStorage.setItem("certificate_id", certificate.certificate_id);
        window.localStorage.setItem("certificate_name", certificate.certificate_name);
        window.localStorage.setItem("certificate_image", "");
        window.localStorage.setItem("start_time", "");
        window.localStorage.setItem("end_time", "");
        window.location.href = 'temp_certificate.html';
    });

    //资质证书单击事件
    $("#fullButton").click(function () {
        window.localStorage.setItem("post_id", certificate.post_id);
        window.localStorage.setItem("post_name", certificate.post_name);
        window.localStorage.setItem("certificate_id", certificate.certificate_id);
        window.localStorage.setItem("certificate_name", certificate.certificate_name);
        window.localStorage.setItem("certificate_code", "");
        window.localStorage.setItem("onset_time", "");
        window.localStorage.setItem("failure_time", "");
        window.localStorage.setItem("review_time", "");
        window.localStorage.setItem("certifying_id", "");
        window.localStorage.setItem("certifying_name", "");
        window.localStorage.setItem("certificate_image", "");
        window.localStorage.setItem("check_true_link", "");
        window.localStorage.setItem("check_true_image", "");
        window.location.href = 'full_certificate.html';
    });

    $("#cover").fadeIn(200);
    $(".add-select").fadeIn(200);
}

/**
 * 临时证明的证书，修改证书信息
 */
function showTempAddDialog(certificate) {
    //临时证明单击事件
    $("#tempButton").click(function () {
        window.localStorage.setItem("certificate_id", certificate.certificate_id);
        window.localStorage.setItem("certificate_name", certificate.certificate_name);
        window.localStorage.setItem("certificate_image", certificate.certificate_image);
        window.localStorage.setItem("start_time", certificate.onset_time);
        window.localStorage.setItem("end_time", certificate.failure_time);
        window.location.href = 'temp_certificate.html';
    });
    //资质证书单击事件
    $("#fullButton").click(function () {
        window.localStorage.setItem("post_id", certificate.post_id);
        window.localStorage.setItem("post_name", certificate.post_name);
        window.localStorage.setItem("certificate_id", certificate.certificate_id);
        window.localStorage.setItem("certificate_name", certificate.certificate_name);
        window.localStorage.setItem("certificate_code", "");
        window.localStorage.setItem("onset_time", "");
        window.localStorage.setItem("failure_time", "");
        window.localStorage.setItem("review_time", "");
        window.localStorage.setItem("certifying_id", "");
        window.localStorage.setItem("certifying_name", "");
        window.localStorage.setItem("certificate_image", "");
        window.localStorage.setItem("check_true_link", "");
        window.localStorage.setItem("check_true_image", "");
        window.location.href = 'full_certificate.html';
    });
    $("#cover").fadeIn(200);
    $(".add-select").fadeIn(200);
}

/**
 * 已录入的证书，修改证书信息
 */
function showFullAddDialog(certificate) {
    window.localStorage.setItem("post_id", certificate.post_id);
    window.localStorage.setItem("post_name", certificate.post_name);
    window.localStorage.setItem("certificate_id", certificate.certificate_id);
    window.localStorage.setItem("certificate_name", certificate.certificate_name);
    window.localStorage.setItem("certificate_code", certificate.certificate_code);
    window.localStorage.setItem("onset_time", certificate.onset_time);
    window.localStorage.setItem("failure_time", certificate.failure_time);
    window.localStorage.setItem("review_time", certificate.review_time);
    window.localStorage.setItem("certifying_id", certificate.certifying_id);
    window.localStorage.setItem("certifying_name", certificate.certifying_name);
    window.localStorage.setItem("certificate_image", certificate.certificate_image);
    window.localStorage.setItem("check_true_link", certificate.check_true_link);
    window.localStorage.setItem("check_true_image", certificate.check_true_image);
    window.location.href = 'full_certificate.html';
}

/**
 * 取消录入证书
 */
function cancelAdd() {
    $("#cover").fadeOut(200);
    $(".add-select").fadeOut(200);
}