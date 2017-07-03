;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            var that = this;
            this.parent_name_map = {
                "country": "国家",
                "province": "省",
                "city": "市",
                "area": "区"
            };
            this.isAjax = false;
            this.step();
            if (this.id) {
                that.getData();
            }
            this.imgModal();
            this.addEvent();
        },
        /**
         * 调用图片选择插件
         * 选择完成后执行imgSelected()进行渲染.
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
            if (this.$currentImgUploadBtn.find('.image').length > 0) {
                this.$currentImgUploadBtn.find('.image').attr('src', url);
            } else {
                this.$currentImgUploadBtn.prepend('<img id="unionpayCertificate" class="image" src="' + url + '">')
            }

            // hover
            $('.image,.img-close').hover(function () {
                $(this).parent().find('.img-close').show();
            }, function () {
                $(this).parent().find('.img-close').hide();
            });
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
            $('[name=radio]').on('ifChecked', function () {
                var payType = $(this).val();
                $('.pay-type-wrapper[data-type=' + payType + ']').show();
            });

            $('[name=radio]').on('ifUnchecked', function () {
                var payType = $(this).val();
                $('.pay-type-wrapper[data-type=' + payType + ']').hide();
            });
        },
        /**
         * 步骤
         */
        step: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // iCheck
            $(document).on('ready', function () {
                that.iCheck();
            });

            // next & back
            $('#j-next,#j-back,#j-submit').click(function () {
                var type = $(this).attr('data-type');
                var isValid = true;
                var required, result;
                var payType = $('input[name=radio]:checked').attr('value');

                if (type == 1) {
                    that.stepJump(type);
                } else if (type == 2) {
                    required = $('.step[data-now_step=1]').find('[required]');
                    for (var i = 0; i < required.length; i++) {
                        result = validator.checkField.call(validator, required.eq(i));
                        if (result.valid === false) {
                            isValid = false;
                            toastr.error(result.error, '提示');
                            return;
                        }
                    }
                    if (isValid == true) {
                        that.stepJump(type);
                    }
                } else if (type == 3) {
                    required = $('.step[data-now_step=2] .pay-type-wrapper[data-type=' + payType + '],.step[data-now_step=2] .other-info').find('[required]');
                    for (var n = 0; n < required.length; n++) {
                        result = validator.checkField.call(validator, required.eq(n));
                        if (result.valid === false) {
                            isValid = false;
                            toastr.error(result.error, '提示');
                            return;
                        }
                    }
                    if (isValid == true) {
                        that.setPostData();
                        if (that.id) {
                            that.addAccount();
                        } else {
                            that.changeAccount();
                        }
                    }
                }
            })
        },
        stepJump: function (type) {
            $('.add-channel-step span').removeClass('add-channel-active');
            $('.add-channel-step span[data-step_value=' + type + ']').addClass('add-channel-active');
            $('.step').hide();
            $('.step[data-now_step=' + type + ']').show();
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

            // 省 市 区 选择
            $(document).on('change', 'select', function () {
                var name = $(this).attr('data-nextName');
                var code = $(this).find('option:selected').attr('data-code');
                var parent_cfg = {};
                parent_cfg.parent_name = name;
                parent_cfg.parent_code = code;
                switch (name) {
                    // 国家
                    case 'country':
                        break;
                    // 省
                    case 'province':
                        if (code == 'cn') {
                            that.getArea($('#areaList-province'), parent_cfg, function () {
                            });
                            $('#areaList-province,#areaList-city,#areaList-area').attr('required', 'required');
                        } else {
                            $('#areaList-province,#areaList-city,#areaList-area').removeAttr('required');
                            that.areaInit(['#areaList-province', '#areaList-city', '#areaList-area']);
                        }
                        break;
                    // 市
                    case 'city':
                        that.getArea($('#areaList-' + name), parent_cfg, function () {
                            that.areaInit(['#areaList-area']);
                        });
                        break;
                    // 区
                    case 'area':
                        that.getArea($('#areaList-' + name), parent_cfg, function () {

                        });
                        break;
                }
            });

            $('.j-img-close.img-close').click(function (e) {
                e.stopPropagation();
                $(this).parent().find('.image').remove();
                $(this).hide();
            })
        },
        /**
         * 获取地区信息
         */
        getArea: function (area, parent_cfg, cb) {
            var that = this;
            Api.get({
                url: "/store/region/list.do",
                data: {
                    parent_code: parent_cfg.parent_code || 'CN'
                },
                success: function (data) {
                    var template = _.template($('#j-template').html());
                    $(area).html(template({
                        items: data.data.region_list,
                        parent_name: that.parent_name_map[parent_cfg.parent_name] || '省'
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
        },
        //获取数据
        getData: function () {
            var that = this;
            Api.get({
                url: "/storage/get.do",
                data: {
                    id: that.id
                },
                success: function (data) {
                    // todo 先渲染省市区
                    if (data) {
                        that.getArea($('#areaList-province'), {
                            parent_name: 'province',
                            parent_code: data.data.address_country.split('|')[1]
                        }, function () {
                            that.getArea($('#areaList-city'), {
                                parent_name: 'city',
                                parent_code: data.data.address_province.split('|')[1]
                            }, function () {
                                that.getArea($('#areaList-area'), {
                                    parent_name: 'area',
                                    parent_code: data.data.address_city.split('|')[1]
                                }, function () {
                                    that.renderDataFunc(data.data)
                                });
                            });
                        });
                    }
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        renderDataFunc: function (data) {
            var that = this;
            $.each(data, function (key, value) {
                switch (key) {
                    case 'name':
                        $('#name').val(value);
                        break;
                    case 'company':
                        $('#company').val(value);
                        break;
                    case 'linkman':
                        $('#linkman').val(value);
                        break;
                    case 'linkphone':
                        $('#supplierName').val(value);
                        break;
                    case 'country':
                        $('#areaList-country option[data-code=' + value + ']').prop('selected', true);
                        break;
                    case 'province':
                        $('#areaList-province option[data-code=' + value + ']').prop('selected', true);
                        break;
                    case 'city':
                        $('#areaList-city option[data-code=' + value + ']').prop('selected', true);
                        break;
                    case 'area':
                        $('#areaList-area option[data-code=' + value + ']').prop('selected', true);
                        break;
                    case 'comment':
                        $('#comment').val(value);
                        break;
                    case 'store_ch_name':
                        $('#storeChName').val(value);
                        break;
                    case 'store_en_name':
                        $('#storeEnName').val(value);
                        break;
                    case 'store_account':
                        $('#storeAccount').val(value);
                        break;
                    case 'origin_pwd':
                        $('#originPwd').val(value);
                        break;
                    case 'pay_type':
                        var arr = (value).split(',');
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i] == 1) {
                                // 支付宝
                                $('#alipayPartner').val(data.config_info.alipay_partner);
                                $('#alipayAccount').val(data.config_info.alipay_account);
                                $('#alipayMchPrivateKey').val(data.config_info.alipay_mch_private_key);
                                $('#alipayPublicKey').val(data.config_info.alipay_public_key);
                            } else if (arr[i] == 2) {
                                // 微信
                                $('#wechatH5AppId').val(data.config_info.wechat_h5_app_id);
                                $('#wechatH5AppSecret').val(data.config_info.wechat_h5_app_secret);
                                $('#wechatH5PartnerId').val(data.config_info.wechat_h5_partner_id);
                                $('#wechatH5PartnerKey').val(data.config_info.wechat_h5_partner_key);
                                $('#wechatAppAppId').val(data.config_info.wechat_app_app_id);
                                $('#wechatAppAppSecret').val(data.config_info.wechat_app_app_secret);
                                $('#wechatAppPartnerId').val(data.config_info.wechat_app_partner_id);
                                $('#wechatAppPartnerKey').val(data.config_info.wechat_app_partner_key);
                            } else if (arr[i] == 3) {
                                // 银联
                                $('#unionpayMchId').val(data.config_info.unionpay_mch_id);
                                $('.imgUploadBtn').prepend('<img id="unionpayCertificate" class="image" src="' + data.config_info.unionpay_certificate + '">')
                            }
                        }
                        $('#wechatLoginH5AppId').val(data.config_info.wechat_login_h5_app_id);
                        $('#wechatLoginH5AppSecret').val(data.config_info.wechat_login_h5_app_secret);
                        $('#wechatLoginAppAppId').val(data.config_info.wechat_login_app_app_id);
                        $('#wechatLoginAppAppSectet').val(data.config_info.wechat_login_app_app_sectet);
                        $('#csTel').val(data.config_info.cs_tel);
                        $('#csOnlineUrl').val(data.config_info.cs_online_url);
                        $('#aboutUs').val(data.config_info.about_us);
                        break;

                }
            });
        },
        /**
         * 设置要提交的数据
         * this.postData
         */
        setPostData: function () {
            this.postData = {};
            this.postData.name = $.trim($('#name').val());                                                              // 各渠道间名称不可重复
            this.postData.company = $.trim($('#company').val());                                                        // 公司名称
            this.postData.linkman = $.trim($('#linkman').val());                                                        // 联系人
            this.postData.linphone = $.trim($('#linkphone').val());                                                     // 联系电话
            this.postData.address = $.trim($('#address').val());                                                        // 渠道详细地址
            this.postData.country = $('#areaList-country option:selected').attr('data-code');                           // 国家
            this.postData.province = $('#areaList-province option:selected').attr('data-code');                         // 省
            this.postData.city = $('#areaList-city option:selected').attr('data-code');                                 // 市
            this.postData.area = $('#areaList-area option:selected').attr('data-code');                                 // 区
            this.postData.comment = $.trim($('#comment').val());                                                        // 	备注信息
            this.postData.store_ch_name = $.trim($('#storeChName').val());                                              // 商城中文名不可重复
            this.postData.store_en_name = $.trim($('#storeEnName').val());                                              // 商城英文名不可重复
            this.postData.store_account = $.trim($('#storeAccount').val());                                             // 商城账号不可重复
            this.postData.origin_pwd = $.trim($('#originPwd').val());                                                   // 初始密码
            this.postData.parent_biz_code = $.cookie('biz_code');                                                       // 管控的biz_code
            var checked = [];
            for (var i = 0; i < $('[name=radio]:checked').length; i++) {
                var value = $('[name=radio]:checked').eq(i).val();
                if (value == 'alipay') {
                    checked.push(1);
                } else if (value == 'wxpay') {
                    checked.push(2);
                } else if (value == 'unionpay') {
                    checked.push(3);
                }

                this.postData.pay_type = checked.toString();                                                            // 账户的开通信息表示,1表示支付宝,2表示微信,3表示银联,多个采用字符串拼接,英文逗号隔开,例如1,2,3
            }
            this.postData.config_info = {};
            for (var n = 0; n < checked.length; n++) {
                if (checked[n] == 1) {
                    // 支付宝
                    this.postData.config_info.alipay_partner = $.trim($('#alipayPartner').val());                       // 支付宝商户号
                    this.postData.config_info.alipay_account = $.trim($('#alipayAccount').val());                       // 支付宝账号
                    this.postData.config_info.alipay_mch_private_key = $.trim($('#alipayMchPrivateKey').val());         // 支付宝商户私钥
                    this.postData.config_info.alipay_public_key = $.trim($('#alipayPublicKey').val());                  // 支付宝公钥

                } else if (checked[n] == 2) {
                    // 微信
                    this.postData.config_info.wechat_h5_app_id = $.trim($('#wechatH5AppId').val());                     // 微信支付H5端APPID
                    this.postData.config_info.wechat_h5_app_secret = $.trim($('#wechatH5AppSecret').val());             // 微信支付H5端密钥
                    this.postData.config_info.wechat_h5_partner_id = $.trim($('#wechatH5PartnerId').val());             // 微信支付H5端商户号
                    this.postData.config_info.wechat_h5_partner_key = $.trim($('#wechatH5PartnerKey').val());           // 微信支付H5端商户Key
                    this.postData.config_info.wechat_app_app_id = $.trim($('#wechatAppAppId').val());                   // 微信支付app端APPID
                    this.postData.config_info.wechat_app_app_secret = $.trim($('#wechatAppAppSecret').val());           // 微信支付app端密钥
                    this.postData.config_info.wechat_app_partner_id = $.trim($('#wechatAppPartnerId').val());           // 微信支付app商户号
                    this.postData.config_info.wechat_app_partner_key = $.trim($('#wechatAppPartnerKey').val());         // 微信支付app商户Key

                } else if (checked[n] == 3) {
                    // 银联
                    this.postData.config_info.unionpay_mch_id = $.trim($('#unionpayMchId').val());                      // 银联商户号
                    this.postData.config_info.unionpay_certificate = $.trim($('#unionpayCertificate').attr('src'));     // 银联证书地址

                }
            }

            this.postData.config_info.wechat_login_h5_app_id = $.trim($('#wechatLoginH5AppId').val());                  // 微信登录H5端APPID
            this.postData.config_info.wechat_login_h5_app_secret = $.trim($('#wechatLoginH5AppSecret').val());          // 微信登录H5端密钥
            this.postData.config_info.wechat_login_app_app_id = $.trim($('#wechatLoginAppAppId').val());                // 微信登录APP端APPID
            this.postData.config_info.wechat_login_app_app_sectet = $.trim($('#wechatLoginAppAppSectet').val());        // 微信登录APP端密钥
            this.postData.config_info.cs_tel = $.trim($('#csTel').val());                                               // 客服电话
            this.postData.config_info.cs_online_url = $.trim($('#csOnlineUrl').val());                                  // 在线客服链接
            this.postData.config_info.about_us = $.trim($('#aboutUs').val());                                           // 关于我们链接

        },
        //增加账号
        addAccount: function () {
            var that = this;
            if (this.isAjax == true) {
                return;
            }
            this.isAjax = true;
            Api.get({
                url: "/storage/add.do",
                data: {
                    storage_dto: JSON.stringify(that.postData)
                },
                success: function () {
                    toastr.success('添加成功!', '提示');
                    setTimeout(function () {
                        location.href = 'warehouse.html';
                    }, 1000)
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        //修改账号
        changeAccount: function () {
            var that = this;
            if (this.isAjax == true) {
                return;
            }
            this.isAjax = true;
            Api.get({
                url: '/storage/update.do',
                data: {
                    storage_dto: JSON.stringify(that.postData)
                },
                success: function () {
                    toastr.success('修改成功!', '提示');
                    setTimeout(function () {
                        location.href = 'warehouse.html';
                    }, 1000)
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        }
    };
    $(function () {
        main.init();
    })
}());
