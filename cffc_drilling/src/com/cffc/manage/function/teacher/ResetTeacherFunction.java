package com.cffc.manage.function.teacher;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.Map;

public class ResetTeacherFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        //获取信息
        String userId = params.get("user_id").toString();
        String teacherNo = params.get("teacher_no").toString();

        //如果工号已修改，判断工号是否已被占用
        Map teacherMap = DataContext.getContext().doHexByIdToMap("hex_teacher_queryTeacherById", "user_id=" + userId);

        if (!teacherNo.equals(teacherMap.get("teacher_no"))){
            Map map = DataContext.getContext().doHexByIdToMap("hex_teacher_queryTeacherByNo", "teacher_no=" + teacherNo);
            if (map != null && !map.isEmpty()){
                return new DaoResult(-1,"您输入的教师工号"+teacherNo+"已存在，请检查");
            }
        }

        //所有判断正确，进行逻辑操作
        DaoResult daoResult = DataContext.getContext().doHexById("hex_teacher_resetTeacher", params);
        daoResult.setFlag(1);
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
