/**
 * Created by lijiahao on 17/3/14.
 */
var HDL = (function () {
    var handle = {
        init: function () {
            return this;
        },
        countChecked: function () {

            var checkCount = $(".checkbox:checked").length;

            if (checkCount) {
                $('.column-title').hide();
                $('.bulk-actions').show();
                $('.action-cnt').html(checkCount + '条');
            } else {
                $('.column-title').show();
                $('.bulk-actions').hide();
            }
        },
        getQuery:function(key){
            var t = {};
            location.search.replace("?","").replace(/&?([^=&]+)=([^=&]*)/g, function($0, $1,$2){ t[$1] = $2; });
            return typeof t[key] === "undefined" ? "" : t[key];
        }
    };
    return handle.init();
})();