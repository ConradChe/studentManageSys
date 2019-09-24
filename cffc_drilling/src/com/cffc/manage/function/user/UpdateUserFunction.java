package com.cffc.manage.function.user;

import com.cffc.manage.util.CurrentUserUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateUserFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        //获取当前时间
        String currentTime = CurrentUserUtil.getCurrentTime();

        String userId = params.get("user_id").toString();
        String loginCode = params.get("login_code").toString();

        /*------------判断电话是否存在---------------*/
        Map oldUser = DataContext.getContext().doHexByIdToMap("hex_register_queryUserById", "user_id="+userId);
        String oldLoginCode = oldUser.get("login_code").toString();
        if (!loginCode.equals(oldLoginCode)){
            Map userMap = DataContext.getContext().doHexByIdToMap("hex_register_queryUserByLoginCode", "login_code=" + loginCode);
            if (userMap != null && !userMap.isEmpty()){
                return new DaoResult(-1,"您输入的电话"+loginCode+"已存在，请检查");
            }
        }

        /*-------------逻辑操作----------------*/
        List<Map> paramList = new ArrayList<>();
        //修改其他信息
        params.put("funcId","hex_register_updateUser");
        params.put("operate_time", currentTime);
        params.put("mobile_phone", params.get("login_code"));
        paramList.add(params);

        //修改角色用户关系表
        Map param2 = new HashMap();
        param2.put("funcId","hex_role_updateUserRole");
        param2.put("user_id",userId);
        param2.put("role_id",params.get("role_id"));
        paramList.add(param2);

        if ("2".equals(params.get("role_id"))){
            Map param3 = new HashMap();
            param3.put("funcId","hex_teacher_updateTeacher");
            param3.put("user_id",userId);
            param3.put("teacher_name",params.get("user_name"));
            param3.put("gender",params.get("gender"));
            param3.put("mobile_phone",params.get("mobile_phone"));
            paramList.add(param3);
        }else if ("3".equals(params.get("role_id"))){
            Map param4 = new HashMap();
            param4.put("funcId","hex_student_updateStudent");
            param4.put("user_id",userId);
            param4.put("student_name",params.get("user_name"));
            param4.put("gender",params.get("gender"));
            param4.put("mobile_phone",params.get("mobile_phone"));
            paramList.add(param4);
        }
        //执行事务
        Response response = DataContext.getContext().doHexsByTransaction(null, paramList);
        DaoResult daoResult = new DaoResult(response.getFlag(),response.getMessage());
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
