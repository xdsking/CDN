/**
 * Created by xuds on 2015/4/9.
 */
(function ($) {
    $.fn.dndSource = function (params) {
        /*if (this.length == 0) {
         var dndSource = $("<div></div>");
         dndSource.attr({id: params.id});
         dndSource.appendTo("body");
         this.push(dndSource[0]);
         }*/
        var self = this;
        if (this.children().length > 0) {
            return this.children();
        }
        var getDndPanelId=function(self){
            var dndPanelId;
            if(self.length==1){
                dndPanelId= self[0].id;
            }else{
                console.log("非法操作,弹出框绑定多个对象.");
            }
            if(dndPanelId==""){
                console.log("错误!未设定弹出框容器的ID属性.");
            }
            return dndPanelId;
        };
        var options = $.fn.dndSource.options = {
            theme: "info",
            maxable:true,
            closable: true,
            content: null,
            title: "　",
            speed: 500,
            style:"margin-bottom:0;position: absolute;display: none;z-index:30;",
            dockable: true,
            dndBodyMinHeight: "300px",
            containerNode: document.body,
            dockTo: $("#dockBar"),
            dndPanelNode: null,
            containment: "body"//parent
        };
        var styleStr=options.style+params.style;
        $.extend(options, params);
        $.extend(options, {id:getDndPanelId(self)});
        options.style=styleStr;
        var dndSource = $("<div></div>");
        dndSource.addClass("panel panel-" + options.theme);
        dndSource.attr({
            id: options.id,
            style: options.style,
            role: "alert"
        });
        this.append(dndSource);
        //title
        var dndTitleNode = $('<div></div>');
        dndTitleNode.addClass("panel-heading cstm-drag-panel-heading");
        dndTitleNode.text(options.title);
        dndTitleNode.appendTo(dndSource);
        var dndToolPanel=$('<div></div>');
        dndToolPanel.addClass("cstm-titleOptionPanel");
        dndToolPanel.appendTo(dndTitleNode);
        dndToolPanel.on("mousedown",function(evt){
            evt.stopPropagation();
        });
        //关闭
        if (options.closable) {
            var dndCloseNode = $('<span></span>');
            dndCloseNode.addClass("glyphicon glyphicon-remove cstm-titleOption");
            dndCloseNode.attr({
                "operate-destroy": options.id,
                "aria-hidden": "true",
                title: "关闭"
            });
            /**
             * 关闭按钮点击事件
             */
            dndCloseNode.click(function () {
                $(self).dndSource.destroy(dndSource);
            });
            dndCloseNode.appendTo(dndToolPanel);
        }
        //最大化
        if (options.maxable) {
            var dndMaxNode = $('<span></span>');
            //还原按钮
            var dndRestoreNode = $('<span></span>');
            dndMaxNode.addClass("glyphicon glyphicon-fullscreen cstm-titleOption");
            dndMaxNode.attr({
                "operate-max": options.id,
                "aria-hidden": "true",
                title: "最大化"
            });
            /**
             * 最大化按钮点击事件
             */
            dndMaxNode.click(function () {
                $(self).dndSource.maximize(dndSource,dndMaxNode,dndRestoreNode);
            });
            dndMaxNode.appendTo(dndToolPanel);

            dndRestoreNode.addClass("glyphicon glyphicon-triangle-bottom cstm-titleOption");
            dndRestoreNode.css("display","none");
            dndRestoreNode.attr({
                "operate-max": options.id,
                "aria-hidden": "true",
                title: "还原"
            });
            /**
             * 还原按钮点击事件
             */
            dndRestoreNode.click(function () {
                $(self).dndSource.restore(dndSource,dndMaxNode,dndRestoreNode);
            });
            dndRestoreNode.appendTo(dndToolPanel);
        }
        //最小化
        if (options.dockable) {
            var dndMinNode = $('<span></span>');
            dndMinNode.addClass("glyphicon glyphicon-minus cstm-titleOption");
            dndMinNode.attr({
                "operate-minimize": options.id,
                "aria-hidden": "true",
                title: "最小化"
            });
            /**
             * 最小化点击事件
             */
            dndMinNode.click(function () {
                $(self).dndSource.hide({domNode: dndSource, options: options});
            });
            dndMinNode.appendTo(dndToolPanel);
        }

        //dndBody
        var dndBodyNode = $('<div></div>');
        //阻止拖动的事件冒泡
        dndBodyNode.on("mousedown", function(evt){
            evt.stopPropagation();
        });
        dndBodyNode.addClass("panel-body");
        dndBodyNode.css("min-height", options.dndBodyMinHeight);
        dndBodyNode.appendTo(dndSource);

        if (options.content) {
            dndBodyNode.append(options.content);
        }
        /*if (typeof options.containerNode === "string") {
         this.appendTo(options.containerNode);
         } else {
         this.appendTo("body");
         }*/
        if(options.resizable){
            dndSource.resizable();
        }
        dndSource.draggable({
            cursor: "move",
            containment: options.containment//$("#alterPanel")
        });
        return dndSource;
    };
    $.fn.dndSource.show = function (domNode) {
        var speed = this.options.speed;
        $.each(domNode, function (index, item) {
            var dockBarItem = $("[dock-handle=" + item.id + "]");
            if (dockBarItem.length > 0) {
                dockBarItem.fadeOut(speed, function () {
                    dockBarItem.remove();
                });
            }
        });
        domNode.fadeIn(speed);
    };
    $.fn.dndSource.hide = function (params) {
        var speed = this.options.speed;
        params.domNode.fadeOut(speed);
        var options = params.options, dockTo = this.options.dockTo, theme = options.theme, title = options.title;
        //避免重复点击dock多个
        if ($("[dock-handle=" + options.id + "]").length > 0) {
            return;
        }
        var dockItem = $("<div></div>");
        dockItem.addClass("panel panel-" + theme + " cstm-dock-item");
        dockItem.attr({
            "dock-handle": options.id
        });
        //双击显示
        dockItem.dblclick(function () {
            $(params.domNode).dndSource.show(params.domNode);
            dockItem.remove();
        });
        var dockPanelHeading = $("<div></div>");
        dockPanelHeading.addClass("panel-heading cstm-dock-item-heading");
        dockPanelHeading.text(title);
        dockPanelHeading.appendTo(dockItem);

        var dockToolPanel=$('<div></div>');
        dockToolPanel.addClass("cstm-titleOptionPanel");
        dockToolPanel.appendTo(dockPanelHeading);
        //关闭
        var dockPanelDestroy = $("<span></span>");
        dockPanelDestroy.addClass("glyphicon glyphicon-remove cstm-titleOption");
        dockPanelDestroy.attr({
            title: "关闭",
            "aria-hidden": "true"
        });
        dockPanelDestroy.click(function () {
            var flag=$(params.domNode).dndSource.destroy(params.domNode);
            if(flag){
                dockItem.remove();
            }
        });
        dockPanelDestroy.appendTo(dockToolPanel);
        //显示
        var dockPanelShow = $("<span></span>");
        dockPanelShow.addClass("glyphicon glyphicon-triangle-top cstm-titleOption");
        dockPanelShow.attr({
            title: "还原",
            "aria-hidden": "true"
        });
        dockPanelShow.click(function () {
            $(params.domNode).dndSource.show(params.domNode);
            dockItem.remove();
        });
        dockPanelShow.appendTo(dockToolPanel);
        if ($.type(dockTo) == "object" && dockTo.length == 0) {
            var dockBar = $("<div id='dockBar'></div>").appendTo("body");
            dockBar.append(dockItem);
            this.options.dockTo = dockBar;
        } else {
            dockTo.append(dockItem);
        }
    };
    $.fn.dndSource.destroy = function (domNode) {
        var speed = this.options.speed;
        var flag = confirm("关闭后将终止未完成的操作，确认关闭?");
        if(flag){
            domNode.fadeOut(speed,function () {
                domNode.remove();
            });
        }
        return flag;
    };
    //最大化浮动窗口
    $.fn.dndSource.maximize=function(domNode,dndMaxNode,dndRestoreNode){
        domNode.addClass("dndSource-maximize");
        dndMaxNode.css("display","none");
        dndRestoreNode.css("display","block");
    };
    //还原浮动窗口
    $.fn.dndSource.restore=function(domNode,dndMaxNode,dndRestoreNode){
        domNode.removeClass("dndSource-maximize");
        dndMaxNode.css("display","block");
        dndRestoreNode.css("display","none");
    };
})(jQuery);