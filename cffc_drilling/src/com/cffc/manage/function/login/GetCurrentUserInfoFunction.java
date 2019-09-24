package com.cffc.manage.function.login;

import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;
import com.tuoyb.auth.util.StringUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 获取当前用户信息
 *
 * @author pandong
 * @date 2017年8月23日 下午4:20:12
 * @copyright(c) yunlaila.com.cn
 */
public class GetCurrentUserInfoFunction implements IFunction {

    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String loginToken = StringUtil.getString(params, "login_token");

        // 根据用户编号查询当前用户的信息
        DaoResult daoResult = DataContext.getContext().doHexById("hex_login_queryUserByToken", "login_token=" + loginToken);
        // 获得用户信息
        HashMap loginUserMap = (HashMap) daoResult.getItems().get(0);
        // 替换里面的数据字典项目
        loginUserMap.put("gender_text", DataContext.getDict("GENDER", loginUserMap.get("gender")));
        loginUserMap.put("user_state_text", DataContext.getDict("USER_STATE", loginUserMap.get("user_state")));
        loginUserMap.put("login_type_text", DataContext.getDict("LOGIN_TYPE", loginUserMap.get("login_type")));
        loginUserMap.put("login_token", loginToken);

        // 获取用户更多数据
        setUserMoreInfo(loginUserMap);

        String userId = StringUtil.getString(loginUserMap, "user_id");
        List accessList = DataContext.getContext().doHexByIdToList("hex_login_queryAccessListByUserId", "user_id=" + userId);
        loginUserMap.put("access_list", accessList);

        return daoResult;
    }

    @Override
    public void doRollback(Map context) {

    }

    public static void setUserMoreInfo(Map loginUserMap) {
        String userId = StringUtil.getString(loginUserMap, "user_id");

        // 查询当前用户的权限菜单
        List accessList = DataContext.getContext().doHexByIdToList("hex_login_queryAccessListByUserId", "user_id=" + userId);
        loginUserMap.put("access_list", accessList);
    }

}
