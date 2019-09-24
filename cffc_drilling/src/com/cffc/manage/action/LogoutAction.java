package com.cffc.manage.action;

import com.haitsoft.framework.data.bean.Response;
import com.haitsoft.framework.data.context.DataContext;
import com.cffc.manage.token.Token;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 退出系统
 * 
 * @author chenjialun
 * @date 2019年6月6日 下午5:32:12
 */
public class LogoutAction extends LoginAction {

	@Override
	public void doAction(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// 读取前台传递过来的信息，并保存这些信息
		String loginToken = request.getParameter("login_token");
		if(loginToken != null && loginToken.length() > 0) {
			DataContext.getContext().doHexById("hex_login_logoutByToken", "login_token=" + loginToken);
			Token.getTokenCache(loginToken).delete(); // 清除缓存
		}

		// 定义返回对象
		Response haitResponse = new Response(1, "退出成功");
		print(response, haitResponse);
		return;
	}
}
