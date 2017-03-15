/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.currentCateObj = {};                   // 当前选择的一二级类目对象
            this.categoryId = '';
            this.imageUrl = '';
            this.isAjax = false;
            this.api = Api.domain();                    // 接口请求的api
            // 初始化提示框
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
            });
            this.brand_id = HDL.getQuery('id');
            var height = window.innerHeight - 200;
            var contentHeight = $('.x_panel').height();
            $('.x_panel').css({
                'min-height': (height > contentHeight ? height : contentHeight) + 'px'
            });
            if (this.brand_id) {
                var that = this;
                this.getBrand(this.brand_id, function (data) {
                    $('#brandName').val(data.data.brand_name);
                    $('#brandDesc').val(data.data.brand_desc);
                    that.$currentImgUploadBtn = $('.imgUploadBtn');
                    that.imgSelected(data.data.logo);
                }, function (data) {

                })
            }
            this.addEvent();
            this.imgModal();
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
        imgSelected: function (url) {
            console.log(url);
            this.imageUrl = url;
            if (this.$currentImgUploadBtn.find('.logo-image').length > 0) {
                this.$currentImgUploadBtn.find('.logo-image').attr('src', url);
            } else {
                this.$currentImgUploadBtn.append('<img class="logo-image" src="' + url + '">')
            }
        },
        addEvent: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 取消
            $('.j-cancel').click(function () {
                var data = {};
                data.target = $(this);
                data.position = 'right';
                data.content = '确定要取消?';
                data.closeOnBodyClick = true;
                that.tip(data, function (btn, dialog) {
                    dialog.close();
                    location.href = 'goods-brand.html';
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // 保存
            $('.j-submit').click(function () {
                var isValid = true;
                if (!$('.logo-image').length) {
                    toastr.error('没有选择品牌logo', '提示');
                    isValid = false;
                    return;
                }
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                        return;
                    }
                }
                if (isValid == true) {
                    if (that.isAjax == true) {
                        return;
                    }
                    that.isAjax = true;
                    that.setPostData();
                    if (that.brand_id) {
                        that.updateBrand(function (data) {
                            toastr.success(data.msg, '提示');
                            that.isAjax = false;
                            location.href = 'goods-brand.html';
                        }, function (data) {
                            toastr.error(data.msg, '提示');
                            that.isAjax = false;
                        });
                    } else {
                        that.addBrand(function (data) {
                            toastr.success(data.msg, '提示');
                            that.isAjax = false;
                            location.href = 'goods-brand.html';
                        }, function (data) {
                            toastr.error(data.msg, '提示');
                            that.isAjax = false;
                        });
                    }
                }
            });
        },
        setPostData: function () {
            this.postData = {};
            this.postData.logo = $('.logo-image').attr('src');
            this.postData.brand_name = $.trim($('#brandName').val());
            this.postData.brand_desc = $.trim($('#brandDesc').val());
            this.postData.brand_id = this.brand_id;
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
                closeOnBodyClick: data.closeOnBodyClick,
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
        /**
         * 获取
         */
        getBrand: function (data, success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/brand/get.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    brand_id: data
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    error && error(data);
                }
            });
        },
        /**
         * 添加
         */
        addBrand: function (success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/brand/add.do',
                type: 'get',
                dataType: 'jsonp',
                data: that.postData,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    error && error(data);
                }
            });
        },
        /**
         * 编辑
         */
        updateBrand: function (success, error) {
            var that = this;
            $.ajax({
                url: that.api + '/brand/update.do',
                type: 'get',
                dataType: 'jsonp',
                data: that.postData,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        success && success(data);
                    } else {
                        error && error(data);
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    error && error(data);
                }
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();