package com.cffc.manage.action;

import com.cffc.manage.util.CurrentUserUtil;
import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.core.servlet.IAction;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.cffc.manage.function.login.GetCurrentUserInfoFunction;
import com.cffc.manage.token.Token;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.*;

/**
 * @author chenjialun
 * @description: TODO
 * @date 2019/6/614:49
 */
public class LoginAction implements IAction {


    @Override
    public void doAction(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // 读取前台传递过来的信息，并保存这些信息
        String loginCode = request.getParameter("login_code");
        String loginPass = request.getParameter("login_pass");
        String loginType = request.getParameter("login_type"); // 电脑端
        loginType = loginType == null ? "5" : loginType;
        String loginNote = request.getParameter("login_note");

        // 定义返回对象
        Response haitResponse = new Response(1, "success");

        // 进行二次基本判断
        if (loginCode == null || loginCode.length() == 0 || loginPass == null || loginPass.length() == 0) {
            haitResponse.setFlag(-1);
            haitResponse.setMessage("用户名或密码不允许为空!");
            print(response, haitResponse);
//            session.setAttribute("errorMsg", "用户名或密码不允许为空!");
//            response.sendRedirect(this.getLoginUrl());
            return;
        }

        // 防止简单的SQL注入
        if (isHaveBlank(loginCode) || isHaveBlank(loginPass)) {
            haitResponse.setFlag(-1);
            haitResponse.setMessage("用户名或密码不允许存在空格和单引号!");
            print(response, haitResponse);
//            session.setAttribute("errorMsg", "用户名或密码不允许存在空格和单引号!");
//            response.sendRedirect(this.getLoginUrl());
            return;
        }

        // 进行验证操作
        Map loginCheckMap = DataContext.getContext().doHexByIdToMap("hex_login_loginByCodeAndPass", "login_code=" + loginCode + "&login_pass=" + loginPass);
        if (loginCheckMap == null || loginCheckMap.size() == 0) {
            haitResponse.setFlag(-1);
            haitResponse.setMessage("用户名或密码错误!");
            print(response, haitResponse);
//            session.setAttribute("errorMsg", "用户名或密码错误!");
//            response.sendRedirect(this.getLoginUrl());
            return;
        }

        // 获得用户编号
        String userId = loginCheckMap.get("user_id").toString();

        // 生成结束时间，为1年后
        Calendar dayEndCalendar = Calendar.getInstance();
        dayEndCalendar.add(Calendar.YEAR, 1);
        Long expiredTime = dayEndCalendar.getTime().getTime();// 到期时间

        // 生成token，过期时间为1天
        String token = Token.createToken(userId, Integer.parseInt(loginType), expiredTime);

        // 更新登录信息
        Map global = new HashMap();
        List<Map> paramList = new ArrayList<Map>();
        global.put("transaction", true);

        // 删除之前的登录信息
        Map param = new HashMap();
        param.put("funcId", "hex_login_removeTokenById");
        param.put("user_id", userId);
        param.put("login_type", loginType);
        paramList.add(param);

        // 添加新的登录信息
        param = new HashMap();
        param.put("funcId", "hex_login_insetToken");
        param.put("user_id", userId);
        param.put("login_type", loginType);
        param.put("login_token", token);
        param.put("login_note", loginNote);
        paramList.add(param);

        //更新最近登录时间
        param = new HashMap();
        param.put("funcId", "hex_login_updateLastLoginTime");
        param.put("user_id", userId);
        param.put("last_login_time", CurrentUserUtil.getCurrentTime());
        paramList.add(param);

        Response dataResponse = DataContext.getContext().doHexsByTransaction(global, paramList);
        if (dataResponse.getFlag() <= 0) {
            haitResponse.setFlag(-1);
            haitResponse.setMessage("登录失败，原因可能是:" + dataResponse.getMessage());
            print(response, haitResponse);
//            session.setAttribute("errorMsg", dataResponse.getMessage());
//            response.sendRedirect(this.getLoginUrl());
            return;
        }

        // 根据用户编号查询当前用户的信息
        DaoResult daoResult = DataContext.getContext().doHexById("hex_login_queryUserByToken", "login_token=" + token);
        // 获得用户信息
        HashMap loginUserMap = (HashMap) daoResult.getItems().get(0);

        // 替换里面的数据字典项目
        loginUserMap.put("user_state_text", DataContext.getDict("USER_STATE", loginUserMap.get("user_state")));
        loginUserMap.put("login_type_text", DataContext.getDict("LOGIN_TYPE", loginUserMap.get("login_type")));
        loginUserMap.put("login_token", token);
        loginUserMap.put("user_id", StringUtil.getString(loginUserMap, "user_id"));
        loginUserMap.put("user_name", StringUtil.getString(loginUserMap, "user_name"));
        loginUserMap.put("contractor_id", StringUtil.getString(loginUserMap, "contractor_id"));
        loginUserMap.put("contractor_name", StringUtil.getString(loginUserMap, "contractor_name"));
        loginUserMap.put("team_id", StringUtil.getString(loginUserMap, "team_id"));
        loginUserMap.put("team_name", StringUtil.getString(loginUserMap, "team_name"));
        loginUserMap.put("post_id", StringUtil.getString(loginUserMap, "post_id"));
        loginUserMap.put("post_name", StringUtil.getString(loginUserMap, "post_name"));
        loginUserMap.put("role_id", StringUtil.getString(loginUserMap, "role_id"));
        loginUserMap.put("role_name", StringUtil.getString(loginUserMap, "role_name"));

        // 设置更多用户信息
        GetCurrentUserInfoFunction.setUserMoreInfo(loginUserMap);

        // 保存当前信息到缓存
        Token.updateUserToCache(token, loginUserMap);

        // 返回数据到前台
        haitResponse.setFlag(1);
        haitResponse.setMessage("登录成功");
        haitResponse.getResults().add(daoResult);
        print(response, haitResponse);
//        response.sendRedirect(this.getIndexUrl());
    }

    protected void print(HttpServletResponse httpResponse, Response haitResponse) throws IOException {
        httpResponse.setContentType("text/json; charset=UTF-8");
        httpResponse.getWriter().write(haitResponse.asJSON());
        httpResponse.flushBuffer();
    }

    private boolean isHaveBlank(String text) {
        // 如果为空， 则不肯定没有空格
        if (null == text || "".equals(text)) {
            return false;
        }
        return text.indexOf(" ") == -1 && text.indexOf("'") == -1 ? false : true;
    }
}
