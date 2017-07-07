/**
 * Created by lijiahao on 17/3/1.
 * ajax Api
 */
;var Api = (function () {
    var api = {
        init: function () {
            this.domain();
            return this;
        },
        domain: function () {
            var host = location.host;
            if (!host || host.indexOf('localhost') != -1 || host.indexOf('file') != -1) {
                // 测试环境 or 本地环境
                this.ajaxDomain = 'http://boss.mockuai.net:8080/bossmanager';
                //this.ajaxDomain = 'http://test.seller.mockuai.com/bossmanager';
            } else {
                this.ajaxDomain = 'http://' + host + '/bossmanager';
            }
            return this.ajaxDomain;
        },
        post: function (opts) {
            this.ajax(opts, 'post')
        },
        get: function (opts) {
            this.ajax(opts, 'get')
        },
        ajax: function (opts, type) {
            var that = this;
            var height = (window.innerHeight - 40) / 2;
            var dataType;

            $('.mask-img').css({
                'margin-top': height
            });

            if (opts.dataType) {
                dataType = opts.dataType
            } else {
                if (type == 'post') {
                    dataType = 'json'
                } else {
                    dataType = 'jsonp'
                }
            }
            $.ajax({
                url: opts.absoluteUrl ? opts.absoluteUrl : (that.ajaxDomain + opts.url),
                dataType: dataType,
                type: type,
                data: opts.data || '',
                beforeSend: function () {
                    // 遮罩层改为配置项
                    if (opts.mask && opts.mask === true) {
                        $('.mask').fadeIn();
                    }
                },
                success: function (data) {
                    if (data.code == 40000) {
                        console.log('登录已过期');
                        location.href = 'login.html'
                    } else if (data.code == 10000) {
                        opts.success && opts.success(data);
                    } else {
                        opts.error && opts.error(data);
                    }
                },
                complete: function (data) {
                    setTimeout(function () {
                        $('.mask').fadeOut();
                    }, 500);
                    opts.complete && opts.complete(data);
                },
                error: function (xhr, status, error) {
                    console.log(xhr, status, error);
                    opts.error && opts.error(xhr, status, error);
                }
            })
        }
    };
    return api.init();
})();