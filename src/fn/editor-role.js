/**
 * Created by kyn on 17/3/15.
 */
;(function(){
    var main={
        init:function(){
            this.api = Api.domain();
            this.Verification();
            this.render();
        },
        //判断是否是修改
        isGetData: function() {
            var that = this;
            var id = window.location.search.split('=')[1];
            if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
            } else {
                that.getData(id);
            }
        },
        //获取数据
        getData:function(id){
            var that=this;
            $.ajax({
                url:that.api+"/userRole/get.do",
                dataType:"jsonp",
                type:"get",
                data:{
                    id:parseInt(id)
                },
                success:function(data){
                    $(".name").val(data.data.role_name);
                    $(".explain").val(data.data.role_desc);
                    var arr=eval(data.data.role);
                    console.log(arr[1])
                    for (var i = 0; i<arr.length ; i++){
                        $("input[data-id="+arr[i]+"]").prop("checked",true)
                    }
                    if($("input[type='checkbox']").length == $("input:checked").length+1 ){
                        $("#check-all").prop("checked",true)
                    }
                    that.iCheck()

                },
                error:function(){
                    toastr.error('失败啦!');
                }
            })
        },
        render:function(){
            var that = this;
            var arr=["461",
                "462",
                "464",
                "493",
                "487",
                "488",
                "489",
                "490",
                "491",
                "307",
                "392",
                "368",
                "387",
                "386",
                "384",
                "383",
                "382",
                "380",
                "379",
                "378",
                "363",
                "377",
                "365",
                "374",
                "366",
                "371",
                "369",
                "372",
                "393",
                "395",
                "467",
                "421",
                "453",
                "451",
                "440",
                "439",
                "438",
                "436",
                "434",
                "432",
                "430",
                "429",
                "435",
                "417",
                "397",
                "396",
                "469",
                "285",
                "300",
                "302",
                "303",
                "308",
                "313",
                "315",
                "317",
                "319",
                "320",
                "299",
                "298",
                "297",
                "286",
                "287",
                "288",
                "289",
                "290",
                "293",
                "294",
                "295",
                "296",
                "321",
                "323",
                "345",
                "346",
                "347",
                "352",
                "354",
                "355",
                "357",
                "359",
                "360",
                "344",
                "343",
                "342",
                "324",
                "326",
                "327",
                "328",
                "330",
                "333",
                "335",
                "337",
                "339",
                "362",
                "463",
                "281",
                "282",
                "283",
                "284",
                "291",
                "301",
                "304",
                "305",
                "306",
                "309",
                "310",
                "311",
                "312",
                "314",
                "316",
                "318",
                "322",
                "325",
                "331",
                "351",
                "353",
                "356",
                "358",
                "361",
                "364",
                "367",
                "370",
                "373",
                "375",
                "376",
                "381",
                "433",
                "460",
                "385",
                "388",
                "468",
                "486",
                "492",
                "350",
                "332",
                "334",
                "336",
                "338",
                "340",
                "341",
                "348",
                "389",
                "391",
                "394",
                "398",
                "408",
                "409",
                "410",
                "411",
                "407",
                "415",
                "416",
                "418",
                "329",
                "427",
                "428",
                "431",
                "349",
                "420",
                "422",
                "423",
                "424",
                "437",
                "441",
                "452"
            ]
            $.ajax({
                url:that.api+"/baseMenu/permission/query.do",
                dataType:"jsonp",
                type:"get",
                data:{
                    version:1,
                    id_list:JSON.stringify(arr)
                },
                success:function(data){
                    that.mainShow(data)
                },
                error:function(){

                }
            })
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
            // checked
            $('#check-all').on('ifClicked', function () {
                if (this.checked) {
                    $('.checkbox').iCheck('uncheck');
                } else {
                    $('.checkbox').iCheck('check');
                }
            });
            $('.checkbox').on('ifChecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');
                var id = $(this).parents("tr").attr("data-parent_id");
                var sid = $(this).attr("data-id");
                //判断是否一级点击
                if ($(this).parents("tr").hasClass("j-parent")){
                    if($("[data-parent_id="+sid+"]").find("input:checked").length==0){
                        $("[data-parent_id="+sid+"]").eq(0).find("input").iCheck("check")
                    }
                }else if($(this).parents("tr").hasClass("j-children")) {          //判断是否是二级点击
                    $("input[data-id="+id+"]").iCheck("check");
                    if($("[data-parent_id="+sid+"]").find("input:checked").length==0) {
                        $("[data-parent_id="+sid+"]").eq(0).find("input").iCheck("check")
                    }
                }else if ($(this).parents("tr").hasClass("j-children-son")){           //判断是否三级点击
                    var gsid = $(this).parents("tr").attr("data-grandpa_id");
                    $("input[data-id="+id+"]").iCheck("check");
                    $("input[data-id="+gsid+"]").iCheck("check");
                }

                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').addClass('selected');
            });

            $('.checkbox').on('ifUnchecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');

                var id = $(this).parents("tr").attr("data-parent_id");
                var sid = $(this).attr("data-id");
                //判断一级是否点击
                if ($(this).parents("tr").hasClass("j-parent")) {
                    $("[data-parent_id="+sid+"]").find("input").iCheck("uncheck")
                    $("[data-grandpa_id="+sid+"]").find("input").iCheck("uncheck")
                }else if ($(this).parents("tr").hasClass("j-children")) {               //判断是否是二级点击
                    $("[data-parent_id="+sid+"]").eq(0).find("input").iCheck("uncheck");
                    if ($(".j-children[data-parent_id="+id+"]").find("input:checked").length==0) {
                        $("input[data-id="+id+"]").iCheck("uncheck");
                    }
                }else if ($(this).parents("tr").hasClass("j-children-son")){          //判断是否是三级点击
                    var gsid = $(this).parents("tr").attr("data-parent_id");
                    if ($(".j-children-son[data-parent_id="+gsid+"]").find("input:checked").length == 0){
                        $("input[data-id="+gsid+"]").iCheck("uncheck")
                    }
                }
                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').removeClass('selected');
            })
        },
        //验证
        Verification:function(){
            var that=this;
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('.btn-save').click(function () {
                var isValid = true;
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                    }
                }
                if( isValid == true ){
                    for (var i = 0; i<$(".checked").is("checked").length; i++){
                        $("input:checked").eq(i)
                    }
                    var checkboxed = $('.checkbox:checked');
                    var idsArr = [];
                    for( var i = 0; i < checkboxed.length ; i ++ ){
                        idsArr.push(checkboxed.eq(i).attr('data-id'))
                    }
                    var data={
                        role:JSON.stringify(idsArr),
                        role_desc:$(".explain").val(),
                        role_name:$(".name").val()
                    };
                    var id = window.location.search.split('=')[1];
                    if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
                        that.submitData(data)

                    } else {
                        data.id = id;
                        that.changeData(data);
                    }
                }
            });
        },
        addEvent:function(){
            // 子菜单折叠和展现
            var that=this;

            $(document).on('click','.j-parent',function(e){
                e.stopPropagation();
                var $this = $(this);
                var id = $(this).attr('data-id');
                if( $this.hasClass('j-show') == false ){
                    $this.parent().find('.j-children[data-parent_id='+id+']').show();
                    $this.toggleClass('j-show',true);
                    $this.find('.j-caret').removeClass('caret-right');
                    $this.find('.j-caret').addClass('caret-bottom')
                }else{
                    // 联动 ——————--------
                    $this.parent().find('.j-children[data-parent_id='+id+']').hide();
                    $this.parent().find('.j-children[data-parent_id='+id+']').removeClass('j-children-active');
                    $this.parent().find('.j-children[data-parent_id='+id+']').find('.j-caret').addClass('caret-right');
                    $this.parent().find('.j-children[data-parent_id='+id+']').find('.j-caret').removeClass('caret-bottom');
                    $this.parent().find('.j-children-son[data-grandpa_id='+id+']').hide();
                    // ------------------
                    $this.toggleClass('j-show',false);
                    $this.find('.j-caret').addClass('caret-right');
                    $this.find('.j-caret').removeClass('caret-bottom')
                }
            });
            // 二级导航点击请求对应的子页面
            $(document).on('click','.j-children',function(e){
                e.stopPropagation();
                var parent_id = $(this).attr('data-parent_id');
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var $this = $(this);
                if( $(this).hasClass('j-children-active') ){
                    //已经展开了则隐藏
                    $('.j-children-son[data-parent_id='+id+']').hide();
                    $this.find('.j-caret').addClass('caret-right');
                    $this.find('.j-caret').removeClass('caret-bottom')
                }else{
                    //未展开则展开
                    //that.getSonPage(id, parent_id, $this, name);
                    that.targetElement = $this;
                    $('.j-children-son[data-parent_id='+id+']').show();
                    $this.find('.j-caret').removeClass('caret-right');
                    $this.find('.j-caret').addClass('caret-bottom')
                }
                $(this).toggleClass('j-children-active');
            });
        },
        mainShow:function(data){
            var that=this;
            var tpl=$("#tpl").html();
            $("#tpl-main").html(_.template(tpl)({
                data:data.data
            }));
            that.isGetData();
            that.addEvent();
            that.iCheck();
        },
        //提交增加
        submitData:function(data){
            var that = this;
            $.ajax({
                url:that.api+"/userRole/add.do",
                dataType:"jsonp",
                type:"get",
                data:data,
                success:function(){
                    toastr.success('添加成功');
                    setTimeout(function(){
                        location.href = './role-management.html'
                    },5200)
                },
                error:function(){
                    toastr.error('失败啦!');
                }
            })
        },
        //提交修改
        changeData:function(data){
            var that = this;
            $.ajax({
                url: that.api+"/userRole/update.do",
                dataType:"jsonp",
                type:"get",
                data:data,
                success:function(){
                    toastr.success('编辑成功');
                    setTimeout(function(){
                        location.href = './role-management.html'
                    },5200)
                },
                error:function(){
                    toastr.error('失败啦!');
                }

            })
        }
    };
    $(function(){
        main.init()
    })
})();
