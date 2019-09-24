package com.cffc.manage.function.user;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DeleteUserFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {

        //获取数据
        String userId = params.get("user_id").toString();

        //判断用户是否存在
        Map userById = DataContext.getContext().doHexByIdToMap("hex_register_queryUserById", "user_id=" + userId);
        if (userById == null || userById.isEmpty()){
            return new DaoResult(-1, "您要删除的用户信息异常,请刷新后重试");
        }

        //逻辑操作

        List<Map>paramList = new ArrayList<>();
        if (userById.get("role_id").equals("2")){
            Map param3 = new HashMap();
            param3.put("funcId","hex_teacher_deleteTeacher");
            param3.put("user_id",userId);
            paramList.add(param3);
        }else if (userById.get("role_id").equals("3")){
            Map param4 = new HashMap();
            param4.put("funcId","hex_student_deleteStudent");
            param4.put("user_id",userId);
            paramList.add(param4);
        }
        Map param = new HashMap();
        param.put("funcId","hex_register_deleteUserById");
        param.put("user_id",userId);
        paramList.add(param);

        Map param2 = new HashMap();
        param2.put("funcId","hex_role_deleteUserRole");
        param2.put("user_id",userId);
        paramList.add(param2);


        Response response = DataContext.getContext().doHexsByTransaction(null, paramList);
        DaoResult daoResult = new DaoResult(response.getFlag(), response.getMessage());
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
