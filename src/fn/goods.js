/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.nowStep = 1;                           // 添加商品的步骤
            this.selectizeNumber = 1;                   // 商品规格选择框的index
            this.skuArr = {};                           // sku的对象数组
            this.editor = UE.getEditor('editor');       // 富文本编辑器

            this.toastrInit();
            this.step();
            this.validator();
            this.addEvent();
            this.imgModal();
        },
        imgModal: function(){
            var that = this;
            $('.imgUploadBtn').imgModal({
                selectImgPopupBtn:'.imgUploadBtn',
                selectImgBtn:'.j-select-img',
                times:1,
                multiple:false,
                //newImgBtn:'.j-upload',
                selectSuccess:function(data,target){
                    $('body').trigger('imgUploadSelected', [data]);
                },
                uploadSuccess:function(data,target){
                    $('body').trigger('imgUploadSelected', [data[0].url]);
                }
            });
        },
        /**
         * 初始化提示框
         */
        toastrInit: function () {
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
        },
        /**
         * 步骤
         */
        step: function () {
            var that = this;

            // 下一步 & 重新选择
            $('#nextStep,#reselect').click(function () {
                var type = $(this).attr('data-type');
                var num = Number($('.add-goods-active').attr('data-step_value'));

                if (type === 'next') {
                    if (that.nowStep == 1) {
                        // todo 验证类目选择
                    } else if (that.nowStep == 2) {
                        // todo 验证商品编辑
                    }
                    that.nowStep = num + 1 == 4 ? 1 : num + 1;
                } else if (type === 'back') {
                    // todo back
                    that.nowStep = num - 1 == 0 ? 1 : num - 1;
                }
                // 步骤跳转
                $('.add-goods-active').removeClass('add-goods-active');
                $('.active-step').removeClass('active-step');
                $('[data-step_value=' + that.nowStep + ']').addClass('add-goods-active');
                $('[data-now_step=' + that.nowStep + ']').addClass('active-step');
            });
        },
        /**
         * 排序
         * @param a
         * @param b
         * @returns {number}
         */
        sortNumber: function (a, b) {
            return a - b
        },
        /**
         * 验证
         */
        validator: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 验证
            $('#submit').click(function () {
                var isValid = true;
                var radioGoods = $('input[name=radio-goods]:checked').val();

                // required input validator
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i))
                    if (result.valid === false) {
                        isValid = false;
                    }
                }

                // self input validator
                if (radioGoods == 1) {
                    if (isValid == true) {
                        isValid = that.validatorRate();
                    }
                }
                if (isValid == true) {
                    $('#nextStep').click();
                } else {
                    //$('#nextStep').click();
                    //toastr.error('信息未填写或者填写不符合规范')
                }
            });
        },
        /**
         * 验证税率
         * @returns {boolean}
         */
        validatorRate: function () {
            var radioRate = $('input[name=radio-rate]:checked').val();
            var radioCommon = $.trim($('#radioCommon').val());
            var rateCommonThreshold = $.trim($('#rateCommonThreshold').val());
            var rateTemplate = $('#rateTemplate:selected').val();

            if (radioRate == 1) {
                // 验证统一税率
                if (radioCommon == '') {
                    toastr.error('统一税率起征点未填写或填写不合法', '错误提示');
                    return false;
                }
                if (rateCommonThreshold == '') {
                    toastr.error('统一税率的税率未填写或填写不合法', '错误提示');
                    return false;
                }
            } else {
                // 验证税率模板
                if (!rateTemplate) {
                    toastr.error('税率模板未选择', '错误提示');
                    return false;
                }
            }

            return true;
        },
        /**
         * 验证skuName是否存在
         * @param name
         * @returns {boolean}
         */
        validatorSkuName: function (name) {
            for (i in this.skuArr) {
                if (this.skuArr[i].prop_name == name) {
                    return false;
                }
            }
            return true;
        },
        addEvent: function () {
            var that = this;

            // 商品类型 切换
            $('input[name=radio-goods]').on('ifChecked', function () {
                if ($(this).val() == 2) {
                    // 国内商品
                    $('#rate').hide();
                } else {
                    // 跨进商品
                    $('#rate').show();
                }
            });

            // 添加 sku 规格
            $('.j-add-sku-specifications').click(function () {
                // 沿用老的 最多添加三个规格
                if (that.selectizeNumber === 4) {
                    return false;
                }
                that.addSku();
            });

            // 添加 sku-prop
            $('.goods-content').on('click', '.j-add-prop', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var value = $(this).attr('data-value');
                var prop = {};
                var dataArr = [];
                var k = 0;
                var isExist = false;

                if( that.skuArr[name].arr.length >= 8 ){
                    toastr.warning('添加的sku'+ name +'超出上限','警告提示');
                    return false;
                }

                data.content = '<input type="text" class="form-control prop">';
                data.target = $(this);
                data.position = 'bottom';
                that.tip(data, function (button, dialog) {
                    prop.prop_name = name;
                    prop.prop_value = value;
                    prop.value_name = $.trim($('.prop').val());
                    prop.value_id = data.target.parent().attr('data-index');

                    if( prop.value_name == '' ){
                        toastr.error('规格属性不能为空','错误提示');
                        return false;
                    }

                    // 渲染sku行
                    if (that.skuArr[name].arr.length == 0) {
                        that.renderSkuGroupCont(data.target, prop);
                    } else {
                        for (var n = 0; n < that.skuArr[name].arr.length; n++) {
                            if (that.skuArr[name].arr[n].value_name === prop.value_name) {
                                isExist = true;
                            }
                        }
                        if (isExist === false) {
                            that.renderSkuGroupCont(data.target, prop);
                        }
                    }

                    console.log('this.skuArr' + JSON.stringify(that.skuArr));

                    // sku组合
                    for (var m in that.skuArr) {
                        // 判断sku 里面的具体内容是否存在. 例如 尺码 中是否具体存在X,M,L
                        if (that.skuArr[m].arr.length > 0) {
                            dataArr[k] = [];
                            for (var i = 0; i < that.skuArr[m].arr.length; i++) {
                                dataArr[k].push({
                                    prop_name: that.skuArr[m].arr[i].prop_name,
                                    prop_value: that.skuArr[m].arr[i].prop_value,
                                    value_name: that.skuArr[m].arr[i].value_name,
                                    value_id: that.skuArr[m].arr[i].value_id
                                });
                            }
                        }
                        k++
                    }
                    console.log('dataArr:' + JSON.stringify(dataArr));

                    var skuData = that.combine(dataArr);

                    // sku组合
                    that.renderSkuTable(skuData);

                    // sku 图片select框
                    that.renderSkuSelect(skuData);
                    that.renderSkuImage(that.skuArr);

                    // props hover
                    $('.props').hover(function () {
                        $(this).find('.j-close').show();
                    }, function () {
                        $(this).find('.j-close').hide();
                    });

                    // 渲染完成后 初始化下icheck
                    that.iCheck();

                    dialog.close();
                    if (that.skuArr) {
                        $('.stock-container,.sku-container').show();
                        that.inputDisabled();
                    }
                }, function (button, dialog) {
                    dialog.close();
                })
            });

            // 批量设置 - sku
            $('.goods-content').on('click', '.j-batch', function () {
                var type = $(this).attr('data-type');
                $(this).hide();
                $('input[data-type]').hide();
                $('input[data-type=' + type + ']').show().focus();
            });

            // 批量设置 - sku - input
            $('.goods-content').on('blur', 'input[data-type=costPrice],input[data-type=ean]', function () {
                var type = $(this).attr('data-type');

                $(this).hide();
                $('.j-batch[data-type=' + type + ']').show();

                if ($(this).val() == '') {
                    return;
                }
                $('input[data-input_type=' + type + ']').val($(this).val()).change();
            });

            // 单个输入 - sku - input
            $('.goods-content').on('change', 'input[data-input_type=costPrice],input[data-input_type=ean]', function () {
                var type = $(this).attr('data-input_type');
                var arr = [], hasEmpty = false;
                if ($(this).val() == '') {
                    return;
                }
                $.each($('input[data-input_type=' + type + ']'), function (index, ele) {
                    var v = $(ele).val();
                    if (v == '') {
                        hasEmpty = true;
                        return;
                    }
                    arr.push(Number(v));
                });
                hasEmpty ? $('#' + type).val('') : $('#' + type).val(arr.sort(this.sortNumber).shift().toFixed(2));
            });

            // sku 属性切换
            $('.goods-content').on('ifChecked','input[name=radio-sku-prop]', function () {
                var key = $(this).attr('data-key');
                $('.dl-active').removeClass('dl-active');
                $('dl[data-key='+key+']').addClass('dl-active');
            });

            // props 删除
            $('.goods-content').on('click', '.j-close', function () {
                toastr.success('删除成功','成功提示')
            });

            // selectize 删除
            $('.goods-content').on('click', '.selectize-close', function () {
                toastr.success('删除成功','成功提示')
            });
        },
        /**
         * 新增sku条目
         */
        addSku: function () {
            var that = this;
            var selectizeTpl = _.template($('#j-template-selectize').html());

            $('#skuCont').append(selectizeTpl({
                number: that.selectizeNumber
            }));
            var selectize = $('#selectize-' + that.selectizeNumber).selectize({
                options: [{value: 278, text: '278'}, {value: 412, text: '412'}],
                placeholder: '请添加规格',
                create: true,
                onItemAdd: function (value, $item) {
                    // 选择sku事件
                    var name = $item.html();
                    var targetNumber = $item.parents('.sku-group').index() + 1;
                    var $selectize = selectize[0].selectize;
                    that.renderSkuAddButtom($selectize, targetNumber, name, value);
                }
            });

            that.selectizeNumber += 1;
            if (that.selectizeNumber === 4) {
                $('.j-add-sku-specifications').parents('.sku-group').hide();
            }

            // selectize hover
            $('.sku-group-title').hover(function () {
                $(this).find('.selectize-close').show();
            }, function () {
                $(this).find('.selectize-close').hide();
            })
        },
        /**
         * 排列组合
         * sku组合
         * @param arg
         * @returns {*}
         */
        combine: function (arg) {
            if (arg.length == 0) {
                return arg;
            }
            var r = [], max = arg.length - 1;

            function combineArr(arr, n) {
                for (var i = 0, j = arg[n].length; i < j; i++) {
                    var a = arr.slice(0);
                    a.push(arg[n][i]);
                    if (n == max) {
                        r.push(a)
                    } else {
                        combineArr(a, n + 1)
                    }
                }
            }

            combineArr([], 0);
            return r
        },
        /**
         * 渲染sku 添加按钮并组合数组skuArr
         * 根据skuArr / floor 与 当前选择的sku进行比较判断是否存在
         * @param $selectize    当前的selectize
         * @param targetNumber  当前的指针数
         * @param name          选择的条目
         * @param value         选择的条目的value
         */
        renderSkuAddButtom: function ($selectize, targetNumber, name, value) {

            if (this.validatorSkuName(name) === true) {
                // 不存在sku数组中 直接添加
                // 判断楼层是否已经存在
                if (this.isExist(targetNumber) == true) {
                    this.delSku(this.skuArr, targetNumber);
                }
                var template = _.template($('#j-template-skuProp').html());

                this.skuArr[value] = {
                    prop_name: name,
                    prop_value: $.trim(value),
                    floor: targetNumber,
                    arr: []
                };

                $('.sku-group-cont-' + targetNumber).html(template({
                    current_prop_name: name,
                    current_prop_value: value
                }));

            } else {
                // 存在sku数组中 先删除后添加
                // 删除
                this.delSku(this.skuArr, targetNumber);
                toastr.error('所选sku已经存在了', '错误提示');
                $selectize.clear();
            }
            console.log('this.skuArr' + JSON.stringify(this.skuArr));
        },
        /**
         * 渲染sku规格添加行
         * @param target
         * @param prop
         */
        renderSkuGroupCont: function (target, prop) {
            this.skuArr[prop.prop_value].arr.push(prop);
            target.before('<span class="props">' + prop.value_name + '<i class="fa fa-close props-close j-close"></i></span>');
        },
        /**
         * 渲染sku组合表格
         * @param data
         */
        renderSkuTable: function (data) {
            var skuTemplate = _.template($('#j-template-sku').html());
            $('#sku').html(skuTemplate({
                items: data
            }));
        },
        /**
         * 渲染sku选择框radio
         */
        renderSkuSelect: function (data) {
            var template = _.template($('#j-template-sku-select').html());
            $('#sku-img').html(template({
                items: data
            }));
        },
        /**
         * 渲染sku图片
         * @param data
         */
        renderSkuImage: function (data) {
            var template = _.template($('#j-template-sku-img').html());
            $('.sku-gallery').html(template({
                items: data
            }));
        },
        /**
         * 移除floor级别的sku
         * @param obj
         * @param floor
         */
        delSku: function (obj, floor) {
            for (k in obj) {
                if (obj[k].floor == floor) {
                    delete obj[k];
                }
            }
        },
        /**
         * 判断是否存在
         * @param targetNumber
         * @returns {boolean}
         */
        isExist: function (targetNumber) {
            for (k in this.skuArr) {
                if (targetNumber == this.skuArr[k].floor) {
                    return true;
                }
            }
            return false;
        },
        /**
         * icheck定义
         */
        iCheck: function () {
            if ($("input.flat")[0]) {
                $(document).ready(function () {
                    $('input.flat').iCheck({
                        checkboxClass: 'icheckbox_flat-green',
                        radioClass: 'iradio_flat-green'
                    });
                });
            }
        },
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            var dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog)
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        fail && fail(button, dialog)
                    }
                }]
            });
        },
        inputDisabled: function () {
            if( !this.skuArr ){
                $('#costPrice,#ean').prop('disabled',false);
            }else{
                $('#costPrice,#ean').prop('disabled',true);
                $('#costPrice,#ean').val('')
            }
        }
    };
    // run
    $(function () {
        main.init();
    })
})();