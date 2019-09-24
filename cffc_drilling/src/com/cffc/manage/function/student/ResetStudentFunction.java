package com.cffc.manage.function.student;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.Map;

public class ResetStudentFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        //获取信息
        String userId = params.get("user_id").toString();
        String studentNo = params.get("student_no").toString();

        //如果工号已修改，判断工号是否已被占用
        Map student = DataContext.getContext().doHexByIdToMap("hex_student_queryStudentById", "user_id=" + userId);

        if (!studentNo.equals(student.get("student_no"))){
            Map map = DataContext.getContext().doHexByIdToMap("hex_student_queryStudentByNo", "student_no=" + studentNo);
            if (map != null && !map.isEmpty()){
                return new DaoResult(-1,"您输入的学生学号"+studentNo+"已存在，请检查");
            }
        }

        //所有判断正确，进行逻辑操作
        DaoResult daoResult = DataContext.getContext().doHexById("hex_student_resetStudent", params);
        daoResult.setFlag(1);
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
