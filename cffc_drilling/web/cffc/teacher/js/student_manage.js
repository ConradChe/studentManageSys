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
    studentOperateForm.load("hex_student_queryStudentDetails",params);
    studentOperateDialog.setTitle("学生详情");
    studentOperateDialog.show();
    studentGridRow = null;
}


