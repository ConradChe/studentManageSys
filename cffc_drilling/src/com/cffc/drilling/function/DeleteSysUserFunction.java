package com.cffc.drilling.function;

import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DeleteSysUserFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String userId = StringUtil.getString(params, "user_id");

        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        //删除用户
        Map param = new HashMap();
        param.put("funcId", "hex_cffc_deleteUser");
        param.put("user_id", userId);
        paramList.add(param);

        //删除用户绑定的角色
        param = new HashMap();
        param.put("funcId", "hex_cffc_deleteSysUserRole");
        param.put("user_id", userId);
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
