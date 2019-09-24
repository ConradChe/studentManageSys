

/*
 *页面加载完成
 */
$(document).ready(function () {
    studentOperateForm = hait.getCompById("studentOperateForm");
    var userId = hait.getCurrentUser().user_id;
    var params = {};
    params["user_id"] = userId;
    studentOperateForm.load("hex_student_queryStudentDetails",params);
});

/*
 *修改数据
 */
function saveTeacherData() {
    var TEL_REGEXP = /^((1[358][0-9])|(14[57])|(17[0678])|(19[7]))\d{8}$/;
    var mobilePhone = studentOperateForm.getValue("mobile_phone");
    // 判断手机号是否合法
    if(!TEL_REGEXP.test(mobilePhone)){
        alert("手机号不合法，请重新输入！");
        return;
    }
    var params = {};
    var userId = hait.getCurrentUser().user_id;
    params["user_id"] = userId;
    studentOperateForm.submit("hex_student_updateStudentDetailsFunction",params);
}