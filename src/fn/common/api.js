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
            this.ajaxDomain = 'http://boss.mockuai.net:8080/bossmanager';
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
            $.ajax({
                url: that.ajaxDomain + opts.url,
                dataType: type == 'post' ? 'json' : 'jsonp',
                type: type,
                data: opts.data || '',
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