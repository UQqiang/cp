/**
 * Created by kyn on 17/3/21.
 */
;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            if( this.id ){
                this.getData();
            }
            this.verification();
            this.addEvent();
        },
        verification: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('#j-submit').click(function () {
                var isValid = true;
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                        return;
                    }
                }
                if (isValid == true) {
                    that.submit();
                }
            });
        },
        addEvent: function () {
            var that = this;

            // 取消
            $('#j-cancel').click(function () {
                var config = {};
                config.content = '未保存的数据将会丢失，确定要离开吗?';
                config.target = $(this);
                config.position = 'right';
                that.tip(config, function (btn, dialog) {
                    location.href = 'goods-tax-template.html';
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });
        },
        /**
         * postData
         */
        setPostData: function () {
            this.postData = {};
            this.postData.name = $("#name").val();
            this.postData.taxRate = $("#taxRate").val();
            this.postData.post = $("#post").val();
            this.postData.tax = $("#tax").val();

            return this.postData
        },
        submit: function () {
            var that = this;
            $.ajax({
                url: "",
                type: "",
                dataType: "",
                data: that.postData,
                success: function (data) {
                    toastr.success('成功', '提示');
                },
                error: function (data) {
                    toastr.error('失败', '提示');
                }
            })
        }
    }
    $(function () {
        main.init();
    })
})()