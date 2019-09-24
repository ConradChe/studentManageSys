package com.cffc.manage.function.student;

import com.cffc.manage.util.CurrentUserUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.Map;

public class QueryStudentOfTeacherFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        //获取登录用户id
        String userId = CurrentUserUtil.getUserId(params);
        //更换用户id
        params.put("user_id",userId);

        //逻辑操作
        DaoResult daoResult = DataContext.getContext().doHexById("hex_student_queryStudentOfTeacher", params);

        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
