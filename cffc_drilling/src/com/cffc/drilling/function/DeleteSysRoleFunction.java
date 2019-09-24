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

public class DeleteSysRoleFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String roleId = StringUtil.getString(params, "role_id");

        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        //删除角色
        Map param = new HashMap();
        param.put("funcId", "hex_cffc_deleteSysRole");
        param.put("role_id", roleId);
        paramList.add(param);

        //删除角色绑定的菜单
        param = new HashMap();
        param.put("funcId", "hex_cffc_deleteSysRoleMenu");
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
