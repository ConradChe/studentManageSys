/**
 * 教师列表选中行
 */
var teacherGridRow;

/**
 * 页面加载完毕
 */
$(document).ready(function () {
    teacherGrid = hait.getCompById("teacherGrid");
    teacherOperateForm = hait.getCompById("teacherOperateForm");
    teacherOperateDialog = hait.getCompById("teacherOperateDialog");

    //当表单请求完毕
    teacherOperateForm.onaftersubmit = function () {
        teacherOperateDialog.hide();//隐藏对话框
        teacherGrid.refresh();//刷新列表数据
    }

});

/**
 * 单击所属教师行
 */
function teacherGridRowClick(row) {
    teacherGridRow = row;
}

/**
 * 条件查询
 */
function searchTeacherByConditions() {
    teacherGrid.params = {};
    var searchColumn = hait.getCompById("searchColumn").getValue();
    var searchValue = hait.getCompById("searchValue").getValue();
    if (searchValue != null && searchValue.length > 0 && searchColumn != "0"){
        teacherGrid.params[searchColumn] = searchValue;
    }

    //刷新页面
    teacherGrid.refresh();
}

/**
 * 分配教师
*/
function showAddTeacherDialog() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (teacherGridRow == null || teacherGridRow.length == 0){
        alert("您没有选择任何数据！");
        return;
    }
    teacherOperateForm.reset();
    var params = {};
    params["user_id"] = teacherGridRow["user_id"];
    teacherOperateForm.load("hex_teacher_queryTeacher",params);
    var classId = teacherGridRow["class_id"];
    hait.getCompById("classId").setValue(classId);
    teacherOperateDialog.setTitle("分配教师");
    teacherOperateDialog.show();
}

/**
 * 执行操作(分配教师，编辑教师)
 */
function saveTeacherData() {
        if(!confirm("您确定要分配此教师吗？")){
            return;
        }
        var classId = hait.getCompById("classId").getValue();
        var params = {};
        params["user_id"] = teacherGridRow["user_id"];
        params["class_id"] = classId;
        params["class_name"] = classId == 1 ? "1班" : (classId == 2 ? "2班" : "3班");
        teacherOperateForm.submit("hex_teacher_resetTeacherFunction",params);
}

/**
 * 删除教师
 */
function doDeleteTeacher() {
    if(hait.getCurrentUser().role_id != "1"){
        alert("您没有操作权限！");
        return;
    }
    if (teacherGridRow == null || teacherGridRow.length == 0){
        alert("您没有选择任何数据");
        return;
    }

    if (!confirm("您确定要删除选中的数据？")) {
        return false;
    }

    //删除指令
    var params = {};
    params["user_id"] = teacherGridRow["user_id"];
    params["funcId"] = "hex_register_deleteUserFunction";

    request({
        data:[params],
        func:function (data) {
            if (data.responses[0].flag <= 0){
                alert(data.responses[0].message);
                return;
            }
            teacherGrid.refresh();
            teacherGridRow = null;
        }
    });
}
