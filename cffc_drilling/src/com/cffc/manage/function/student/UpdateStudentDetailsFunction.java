package com.cffc.manage.function.student;

import com.cffc.manage.util.CurrentUserUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateStudentDetailsFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        /*--------获取数据-----------*/
        String userId = params.get("user_id").toString();
        String studentNo = params.get("student_no").toString();
        String mobilePhone = params.get("mobile_phone").toString();

        //获取当前时间
        String currentTime = CurrentUserUtil.getCurrentTime();

        /*---------判断学号是否存在------------*/
        Map student = DataContext.getContext().doHexByIdToMap("hex_student_queryStudentById", "user_id=" + userId);

        if (!studentNo.equals(student.get("student_no"))){
            Map map = DataContext.getContext().doHexByIdToMap("hex_student_queryStudentByNo", "student_no=" + studentNo);
            if (map != null && !map.isEmpty()){
                return new DaoResult(-1,"您输入的学生学号"+studentNo+"已存在，请检查");
            }
        }

        /*---------判断电话是否存在-----------*/
        Map oldUser = DataContext.getContext().doHexByIdToMap("hex_register_queryUserById", "user_id="+userId);
        String oldLoginCode = oldUser.get("login_code").toString();
        if (!mobilePhone.equals(oldLoginCode)){
            Map userMap = DataContext.getContext().doHexByIdToMap("hex_register_queryUserByLoginCode", "login_code=" + mobilePhone);
            if (userMap != null && !userMap.isEmpty()){
                return new DaoResult(-1,"您输入的电话"+mobilePhone+"已存在，请检查");
            }
        }

        /*------------所有条件均通过--------------*/
        List<Map> paramList = new ArrayList<>();
        //更新用户表
        params.put("funcId","hex_register_updateUser");
        params.put("operate_time", currentTime);
        params.put("login_code",mobilePhone);
        paramList.add(params);

        //更新学生表
        Map param = new HashMap();
        param.put("funcId","hex_student_updateStudent");
        param.put("user_id",userId);
        param.put("student_name",params.get("student_name"));
        param.put("gender",params.get("gender"));
        param.put("mobile_phone",params.get("mobile_phone"));
        param.put("start_time",params.get("start_time"));
        paramList.add(param);

        //执行事务
        Response response = DataContext.getContext().doHexsByTransaction(null, paramList);
        DaoResult daoResult = new DaoResult(response.getFlag(),response.getMessage());
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
