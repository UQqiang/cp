/**
 * Created by lijiahao on 17/3/1.
 */
;var Api = (function () {
    var api = {
        init: function () {
            this.domain();
            return this;
        },
        domain: function () {
            //this.ajaxDomain = 'http://boss.mockuai.net:8080/bossmanager';
            this.ajaxDomain = 'http://test.seller.mockuai.com/bossmanager';
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
            console.log(that.ajaxDomain);
            var height = (window.innerHeight - 40)/2;
            $('.mask-img').css({
                'margin-top': height
            });
            $.ajax({
                url: that.ajaxDomain + opts.url,
                dataType: type == 'post' ? 'json' : 'jsonp',
                type: type,
                data: opts.data || '',
                beforeSend: function () {
                    // 遮罩层改为配置项
                    if( opts.mask && opts.mask === true ){
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
                    }, 1000);
                    opts.complete && opts.complete(data);
                },
                error: function (data) {
                    opts.error && opts.error(data);
                }
            })
        }
    };
    return api.init();
})();