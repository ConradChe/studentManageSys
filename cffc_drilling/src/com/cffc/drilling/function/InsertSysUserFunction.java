package com.cffc.drilling.function;

import com.cffc.manage.util.CurrentUserUtil;
import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class InsertSysUserFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String userId = DataContext.getContext().getSequenceId("");
        String loginCode = StringUtil.getString(params, "login_code");
        String loginPass = StringUtil.getString(params, "login_pass");
        String userName = StringUtil.getString(params, "user_name");
        String roleId = StringUtil.getString(params, "role_id");
        String roleName = StringUtil.getString(params, "role_name");

        Map user = DataContext.getContext().doHexByIdToMap("hex_cffc_queryUserByLoginCode", "login_code=" + loginCode);
        if(user != null && !user.isEmpty()){
            return new DaoResult(-1, "手机号已存在，请重新输入！");
        }

        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        //新增账号
        Map param = new HashMap();
        param.put("funcId", "hex_cffc_insertSysUser");
        param.put("user_id", userId);
        param.put("login_code", loginCode);
        param.put("login_pass", loginPass);
        param.put("user_name", userName);
        param.put("mobile_phone", loginCode);
        param.put("role_id", roleId);
        param.put("role_name", roleName);
        param.put("last_login_time", CurrentUserUtil.getCurrentTime());
        param.put("operate_id", CurrentUserUtil.getUserId(params));
        param.put("operate_name", CurrentUserUtil.getUserName(params));
        param.put("operate_time", CurrentUserUtil.getCurrentTime());
        paramList.add(param);

        //新增账号绑定的角色
        param = new HashMap();
        param.put("funcId", "hex_cffc_insertSysUserRole");
        param.put("user_id", userId);
        param.put("role_id", roleId);
        paramList.add(param);

        Response dataResponse = DataContext.getContext().doHexsByTransaction(global, paramList);
        if (dataResponse.getFlag() <= 0) {
            return new DaoResult(-1, "保存失败，原因可能是：" + dataResponse.getMessage());
        }

        return new DaoResult(1, "保存成功");
    }

    @Override
    public void doRollback(Map context) {

    }
}
