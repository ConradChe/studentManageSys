function back() {
    $('[class*="-two"]').css('display', 'none');
    $('.sort_box').css('display', 'block');
    $('.initials').css('display', 'block');
    $('.header').css('display', 'block');
}

$(function () {

    document.documentElement.style.fontSize = window.innerWidth / 3.75 + 'px';

    getContractor();

    window.onresize = function () {
        if ($(window).height() < 400) {
            $('.nav').hide();
        } else {
            $('.nav').show();
        }

    }
    $('[class*="-two"]').css('display', 'none');

    var Initials = $('.initials');
    var LetterBox = $('#letter');
    Initials.find('ul').append('<li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li><li>G</li><li>H</li><li>I</li><li>J</li><li>K</li><li>L</li><li>M</li><li>N</li><li>O</li><li>P</li><li>Q</li><li>R</li><li>S</li><li>T</li><li>U</li><li>V</li><li>W</li><li>X</li><li>Y</li><li>Z</li><li>#</li>');

    $(".initials ul li").click(function () {
        var _this = $(this);
        var LetterHtml = _this.html();
        LetterBox.html(LetterHtml).fadeIn();

        Initials.css('background', 'rgba(145,145,145,0.6)');

        setTimeout(function () {
            Initials.css('background', 'white');
            LetterBox.fadeOut();
        }, 1000);

        var _index = _this.index()
        if (_index == 0) {
            $('.sort_box').animate({scrollTop: '0px'}, 300);//点击第一个滚到顶部
        } else if (_index == 26) {
            var DefaultTop = $('#default').position().top;
            $('.sort_box').animate({scrollTop: DefaultTop + 'px'}, 300);//点击最后一个滚到#号
        } else {
            var letter = _this.text();
            if ($('#' + letter).length > 0) {
                var LetterTop = $('#' + letter).position().top;
                var scroll = $('.sort_box').scrollTop();
                $('.sort_box').animate({scrollTop: LetterTop + scroll - 65 + 'px'}, 300);
            }
        }
    })

    var windowHeight = $(window).height();
    var InitHeight = windowHeight - 65;
    Initials.height(InitHeight);
    var LiHeight = InitHeight / 28;
    Initials.find('li').height(LiHeight);

    var isInputZh = false;
    var search = document.getElementById('searchInput');

    //输入法开始输入之前
    search.addEventListener('compositionstart', function (e) {
        isInputZh = true;
    }, false);
    //输入法输入结束之后
    search.addEventListener('compositionend', function (e) {
        isInputZh = false;
        //等待输入法输入完成后，再进行查询
        getContractor(search.value);
    }, false);
    search.addEventListener('input', function (e) {
        //输入法正在输入，直接返回不执行查询
        if (isInputZh) return;
        var value = this.value;
        //输入法输入结束，执行查询
        getContractor(value);
    }, false);


});

/**
 * 选择工作单位
 */
function setContractor(row) {
    var contractorName = $(row).find("div").text();
    $("#contractorName", parent.document).val(contractorName);
    $("#contractorList", parent.document).hide(300);
}

/**
 * 获取工作单位选项
 */
function getContractor(searchText = "") {
    var params = {};
    params.funcId = "hex_wechat_queryContractorNameList";
    if (searchText.length > 0) {
        params.contractor_name = searchText;
    }
    request({
        data: [params],
        func: function (data) {
            if (data.responses[0].flag <= 0) {
                alert(data.responses[0].message);
                return;
            }
            var items = data.responses[0].items;
            if(items == null || items == undefined){
                items = {};
            }
            var context = "";
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var contractorName = item.contractor_name;
                if(contractorName.indexOf(searchText) < 0){
                    continue;
                }
                context += "<div class=\"sort_list\" onclick='setContractor(this)'>";
                if (searchText.length <= 0) {
                    context += "<div class=\"num_name\">" + contractorName + "</div>";
                    context += "</div>";
                    continue;
                }
                var nameArr = contractorName.split(searchText);
                context += "<div class=\"num_name\">" + nameArr[0] + "<span style='color:green;'>" + searchText + "</span>" + nameArr[1] + "</div>";
                context += "</div>";
            }
            context = context.length == 0 ? "<div style='color:#c6c6c6;position: fixed;top:50%;left:50%;transform: translate(-50%, -50%)'>没有找到，<font style='color:blue;text-decoration: underline;' onclick='showContractorDialog()'>点击手动录入</font></div>" : context;
            $(".sort_box").html(context);
            initials();
        }
    });
}

