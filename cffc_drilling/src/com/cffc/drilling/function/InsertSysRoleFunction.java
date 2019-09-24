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

public class InsertSysRoleFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String roleId = DataContext.getContext().getSequenceId("");
        String roleName = StringUtil.getString(params, "role_name");
        String note = StringUtil.getString(params, "note");
        String menuIds = StringUtil.getString(params, "menu_ids");

        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        //新增角色
        Map param = new HashMap();
        param.put("funcId", "hex_cffc_insertSysRole");
        param.put("role_id", roleId);
        param.put("role_name", roleName);
        param.put("note", note);
        param.put("menu_ids", menuIds);
        param.put("operate_id", CurrentUserUtil.getUserId(params));
        param.put("operate_name", CurrentUserUtil.getUserName(params));
        param.put("operate_time", CurrentUserUtil.getCurrentTime());
        paramList.add(param);

        //新增角色绑定的菜单
        for(String menuId : menuIds.split(",")){
            param = new HashMap();
            param.put("funcId", "hex_cffc_insertSysRoleMenu");
            param.put("role_id", roleId);
            param.put("menu_id", menuId);
            paramList.add(param);
        }

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
