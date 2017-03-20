/**
 * Created by lijiahao on 17/1/9.
 * skuArr [
 *"216":{
 *  "sku_name":"体型大小",
 *  "sku_id":"216",
 *  "floor":1,
 *  "value":[{
 *      "prop_name":"体型大小",
 *      "prop_id":"216",
 *      "value_name":"20",
 *      "value_id":94685,
 *      "thumb":""
 *      },
 *      {
 *      "prop_name":"体型大小",
 *      "prop_id":"216",
 *      "value_name":"30",
 *      "value_id":94686},
 *      "thumb":""
 *    ]}
 * ]
 */
;(function () {
    var main = {
        init: function () {
            this.nowStep = 1;                           // 添加商品的步骤
            this.currentCateObj = {};                   // 当前选择的一二级类目对象
            this.cateId = '';                           // 当前的类目id ( 二级类目 )
            this.index = 0;                             // index 用于创建sku
            this.skuHistoryArr = [];                    // sku历史记录
            this.selectizeNumber = 1;                   // 商品规格选择框的数量 开放最多三个
            this.skuArr = {};                           // sku的对象数组 (本JS 核心对象. 数据的操作主要围绕这个对象)
            this.skuTableData = [];                     // sku表格的对象数组
            this.selectId = null;                       // 选中的sku主图的id
            this.commonGallery = [];                    // 商品主图
            this.skuGallery = [];                       // sku主图
            this.editor = UE.getEditor('editor');       // 富文本编辑器
            this.warehouseData = [];
            this.api = Api.domain();                    // 接口请求的api
            this.goodsId = HDL.getQuery('id');          // 商品的id
            // 初始化提示框
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            var height = window.innerHeight - 200;
            $('.step').css({
                'min-height': height + 'px'
            });
            if (this.goodsId) {
                this.nowStep = 2;
                $.when(
                    this.queryBrand(),
                    this.queryCountry(),
                    this.queryHistorySkuProperty()
                ).done(
                    this.getGoods()
                );
            }
            this.stepShow();
            this.step();
            this.addEvent();
            this.imgModal();
            this.queryCategory();
            this.selectPluginWarehouse();
        },
        /**
         * 调用图片选择插件
         */
        imgModal: function () {
            var that = this;
            $('.imgUploadBtn').imgModal({
                selectImgPopupBtn: '.imgUploadBtn',
                selectImgBtn: '.j-select-img',
                times: 1,
                multiple: false,
                selectSuccess: function (data, target) {
                    that.$currentImgUploadBtn = target;
                    that.imgSelected(data);
                },
                uploadSuccess: function (data, target) {
                    that.$currentImgUploadBtn = target;
                    that.imgSelected(data[0].url);
                }
            });
        },
        /**
         * 图片选择后的操作
         * @param url
         */
        imgSelected: function (url) {
            var that = this;
            var img = url;
            var thumb = img + '@1e_80w_80h_1c_0i_1o_90Q_1x.png';
            var hasSelected = false;
            if (that.$currentImgUploadBtn.attr('data-type') == 'common') {
                if (that.commonGallery.length >= 5) {
                    return;
                }
                // 商品主图
                that.commonGallery.push({
                    color: '通用',
                    img: img,
                    id: 0
                });
                that.renderCommonGallery(that.commonGallery);
            } else {
                // sku主图
                var pid = that.$currentImgUploadBtn.attr('data-pid');
                var name = that.$currentImgUploadBtn.attr('data-name');
                var sku_id = that.$currentImgUploadBtn.parent().attr('data-sku_id');
                var index = that.$currentImgUploadBtn.attr('data-index');

                // 当有相同的时候 替换掉
                for (var i = 0; i < that.skuGallery.length; i++) {
                    if (that.skuGallery[i].id == pid) {
                        hasSelected = true;
                        that.skuGallery[i] = {
                            color: name,
                            img: img,
                            id: pid
                        }
                    }
                }
                if (hasSelected == false) {
                    that.skuGallery.push({
                        color: name,
                        img: img,
                        id: pid
                    });
                }
                that.skuArr[sku_id].value[index].thumb = thumb;
                that.renderSkuGallery(sku_id, pid);
            }
        },
        /**
         * 调用弹窗选择插件
         * 选择仓库
         */
        selectPluginWarehouse: function () {
            var that = this;
            $('#selectPluginButtonWarehouse').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 3,
                title: '选择仓库',
                selectLength: 10,
                selectedList: that.warehouseData,
                selectSuccess: function (data) {
                    that.warehouseData = data;
                    that.renderWareHouse();
                    that.iCheck();
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 步骤的展示
         */
        stepShow: function () {
            var that = this;
            // 步骤跳转
            $('.add-goods-active').removeClass('add-goods-active');
            $('.active-step').removeClass('active-step');
            $('[data-step_value=' + that.nowStep + ']').addClass('add-goods-active');
            $('[data-now_step=' + that.nowStep + ']').addClass('active-step');

            // 滚动条自动回顶部
            document.getElementsByTagName('body')[0].scrollTop = 0;
        },
        /**
         * 步骤相关
         */
        step: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 下一步 & 重新选择
            $('#nextStep,#nextStep2,.reselect,#submit').click(function () {
                var type = $(this).attr('data-type');
                var num = Number($('.add-goods-active').attr('data-step_value'));
                var isValid = true;

                if (!that.currentCateObj['2']) {
                    return false;
                }

                if (type === 'next') {
                    if (that.nowStep == 1) {
                        // 第一步 验证类目
                        that.queryHistorySkuProperty();
                        that.queryBrand();
                        that.queryCountry();
                    } else if (that.nowStep == 2) {
                        //// 第二步 验证商品
                        //var radioGoods = $('input[name=radio-goods]:checked').val();
                        //
                        //// required input validator
                        //for (var i = 0; i < $('[required]').length; i++) {
                        //    var required = $('[required]');
                        //    var result = validator.checkField.call(validator, required.eq(i))
                        //    if (result.valid === false) {
                        //        isValid = false;
                        //        return;
                        //    }
                        //}
                        //
                        //// self input validator
                        //if (radioGoods == 1) {
                        //    if (isValid == true) {
                        //        isValid = that.validatorRate();
                        //    }
                        //}
                        //
                        //// 验证商品详情富文本
                        //if (that.editor.getContent() == '') {
                        //    toastr.error('商品详情不能为空', '错误提示');
                        //    isValid = false;
                        //    return;
                        //}
                    }
                    that.nowStep = num + 1 == 4 ? 1 : num + 1;
                } else if (type === 'back') {
                    // todo back
                    that.nowStep = num - 1 == 0 ? 1 : num - 1;
                } else if (type === 'submit') {
                    // 保存
                    if (isValid == true) {
                        if (!that.goodsId) {
                            that.setPostData();
                            that.addGoods();
                        }
                        //$('#nextStep').click();
                    } else {
                        //$('#nextStep').click();
                        //toastr.error('信息未填写或者填写不符合规范')
                    }
                }

                if (isValid == true && type != 'submit') {
                    that.stepShow();
                }
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
            for (var i in this.skuArr) {
                if (this.skuArr[i].sku_name == name) {
                    return false;
                }
            }
            return true;
        },
        addEvent: function () {
            var that = this;

            // 添加 sku 规格
            $('.j-add-sku-specifications').click(function () {
                // 沿用老的 最多添加三个规格
                if (that.selectizeNumber === 4) {
                    return false;
                }
                that.index++;
                that.addSku(function () {
                    that.selectizeNumber += 1;
                    if (that.selectizeNumber === 4) {
                        $('.j-add-sku-specifications').parents('.sku-group').hide();
                    }
                });
                that.initWarehouse();
            });

            // 添加 sku-prop
            $('.goods-content').on('click', '.j-add-prop', function () {
                var data = {};
                var sku_name = $(this).attr('data-sku_name');
                var sku_id = $(this).attr('data-sku_id');
                var prop = {};
                var isExist = false;

                // 超出上限
                if (that.skuArr[sku_id].value.length >= 8) {
                    toastr.warning('添加的sku' + sku_name + '超出上限', '警告提示');
                    return false;
                }
                data.content = '<input type="text" class="form-control prop">';
                data.target = $(this);
                data.position = 'bottom';
                that.tip(data, function (button, dialog) {
                    prop.prop_name = sku_name;
                    prop.prop_id = sku_id;
                    prop.value_name = $.trim($('.prop').val());

                    if (prop.value_name == '') {
                        toastr.error('规格属性不能为空', '错误提示');
                        return false;
                    }
                    that.skuPropAdd(sku_id, prop.value_name, function (pid) {
                        prop.value_id = pid;

                        // 渲染sku行
                        if (that.skuArr[sku_id].value.length == 0) {
                            (that.skuArr[prop.prop_id].value).push(prop);
                            that.renderSkuGroupCont(data.target, prop);
                        } else {
                            // 重复的sku ( 不再添加 )
                            for (var n = 0; n < that.skuArr[sku_id].value.length; n++) {
                                if (that.skuArr[sku_id].value[n].value_name === prop.value_name) {
                                    isExist = true;
                                }
                            }
                            if (isExist === false) {
                                (that.skuArr[prop.prop_id].value).push(prop);
                                that.renderSkuGroupCont(data.target, prop);
                            }
                        }
                        that.combineData();
                        that.render(sku_id)
                        dialog.close();
                    });
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
            $('.goods-content').on('blur', 'input[data-type=lowestPrice],input[data-type=suggestionsPrice],input[data-type=ean]', function () {
                var type = $(this).attr('data-type');

                $(this).hide();
                $('.j-batch[data-type=' + type + ']').show();

                if ($(this).val() == '') {
                    return;
                }
                $('input[data-input_type=' + type + ']').val($(this).val()).change();
                that.finishingSkuTableData();
            });

            // 单个输入 - sku - input
            $('.goods-content').on('change', 'input[data-input_type=lowestPrice],input[data-input_type=suggestionsPrice],input[data-input_type=ean]', function () {
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
                that.finishingSkuTableData();
            });

            // sku 属性切换
            $('.goods-content').on('ifChecked', 'input[name=radio-sku-prop]', function () {
                var sku_id = $(this).attr('data-sku_id');

                // 切换的时候判断选择的sku主图属性
                that.selectId = sku_id;
                $('.dl-active').removeClass('dl-active');
                $('dl[data-sku_id=' + sku_id + ']').addClass('dl-active');

                // 切换的时候 删除全部的sku图片
                for (var key in that.skuArr) {
                    for (var i = 0; i < that.skuArr[key].value.length; i++) {
                        delete that.skuArr[key].value[i].thumb
                    }
                }
                that.skuGallery = [];
                that.renderSkuGallery(sku_id);
            });

            // props 删除
            $('.goods-content').on('click', '.j-g-close.props-close', function () {
                var sid = $(this).parent().attr('data-sid');
                var pid = $(this).parent().attr('data-pid');
                for (var key in that.skuArr) {
                    if (key == sid) {
                        for (var i = 0; i < that.skuArr[key].value.length; i++) {
                            if (that.skuArr[key].value[i].value_id == pid) {
                                that.skuArr[key].value.splice(i, 1);
                                i--;
                            }
                        }
                    }
                }
                for (var m = 0; m < that.skuTableData.length; m++) {
                    for( var n = 0 ; n < that.skuTableData[m].prop.length; n++){
                        if( pid == that.skuTableData[m].prop[n].value_id ){
                            that.skuTableData.splice(m,1);
                            m--;
                        }
                    }
                }
                $(this).parent().remove();
                that.render(sid);
                toastr.success('删除成功', '成功提示')
            });

            // selectize 删除
            $('.goods-content').on('click', '.j-g-close.selectize-close', function () {
                var floor = $(this).attr('data-floor');
                for (var key in that.skuArr) {
                    if (that.skuArr[key]['floor'] == floor) {
                        delete that.skuArr[key];
                    }
                }
                $(this).parents('.sku-group').remove();
                // 因为删除的比较多 所以滞空
                that.skuTableData = [];
                that.combineData();
                that.render();
                // 减少楼层
                that.selectizeNumber -= 1;
                if (that.selectizeNumber < 4) {
                    $('.j-add-sku-specifications').parents('.sku-group').show();
                }
                toastr.success('删除成功', '成功提示');
            });

            // 图片删除
            $('.goods-content').on('click', '.j-g-close.img-close', function (e) {
                e.stopPropagation();
                var type = $(this).parent().attr('data-type');
                var index = $(this).parent().index();
                var pid = $(this).parent().attr('data-pid');

                if (!pid) {
                    // 商品主图
                    that.commonGallery.splice(index, 1);
                    console.log(that.commonGallery, that.commonGallery.length);
                    that.renderCommonGallery(that.commonGallery);
                } else {
                    // sku主图
                    var sku_id = $(this).parents('dl').attr('data-sku_id');
                    for (var n = 0; n < that.skuGallery.length; n++) {
                        if (that.skuGallery[n].id == pid) {
                            that.skuGallery.splice(n, 1);
                            n--;
                        }
                    }
                    for (var k in that.skuArr) {
                        for (var m = 0; m < that.skuArr[k].value.length; m++) {
                            if (that.skuArr[k].value[m].value_id == pid) {
                                that.skuArr[k].value[m].thumb = null;
                            }
                        }
                    }
                    that.renderSkuImage(that.skuArr);
                }
                toastr.success('删除成功', '成功提示');
            });

            // 仓库删除
            $('#warehouse').on('click', '.j-delete-warehouse', function () {
                var warehouseId = $(this).attr('data-warehouse_id');
                var name = $(this).attr('data-name');
                var data = {};
                data.target = $(this);
                data.position = 'left';
                data.content = '确定要删除' + name + '吗?';
                that.tip(data, function (button, dialog) {
                    for (var i = 0; i < that.warehouseData.length; i++) {
                        if (that.warehouseData[i].id == warehouseId) {
                            that.warehouseData.splice(i, 1);
                            i--
                        }
                    }
                    data.target.parents('table').remove();
                    dialog.close();
                }, function (button, dialog) {
                    dialog.close();
                })
            })
        },
        /**
         * 新增sku条目
         */
        addSku: function (cb,onAddcb) {
            var that = this;
            var selectizeTpl = _.template($('#j-template-selectize').html());

            $('#skuCont').append(selectizeTpl({
                index: that.index
            }));
            var selectize = $('#selectize-' + that.index).selectize({
                options: that.skuHistoryArr,
                placeholder: '请添加规格',
                create: true,
                onItemAdd: function (value, $item) {
                    // 选择sku事件
                    var name = $item.html();
                    var floor = $item.parents('.sku-group').attr('data-index');
                    var $selectize = selectize[0].selectize;
                    that.renderSkuAddButtom($selectize, floor, name, value);
                    onAddcb && onAddcb($selectize);
                }
            });
            var $selectize = selectize[0].selectize;
            cb && cb($selectize);
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
        combineData: function () {
            var that = this;
            var dataArr = [];
            var k = 0;
            // sku组合
            for (var m in that.skuArr) {
                // 判断sku 里面的具体内容是否存在. 例如 尺码 中是否具体存在X,M,L
                if (that.skuArr[m].value.length > 0) {
                    dataArr[k] = [];
                    for (var i = 0; i < that.skuArr[m].value.length; i++) {
                        dataArr[k].push({
                            prop_name: that.skuArr[m].value[i].prop_name,
                            prop_id: that.skuArr[m].value[i].prop_id,
                            value_name: that.skuArr[m].value[i].value_name,
                            value_id: that.skuArr[m].value[i].value_id
                        });
                    }
                    k++
                }
            }
            var skuTableData = that.combine(dataArr);
            for (var l = 0; l < skuTableData.length; l++) {
                that.skuTableData[l] = {
                    prop: skuTableData[l]
                };
            }
            console.log(that.skuTableData)
        },
        render: function (sid) {
            var that = this;

            // sku组合
            that.renderSkuTable(that.skuTableData);
            // sku 图片select框
            that.renderSkuSelect(that.skuTableData, sid);
            // sku 图片
            that.renderSkuImage(that.skuArr, sid);
            that.checkedSkuExist(that.skuTableData);

            that.initWarehouse();

            // 渲染完成后 初始化下icheck
            that.iCheck();

            that.hoverFunc();
        },
        /**
         * 渲染sku 添加按钮并组合数组skuArr
         * 根据skuArr / floor 与 当前选择的sku进行比较判断是否存在
         * @param $selectize    当前的selectize
         * @param floor         当前的指针数
         * @param name          选择的条目
         * @param sku_id        选择的条目的value
         */
        renderSkuAddButtom: function ($selectize, floor, name, sku_id) {

            if (this.validatorSkuName(name) === true) {
                // 不存在sku数组中 直接添加
                // 判断楼层是否已经存在
                if (this.isExist(floor) == true) {
                    this.delSku(this.skuArr, floor);
                }
                var template = _.template($('#j-template-skuProp').html());

                this.skuArr[sku_id] = {
                    sku_name: name,
                    sku_id: $.trim(sku_id),
                    floor: floor,
                    value: []
                };

                $('.sku-group-cont-' + floor).html(template({
                    current_sku_name: name,
                    current_sku_id: sku_id
                }));

            } else {
                // 存在sku数组中 先删除后添加
                // 删除
                this.delSku(this.skuArr, floor);
                toastr.error('所选sku已经存在了', '错误提示');
                $selectize.clear();
            }
            console.log('this.skuArr(第一次最新的):' + JSON.stringify(this.skuArr));
        },
        /**
         * 渲染sku规格添加行
         * @param target
         * @param prop
         */
        renderSkuGroupCont: function (target, prop) {
            target.before('<span class="props" data-sid="' + prop.prop_id + '" data-pid="' + prop.value_id + '">' + prop.value_name + '<i class="fa fa-close props-close j-g-close"></i></span>');
        },
        /**
         * 渲染sku组合表格
         * @param data
         */
        renderSkuTable: function (data) {
            if (data.length > 0) {
                var skuTemplate = _.template($('#j-template-sku').html());
                $('#sku').html(skuTemplate({
                    items: data
                }));
            } else {
                $('#sku').html('');
            }
        },
        /**
         * 渲染sku选择框radio
         */
        renderSkuSelect: function (data, sku_id) {
            if (data.length > 0) {
                var template = _.template($('#j-template-sku-select').html());
                $('#sku-img').html(template({
                    items: data,
                    sku_id: sku_id
                }));
            } else {
                $('#sku-img').html('');
            }
        },
        /**
         * 渲染sku图片
         * @param data
         * @param sku_id
         */
        renderSkuImage: function (data, sku_id) {
            var template = _.template($('#j-template-sku-img').html());
            $('.sku-gallery').html(template({
                items: data,
                sku_id: sku_id
            }));
            if (!sku_id) {
                var current = $('input[name=radio-sku-prop]:checked').attr('data-sku_id');
                $('.sku-gallery').find('dl[data-sku_id=' + current + ']').addClass('dl-active');
            }
            this.hoverFunc();
        },
        renderCommonGallery: function (data) {
            var template = _.template($('#j-template-common-gallery').html());
            $('#main-gallery ul').html(template({
                items: data
            }));
            this.hoverFunc();
        },
        renderSkuGallery: function (sku_id, pid) {
            var that = this;
            var template = _.template($('#j-template-sku-img').html());
            if (!this.skuArr[sku_id]) {
                return false;
            } else {
                $('.sku-gallery').html(template({
                    items: that.skuArr,
                    sku_id: sku_id
                }));
            }
            that.hoverFunc();
        },
        renderWareHouse: function () {
            var that = this;
            var template = _.template($('#j-template-warehouse').html());
            if (that.skuTableData.length > 0) {
                $('#warehouse').html(template({
                    items: that.warehouseData,
                    sku: that.skuTableData
                }));
            }
        },
        /**
         * 初始化仓库
         * sku变更后,仓库初始化
         */
        initWarehouse: function () {
            // 删除后 仓库要跟着初始化
            if (this.warehouseData.length > 0) {
                this.warehouseData.length = 0;
                $('#warehouse').html('');
            }
        },
        /**
         * 移除floor级别的sku
         * @param obj
         * @param floor
         */
        delSku: function (obj, floor) {
            for (var k in obj) {
                if (obj[k].floor == floor) {
                    delete obj[k];
                }
            }
        },
        /**
         * 更具楼层判断是否存在
         * @param floor
         * @returns {boolean}
         */
        isExist: function (floor) {
            for (var k in this.skuArr) {
                if (floor == this.skuArr[k].floor) {
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
        checkedSkuExist: function (data) {
            var that = this;
            if (data.length > 0) {
                $('.stock-container,.sku-container').show();
                $('#lowestPrice,#suggestionsPrice,#ean').prop('disabled', true);

                var lowestPrice = [], suggestionsPrice = [], ean = [];
                $.each(that.skuTableData, function (i, obj) {
                    if( obj.lowestPrice ){
                        lowestPrice.push(Number(obj.lowestPrice));
                    }
                    if( obj.suggestionsPrice ){
                        suggestionsPrice.push(Number(obj.suggestionsPrice));
                    }
                });

                lowestPrice.length > 0 ? $('#lowestPrice').val((lowestPrice.sort(that.sortNumber).shift() / 100).toFixed(2)): $('#lowestPrice').val('');

                suggestionsPrice.length > 0 ? $('#suggestionsPrice').val((suggestionsPrice.sort(that.sortNumber).shift() / 100).toFixed(2)) : $('#suggestionsPrice').val('');

            } else {
                $('.stock-container,.sku-container').hide();
                $('#lowestPrice,#suggestionsPrice,#ean').prop('disabled', false);
            }
        },
        hoverFunc: function () {
            // hover
            $('.image,.j-g-close.img-close').hover(function () {
                $(this).parent().find('.j-g-close').show();
            }, function () {
                $(this).parent().find('.j-g-close').hide();
            });

            // props hover
            $('.props').hover(function () {
                $(this).find('.j-g-close').show();
            }, function () {
                $(this).find('.j-g-close').hide();
            });

            // selectize hover
            $('.sku-group-title').hover(function () {
                $(this).find('.selectize-close').show();
            }, function () {
                $(this).find('.selectize-close').hide();
            })
        },
        setPostData: function () {
            this.postData = {};
            var sku_props = [];
            var current_select = this.selectId || $('.dl-active').attr('data-sku_id');
            this.postData.name = $.trim($('#name').val());                              // 商品名称
            this.postData.cate_id = this.cateId;                                        // 二级类目id
            this.postData.gallery = JSON.stringify(this.commonGallery.concat(this.skuGallery));       // 商品图片
            this.postData.lowest_price = $.trim($('#lowestPrice').val());               // 最近零售价
            this.postData.suggestions_price = $.trim($('#suggestionsPrice').val());     // 建议售价
            this.postData.description = this.editor.getContent();                       // 商品详情

            // 整理sku_props
            for (var key in this.skuArr) {
                var obj = {}, vid = [], value = [];
                obj.id = key;
                obj.name = this.skuArr[key].sku_name;
                for (var i = 0; i < this.skuArr[key].value.length; i++) {
                    vid.push(this.skuArr[key].value[i].value_id);
                    value.push(this.skuArr[key].value[i].value_name);
                    obj.vid = vid;
                    obj.value = value;
                }
                if (obj.id == current_select) {
                    obj.has_image = 1;
                }
                sku_props.push(obj)
            }

            this.postData.sku_props = JSON.stringify(sku_props);
            this.finishingSkuTableData();
            this.postData.skus = JSON.stringify(this.skuTableData);

        },
        finishingSkuTableData: function () {
            // 整理skus
            var input = $('input[name=skuProp]');

            if (input.length > 0) {
                for (var n = 0; n < input.length; n++) {
                    var type = input.eq(n).attr('data-input_type');
                    var idx = input.eq(n).attr('data-index');
                    var val = $.trim(input.eq(n).val());
                    switch (type) {
                        case 'lowestPrice':
                            this.skuTableData[idx].lowestPrice = (val == '' ? '' : (val * 100).toFixed(0));
                            break;
                        case 'suggestionsPrice':
                            this.skuTableData[idx].suggestionsPrice = (val == '' ? '' : (val * 100).toFixed(0));
                            break;
                        case 'ean':
                            this.skuTableData[idx].ean = val;
                            break;
                    }
                }
            } else {
                if (this.skuTableData.length == 0) {
                    // 构造数据
                    this.skuTableData = [{
                        ean: $.trim($('#ean').val()),
                        lowestPrice: ($.trim($('#lowestPrice').val()) * 100).toFixed(0),
                        suggestionsPrice: ($.trim($('#suggestionsPrice').val()) * 100).toFixed(0),
                        prop: [{
                            prop_id: 0,
                            prop_name: "",
                            value_id: "666",
                            value_name: ""
                        }]
                    }]
                } else {
                    // 保留skuid
                    this.skuTableData[0].ean = $.trim($('#ean').val());
                    this.skuTableData[0].lowestPrice = ($.trim($('#lowestPrice').val()) * 100).toFixed(0);
                    this.skuTableData[0].suggestionsPrice = ($.trim($('#suggestionsPrice').val()) * 100).toFixed(0);
                }
            }
        },
        /**
         * 获取类目
         */
        queryCategory: function () {
            var that = this;
            $.ajax({
                url: that.api + '/category/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    that.categoryData = data.data;
                    if (data.code === 10000) {
                        var template = _.template($('#template-category').html());

                        // 渲染一级类目
                        $('#add-goods-category-1').html(template({
                            items: data.data,
                            level: 1
                        }));

                        // 类目的点击事件
                        $('.categories').on('click', '.category-list li', function () {
                            var id = $(this).attr('data-id');
                            var parent_id = $(this).attr('data-parent_id');
                            var name = $.trim($(this).text());
                            var level = $(this).attr('data-cate_level');

                            if (parent_id == 0) {
                                // 点击的是一级类目
                                // 一级类目移除active
                                $('.category-list li[data-parent_id=' + parent_id + ']').removeClass('active');
                                $('#add-goods-category-2').html(template({
                                    items: data.data,
                                    parent_id: id,
                                    level: 2
                                }));
                                that.currentCateObj = {};
                            } else {
                                // 点击的是二级类目
                                $('.category-list li[data-parent_id!=0]').removeClass('active');
                            }

                            that.currentCateObj[level] = {
                                id: id,
                                parent_id: parent_id,
                                name: name,
                                level: level
                            };
                            $(this).addClass('active');

                            console.log('that.currentCateObj :' + that.currentCateObj);

                            if (that.currentCateObj['2']) {
                                that.cateId = that.currentCateObj['2'].id;
                                var cate_1 = that.currentCateObj['1'].name;
                                var cate_2 = that.currentCateObj['2'].name;
                                $('.currentCategory').html(cate_1 + '&nbsp;-&nbsp;' + cate_2);
                                $('#nextStep').removeAttr('disabled').text('下一步');
                            } else {
                                $('#nextStep').attr('disabled', 'disabled').text('请选择类目');
                                $('.currentCategory').html('');
                            }
                        })
                    }
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        /**
         * sku历史记录
         */
        queryHistorySkuProperty: function () {
            var that = this;
            $.ajax({
                url: that.api + '/property/sku/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    var skuHistroy = data.data.item_sku_list;
                    $.each(skuHistroy, function (index, obj) {
                        that.skuHistoryArr.push({
                            value: obj.id,
                            text: obj.sku_code
                        });
                    });
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        /**
         * 输入一个sku 返回一个对应的id
         */
        skuPropAdd: function (sku_id, property_name, cb) {
            var that = this;
            $.ajax({
                url: that.api + '/property/sku_property/add.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    sku_id: sku_id,
                    property_name: property_name
                },
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    if (data.code == 10000) {
                        cb && cb(data.data.id)
                    }
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        /**
         * 国家列表
         */
        queryCountry: function () {
            var that = this;
            $.ajax({
                url: '../src/stub/flag.json',
                type: 'get',
                dataType: 'json',
                data: {},
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.code == 10000) {
                        var t = _.template($('#j-template-country').html());
                        $('#countryList').html(t({
                            items: data.data.item_list
                        }));

                    } else {
                        toastr.error(data.msg, '提示');
                    }
                },
                complete: function () {
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 品牌列表
         */
        queryBrand: function () {
            var that = this;
            $.ajax({
                url: that.api + '/brand/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {},
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.code == 10000) {
                        var t = _.template($('#j-template-brand').html());
                        $('#brandList').html(t({
                            items: data.data.data
                        }));

                    } else {
                        toastr.error(data.msg, '提示');
                    }
                },
                complete: function () {
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 添加商品
         */
        addGoods: function () {
            var that = this;
            $.ajax({
                url: that.api + '/item/add.do',
                type: 'get',
                dataType: 'jsonp',
                data: that.postData,
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    if (data.code === 10000) {

                    } else {
                        toastr.error(data.msg, '错误提示')
                    }
                },
                complete: function () {
                },
                error: function (data) {
                }
            })
        },
        /**
         * 获取商品
         */
        getGoods: function () {
            var that = this;
            $.ajax({
                url: that.api + '/item/get.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    item_id: that.goodsId
                },
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    if (data.code === 10000) {
                        that.renderGoods(data.data)
                    } else {
                        toastr.error(data.msg, '错误提示')
                    }
                },
                complete: function () {
                },
                error: function (data) {
                }
            })
        },
        /**
         * 渲染商品详情
         * @param data
         */
        renderGoods: function (data) {
            var that = this;
            $.each(data, function (key, value) {
                switch (key) {
                    case "cate_id":
                        that.cateId = value;
                        break;
                    case "cate_name":
                        $('.currentCategory').html(value);
                        break;
                    case "name":
                        $('#name').val(value);
                        break;
                    case "brand_id":
                        if (value != 'null') {
                            $('#brandList').val(value);
                        }
                        break;
                    case "higo_extra_info":
                        $('#countryList').val(value.supply_base);
                        break;
                    case "description":
                        var d = new $.Deferred();
                        that.editor.ready(function (editor) {
                            d.resolve(editor);
                        });
                        $.when(d).done(function () {
                            that.editor.setContent(value)
                        });
                        break;
                    case "sku_props":
                        // 通用主图
                        that.commonGallery = $.grep(data.gallery, function (d) {
                                return d.id == 0;
                            }) || [];
                        that.renderCommonGallery(that.commonGallery);

                        // sku 图
                        that.skuGallery = $.grep(data.gallery, function (d) {
                                return d.id != 0 && d.id != 666;
                            }) || [];

                        $.when(that.queryHistorySkuProperty()).done(function () {
                            that.selectizeNumber = data.sku_props.length;
                            if (value[0].id == 0) {
                                data.sku_props = [];
                            }
                            if (data.sku_props.length > 2) {
                                $('.j-add-sku-specifications').parents('.sku-group').hide();
                            }
                            $.each(data.sku_props, function (index, obj) {
                                that.index++;
                                that.addSku(function (selectize) {
                                    selectize.setValue(obj.id);
                                    that.skuTableData = data.skus;
                                    that.render(obj.id);
                                }, function () {
                                    for (var i = 0; i < obj.value.length; i++) {
                                        var props = {};
                                        props.prop_name = obj.name;
                                        props.prop_id = obj.id;
                                        props.value_name = obj.value[i];
                                        props.value_id = obj.vid[i];
                                        (that.skuArr[props.prop_id].value).push(props);
                                        that.renderSkuGroupCont($('.j-add-prop[data-sku_id=' + obj.id + ']'), props);
                                    }
                                    for (var n = 0; n < that.skuGallery.length; n++) {
                                        for (var m = 0; m < that.skuArr[obj.id].value.length; m++) {
                                            if (that.skuGallery[n].id == that.skuArr[obj.id].value[m].value_id) {
                                                that.skuArr[obj.id].value[m].thumb = that.skuGallery[n].img;
                                            }
                                        }
                                    }
                                });
                            });
                        });
                        break;
                    case "skus":
                        that.skuTableData = value;
                        var lowestPrice = [], suggestionsPrice = [], ean = [];
                        $.each(that.skuTableData, function (i, obj) {
                            lowestPrice.push(Number(obj.origin_price));
                            suggestionsPrice.push(Number(obj.price));
                        });
                        $('#lowestPrice').val((lowestPrice.sort(that.sortNumber).shift() / 100).toFixed(2));
                        $('#suggestionsPrice').val((suggestionsPrice.sort(that.sortNumber).shift() / 100).toFixed(2));
                        break;
                }
            })
        }
    };
    // run
    $(function () {
        main.init();
    })
})();