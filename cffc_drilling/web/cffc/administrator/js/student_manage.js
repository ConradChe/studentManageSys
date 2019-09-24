/**
 * 学生列表选中行
 */
var studentGridRow;

/**
 * 页面加载完毕执行操作
 */
$(document).ready(function () {
    studentGrid = hait.getCompById("studentGrid");
    studentOperateDialog = hait.getCompById("studentOperateDialog");
    studentOperateForm = hait.getCompById("studentOperateForm");
    studentOperateDialog1 = hait.getCompById("studentOperateDialog1");
    studentOperateForm1 = hait.getCompById("studentOperateForm1");

    //当表单请求完毕
    studentOperateForm.onaftersubmit = function () {
        studentOperateDialog.hide();//隐藏对话框
        studentGrid.refresh();//刷新列表数据
    }

});

/**
 * 单击选中行
 */
function studentGridRowClick(row) {
    studentGridRow = row;
}


/**
 *条件查询学生
 */
function searchStudentByConditions() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    studentGrid.params = {};
    var searchColumn = hait.getCompById("searchColumn").getValue();
    var searchValue = hait.getCompById("searchValue").getValue();

    if (searchValue != null && searchValue.length > 0 && searchColumn != "0"){
        studentGrid.params[searchColumn] = searchValue;
    }

    //刷新页面
    studentGrid.refresh();

}

/**
 * 分配学生
 */
function showAddStudentDialog() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (studentGridRow == null || studentGridRow.length == 0){
        alert("您没有选择任何数据！");
        return;
    }
    studentOperateForm.reset();
    var params = {};
    params["user_id"] = studentGridRow["user_id"];
    studentOperateForm.load("hex_student_queryStudent",params);
    var classId = studentGridRow["class_id"];
    hait.getCompById("classId").setValue(classId);
    studentOperateDialog.setTitle("分配学生");
    studentOperateDialog.show();
}

/**
 * 执行分配学生操作
 */
function saveTeacherData() {
    if(!confirm("您确定要分配此学生吗？")){
        return;
    }
    var classId = hait.getCompById("classId").getValue();
    var params = {};
    params["user_id"] = studentGridRow["user_id"];
    params["class_id"] = classId;
    params["class_name"] = classId == 1 ? "1班" : (classId == 2 ? "2班" : "3班");
    studentOperateForm.submit("hex_student_resetStudentFunction",params);
}

/**
 * 删除学生
 */
function doDeleteStudent() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (studentGridRow == null || studentGridRow.length == 0){
        alert("您没有选择任何数据");
        return;
    }

    if (!confirm("您确定要删除选中的数据？")) {
        return false;
    }

    //删除指令
    var params = {};
    params["user_id"] = studentGridRow["user_id"];
    params["funcId"] = "hex_register_deleteUserFunction";

    request({
        data:[params],
        func:function (data) {
            if (data.responses[0].flag <= 0){
                alert(data.responses[0].message);
                return;
            }
            studentGrid.refresh();
            studentGridRow = null;
        }
    });
}

/**
 * 查看学生详情
 */
function searchStudentDetails() {
    if (studentGridRow == null || studentGridRow.length == 0){
        alert("您没有做任何选择！");
        return;
    }
    var params = {};
    var userId = studentGridRow["user_id"];
    params["user_id"] = userId;
    studentOperateForm1.load("hex_student_queryStudentDetails",params);
    studentOperateDialog1.setTitle("学生详情");
    studentOperateDialog1.show();
    studentGridRow = null;
}
