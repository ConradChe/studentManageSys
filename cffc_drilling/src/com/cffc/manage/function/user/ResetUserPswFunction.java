package com.cffc.manage.function.user;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResetUserPswFunction implements IFunction {

    private static String loginPass = "123456";

    public static String getLoginPass() {
        return loginPass;
    }

    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        /*获取数据*/
        String userId = params.get("user_id").toString();

        /*判断用户是否存在*/
        Map userMap = DataContext.getContext().doHexByIdToMap("hex_register_queryUserById", "user_id=" + userId);
        if (userMap == null || userMap.isEmpty()){
            return new DaoResult(-1, "您要重置的用户信息异常,请刷新后重试");
        }

        //逻辑操作
        Map param = new HashMap();
        param.put("user_id",userId);
        param.put("login_pass",getLoginPass());

        DaoResult daoResult = DataContext.getContext().doHexById("hex_register_resetUserPsw", param);
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
