
/**
 * 操作标识
 */
var operateFlag = "";

/**
 * 用户列表选中行
 */
var userGridRow;

/**
 *单击用户信息列表
 */
function userGridRowClick(row) {
    userGridRow = row;
}

/**
 * 双击所在行
 */
function showModifyUserDialogClick(row) {
    userGridRow = row;
    showModifyUserDialog();
}


/**
 * 页面加载完毕
 */
$(document).ready(function () {
    userGrid = hait.getCompById("userGrid");
    userOperateForm = hait.getCompById("userOperateForm");
    userOperateDialog = hait.getCompById("userOperateDialog");

    //当表单请求完毕
    userOperateForm.onaftersubmit = function () {
        userOperateDialog.hide();//隐藏对话框
        userGrid.refresh();//刷新列表数据
    }

});


/**
 * 按条件查询用户信息
 */
function searchUserByConditions() {
    userGrid.params = {};
    var searchColumn = hait.getCompById("searchColumn").getValue();
    var searchValue = hait.getCompById("searchValue").getValue();
    if (searchValue != null && searchValue.length > 0 && searchColumn != "0"){
        userGrid.params[searchColumn] = searchValue;
    }

    //刷新页面
    userGrid.refresh();
}

/*
 *添加用户
 */
function showAddUserDialog() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    userOperateForm.reset();
    userOperateDialog.setTitle("添加用户");
    userOperateDialog.show();
    operateFlag = "add";
}

/**
 * 编辑用户
 */
function showModifyUserDialog() {

    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (userGridRow == null || userGridRow.length == 0){
        alert("您没有选择任何数据");
        return;
    }
    userOperateForm.reset();
    var params = {};
    params["user_id"] = userGridRow["user_id"];
    userOperateForm.load("hex_register_queryUserById",params);
    var roleId = userGridRow["role_id"];
    hait.getCompById("roleId").setValue(roleId);
    userOperateDialog.setTitle("编辑用户信息");
    userOperateDialog.show();
    operateFlag = "edit";
}

/**
 * 用户操作（增加、修改）
 */
function saveUserData() {
    //手机号正则
    var TEL_REGEXP = /^((1[358][0-9])|(14[57])|(17[0678])|(19[7]))\d{8}$/;

    var loginCode = userOperateForm.getValue("login_code");

    if (operateFlag == "add"){
        if(!confirm("您确定要添加此用户吗？")){
            return;
        }

        // 进行更多验证
        if(!TEL_REGEXP.test(loginCode)){
            alert("手机号输入错误，只能输入11位的手机号");
            return;
        }
        var roleId = hait.getCompById("roleId").getValue();
        var params = {};
        params["role_id"] = roleId;
        userOperateForm.setValue("role_name",roleId=="1"?"管理员":(roleId=="2"?"教师":"学生"));
        userOperateForm.submit("hex_register_userAddFunction",params);

    }
    if (operateFlag == "edit"){
        if(!confirm("您确定要修改此用户信息吗？")){
            return;
        }
        // 进行更多验证
        if(!TEL_REGEXP.test(loginCode)){
            alert("手机号输入错误，只能输入11位的手机号");
            return;
        }
        var roleId = hait.getCompById("roleId").getValue();
        var params = {};
        params["user_id"] = userGridRow["user_id"];
        params["role_id"] = roleId;
        userOperateForm.setValue("role_name",roleId=="1"?"管理员":(roleId=="2"?"教师":"学生"));
        userOperateForm.submit("hex_register_updateUserFunction",params);

    }
}

/**
 * 删除数据
 */
function doDeleteUser() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }

    var length = userGrid.getSelected().length;

    if (length == 0){
        alert("您没有选择任何数据");
        return;
    }

    if (!confirm("您确定要删除选中的数据？")) {
        return false;
    }

    //删除指令
    var params = userGrid.getSelected();
    for (var i=0;i< length;i++){
        var param = {};
        param["user_id"] = params[i].user_id
        param["funcId"] = "hex_register_deleteUserFunction";
        batchDelete(param);
    }

}

/**
 * 批量删除方法
 */
function batchDelete(param) {
    request({
        data:[param],
        func:function (data) {
            if (data.responses[0].flag <= 0){
                alert(data.responses[0].message);
                return false;
            }
            userGrid.refresh();
        }
    });
}

/*
*重置密码
 */
function showModifyResetPsw() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (userGridRow == null || userGridRow.length == 0){
        alert("您没有选择任何数据");
        return;
    }

    if (!confirm("您确定要将该用户的密码重置为默认密码吗？")) {
        return false;
    }
    //重置指令
    var params = {};
    params["user_id"] = userGridRow["user_id"];
    params["funcId"] = "hex_register_resetUserPswFunction";
    request({
        data:[params],
        func:function (data) {
            if (data.responses[0].flag <= 0){
                alert(data.responses[0].message);
                return;
            }
            alert("重置成功！");
            userGrid.refresh();
            userGridRow = null;
        }
    });
}
