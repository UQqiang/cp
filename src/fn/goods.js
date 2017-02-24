/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.nowStep = 1;               // 添加商品的步骤
            this.selectizeNumber = 1;       // 商品规格选择框的index
            this.skuName = [];              // sku的名称数组
            this.skuProp = [];              // sku的prop数组

            this.toastrInit();
            this.step();
            this.validator();
            this.addEvent();

            this.arr = [
                [{prop_name: '尺码', prop_id: 1, value_name: 'X', value_id: 10}, {
                    prop_name: '尺码',
                    prop_id: 2,
                    value_name: 'M',
                    value_id: 11
                }, {
                    prop_name: '尺码',
                    prop_id: 5,
                    value_name: 'L',
                    value_id: 20
                }],
                [{prop_name: '颜色', prop_id: 3, value_name: '红色', value_id: 12}, {
                    prop_name: '颜色',
                    prop_id: 4,
                    value_name: '绿色',
                    value_id: 13
                }],
                [
                    {prop_name: '数量', prop_id: 3, value_name: '多', value_id: 12}, {
                    prop_name: '数量',
                    prop_id: 4,
                    value_name: '少',
                    value_id: 13
                }
                ]
            ];

            // 富文本编辑器
            this.editor = UE.getEditor('editor');
        },
        /**
         * 初始化提示框
         */
        toastrInit: function () {
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            //toastr.success('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.info('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.error('Have fun storming the castle!', 'Miracle Max Says');
            //toastr.warning('1','2');
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
         *  排序
         */
        sortNumber: function (a, b) {
            return a - b
        },
        validator: function () {
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('#submit').click(function () {
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    validator.checkField.call(validator, required.eq(i))
                }
            });
        },
        addEvent: function () {
            var that = this;

            // 添加 sku 规格
            $('.j-add-sku-specifications').click(function () {
                if (that.selectizeNumber === 4) {
                    return false;
                }
                that.addSku();
            });

            // 添加 sku-prop
            $('.goods-content').on('click', '.j-add-prop', function () {
                var data = {};
                data.content = '<input type="text" class="form-control prop">';
                data.target = $(this);
                data.position = 'bottom';
                that.tip(data, function (button, dialog) {
                    var prop = {
                        value: $('.prop').val(),
                        id: data.target.parent().attr('data-index')
                    };
                    that.skuProp.push(prop);
                    console.log(that.skuProp);
                    that.combine(that.arr);
                    dialog.close();
                    if (that.arr) {
                        $('.stock-container,.sku-container').show();
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
            $('.goods-content').on('change', 'input[data-type=costPrice],input[data-type=ean]', function () {
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
                options: [{value: 1, text: '11111'}, {value: 2, text: '名字'}],
                placeholder: '请添加规格',
                create: true,
                onItemAdd: function (value, $item) {
                    // 选择sku事件
                    console.log(value, $item);
                    var name = $item.html();
                    var targetNumber = $item.parents('.sku-group').index() + 1;
                    var $selectize = selectize[0].selectize;
                    that.renderSku($selectize, targetNumber, name);
                }
            });

            that.selectizeNumber += 1;
            if (that.selectizeNumber === 4) {
                $('.j-add-sku-specifications').parents('.sku-group').hide();
            }
        },
        /**
         * 验证skuName是否存在
         * @param name
         * @returns {boolean}
         */
        validatorSkuName: function (name) {

            for (var i = 0; i < this.skuName.length; i++) {
                if ($.inArray(name, this.skuName) != -1) {
                    return false;
                }
            }
            return true;
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
         * 渲染sku
         * @param $selectize
         * @param targetNumber
         * @param name
         */
        renderSku: function ($selectize, targetNumber, name) {
            if (this.validatorSkuName(name) === true) {
                var template = _.template($('#j-template-skuProp').html());
                this.skuName.push($.trim(name));
                $('.sku-group-cont-' + targetNumber).html(template({}));
                $selectize.clear();
            } else {
                toastr.error('输入的sku已经存在~', '错误提示!');
            }
            // sku组合
            var skuData = this.combine(this.arr);
            var skuTemplate = _.template($('#j-template-sku').html());
            $('#sku').html(skuTemplate({
                items: skuData
            }));

            // sku 图片
            var skuImgTemplate = _.template($('#j-template-sku-img').html());
            $('#sku-img').html(skuImgTemplate({
                items: skuData
            }));
            this.iCheck();
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
        }
    };
    // run
    $(function () {
        main.init();
    })
})();