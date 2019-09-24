package com.cffc.manage.function.login;

import com.cffc.manage.util.CurrentUserUtil;
import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;
import java.util.HashMap;
import java.util.Map;

/**
 * 修改密码
 */
public class UpdatePasswordFunction implements IFunction {
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String userId = CurrentUserUtil.getUserId(params);
        String formerLoginCode = StringUtil.getString(params,"former_login_pass");
        String loginCode = StringUtil.getString(params,"login_pass");

        Map param = new HashMap();

        param.put("user_id",userId);
        param.put("login_pass",formerLoginCode);

        Map scenicNameMap = DataContext.getContext().doHexByIdToMap("hex_login_queryPassword", param);
        if (scenicNameMap == null) {
            return new DaoResult(-1, "原密码错误!");
        }

        param.put("login_pass",loginCode);

        DaoResult daoResult = DataContext.getContext().doHexById("hex_login_updatePassword", param);

        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
