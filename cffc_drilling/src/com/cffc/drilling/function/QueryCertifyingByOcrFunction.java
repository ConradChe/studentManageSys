package com.cffc.drilling.function;

import com.cffc.manage.util.StringUtil;
import com.haitsoft.framework.data.bean.DaoResult;
import com.haitsoft.framework.data.context.DataContext;
import com.haitsoft.framework.data.dao.function.IFunction;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class QueryCertifyingByOcrFunction implements IFunction {
    @Override
    public DaoResult doFunction(Map params, Map context) throws Exception {
        String certifyingName = StringUtil.getString(params, "certifying_name");

        if (certifyingName == null || certifyingName.length() == 0) {
            return new DaoResult(-1, "发证机关名称不能为空！");
        }

        DaoResult daoResult = new DaoResult(1, "查询成功");
        List<Map> resultList = new ArrayList<Map>();
        Map certifyingMap = DataContext.getContext().doHexByIdToMap("hex_cffc_queryCertifyingByOcr", "certifying_name=" + certifyingName);
        if (certifyingMap != null && !certifyingMap.isEmpty()) {
            resultList.add(certifyingMap);
            daoResult.setItems(resultList);
            return daoResult;
        } else {
            List<Map> certifyingList = new ArrayList<Map>();
            for (int i = 0; i < certifyingName.length(); i++) {
                if (i == certifyingName.length()) {
                    break;
                }
                String word = certifyingName.substring(0, i + 1);
                certifyingList = DataContext.getContext().doHexByIdToList("hex_cffc_queryCertifyingLikeOcr", "certifying_name=" + word);
                if (certifyingList == null || certifyingList.size() <= 1) {
                    break;
                }
            }
            daoResult.setItems(certifyingList);
            return daoResult;
        }
    }

    @Override
    public void doRollback(Map context) {

    }
}
