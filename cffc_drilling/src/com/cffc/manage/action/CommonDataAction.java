package com.cffc.manage.action;

import com.haitsoft.framework.core.servlet.IAction;
import com.haitsoft.framework.core.util.IPUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.bean.Request;
import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.cffc.manage.token.Token;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Hex访问统一入口
 *
 * @author chenjialun
 * @date 2019年6月6日 上午11:01:48
 */
public class CommonDataAction implements IAction {

    @SuppressWarnings("ConstantConditions")
    @Override
    public void doAction(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 解析前端请求
        Request haitRequest = Request.parse(request.getInputStream());

        // toke有效性验证
        String token = haitRequest.getGlobal().get("token");
        String source = haitRequest.getGlobal().get("source");
        String type = haitRequest.getGlobal().get("type");
        if (token == null || token.length() == 0) {
            write(response, -20100001, "统一登陆标志token为空，不能访问!");
            return;
        }

        // 去除两边的空格
        token = token.trim();
        // 进行有效性判断
        if (!Token.isEnabled(token)) {
            write(response, -20100002, "您还没有登录!");
            return;
        }

        // 进行功能号有效性检查
        for (Map paramMap : haitRequest.getRequests()) {
            String funcId = (String) paramMap.get("funcId");
            if (funcId == null || funcId.length() == 0) {
                write(response, -20100003, "存在功能号为空的请求，不能执行操作，请检查!");
                return;
            }
        }

        DataContext dataContext = DataContext.getContext();
        Response haitResponse = new Response();

        // 解析当前登陆者信息
        String loginId = Token.decryptTokenToArray(token)[1];
        String loginType = Token.decryptTokenToArray(token)[2];
        String currentTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String requestIp = IPUtil.getIpAddr(request); // 获得用户请求的IP地址

        // 将当前用户信息添加到数据层访问对象中，用于Hex可以内部执行时获得用户信息
        Map currentUser = Token.getUserInCache(token);
        if (currentUser == null) {
            currentUser = new HashMap();
        }

        currentUser.put("user_id", loginId);
        currentUser.put("login_type", loginType);
        currentUser.put("current_time", currentTime);
        currentUser.put("request_ip", requestIp);

        // 将用户登录信息统一绑定到请求参数中
        for (Map paramMap : haitRequest.getRequests()) {
            dataContext.bindUser(paramMap, currentUser);
        }

        // 如果是事务执行，那么事务执行
        Map global = haitRequest.getGlobal();
        if (global.get("transaction") != null && global.get("transaction").toString().equals("true")) {
            haitResponse = dataContext.doHexsByTransaction(global, haitRequest.getRequests());
            write(response, haitResponse);
            return;
        }

        // 批量执行Hex操作，此种情况下不存在执行失败的问题，因为执行结果都分散在各个DaoResult中
        for (Map paramMap : haitRequest.getRequests()) {
            String funcId = (String) paramMap.get("funcId");
            DaoResult daoResult = dataContext.doHexById(funcId, paramMap);
            haitResponse.getResults().add(daoResult);
        }

        haitResponse.setFlag(1);
        haitResponse.setMessage("success");
        write(response, haitResponse);
    }

    private void write(HttpServletResponse response, long code, String message) throws IOException {
        Response haitResponse = new Response(code, message);
        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(haitResponse.asJSON());
        response.flushBuffer();
    }

    private void write(HttpServletResponse response, Response haitResponse) throws IOException {
        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(haitResponse.asJSON());
        response.flushBuffer();
    }

}
