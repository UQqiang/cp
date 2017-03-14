/**
 * Created by kyn on 17/3/8.
 */
;(function(){
    var main={
        init:function(){
            this.api = Api.domain();
            this.toastrInit();
            this.render();
            this.addEvent();
            this.verification();
            this.isGetData();
        },
        //是否是修改模板
        isGetData: function() {
            var that = this;
            var id = window.location.search.split('=')[1];
            if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
                // todo 新建运费模板
                $('.title').html('新建运费模板');
            } else {
                // todo 修改运费模板
                $('.title').html('修改运费模板');
                that.getData(id);
            }
        },
        //读取模板数据
        getData:function(id){
            var that=this;
            $.ajax({
                url:that.api+"/bossmanager/freight/get.do",
                dataType:"jsonp",
                type:"get",
                data:{
                    id:id
                },
                success:function(data){
                    var $pricing_method = data.data.freight_template_dto.pricing_method;
                    var $tpl = data.data.freight_template_dto;
                    console.log($tpl.freight_area_template_list)
                    $('.name').val( $tpl.name ) ;
                    $('.default-shipping .basic_charge').val(($tpl.basic_charge)/100);
                    $('.default-shipping .extra_charge').val(($tpl.extra_charge)/100);
                    if( $pricing_method == 0 ){
                        $('.default-shipping .basic_count').val($tpl.basic_count);
                        $('.default-shipping .extra_count').val($tpl.extra_count)
                    }else{
                        $('.default-shipping .basic_count').val(($tpl.basic_count)/10);
                        $('.default-shipping .extra_count').val(($tpl.extra_count)/10)
                    }
                    if ( $pricing_method == 0 ) {
                        $( '.pricing_method input[value=0] ').attr('checked','checked');
                        $('.unit').text('件');
                        $('.unit-che').text('件')
                    } else if ( $pricing_method == 1) {
                        $( '.pricing_method input[value=1] ').attr('checked','checked');
                        $('.unit').text('kg');
                        $('.unit-che').text('重')
                    } else {
                        $( '.pricing_method input[value=2] ').attr('checked','checked');
                        $('.unit').text('m³');
                        $('.unit-che').text('体积')
                    }
                    var template = _.template($('#tpl').html());
                    $('.J_tpl_list').html(template({
                        items:$tpl.freight_area_template_list,
                        status:$pricing_method
                    }));
                },
                error:function(){
                    alert(2)
                }
            })
        },
        //验证表格是否输入
        verification:function(){
            var that=this;
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('.J_submit').click(function () {
                var isValid = true;
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                    }
                }
                if( isValid == true ){
                    alert(1)
                }
            });
        },
        render:function(){
            var that = this;
            $.ajax({
                url:that.api + "/bossmanager/freight/queryAreas.do",
                dataType:"jsonp",
                type:"get",
                success:function(data){
                    console.log(data);
                    that.cityRender(data)
                },
                error:function(){
                    alert(2)
                }
            })
        },
        //popupUpload: function () {
        //    this.popupImgUploadModuleDialog = jDialog.dialog({
        //        title: '请选择',
        //        content: $('#main-tpl').html(),
        //        width: 720,
        //        height: 400,
        //        draggable: false,
        //        closeable:true,
        //    });
        //
        //},
        addEvent:function(){
            var that = this;
            //添加地区渲染
            $('.J_addTpl').click(function(){
                var data= {
                        freight_template_dto: {
                            "freight_area_template_list": [
                                {
                                    "areas": [
                                        {
                                            "name": "未添加地区"
                                        }
                                    ]
                                }
                            ]
                        }
                    };
                that.renderBorder(data);
            });
            // 添加地区 表格删除
            $("body").on("click",".J_del",function(){
                $(this).parents(".odd").remove();
            });
            $("body").on("click",".city-choose",function(){
                $("#main-tpl").css({
                    display:"block"
                })
            });
            //计价方式
            $('.pricing_method input[name=radio]').click(function(){
                if( $(this).val() == 0 ) {
                    $('.unit').text('件');
                    $('.unit-che').text('件')
                } else if ( $(this).val() == 2 ) {
                    $('.unit').text('m³');
                    $('.unit-che').text('体积')
                } else {
                    $('.unit').text('kg');
                    $('.unit-che').text('重')
                }
            });

            $("body").on('click','.close',function(){
                $(".btn-default").click();
            });
            $(".btn-default").click(function(){
                $(".fade").hide();
                $('.modal-lg').fadeOut(500);

            });
            //全选
            $('body').on('click', ".checkAll", function() {
                if(this.checked){
                    $(".checkItem").each(function(){
                        this.checked=true;
                    });
                }else{
                    $(".checkItem").each(function(){
                        this.checked=false;
                    });
                }
            });
            $('body').on('click',".checkItem",function() {
                that.isCheckAll();
            });

            //批量操作
            $('.batch-ope').click(function(e){
                if ($(".gradeX").length == 0){
                    toastr.error('一条运费模板都没,无法批量');
                }else{
                    $checkbox =  $('.tpl-set .ui-table .checkItem');
                    e.preventDefault();
                    if($(this).html() == '取消批量'){
                        $('.the-batch').css({'display':'none'});
                        $(this).html('批量操作')
                    }else{
                        $('.the-batch').css({'display':'block'});
                        $(this).html('取消批量');
                    }
                    if( !$checkbox.hasClass('checkShow') ){
                        $checkbox.css({'display':'inline-block'});
                        $checkbox.addClass('checkShow');
                    }else{
                        $checkbox.css({'display':'none'});
                        $checkbox.removeClass('checkShow');
                        if( $checkbox.attr('checked','checked') ){
                            $checkbox.removeAttr('checked','checked')
                        }
                    }
                    that.isCheckAll();
                }
           });
            //批量设置
            $("body").on('click','.batch-setting',function(e){
                var $checked_length = $('.checkItem:checked').length;
                if( $checked_length < 1){
                    toastr.error('请至少选择一条信息');
                }else {
                    e.preventDefault();
                    that.popupUpload();
                }
            });
            //批量删除运费信息
            $('.batch-del').click(function(){
                $length = $('.tpl-set .ui-table tbody tr').length;
                var $checked_length = $('.checkItem:checked').length;
                if( $checked_length < 1){
                    toastr.error('请至少选择一条信息');
                }else{
                    if( $length >= 1 ){
                        if($length <= $checked_length){
                            $('.checkItem:checked').parents('tr').remove();
                        }else{
                            $('.checkItem:checked').parents('tr').remove()
                        }
                        $(".the-batch").hide();
                        if($('.batch-ope').html() == '取消批量'){
                            $('.batch-ope').html('批量操作')
                        }else{
                            $('.batch-ope').html('取消批量');
                        }
                    }else{
                        return;
                    }
                    that.isCheckAll();
                }
            });
            //点击关闭三级城市列表
            $('body').on('click','.J_close',function(e){
                e.stopPropagation();
                $(this).parents('.cities').css({'display':'none'})
            });
        },
        isCheckAll: function(){
            var the_num = $('.checkItem:checked').length;
            if (the_num == $('.checkItem').length) {
                $(".checkAll").prop('checked', true);
            } else {
                $(".checkAll").prop('checked', false);
            }
        },
        renderBorder:function(data){
            var template = _.template($('#tpl').html());
            $('.J_tpl_list').append(template({
                items:data.freight_template_dto.freight_area_template_list,
                status:-1
            }));
        },
        cityRender:function(data){
            var $tpl1=$("#tpl1").html();
            console.log(data.data.areas[0]);
            $(".modal-body").html(_.template($tpl1)({
                data:data.data.areas
            }));
            this.iCheck();
        },
        /**
         * 初始化提示框
         */
        toastrInit: function () {
            toastr.options = ({
                progressBar: true,
                positionClass: "toast-top-center"
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
            this.chooseCity();
        },
        /**
         *城市选择
         */
        chooseCity:function(){
            // 一级点击
            $(".check-areas-all").click(function(){
                var $right=$(this).parents(".choose-area").find(".right");
                if ($(this).is(":checked")==true) {
                    $(this).parents(".choose-area").find("input").prop("checked",true)
                }else{
                    $(this).parents(".choose-area").find("input").prop("checked",false)
                }
                for(var i = 0;i<$right.find(".area-item").length; i++){
                    $right.find(".area-item").children("span").html($right.find(".area-item").children("span").attr("data-name"))
                }
                $(".cities").hide();
            });
            //二级点击
            $(".check-city-all").click(function(){
                var $province=$(this).parents(".choose-area").children(".right");
                var $cities=$(this).parents(".area-item").find(".cities");
                if ($(this).is(":checked")==true) {
                    $(".cities").hide();
                    $cities.show();
                    $cities.find('input').prop("checked",true);
                    $(this).next("span").html($(this).next("span").attr("data-name"))
                    if ($province.find("input").length==$province.find("input:checked").length){
                        $(this).parents(".choose-area").find(".left").find("input").prop("checked",true)
                    }
                }else{
                    $cities.hide();
                    $cities.find('input').prop("checked",false);
                    $(this).siblings("span").html($(this).siblings("span").attr("data-name"))
                    if ($province.find("input").length!=$province.find("input:checked").length) {
                        $(this).parents(".choose-area").find(".left").find("input").prop("checked",false)
                    }
                }
            });
            //三级点击
            $(".check-city ").click(function(){
                var $cities=$(this).parents(".cities");
                var $place=$(this).parents(".choose-area");
                var $children=$(this).parents(".area-item").children("span");
                if($cities.find("input:checked").length ==0){
                    $children.html($children.attr("data-name"));
                    $(".cities").hide();
                }else if($cities.find("input:checked").length==$cities.find("input").length){
                    $children.html($children.attr("data-name"));
                }
                else{
                    $children.html($children.attr("data-name")+"("+$cities.find("input:checked").length+")");
                }
                if ($cities.find("input").length==$cities.find("input:checked").length){
                    $(this).parents(".area-item").find(".check-city-all").prop("checked",true);
                    if($place.find("input").length==$place.find("input:checked").length+1){
                        $place.find(".check-areas-all").prop("checked",true)
                    }
                }else{
                    $(this).parents(".area-item").find(".check-city-all").prop("checked",false);
                    if($place.find("input").length!=$place.find("input:checked").length+1){
                        $place.find(".check-areas-all").prop("checked",false)
                    }
                }
            })
        },

    };
    $(function(){
        main.init();
    })
}());