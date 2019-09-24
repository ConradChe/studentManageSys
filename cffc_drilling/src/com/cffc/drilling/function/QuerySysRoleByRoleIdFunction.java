package com.cffc.drilling.function;

import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.List;
import java.util.Map;

public class QuerySysRoleByRoleIdFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String roleId = StringUtil.getString(params, "role_id");

        //查询角色信息
        DaoResult daoResult = DataContext.getContext().doHexById("hex_cffc_querySysRoleList", "role_id=" + roleId);
        Map resultMap = (Map) daoResult.getItems().get(0);

        //查询觉得绑定的菜单
        List<Map> menuList = DataContext.getContext().doHexByIdToList("hex_cffc_queryRoleMenuByRoleId", "role_id=" + roleId);

        String menuIds = "";

        //循环拼接菜单编号，多个以逗号隔开
        for(Map menu : menuList){
            menuIds += StringUtil.getString(menu, "menu_id") + ",";
        }

        //去掉最后一位逗号
        menuIds = StringUtil.endWithoutComma(menuIds);

        //放入角色信息中
        resultMap.put("menu_ids", menuIds);
        return daoResult;
    }

    @Override
    public void doRollback(Map context) {

    }
}
