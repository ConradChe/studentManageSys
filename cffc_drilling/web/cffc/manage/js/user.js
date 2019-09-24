function updateCurrentUser(item, isRefresh){
    // 保存登录信息
    window.localStorage.setItem("login_code", item["login_code"]);
    window.localStorage.setItem("token", item["login_token"]);
    window.localStorage.setItem("join_name", item["join_name"]);
    window.localStorage.setItem("join_full_name", item["join_full_name"]);
    window.localStorage.setItem("start_city_name", item["start_city_name"]);
    window.localStorage.setItem("join_show", item["join_name"] + "-" + item["open_city_name"] + "-" + item["service_name"]);
    window.localStorage.setItem("user_name", item["user_name"]);
    window.localStorage.setItem("service_id", item["service_id"]);
    window.localStorage.setItem("service_name", item["service_name"]);
    window.localStorage.setItem("open_city_id", item["open_city_id"]);
    window.localStorage.setItem("open_city_name", item["open_city_name"]);
    window.localStorage.setItem("role_id", item["role_id"]);
    window.localStorage.setItem("print_count", item["print_count"]);
    window.localStorage.setItem("is_can_print_delivery", item["is_can_print_delivery"]);
    window.localStorage.setItem("is_waybill_no_flow", item["is_waybill_no_flow"]);
    window.localStorage.setItem("label_print_type", item["label_print_type"]);
    window.localStorage.setItem("access_list", JSON.stringify(item["access_list"]));
    window.localStorage.setItem("showType", "2");
    // 设置用户信息到本地缓存，因为上面这种保存方式，如果内部域名或地址不一样则无法获取和传递
    hait.setCurrentUser(item);

    if(isRefresh) {
        window.location.reload();
        return;
    }
    var curDate = new Date();
    var loginDate = curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDate();
    item["login_date"] = loginDate;

    // 获取本地所有已登录的用户
    var localUserList = window.localStorage.getItem("local_user_list");
    if(localUserList == null || localUserList.length == 0) {
        localUserList = "[]";
    }
    localUserList = $.parseJSON(localUserList);

    // 重新组装登录用户
    var newUserList = [];
    for(var i = 0 ; i < localUserList.length ; i++) {
        var localUser = localUserList[i];
        var curLoginDate = localUser["login_date"];
        if(curLoginDate != loginDate) {
            continue;
        }
        var flag1 = localUser["join_name"] + "-" + localUser["login_code"];
        var flag2 = item["join_name"] + "-" + item["login_code"];
        if(flag1 != flag2) {
            newUserList.push(localUser);
        }
    }
    newUserList.push(item);
    window.localStorage.setItem("local_user_list", JSON.stringify(newUserList));
}

function getCurrentUserList(){
    var localUserList = window.localStorage.getItem("local_user_list");
    if(localUserList == null || localUserList.length == 0) {
        localUserList = "[]";
    }
    return $.parseJSON(localUserList);
}

function getCurrentUser(){
    var curToken = hait.getToken();
    // 获取本地所有已登录的用户
    var localUserList = getCurrentUserList();
    var currentUser = null;
    for(var i = 0 ; i < localUserList.length ; i++) {
        var localUser = localUserList[i];
        if(localUser["login_token"] == curToken) {
            currentUser = localUser;
            break;
        }
    }
    return currentUser;
}

function removeCurrentUser() {
    var curToken = hait.getToken();
    // 获取本地所有已登录的用户
    var localUserList = getCurrentUserList();

    for(var i = 0 ; i < localUserList.length ; i++) {
        var localUser = localUserList[i];
        if(localUser["login_token"] == curToken) {
            localUserList.splice(i, 1);
            break;
        }
    }
    window.localStorage.setItem("local_user_list", JSON.stringify(localUserList));
}