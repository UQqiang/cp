/**
 * Created by lijiahao on 17/3/1.
 */
;var Api = (function () {
    var api = {
        init: function () {
            return this;
        },
        domain: function () {
            return 'http://boss.mockuai.net:8080/bossmanager';
        }
    };
    return api.init();
})();