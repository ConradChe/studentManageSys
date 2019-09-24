package com.cffc.manage.function.register;

import com.cffc.manage.util.CurrentUserUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author SunJie
 * @Description //TODO
 * @Date 15:46 2019/8/19
 **/
public class UserRegisterFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map map1) throws Exception {
        //生成用户Id
        String userId = DataContext.getContext().getSequenceId("");
        //获取当前时间
        String currentTime = CurrentUserUtil.getCurrentTime();
        //获取角色
        String roleId = params.get("role_id").toString();


        //验证用户是否存在
        DaoResult userDaoResult = DataContext.getContext().doHexById("hex_register_queryUserByLoginCode", params);
        if (userDaoResult.getTotal() > 0) {
            userDaoResult.setFlag(-1);
            userDaoResult.setMessage("此手机号已注册请重新输入");
            return userDaoResult;
        }

        List<Map> paramList = new ArrayList<>();
        //添加用户的其他信息
        params.put("funcId","hex_register_insertUser");
        params.put("user_id", userId);
        params.put("mobile_phone", params.get("login_code"));
        params.put("user_state", 1);
        params.put("operate_id", 0);
        params.put("operate_name", "手动注册");
        params.put("operate_time", currentTime);
        paramList.add(params);

        Map param2 = new HashMap();
        param2.put("funcId","hex_role_insertUserRole");
        param2.put("user_id",userId);
        param2.put("role_id",params.get("role_id"));
        paramList.add(param2);
        //如果添加用户是教师，向教师表插入信息
        if ("2".equals(roleId)){
            Map param3 = new HashMap();
            param3.put("funcId","hex_teacher_insertTeacher");
            param3.put("teacher_name",params.get("user_name"));
            param3.put("gender",params.get("gender"));
            param3.put("mobile_phone",params.get("mobile_phone"));
            param3.put("user_id",userId);
            paramList.add(param3);
        }

        //如果添加用户是学生，向学生表插入信息
        if ("3".equals(roleId)){
            Map param4 = new HashMap();
            param4.put("funcId","hex_student_insertStudent");
            param4.put("student_name",params.get("user_name"));
            param4.put("gender",params.get("gender"));
            param4.put("mobile_phone",params.get("mobile_phone"));
            param4.put("user_id",userId);
            paramList.add(param4);
        }

        //将注册的用户信息添加到数据库中
        Response response = DataContext.getContext().doHexsByTransaction(null, paramList);
        DaoResult daoResult = new DaoResult(response.getFlag(),response.getMessage());
        return daoResult;
    }

    @Override
    public void doRollback(Map map) {

    }
}
