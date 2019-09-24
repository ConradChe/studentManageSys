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

public class UpdateSysRoleFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String roleId = StringUtil.getString(params, "role_id");
        String roleName = StringUtil.getString(params, "role_name");
        String note = StringUtil.getString(params, "note");
        String menuIds = StringUtil.getString(params, "menu_ids");

        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        //修改角色信息
        Map param = new HashMap();
        param.put("funcId", "hex_cffc_updateSysRole");
        param.put("role_id", roleId);
        param.put("role_name", roleName);
        param.put("menu_ids", menuIds);
        param.put("note", note);
        paramList.add(param);

        //先删除原来绑定的菜单
        param = new HashMap();
        param.put("funcId", "hex_cffc_deleteSysRoleMenu");
        param.put("role_id", roleId);
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