/**
 * 取消手动录入
 */
function cancelAdd() {
    $("#cover").fadeOut(200);
    $(".add-select").fadeOut(200);
}

/**
 * 使用手动录入的工作单位
 */
function inputContractor(){
    var contractorName = $("#contractorName").val();
    $("#contractorName", parent.document).val(contractorName);
    $("#contractorList", parent.document).hide(300);
    $("#cover").fadeOut(200);
    $(".add-select").fadeOut(200);
    $("#contractorName").val("");
}

/**
 * 弹出录入工作单位的对话框
 */
function showContractorDialog(){
    $("#cover").fadeIn(200);
    $(".add-select").fadeIn(200);
}

function initials() {//公众号排序
    var SortList = $(".sort_list");
    var SortBox = $(".sort_box");
    SortList.sort(asc_sort).appendTo('.sort_box');//按首字母排序
    function asc_sort(a, b) {
        return makePy($(b).find('.num_name').text().charAt(0))[0].toUpperCase() < makePy($(a).find('.num_name').text().charAt(0))[0].toUpperCase() ? 1 : -1;
    }

    var initials = [];
    var num = 0;
    SortList.each(function (i) {
        var initial = makePy($(this).find('.num_name').text().charAt(0))[0].toUpperCase();
        if (initial >= 'A' && initial <= 'Z') {
            if (initials.indexOf(initial) === -1)
                initials.push(initial);
        } else {
            num++;
        }

    });

    $.each(initials, function (index, value) {//添加首字母标签
        SortBox.append('<div class="sort_letter" id="' + value + '">' + value + '</div>');
    });
    if (num != 0) {
        SortBox.append('<div class="sort_letter" id="default">#</div>');
    }

    for (var i = 0; i < SortList.length; i++) {//插入到对应的首字母后面
        var letter = makePy(SortList.eq(i).find('.num_name').text().charAt(0))[0].toUpperCase();
        switch (letter) {
            case "A":
                $('#A').after(SortList.eq(i));
                break;
            case "B":
                $('#B').after(SortList.eq(i));
                break;
            case "C":
                $('#C').after(SortList.eq(i));
                break;
            case "D":
                $('#D').after(SortList.eq(i));
                break;
            case "E":
                $('#E').after(SortList.eq(i));
                break;
            case "F":
                $('#F').after(SortList.eq(i));
                break;
            case "G":
                $('#G').after(SortList.eq(i));
                break;
            case "H":
                $('#H').after(SortList.eq(i));
                break;
            case "I":
                $('#I').after(SortList.eq(i));
                break;
            case "J":
                $('#J').after(SortList.eq(i));
                break;
            case "K":
                $('#K').after(SortList.eq(i));
                break;
            case "L":
                $('#L').after(SortList.eq(i));
                break;
            case "M":
                $('#M').after(SortList.eq(i));
                break;
            case "N":
                $('#N').after(SortList.eq(i));
                break;
            case "O":
                $('#O').after(SortList.eq(i));
                break;
            case "P":
                $('#P').after(SortList.eq(i));
                break;
            case "Q":
                $('#Q').after(SortList.eq(i));
                break;
            case "R":
                $('#R').after(SortList.eq(i));
                break;
            case "S":
                $('#S').after(SortList.eq(i));
                break;
            case "T":
                $('#T').after(SortList.eq(i));
                break;
            case "U":
                $('#U').after(SortList.eq(i));
                break;
            case "V":
                $('#V').after(SortList.eq(i));
                break;
            case "W":
                $('#W').after(SortList.eq(i));
                break;
            case "X":
                $('#X').after(SortList.eq(i));
                break;
            case "Y":
                $('#Y').after(SortList.eq(i));
                break;
            case "Z":
                $('#Z').after(SortList.eq(i));
                break;
            default:
                $('#default').after(SortList.eq(i));
                break;
        }
    }
    ;
}