package com.cffc.manage.token;

import com.haitsoft.framework.cache.bean.Cache;
import com.haitsoft.framework.cache.context.CacheContext;
import com.haitsoft.framework.core.context.HaitContext;
import com.haitsoft.framework.core.util.EnDeUtil;
import com.haitsoft.framework.data.context.DataContext;

import java.util.HashMap;

/**
 * Token验证
 * 
 * @author pandong
 * @date 2017年8月22日 下午4:18:12
 * @copyright(c) yunlaila.com.cn
 */
public class Token {

	/**
	 * token秘钥
	 */
	private final static String SECRET_KEY = "yunlaila_token";

	/**
	 * 保存过期时间，默认30分钟
	 * 修改为30天过期
	 */
	private final static int expiration = 2 * 24 * 60 * 60;

	/**
	 * 获得缓存对象
	 * 
	 * @param token
	 * @return
	 */
	public static Cache getTokenCache(String token) {
		return CacheContext.getContext().getCache(token.toUpperCase(), expiration);
	}

	/**
	 * 从缓存中获取当前用户对象
	 * 
	 * @param token
	 * @return
	 */
	public static HashMap getUserInCache(String token) {
		Cache cache = getTokenCache(token);
		if (cache == null) {
			return null;
		}

		return cache.get("user") == null ? null : (HashMap) cache.get("user");
	}

	public static boolean updateUserToCache(String token, HashMap user) {
		Cache cache = getTokenCache(token);
		if (cache == null) {
			return false;
		}
		return cache.put("user", user);
	}

	/**
	 * 创建token
	 * 
	 * @param loginId
	 *            登录编号
	 * @param loginType
	 *            登录方式：1安卓手机、2安卓平板、3苹果手机、4苹果平板、5电脑
	 * @param expiredTime
	 *            过期时间
	 * @return
	 */
	public static String createToken(String loginId, int loginType, long expiredTime) {
		String token = "TMS_" + loginId + "_" + loginType + "_" + expiredTime;
		return encryptToken(token);
	}

	/**
	 * 判断是否可用
	 * 
	 * @param token
	 * @return
	 */
	public static boolean isEnabled(String token) {
		// 验证本地是否已经登陆
		Cache cache = getTokenCache(token);

		// 如果没有获取缓存，那么直接返回false
		if (cache == null) {
			HaitContext.getLogger().error("TOKEN", "创建缓存失败，请检查!");
			return false;
		}

		// 判断内部数据是否有效
		HashMap user = getUserInCache(token);

		// 如果缓存信息为空，那么去账户中心验证
		if (user == null) {
			// 验证token的真伪
			user = (HashMap) DataContext.getContext().doHexByIdToMap("hex_login_queryUserByToken", "login_token=" + token);
			if (user == null) {
				return false;
			}

			// 替换里面的数据字典项目
			user.put("gender_text", DataContext.getDict("GENDER", user.get("gender")));
			user.put("user_state_text", DataContext.getDict("USER_STATE", user.get("user_state")));
			user.put("login_type_text", DataContext.getDict("LOGIN_TYPE", user.get("login_type")));
			user.put("login_token", token);

			// 保存当前用户信息
			updateUserToCache(token, user);
		}

		return true;
	}

	public static String isEnabledToken(String token) {
		// 验证本地是否已经登陆
		Cache cache = getTokenCache(token);

		// 如果没有获取缓存，那么直接返回false
		if (cache == null) {
			HaitContext.getLogger().error("TOKEN", "创建缓存失败，请检查!");
			return null;
		}

		// 判断内部数据是否有效
		HashMap user = getUserInCache(token);

		// 如果缓存信息为空，那么去账户中心验证
		if (user == null) {
			// 验证token的真伪
			user = (HashMap) DataContext.getContext().doHexByIdToMap("hex_login_queryUserByToken", "login_token=" + token);
			if (user == null) {
				return null;
			}

			// 替换里面的数据字典项目
			user.put("gender_text", DataContext.getDict("GENDER", user.get("gender")));
			user.put("user_state_text", DataContext.getDict("USER_STATE", user.get("user_state")));
			user.put("login_type_text", DataContext.getDict("LOGIN_TYPE", user.get("login_type")));
			user.put("login_token", token);

			// 保存当前用户信息
			updateUserToCache(token, user);
		}

		return user.get("login_token").toString();
	}

	public static String encryptToken(String token) {
		EnDeUtil enDeUtil = new EnDeUtil(SECRET_KEY);
		return enDeUtil.encrypt(token).toUpperCase();
	}

	public static String decryptToken(String token) {
		EnDeUtil enDeUtil = new EnDeUtil(SECRET_KEY);
		return enDeUtil.decrypt(token);
	}

	public static String[] decryptTokenToArray(String token) {
		return decryptToken(token).split("_");
	}

}