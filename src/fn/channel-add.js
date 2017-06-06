/**
 * Created by kyn on 17/3/3.
 */
;(function () {
    var main = {
        init: function () {
            var that = this;
            this.parent_name_map = {
                "country": "国家",
                "province": "省",
                "city": "市",
                "area": "区"
            };
            this.step();
            this.addEvent();
            this.Verification();
            if (this.id) {
                this.getArea($('#areaList-province'), function () {
                    that.getData();
                })
            } else {
                this.getArea($('#areaList-province'));
            }
        },
        Verification: function () {
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('.btn-save').click(function () {
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    validator.checkField.call(validator, required.eq(i))
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
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
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
        addEvent: function () {
            var that = this;

            // 取消
            $('#j-cancel').click(function () {
                that.tip({
                    target: $(this),
                    position: 'right',
                    content: '未保存的数据将会丢失，确定要离开吗?',
                    closeOnBodyClick: true
                }, function (btn, dialog) {
                    dialog.close();
                    location.href = 'goods-brand.html';
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            //
            $(document).on('change', 'select', function () {
                var name = $(this).attr('data-nextName');
                var code = $(this).find('option:selected').attr('data-code');
                that.parent_name = name;
                that.parent_code = code;
                switch (name) {
                    // 国家
                    case 'country':
                        break;
                    // 省
                    case 'province':
                        break;
                    // 市
                    case 'city':
                        that.getArea($('#areaList-' + name), function () {
                            that.areaInit(['#areaList-area']);
                        });
                        break;
                    // 区
                    case 'area':
                        that.getArea($('#areaList-' + name), function () {

                        });
                        break;
                }
            })
        },
        /**
         * 步骤
         */
        step: function () {
            var that = this;

            // next & back
            $('#j-next,#j-back').click(function () {
                var type = $(this).attr('data-type');
                $('.add-channel-step span').removeClass('add-channel-active');
                $('.add-channel-step span[data-step_value=' + type + ']').addClass('add-channel-active');
                $('.step').hide();
                $('.step[data-now_step=' + type + ']').show();
            })
        },
        /**
         * 获取地区信息
         */
        getArea: function (area, cb) {
            var that = this;
            Api.get({
                url: "/store/region/list.do",
                data: {
                    parent_code: that.parent_code || 'CN'
                },
                success: function (data) {
                    var template = _.template($('#j-template').html());
                    $(area).html(template({
                        items: data.data.region_list,
                        parent_name: that.parent_name_map[that.parent_name] || '省'
                    }));

                    cb && cb(data);
                },
                error: function () {

                }
            })
        },
        areaInit: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var type = arr[i].split('-')[1];
                $(arr[i]).html('<option value="null">' + this.parent_name_map[type] + '</option>')
            }
        }
    };
    $(function () {
        main.init()
    })
}());
