package com.cffc.manage.action;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.haitsoft.framework.core.servlet.IAction;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.cffc.manage.token.Token;
import com.tuoyb.auth.util.StringUtil;
import org.apache.poi.hssf.usermodel.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * 导出Excel
 * 
 * @author pandong
 * @date 2017年12月25日 上午11:57:41
 * @copyright(c) yunlaila.com.cn
 */
@SuppressWarnings("deprecation")
public class ExcelExportAction implements IAction {

	@Override
	public void doAction(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// ----------------------获取参数[S]----------------------//
		String token = request.getParameter("token");
		String funcId = request.getParameter("func-id");
		String params = request.getParameter("params");
		String fileName = request.getParameter("file-name");
		fileName = fileName == null || fileName.length() == 0 ? "export" : fileName;
		String fields = request.getParameter("fields");
		String type = request.getParameter("type");
		// ----------------------获取参数[E]----------------------//

		// ----------------------有效性判断[S]----------------------//
		if (fields == null || fields.length() == 0) {
			write(response, "报表标题为空，无法导出，请检查！");
			return;
		}

		JSONArray fieldsJson = null;
		try {
			fieldsJson = (JSONArray) JSONArray.parse(fields);
		} catch (Exception e) {
			write(response, "报表标题格式不正确，请检查！");
			return;
		}

		// 如果验证token，直接返回即可
		if (!checkToken(token, response)) {
			return;
		}

		// 创建数据请求参数
		DataContext dataContext = DataContext.getContext();
		Map paramMap = JSONObject.parseObject(params);
		Map currentUser = Token.getUserInCache(token);
		dataContext.bindUser(paramMap, currentUser);

		DaoResult daoResult = dataContext.doHexById(funcId, paramMap);
		if (daoResult.getFlag() <= 0) {
			write(response, "获取报表数据出错，原因可能是：" + daoResult.getMessage());
			return;
		}
		List<Map> items = daoResult.getItems();

		//将特殊字符替换为空字符串
		for (Map map : items) {
			Iterator<Entry<String, Object>> iter = map.entrySet().iterator();
			while (iter.hasNext()) {
				Entry<String, Object> entry = iter.next();
				String key = entry.getKey();
				Object valueOb = entry.getValue();
				String value = String.valueOf(valueOb);
				if (".".equals(value) || "-".equals(value) || "+".equals(value)) {
					map.put(key, "");
				}
			}
		}
		// ----------------------有效性判断[E]----------------------//

		// ----------------------生成Excel[S]----------------------//
		// 步骤1，创建一个webbook，对应一个Excel文件
		HSSFWorkbook wb = new HSSFWorkbook();

		// 步骤2，在webbook中添加一个sheet,对应Excel文件中的sheet
		HSSFSheet sheet = wb.createSheet();

		// 步骤3，定义每一列的宽度
		sheet.setColumnWidth(0, getPOIWidthByExcelPiex(30)); // 第一列为序号
		for (int i = 0; i < fieldsJson.size(); i++) {
			JSONObject field = fieldsJson.getJSONObject(i);
			String fieldWidth = field.getString("width");
			if (fieldWidth != null && fieldWidth.length() > 0) {
				int excelWidth = getPOIWidthByExcelPiex(Integer.parseInt(fieldWidth));
				sheet.setColumnWidth(i + 1, excelWidth);
			}
		}

		// 步骤4，创建表头
		HSSFRow titleRow = sheet.createRow(0);
		// 创建表头样式
		HSSFCellStyle titleStyle = wb.createCellStyle();
		titleStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER); // 创建一个居中格式
		titleStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN); // 下边框
		titleStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);// 左边框
		titleStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);// 上边框
		titleStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);// 右边框
		// 创建序号表头
		HSSFCell indexTitle = titleRow.createCell(0);
		indexTitle.setCellValue("序号");
		indexTitle.setCellStyle(titleStyle);
		for (int i = 0; i < fieldsJson.size(); i++) {
			JSONObject field = fieldsJson.getJSONObject(i);
			String fieldName = field.getString("name");
			HSSFCell cell = titleRow.createCell(i + 1);
			cell.setCellValue(fieldName);
			cell.setCellStyle(titleStyle);
		}

		// 步骤5，写入数据
		// 创建单元格样式
		HSSFCellStyle cellStyle = wb.createCellStyle();
		cellStyle.setAlignment(HSSFCellStyle.ALIGN_LEFT); // 创建一个居左格式
		cellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN); // 下边框
		cellStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);// 左边框
		cellStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);// 上边框
		cellStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);// 右边框
		
		for (int i = 0; i < items.size(); i++) {
			Map item = items.get(i);
			HSSFRow itemRow = sheet.createRow(i + 1);
			// 创建序号列
			HSSFCell indexCell = itemRow.createCell(0);
			indexCell.setCellStyle(cellStyle);

			if (i == items.size() - 1 && !"2".equals(type)) {
				indexCell.setCellValue("合计");
			} else {
				indexCell.setCellValue(i + 1 + "");
			}

			for (int k = 0; k < fieldsJson.size(); k++) {
				JSONObject field = fieldsJson.getJSONObject(k);
				String fieldId = field.getString("id");
				String fieldFormat = field.getString("format");
				String fieldVal = item.get(fieldId) == null ? "" : item.get(fieldId).toString();
				HSSFCell cell = itemRow.createCell(k + 1);
				cell.setCellStyle(cellStyle);

				if (fieldVal.length() == 0) {
					continue;
				}

				// 如果没有设置格式，那么自行计算
				if (fieldFormat == null || fieldFormat.length() == 0) {
					if (StringUtil.isNumeric(fieldVal)) {
						if (fieldVal.indexOf(".") >= 0) {
							fieldFormat = "double";
						} else {
							fieldFormat = "int";
						}
					} else {
						fieldFormat = "string";
					}
				}

				// 根据格式放入数据
				if ("string".equals(fieldFormat)) {
					cell.setCellValue(fieldVal);
				} else if ("int".equals(fieldFormat)) {
					cell.setCellValue(Long.parseLong(fieldVal));
				} else if ("double".equals(fieldFormat)) {
					cell.setCellValue(Double.parseDouble(fieldVal));
				}
			}
		}
		// ----------------------生成Excel[E]----------------------//

		// ----------------------输出Excel[S]----------------------//
		// 输出Excel文件
		response.setHeader("Content-disposition", "attachment; filename=" + new String( fileName.getBytes( "gb2312" ), "ISO8859-1" ) + ".xls");
		response.setContentType("application/msexcel");
		wb.write(response.getOutputStream());
		response.flushBuffer();
		// ----------------------输出Excel[E]----------------------//
	}

	private void write(HttpServletResponse response, String message) throws IOException {
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().write(message);
		response.flushBuffer();
	}

	private boolean checkToken(String token, HttpServletResponse response) throws IOException {
		if (token == null || token.length() == 0) {
			write(response, "统一登陆标志token为空，不能访问!");
			return false;
		}

		// 去除两边的空格
		token = token.trim();

		// 进行有效性判断
		if (!Token.isEnabled(token)) {
			write(response, "您还没有登录!");
			return false;
		}

		return true;
	}

	private int getPOIWidthByExcelPiex(int Piex) {
		return (int) (Piex * 37.05);
	}
}
