/**
 * 初始化管理中心界面
 */

$(document.body).ready(function () {

    // 判断是否登录
    var token = hait.getToken();

    if (token == null || token.length == 0 || token == "undefined") {
        alert("您还没有登录，请检查！");
        window.location.href = "../login/login.html";
        return;
    }

    // 获取权限页面
    var accessList = window.localStorage.getItem("access_list");
    // 如果没有任何权限，直接退出即可
    if (accessList == null || accessList.length == 0) {
        return;
    }

    // 转换权限信息为JSON
    accessList = JSON.parse(accessList);
    createMenu(accessList);

    //设置我的名字
    var userName = hait.getCurrentUser().user_name;
    $(".my-name").html(userName);

    //设置菜单栏的高度
    $(".manage-menu").css("height", $("#body").height() - 70);

    //浏览器窗口大小变化时，重新设置iframe的宽高
    window.onresize = function(){
        var managePage = document.getElementById("managePage");
        var width = managePage.offsetWidth;
        var height = $("#body").height() - 102;
        $("#iframePage").css("width", width);
        $("#iframePage").css("height", height);
        $("#managePage").css("height", height);
        $(".manage-menu").css("height", $("#body").height() - 70);
    };

    //点击我的名字，弹出操作框
    $(".user-button").click(function(event){
        $(".cover-transparent").show();
        $(".operate-div").show(150);
        //阻止事件冒泡
        event.stopPropagation();
    });

    //点击遮罩层隐藏操作框（点击其他地方隐藏操作框）
    $(".cover-transparent").click(function(){
        $(".cover-transparent").hide();
        $(".operate-div").hide(150);
    });
});

/**
 * 创建菜单
 *
 * @param accessList
 */
function createMenu(accessList) {

    // 开始生成一级权限菜单
    for (var i = 0; i < accessList.length; i++) {
        var access = accessList[i];
        var menuId = access["menu_id"];
        var menuName = access["menu_name"];
        var menuIcon = access["menu_icon"];
        var menuUrl = access["menu_url"];
        var parentId = access["parent_id"];
        var isLeaf = access["is_leaf"];

        // 如果是一级菜单就放到一级菜单框中
        if (parentId == "0") {
            var context = "";
            context += "<div class=\"menu menu-0\" menu-id=\"" + menuId + "\" onclick=\"hrefMenuPage('" + menuUrl + "','" + menuId + "','" + isLeaf + "')\">";
            context += "<img class=\"menu-icon\" src=\"" + menuIcon + "\"/>";
            context += "<span class=\"menu-name\">" + menuName + "</span>";
            context += "</div>";
            $(".manage-menu").append(context);
            //默认选中首页
            if(menuName == "首页"){
                hrefMenuPage(menuUrl, menuId, isLeaf);
            }
            continue;
        }

        // 如果是二级菜单，则放到对应对应位置
        var parent = $("div.menu-0[menu-id='" + parentId + "']");
        var children = $("div.menu-1[parent-id='" + parentId + "']");
        var secondMenu = "";
        secondMenu += "<div hidden='hidden' class=\"menu menu-1\" parent-id=\"" + parentId + "\" parent-name=\"" + parent.find(".menu-name").html() + "\" menu-id=\"" + menuId + "\" onclick=\"hrefMenuPage('" + menuUrl + "','" + menuId + "','" + isLeaf + "')\">";
        secondMenu += "<span class=\"menu-name\">" + menuName + "</span>";
        secondMenu += "</div>";
        if(children.size() > 0){
            children.last().after(secondMenu);
            continue;
        }
        if (parent.size() > 0) {
            parent.after(secondMenu);
        }
    }

}

/**
 * 提示是否确定退出系统
 */
function showExitDialog(){
    $(".operate-div").hide();
    $(".cover-div").show();
    $(".exit-system").show(150);
}

/**
 * 取消退出系统
 */
function cancelExitSystem(){
    $(".cover-div").hide();
    $(".exit-system").hide(150);
}

/**
 * 退出系统
 */
function exitSystem() {
    $.post(LOGOUT_URL, {
        login_token: hait.getToken()
    }, function (result) {
        var response = result.global;
        if (response.flag <= 0) {
            alert(response.messsage);
            return;
        }
        removeCurrentUser();
        window.location.href = "../login/login.html";
    }, "json");
}

/**
 * 跳转到点击的菜单绑定的子页面
 */
function hrefMenuPage(url, menuId, isLeaf) {

    //取消其他菜单的选中样式
    $("div.menu").css("background-color", "rgba(58, 65, 92, 1)");
    $("div.menu").css("border-left", "2px solid rgba(58, 65, 92, 1)");

    //设置当前点击的菜单选中样式
    var menu = $("div.menu[menu-id='" + menuId + "']");
    menu.css("background-color", "rgba(46,52,74,1)");
    menu.css("border-left", "2px solid rgba(255,255,255,1)");

    //非枝叶的主干菜单，点击后展开枝叶或收起枝叶，没有跳转子页面
    if(parseInt(isLeaf) == 2){
        $(".menu-name-select").html(menu.find(".menu-name").html());
        var children = $("div.menu-1[parent-id='" + menuId + "']");
        if(children.is(":hidden")){
            children.show(200);
        }else{
            children.hide(200);
        }
        return;
    }

    //更新顶部显示的当前菜单名称
    $(".menu-name-select").html(menu.find(".menu-name").html());

    //跳转到选中菜单绑定的页面
    $("#managePage").css("height", $("#body").height() - 102);
    var hrefUrl = BASE_PATH + url;
    var managePage = document.getElementById("managePage");
    managePage.innerHTML = "<object id=\"iframePage\" type=\"text/html\" data=\"" + hrefUrl + "\" width=\"100%\" height=\"100%\"></object>";
}

/**
 * 显示修改密码框
 */
function showUpdatePasswordDialog(){
    $(".cover-transparent").hide();
    $(".operate-div").hide(100);
    // $(".cover-div").show();
    hait.getCompById("updatePasswordDialog").show();
}

/**
 * 关闭修改密码对话框
 */
function closeDialog() {
    hait.getCompById("updatePasswordDialog").hide();
}

/**
 * 修改密码
 * @returns {boolean}
 */
function formSubmit(){
    var form = hait.getCompById("changePassForm");

    // 首先让表单自己进行验证操作
    if (!form.validate()) {
        return;
    }

    // 首选判断两次输入的新密码是否一致
    var formerLoginCode = form.getValue("formerLoginCode");
    var loginCode = form.getValue("loginCode");
    var rePass = form.getValue("rePass");

    if (rePass != loginCode) {
        alert("两次输入的新密码不一样，请检查！");
        return false;
    }

    if (!window.confirm("您确定要修改密码吗？")) {
        return false;
    }

    // 运行到这里，表示一切正确，那么更新密码
    var params = {};
    params.former_login_pass = formerLoginCode;
    params.login_pass = loginCode;

    params.funcId = "hex_login_updatePasswordFunction";

    // 执行这个操作
    request({
        data : [ params ],
        func : function(data) {
            if(data.responses[0].flag <= 0){
                alert(data.responses[0].message);
                return;
            }
            alert("修改成功");
            window.location.href="../login/login.html";
        }
    });
    return false;
};
















