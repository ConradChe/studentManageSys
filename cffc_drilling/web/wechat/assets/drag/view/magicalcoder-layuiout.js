/*页面初始化完成才加载*/
$(document).ready(function() {
    var $ = layui.jquery,layer=layui.layer, form = layui.form, element = layui.element, laydate = layui.laydate,
        layedit = layui.layedit, slider = layui.slider, element = layui.element, colorpicker = layui.colorpicker,
        upload = layui.upload, rate = layui.rate, carousel = layui.carousel, flow = layui.flow, util = layui.util;

    var obj = {
        getParameter:function (name) {
            var query = window.location.search.substring(1);
            if(query!=''){
                var vars = query.split("&");
                for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if(pair.length=2){
                        if(pair[0] == name){return pair[1];}
                    }
                }
            }
            return null;
        },
        rebuildLayUiControls: function () {
            var _t = this;
            form.render();
            element.init();
            //日期
            $(".magicalcoder-laydate").each(function (idx, item) {
                laydate.render(_t.iteratorAttr({elem: item}, item))
            })
            //富文本
            $(".magicalcoder-layedit").each(function (idx, item) {
                var mcDataId = $(item).attr("id");
                if (mcDataId) {
                    layedit.build(mcDataId, {
                        height: 300
                    });
                }
            })
            //外键
            $(".magicalcoder-foreign-select2").each(function (idx, item) {
                var mcDataId = $(item).attr("id");
                if (mcDataId) {
                    $("#" + mcDataId).select2({
                        allowClear: true,//必须设置placeholder 否则报错
                        width: "150px",
                        delay: 500,//等待500ms才触发
                    });
                }
            })
            //颜色选择器
            $(".magicalcoder-color-picker").each(function (idx, item) {
                colorpicker.render(_t.iteratorAttr({elem: $(item)}, item))
            })
            //上传组件
            {
                $(".magicalcoder-layupload").each(function (idx, item) {
                    upload.render(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //滑块
            {
                $(".magicalcoder-slider").each(function (idx, item) {
                    slider.render(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //评分
            {
                $(".magicalcoder-rate").each(function (idx, item) {
                    rate.render(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //轮播
            {
                $(".layui-carousel").each(function (idx, item) {
                    carousel.render(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //流加载
            {
                $(".magicalcoder-flow").each(function (idx, item) {
                    flow.load(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //工具集
            /*{
                $("[mc-type='util']").each(function (idx, item) {
                    util.render(_t.iteratorAttr({elem:$(item)},item))
                })
            }*/
            //代码
            {
                $(".magicalcoder-code").each(function (idx, item) {
                    layui.code(_t.iteratorAttr({elem: $(item)}, item))
                })
            }
            //弹窗
            {
                $(".magicalcoder-layer").each(function (idx, item) {
                    $(this).next().hide()//先隐藏起来
                    $(this).click(function () {
                        var config = _t.iteratorAttr({elem: $(item)}, item);
                        var type = config.type;
                        if(type+''==1){
                            config.content = $(this).next();
                        }
                        if(config.btn){
                            config.btn = config.btn.split(",")
                        }
                        if(config.area){
                            config.area = config.area.split(",")
                        }
                        layer.open(config)
                    })
                })
            }
        },
        iteratorAttr: function (renderConfig, dom) {
            var attrs = dom.attributes;
            for (var i = 0; i < attrs.length; i++) {
                var attr = attrs[i];
                var name = attr.name;
                var value = attr.value;
                if(value!='' && !isNaN(value)){
                    value = parseFloat(value)
                }
                if (name.indexOf("mc-") == 0) {
                    name = name.replace("mc-attr-", '')
                    name = name.replace("mc-event-", '')
                    value == 'true' ? value = true : value = value;
                    value == 'false' ? value = false : value = value;
                    renderConfig[this.htmlAttrNameToTuoFeng(name)] = value
                }
            }
            return renderConfig;
        },
        htmlAttrNameToTuoFeng: function (name) {//userName -> user-name
            var arr = name.split("-")
            var newArr = []
            for (var i=0;i<arr.length;i++) {
                if (i != 0) {
                    if (arr[i] != '') {
                        newArr.push(this.firstCharToUpLower(arr[i]));
                    }
                } else {
                    newArr.push(arr[i]);
                }
            }
            return newArr.join('');
        },
        firstCharToUpLower: function (name) {//首字母大写
            var arr = name.split("");
            arr[0] = arr[0].toUpperCase();
            return arr.join('')
        },
        magicalcoderMjeRender:function () {//解析编码操作的配置
            //
            var scriptIdAttrName = "magicalcoder-mje-script-id";
            $("["+scriptIdAttrName+"]").each(function (idx, item) {
                if(!$(this).is("code")){
                    var value = $(this).attr(scriptIdAttrName);
                    var scriptCodeDome = $("["+scriptIdAttrName+"='script-"+value+"']");
                    if(scriptCodeDome.length>0){
                        var scriptJson = scriptCodeDome.html()
                        if(scriptJson!=''){
                            var jsonObj = JSON.parse(scriptJson);
                            var event = jsonObj.event;
                            var executeList = jsonObj.execute;
                            $(this).bind(event,function () {
                                for(var i=0;i<executeList.length;i++){
                                    var execute = executeList[i];
                                    var executeType = execute.executeType;
                                    switch (executeType) {
                                        case 'show':
                                            $(execute.target).show();
                                            break;
                                        case 'hide':
                                            $(execute.target).hide();
                                            break;
                                        case 'toggle':
                                            $(execute.target).toggle();
                                            break;
                                        case 'remove':
                                            $(execute.target).remove();
                                            break;
                                        case 'redirect':
                                            window.location.href = execute.target;
                                            break;
                                        case 'reload':
                                            window.location.reload();
                                            break;
                                        case 'fadeIn':
                                            $(execute.target).fadeIn();
                                            break;
                                        case 'fadeOut':
                                            $(execute.target).fadeOut();
                                            break;
                                        case 'fadeToggle':
                                            $(execute.target).fadeToggle();
                                            break;
                                        case 'slideDown':
                                            $(execute.target).slideDown();
                                            break;
                                        case 'slideUp':
                                            $(execute.target).slideUp();
                                            break;
                                        case 'slideToggle':
                                            $(execute.target).slideToggle();
                                            break;
                                        case 'html':
                                            $(execute.target).html('');
                                            break;
                                        case 'val':
                                            $(execute.target).val('');
                                            break;
                                        case 'submit':
                                            $(execute.target).submit();
                                            break;
                                        default:
                                            console.log("未知类型"+executeType);
                                            break;
                                    }
                                }

                            })
                        }
                    }
                }
            })
        }
    }

    var uiFrameType = obj.getParameter("uiFrameType");
    $("body").find("svg").remove();
    if ($("body").children().length <= 0) {
        //读取本地域名下缓存的数据
        if (typeof window.localStorage == 'object') {//支持缓存
            var CACHE_KEY_USER_DATA = "layuioutUserData"+uiFrameType
            var html = localStorage.getItem(CACHE_KEY_USER_DATA);
            $("body").html(html)
        }else {
            layer.msg("很抱歉，您的浏览器不支持localStorage,无法使用预览功能")
        }
    }
    //初始化控件
    obj.rebuildLayUiControls();
    obj.magicalcoderMjeRender();
    // exports('magicalcoder_layuiout',obj);
});
