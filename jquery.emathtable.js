//{{{
/*********************************************************
 * jquery.emathtable.js
 * jQuery-plugin for creating a table with math
 * Created by: E-Math -project ( http://emath.eu )
 * Petri Salmela
 * Petri Sallasmaa
 * 18.09.2012
 * v.1.1
 * Copyright: Four Ferries oy
 *   http://fourferries.fi
 * License: GNU AGPL
 ********************************************************/

(function($){
    // jQuery plugin
    $.fn.emathtable = function(options){
        // Test for numberline commands and trigger command with options.
        if (typeof(options) === 'string'){
            var cmd = options;
            if (arguments[0] === 'createDefaultUserSettings') {
                return methods['createDefaultUserSettings'];
            }
            options = arguments[1] || {};
            if (typeof(options) === 'string'){
                options = {name: options};
            }
            // Placeholder variable for returning value.
            options.result = this;
            this.trigger(cmd, options);
            return options.result;
        } else if (typeof(options) === 'object' || !options) {
                // Passing this 'this' to methods.init (so this there is also 'this')
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  options + ' does not exist on jQuery.emathtable' );
            return this;
        }

    }
    
    /**** jQuery-plugin for TableElements. *****/
    var methods = {
        'init' : function(options) {

            var useLegacyDataType = (options['type'] == null);

            var settings;
            
            options = $.extend(true, {}, Emathtable.defaults, options);

            if (useLegacyDataType) {
                // Extend default settings with user given options.
                settings = $.extend({
                    tabletype : 'value_table', // Type of table (styled with
                                                // css)
                    theme : "default_theme", // html class for other styling
                    rows : 2,
                    cols : 2,
                    chartVisible : true,
                    values : [],
                    editable : false,
                    settings : options.settings,
                    metadata : options.metadata
                }, options);
            } else {

                settings = $.extend({
                    tabletype : 'value_table',
                    theme : "default_theme",
                    editable : (options.settings.mode == 'edit'),
                    rows : options.data.rows,
                    cols :  options.data.cols,
                    settings : options.settings,
                    metadata : options.metadata,
                    values : options.data.values,
                    chartVisible : options.data.chartVisible,
                    chartStyle : options.data.chartStyle,
                    //chartParams : options.data.chart
                }, options.data);
            }
            // Return this so that methods of jQuery element can be chained.
            return this.each(function() {
                // Create new Emathtable object.
                var emtable = new Emathtable(this, settings);
                // Init the emathtable
                emtable.init();
            });
        },
        'get': function(){
            var $place = $(this).eq(0);
            $place.trigger('getdata');
            return $place.data('[[elementdata]]');;
        },
        'set': function(params){
            var $place = $(this);
            $place.trigger('set', [params]);
        }
    }
    
    $.fn.tableelement = function(method){
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof(method) === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist in tableelement.');
            return false;
        }
    }

    
    var Emathtable = function(place, settings){
        // Constructor for Emathtable object.
        this.usersettings = settings.settings;
        this.metadata = settings.metadata;
        
        this.place = $(place);
        this.place.addClass('emathtable');
        this.theme = settings.theme;
        this.tabletype = settings.tabletype;
        this.rows = parseInt(settings.rows);
        this.cols = parseInt(settings.cols);
        this.values = settings.values;
        this.editable = settings.editable;
        this.chartVisible = settings.chartVisible;
        this.chartStyle = settings.chartStyle;
        //this.chartParams = settings.chart;
        //if (typeof(this.chartParams) === 'undefined') this.chartParams = new Object();
        
        // Make sure, the table is full rows x cols
        for (var i = 0; i < this.rows; i++){
            if (this.values.length <= i){
                this.values[i] = [];
            }
            for (var j = 0; j < this.cols; j++){
                if (this.values[i].length <= j){
                    this.values[i][j] = '';
                }
            }
        }
        
        if ($('head style#emathtablestyle').length === 0){
            $('head').append('<style id="emathtablestyle" type="text/css">'+Emathtable.strings['style']+'</style>');
        }
        
        // Add chart button if chart element has been loaded.
        if (typeof($.fn.chart) !== 'undefined') {
            if (typeof(this.chartStyle) === 'undefined') this.chartStyle = 'none';
            $('<div></div>').chart({showPlot: false});
        }
    }
    
    Emathtable.prototype.init = function(){
        // Init and draw the table
        var emathtable = this;
        if (this.place.hasClass('emathtable_rendered')){
//             return false;
        }
        this.place.addClass('emathtable_rendered').addClass(this.theme).attr('tabletype',this.tabletype);
        var toolbar = this.editable ? '<div class="emtabletoolbar"><a href="javascript:;" class="emtabletoolbutton emtabletypeselect"><span></span></a><a href="javascript:;" class="emtabletoolbutton emtableaddremove"><span></span></a></div>' : '';
        
        var $emtable = $('<div class="emtablewrapper"><table class="emtable"><tbody></tbody></table>'+toolbar+'</div>');
        // Add chart button if chart element has been loaded.
        if (typeof($.fn.chart) !== 'undefined') {
            if ( this.editable ) {
                $emtable.find('.emtabletoolbar').append('<a href="javascript:;" class="emtabletoolbutton emtabletogglechart emtablechartglyph pie"><span></span></a>');
            }
        }
        this.emtablenumber = -1;
        while ($('#emtable_'+(++this.emtablenumber)).length > 0){};
        $emtable.attr('id','#emtable_'+this.emtablenumber)
        this.place.empty().append($emtable);
        this.table = $emtable.find('table.emtable');
        this.tbody = this.table.find('tbody');
        this.draw();
        this.initEvents();
        return this;
    }
    
    Emathtable.prototype.draw = function(){
        if (this.editable){
            this.edit();
        } else {
            this.show();
        }
        
        if ( this.chartVisible ) this.showChart(this.chartStyle);
    }
    
    Emathtable.prototype.edit = function(){
        
        var emtable = this;
        this.place.addClass('emtable_editmode');
        var tablebody = '';
        for (var i = 0; i < this.rows; i++){
            tablebody += '<tr>';
            for (var j = 0; j < this.cols; j++){
                tablebody += '<td><span class="mathquill-editable">'+this.values[i][j]+'</span></td>';
            }
            tablebody += '</tr>';
        }
        
        this.tbody.html(tablebody);
        this.tbody.find('.mathquill-editable').mathquill('editable').focusout(function(e){
            var $elem = $(this);
            var $td = $elem.parents('td').eq(0);
            var $tr = $td.parents('tr').eq(0);
            var $tbody = $tr.parents('tbody').eq(0);
            var $alltr = $tbody.find('tr');
            var $alltd = $tr.find('td');
            var row = $alltr.index($tr);
            var col = $alltd.index($td);
            emtable.values[row][col] = $elem.mathquill('latex');
            emtable.changed();
        }).bind('keydown.emtable',function(e){
            var $mqelem = $(this);
            var instart = $mqelem.children('span').eq(1).hasClass('cursor');
            var inend = $mqelem.children('span').last().hasClass('cursor');
            var $cell = $(this).parents('td').eq(0);
            var $row = $cell.parents('tr').eq(0);
            var column = $cell.index();
            switch (e.which) {
                case 38:  // up
                    if (instart || e.ctrlKey || e.altKey) {
                        var newcell = $row.prev().find('td').eq(column).find('.mathquill-editable');
                        $mqelem.focusout();
                        newcell.focus();
                    }
                    break;
                case 40:  // down
                    if (inend || e.ctrlKey || e.altKey) {
                        var newcell = $row.next().find('td').eq(column).find('.mathquill-editable');
                        $mqelem.focusout();
                        newcell.focus();
                    }
                    break;
                case 37:  // left
                    if (e.ctrlKey || e.altKey) {
                        var newcell = $cell.prev().find('.mathquill-editable');
                        $mqelem.focusout();
                        newcell.focus();
                    }
                    break;
                case 39:  // right
                    if (e.ctrlKey || e.altKey) {
                        var newcell = $cell.next().find('.mathquill-editable');
                        $mqelem.focusout();
                        newcell.focus();
                    }
                    break;
                case 13:  // enter
                    var newcell = $row.next().find('td').eq(column).find('.mathquill-editable');
                    $mqelem.focusout();
                    newcell.focus();
                    break;
                case 27: // esc
                    $mqelem.focusout();
                    $mqelem.blur();
                    break;
                default:
                    break;
            }
        });
    }
    
    Emathtable.prototype.show = function(){
        var emtable = this;
        this.place.removeClass('emtable_editmode');
        var tablebody = '';
        for (var i = 0; i < this.rows; i++){
            tablebody += '<tr>';
            for (var j = 0; j < this.cols; j++){
                tablebody += '<td><span class="mathquill-embedded-latex">'+this.values[i][j]+'</span></td>';
            }
            tablebody += '</tr>';
        }
        this.tbody.html(tablebody);
        this.tbody.find('.mathquill-embedded-latex').mathquill();
    }
    
    Emathtable.prototype.allowedChartStyles = function(tabletype) {
        if (tabletype === 'none') return(['noborder', 'blank', 'grid_table', 'value_table', 'head_table', 'prop_table']);
        if ((tabletype === 'scatter') || (tabletype === 'line') || (tabletype === 'spline')) return(['noborder', 'blank', 'grid_table', 'value_table']);
        if ((tabletype === 'bar') || (tabletype === 'pie')) return(['noborder', 'blank', 'grid_table', 'head_table', 'prop_table']);
        return([/* Unkown table type has no chart affiliations. */])
    }
    
    Emathtable.prototype.initEvents = function(){
        var emtable = this;
        this.place.bind('getdata', function(e){
            emtable.place.data('[[elementdata]]', emtable.getData());
        });
        this.place.bind('tabletype', function(e, options){
            return emtable.setType(options);
        });
        
        this.place.find('a.emtabletypeselect').click(function(e){
            if ($(this).hasClass('isopen')){
                $(this).parent('.emtabletoolbar').find('.emtabletypelistwrapper ul')
                    .hide('slide', {direction: 'left'}, 300, function(e){
                        $(this).parents('.emtabletypelistwrapper').remove()
                    });
                $(this).removeClass('isopen');
            } else {
                // Close the other menus if open.
                var chartSelect = $(this).parents('.emathtable').find('a.emtabletogglechart');
                if ( chartSelect.hasClass('isopen') ) chartSelect.click();
                
                $(this).parent('.emtabletoolbar')
                    .append(
                        '<div class="emtabletypelistwrapper">\
                            <ul>\
                                <li><a href="javascript:;" ttype="noborder"><span></span></a> No border</li>\
                                <li><a href="javascript:;" ttype="blank"><span></span></a> Blank</li>\
                                <li><a href="javascript:;" ttype="grid_table"><span></span></a> Grid table</li>\
                                <li><a href="javascript:;" ttype="value_table"><span></span></a> Value table</li>\
                                <li><a href="javascript:;" ttype="head_table"><span></span></a> Categorized</li>\
                                <li><a href="javascript:;" ttype="prop_table"><span></span></a> Counts</li>\
                            </ul>\
                        </div>')
                    .find('.emtabletypelistwrapper ul')
                    .hide().show('slide',{direction: 'left'}, 300)
                    .find('a').click(function(e){
                        $(this).parents('.emathtable').emathtable('tabletype', $(this).attr('ttype'));
                        if (emtable.allowedChartStyles(emtable.chartStyle).indexOf(emtable.tabletype) < 0) emtable.hideChart();
                        emtable.changed();
                    });
                $(this).addClass('isopen');
            }
        });
        
        this.place.find('a.emtabletogglechart').click(function(e){
            if ($(this).hasClass('isopen')){
                $(this).parent('.emtabletoolbar').find('.emtablechartlistwrapper ul')
                    .hide('slide', {direction: 'left'}, 300, function(e){
                        $(this).parents('.emtablechartlistwrapper').remove()
                    });
                $(this).removeClass('isopen');
            } else {
                
                // Close the other menus if open.
                var typeSelect = $(this).parents('.emathtable').find('a.emtabletypeselect');
                if ( typeSelect.hasClass('isopen') ) typeSelect.click();
                
                var chartMenu = 
                    '<div class="emtablechartlistwrapper">\
                        <ul>'
                            if (emtable.allowedChartStyles('none').indexOf(emtable.tabletype) >= 0) chartMenu += '<li><a href="javascript:;" ctype="none" ' + (emtable.chartStyle == 'none' ? 'class="selected"': '') + '><span></span></a> None</li>';
                            if (emtable.allowedChartStyles('scatter').indexOf(emtable.tabletype) >= 0)  chartMenu +='<li><a href="javascript:;" ctype="scatter" ' + (emtable.chartStyle == 'scatter' ? 'class="selected"': '') + '><span></span></a> Scatter plot</li>'
                            if (emtable.allowedChartStyles('line').indexOf(emtable.tabletype) >= 0)  chartMenu +='<li><a href="javascript:;" ctype="line" ' + (emtable.chartStyle == 'line' ? 'class="selected"': '') + '><span></span></a> Line plot</li>'
                            if (emtable.allowedChartStyles('spline').indexOf(emtable.tabletype) >= 0)  chartMenu +='<li><a href="javascript:;" ctype="spline" ' + (emtable.chartStyle == 'spline' ? 'class="selected"': '') + '><span></span></a> Spline plot</li>'
                            if (emtable.allowedChartStyles('bar').indexOf(emtable.tabletype) >= 0)  chartMenu +='<li><a href="javascript:;" ctype="bar" ' + (emtable.chartStyle == 'bar' ? 'class="selected"': '') + '><span></span></a> Bar chart</li>'
                            if (emtable.allowedChartStyles('pie').indexOf(emtable.tabletype) >= 0)  chartMenu +='<li><a href="javascript:;" ctype="pie" ' + (emtable.chartStyle == 'pie' ? 'class="selected"': '') + '><span></span></a> Pie chart</li>'
                    chartMenu +=    '</ul>\
                    </div>'
                
                $(this).parent('.emtabletoolbar')
                    .append(chartMenu)
                    .find('.emtablechartlistwrapper ul')
                    .hide().show('slide',{direction: 'left'}, 300)
                    .find('a').click(function(e){
                        $(this).parents('.emtablechartlistwrapper ul').find('li a').removeClass('selected');
                        $(this).addClass('selected');
                        emtable.showChart($(this).attr('ctype'));
                        emtable.changed();
                    });
                $(this).addClass('isopen');
            }
        });
        
        this.place.find('a.emtableaddremove').click(function(e){
            if ($(this).hasClass('isopen')){
                emtable.hideAddremove();
                $(this).removeClass('isopen');
            } else {
                emtable.showAddremove();
                $(this).addClass('isopen');
            }
        });
        
        return this;
    }
    
    

    Emathtable.prototype.getData = function(options){
        var vals = $.extend(true, [], this.values);
        // TODO: the changed metadata!
        var result = {type: "emathtable", metadata: this.metadata, data: {rows: this.rows, cols: this.cols, values: vals, tabletype: this.tabletype}};
        
        if (typeof($.fn.chart) !== 'undefined') { 
                if (typeof this.chartVisible !== 'undefined') {
                    result.data.chartVisible = this.chartVisible;
                }
                result.data.chartStyle = this.chartStyle;
                //result.data.chartParams = $.extend(true, {}, this.chartParams);
        }
        
        if (options) {
            options.result = result;
        }
        
        return result;
    
    }
    
    Emathtable.prototype.setType = function(options){
        this.tabletype = options.name;
        this.place.attr('tabletype',this.tabletype);
    }
    
    Emathtable.prototype.showChart = function(chartStyle) {
        if ( typeof(chartStyle !== 'undefined') ) this.chartStyle = chartStyle;
        
        if (typeof($.fn.chart) !== 'undefined') {
            
            if ( this.chartStyle === 'none' ) this.hideChart();
            else {
                var chart = this.place.find('.chart').empty();
                if (chart.length == 0) this.place.append('<div class="chart"></div>');
                
                var opt = {}; this.getData(opt);
                
                opt.result.chartStyle = this.chartStyle;
                opt.result.showPlot = true;
                opt.result.dataMode = 'normal';
                opt.result.rowLabels = 'auto';
                opt.result.colLabels = 'auto';
                
                if (this.tabletype == 'prop_table') {
                    opt.result.dataMode = 'counts';
                    opt.result.rowLabels = true;
                    opt.result.colLabels = true;
                }
                else if ((this.tabletype == 'value_table') || (this.tabletype == 'head_table')) {
                    opt.result.colLabels = true;
                }
                
                //opt.result = $.extend(this.chartParams, opt.result);
                this.place.find('.chart').chart(opt.result);
                
            }
        }
    }
    
    Emathtable.prototype.hideChart = function() {
        if (typeof($.fn.chart) !== 'undefined') {
            this.chartStyle = 'none';
            this.place.find('.chart').remove();
        }
    }
    
    Emathtable.prototype.showAddremove = function(){
        var emtable = this;
        this.table.addClass('emtable_addremove');
        var removetr = '<thead class="emtableremovetr"><tr>';
        var addtr = '<thead class="emtableaddtr"><tr>';
        for (var i = 0; i < this.cols; i++){
            removetr += '<td><a href="javascript:;" class="emtableremovecol"><span></span></a></td>';
            addtr += '<td><a href="javascript:;" class="emtableaddcol"><span></span></a></td>';
        }
        removetr += '</tr></thead>';
        addtr += '<td><a href="javascript:;" class="emtableaddcol"><span></span></a></td></tr></thead>'
        this.tbody
            .before(removetr)
            .after(addtr);
        this.tbody.find('tr td:first-child').prepend('<a href="javascript:;" class="emtableremoverow"><span></span></a>');
        this.tbody.find('tr td:last-child').prepend('<a href="javascript:;" class="emtableaddrow"><span></span></a>');
        this.table.find('thead.emtableaddtr td:last-child').prev().prepend('<a href="javascript:;" class="emtableaddrow"><span></span></a>');
        // Add row
        this.table.find('a.emtableaddrow').click(function(e){
            var $alink = $(this);
            var $parent = $alink.parents('tbody, thead');
            var $tr = $alink.parents('tr').eq(0);
            var row;
            if ($parent[0].tagName === 'TBODY'){
                row = $parent.find('tr').index($tr);
            } else {
                row = emtable.rows;
            }
            var newrow = [];
            for (var i = 0; i < emtable.cols; i++){
                newrow.push('');
            }
            emtable.values.splice(row, 0, newrow);
            emtable.rows += 1;
            emtable.init();
            emtable.place.find('a.emtableaddremove').click();
            emtable.changed();
        });
        // Remove row
        this.table.find('a.emtableremoverow').click(function(e){
            var $alink = $(this);
            var $parent = $alink.parents('tbody');
            var $tr = $alink.parents('tr').eq(0);
            var row = $parent.find('tr').index($tr);
            emtable.values.splice(row, 1);
            emtable.rows -= 1;
            emtable.init();
            emtable.place.find('a.emtableaddremove').click();
            emtable.changed();
        });
        // Add column
        this.table.find('a.emtableaddcol').click(function(e){
            var $alink = $(this);
            var $parent = $alink.parents('thead');
            var $td = $alink.parents('td').eq(0);
            var $alltd = $alink.parents('tr').eq(0).find('td');
            var col = $alltd.index($td);
            for (var i = 0; i < emtable.rows; i++){
                emtable.values[i].splice(col, 0, '');
            }
            emtable.cols += 1;
            emtable.init();
            emtable.place.find('a.emtableaddremove').click();
            emtable.changed();
        });
        // Remove column
        this.table.find('a.emtableremovecol').click(function(e){
            var $alink = $(this);
            var $parent = $alink.parents('thead');
            var $td = $alink.parents('td').eq(0);
            var $alltd = $alink.parents('tr').eq(0).find('td');
            var col = $alltd.index($td);
            for (var i = 0; i < emtable.rows; i++){
                emtable.values[i].splice(col, 1);
            }
            emtable.cols -= 1;
            emtable.init();
            emtable.place.find('a.emtableaddremove').click();
            emtable.changed();
        });
    }
    
    Emathtable.prototype.hideAddremove = function(){
        this.table.removeClass('emtable_addremove');
        this.table.find('.emtableremovetr').remove();
        this.tbody.find('a.emtableremoverow').remove();
        this.table.find('.emtableaddtr').remove();
        this.tbody.find('a.emtableaddrow').remove();
    }
    
    Emathtable.prototype.changed = function(){
        if (typeof($.fn.chart) !== 'undefined') {
            var chart = this.place.find('.chart').empty();
            if (chart.length > 0) {
                var opt = {}; this.getData(opt);
                
                opt.result.chartStyle = this.chartStyle;
                opt.result.showPlot = true;
                opt.result.dataMode = 'normal';
                opt.result.rowLabels = 'auto';
                opt.result.colLabels = 'auto';
                
                if (this.tabletype == 'prop_table') {
                    opt.result.dataMode = 'counts';
                    opt.result.rowLabels = true;
                    opt.result.colLabels = true;
                }
                else if ((this.tabletype == 'value_table') || (this.tabletype == 'head_table')) {
                    opt.result.colLabels = true;
                }
                
                //opt.result = $.extend(this.chartParams, opt.result);
                chart.chart(opt.result);
            }
        }
        
        this.metadata.modifier = this.usersettings.username;
        this.metadata.modified = new Date();     
        
        // TODO: Remove this one when we do not support the old book anymore
        var e = jQuery.Event("emathtable_changed");
        this.place.trigger( e );
        // This is the one elementset is listening for
        this.place.trigger('element_changed', {type: 'emathtable'});
    }
    
    
    Emathtable.strings = {
        style: '.emtablewrapper, .emathtable a.emtabletoolbutton {display: inline-block; padding: 0.3em; border: 1px solid #777;'+
            'background: rgb(255,255,255); /* Old browsers */'+
            'background: -moz-linear-gradient(top,  rgba(255,255,255,1) 0%, rgba(229,229,229,1) 100%); /* FF3.6+ */'+
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255,255,255,1)), color-stop(100%,rgba(229,229,229,1))); /* Chrome,Safari4+ */'+
            'background: -webkit-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Chrome10+,Safari5.1+ */'+
            'background: -o-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Opera 11.10+ */'+
            'background: -ms-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* IE10+ */'+
            'background: linear-gradient(to bottom,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* W3C */'+
            'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#ffffff\', endColorstr=\'#e5e5e5\',GradientType=0 ); /* IE6-9 */}'+
            '.emtable_editmode .emtablewrapper {min-height: 150px;}'+
            '.emathtable a.emtabletoolbutton {padding: 2px; margin: 3px 0; border-radius: 3px; height: 20px; width: 20px; display: block;}'+
            '.emathtable a.emtabletoolbutton span { height: 20px; width: 20px; display: inline-block; margin: 0; padding: 0;}'+
            '.emathtable a.emtabletoolbutton.emtabletypeselect span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADaAAAA2gBkEje+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAQoSURBVDiNhVRdSFtnGH6+es5pmkwdDCEJawmrtHbpZMKkmVWzYVAbbxyGYSgUGatzEJi0K5SWliIRd9HrDYfbGOvNhnQMJk6oImQXk9LOn2lrdaVWG/+Sk+SYmZNzvnPe3XjE1K774L34eN/v4Xne93k/RkR42fF6vZ+HQqHPANDg4OBXs7OzfS+rF16KBuDo0aPV4XD49YMHD+L+/fvevTnGGKPnGB3Ye/H7/d80NDT8whgr3nlgc7vdHkmSIIoinE6nhzEmAYDL5fJ0dHT83tTUNFDAgIhARKipqekfHh7OT0xMUGdn59zp06d/uHLlysK9e/eMlZUV2tjYoAcPHvDe3t75YDD408DAwHImk6Gpqal8IBD42sLZlayq6hJjjImiiAsXLpwQRfGEIAgQRRGSJEGSJHg8nqLu7u5j3d3dx3RdB+cc2WyWJ5PJmX0MiQihUGj04cOHtLi4SE+fPqW1tTWSZZmy2SzlcjnKZrOkKAqlUilKJBK0vLxMZ86cGdyLUdDDzc3Nx4IgwGaz7YbdbkcymSRZlgEAnPOCSKVSmy+cMmPMdv369fccDseuzK2tLd7T0zMzNjb2vSAIr9TX13/Q1dX1dnFxcZFhGCgqKkJjY2MjY6yYiLYAgFVVVfVUVFS8WVZWdrirq+sdp9N5wJrqjRs3pvr6+qosazDG2KVLl6YvXrx4MpfLQdM0KIqCsbGx1Xg8vjk5OTkrtLe3d5w7d+6wKIq7zIgI2WwWo6Ojv+31GRGRz+f7tbOz86Su69A0zXKIi3PuOnToUIkgy7Jo9U0QBBiGAcMwwBiDKIqvPm90xliJaZpQVRX5fB6maYJzjmfPntH8/Lwg3Lp16+NYLPa+2+1+KxqNBlwu1wELsKWlJcAYcxDRPztgjmvXrjVpmgZL8vr6un758uXvFEX5WZblaWFlZWUIwBBjTKysrJyJRCLHOecwTRPhcPgNSZL+qq+vHzdNE9Fo1N/c3OxJp9PI5/MwDAOxWOzxkydPPiUis2DKRKQHAoHR8+fPHwdgyWZtbW2e1tbWDs45tre3oSgKNE2Dpmmw2WyYnp7+2wIr2GXGGHM4HF7DMMA5hyVLURSkUikkEgmk02moqopcLgfTNKHrOoLBYLXL5areB+jz+b64evVqjVWoquouaC6Xg6qqUFUVuq5DkiQYhmGKooja2tqyurq6fsaYUCDZbreXAUAikTBv3rz558LCwvSpU6febWhoKC8pKRF2WNHIyMhiLBYbMU1TPnv27CeVlZWvxePxGSLi+3bZ7/d/W1tb+yUAYcd+Qnl5+Y937tyhoaEhikQicwDsVr3T6az2er39ANi+3wYAxsfHP9p7JyLu8XhGMpnMh6WlpZBlOU5E21Z+dXX1LoC7L9zl/zpLS0t/3L59O37kyBHj0aNHc/9X/y9quGeGFrS2jQAAAABJRU5ErkJggg==") center center no-repeat;}'+
            '.emathtable a.emtabletoolbutton.emtableaddremove span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADHQAAAx0Bme/POQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFjSURBVDiNzZO/SwJhGMe/793pC915VGIFQdAUqOfUUmNgIP34F3Jta6yhWoS2psYGh/YQciqSwL8gCHRoEJq80tLzTe/X23QSqHSHFn2nh+cLH54vz/MQzjkmKWGiNADSQIcQcptOn0mh0HKHsdPtUqkyFjCfSMxr0egBpZSiXq8COAkCHBWZAAAnhASBAQDxlnKXyZxTSlfAuaCq6qYoikK73X60HefFdV3zo9E43C2Xqz8B+5EVWd5TFGX2uxmJRFIAUgBgmeYDAP9Ag7GCw3mcuy5RFWVVEEXBMIxnh/NX17Z7jLH7QJE95ZPJBU3TapTScF3XcxvF4rEfkKffv0M5HtffW61LSRSXuowVggIHIo+rP3i9IVrfv1mUlXBW4Bh66J1u77p8sfPkGzgzPZWLxeayo/xGs7EGYMs30LRd3bKskb5l2m9e7W/CWvOoUtevuCsMjdyUPvsf9P+3PHHgFyEbhXpQOuT5AAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable a.emtabletoolbutton.isopen {border-color: red; background: rgb(229,229,229); /* Old browsers */'+
            'background: -moz-linear-gradient(top,  rgba(229,229,229,1) 0%, rgba(255,255,255,1) 100%); /* FF3.6+ */'+
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(229,229,229,1)), color-stop(100%,rgba(255,255,255,1))); /* Chrome,Safari4+ */'+
            'background: -webkit-linear-gradient(top,  rgba(229,229,229,1) 0%,rgba(255,255,255,1) 100%); /* Chrome10+,Safari5.1+ */'+
            'background: -o-linear-gradient(top,  rgba(229,229,229,1) 0%,rgba(255,255,255,1) 100%); /* Opera 11.10+ */'+
            'background: -ms-linear-gradient(top,  rgba(229,229,229,1) 0%,rgba(255,255,255,1) 100%); /* IE10+ */'+
            'background: linear-gradient(to bottom,  rgba(229,229,229,1) 0%,rgba(255,255,255,1) 100%); /* W3C */'+
            'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="#e5e5e5", endColorstr="#ffffff",GradientType=0 ); /* IE6-9 */}'+
            '.emtabletoolbar {display: inline-block; margin-left: 0.5em; vertical-align: top; position: relative;}'+
            '.emtabletoolbar .emtabletypelistwrapper {position: absolute; right: -0.35em; top: -0.3em;}'+
            '.emtabletoolbar .emtabletypelistwrapper ul {position: absolute; left: 0; top: 0; padding: 0; margin: 0; list-style: none; border: 1px solid #777; border-left: none; border-radius: 0 0.3em 0.3em 0; overflow: hidden;}'+
            '.emtabletoolbar .emtabletypelistwrapper ul li {font-size: 80%; margin: 0; padding: 0; padding-right: 10px;'+
            'background: rgb(255,255,255); /* Old browsers */'+
            'background: -moz-linear-gradient(top,  rgba(255,255,255,1) 0%, rgba(229,229,229,1) 100%); /* FF3.6+ */'+
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255,255,255,1)), color-stop(100%,rgba(229,229,229,1))); /* Chrome,Safari4+ */'+
            'background: -webkit-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Chrome10+,Safari5.1+ */'+
            'background: -o-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Opera 11.10+ */'+
            'background: -ms-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* IE10+ */'+
            'background: linear-gradient(to bottom,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* W3C */'+
            'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#ffffff\', endColorstr=\'#e5e5e5\',GradientType=0 ); /* IE6-9 */}'+
            '.emtabletoolbar .emtabletypelistwrapper ul li a {vertical-align: middle; margin: 0; padding: 0.2em; display: inline-block; width: 20px; height: 20px; margin-right: 5px;}'+
            '.emathtable {text-align: center;}'+
            '.emathtable .emtablewrapper {text-align: left; white-space: nowrap;}'+
            '.emathtable a.emtabletoolbutton {color: black; text-shadow: 1px 1px 1px white;}'+
            '.emathtable a.emtabletoolbutton:hover {color: black; text-shadow: 2px 2px 1px white;}'+
            '.emathtable .emtablewrapper .mathquill-editable {display: block; background-color: white; border: 1px dotted #ccc;}'+
            '.emathtable table.emtable {display: inline-block; margin: 10px;}'+
            '.emathtable[tabletype="default"] table.emtable { border-collapse: collapse;}'+
            '.emathtable[tabletype="default"] table.emtable tbody tr:first-child td {border-bottom: 1px solid black;}'+
            '.emathtable[tabletype="default"] table.emtable tbody td {border-left: 1px solid black; padding: 0.2em;}'+
            '.emathtable[tabletype="default"] table.emtable tbody td:first-child {border-left: none;}'+
            '.emathtable[tabletype="value_table"] table.emtable {border-collapse: collapse; background-color: white;}'+
            '.emathtable[tabletype="value_table"] table.emtable tbody tr:first-child td {border-bottom: 2px solid black; text-align: center;}'+
            '.emathtable[tabletype="value_table"] table.emtable tbody td {border-left: 2px solid black; padding: 0.2em; min-width: 2em; text-align: right;}'+
            '.emathtable[tabletype="value_table"] table.emtable thead td {padding: 0 0.2em;}'+
            '.emathtable[tabletype="value_table"] table.emtable tbody td:first-child {border-left: none;}'+
            '.emathtable[tabletype="column_table"] table.emtable {border-collapse: collapse; background-color: white;}'+
            '.emathtable[tabletype="column_table"] table.emtable tbody tr:first-child td {border-bottom: 2px solid black; text-align: center;}'+
            '.emathtable[tabletype="column_table"] table.emtable tbody td {border-left: 2px solid black; padding: 0.4em 1em; min-width: 2em; text-align: center;}'+
            '.emathtable[tabletype="column_table"] table.emtable thead td {padding: 0 0.2em;}'+
            '.emathtable[tabletype="column_table"] table.emtable tbody td:first-child {border-left: none;}'+
            '.emathtable[tabletype="grid_table"] table.emtable {border-collapse: collapse;}'+
            '.emathtable[tabletype="grid_table"] table.emtable tbody td {border: 1px solid black; padding: 0.2em; background-color: white; min-width: 3em;}'+
            '.emathtable[tabletype="grid_table"] table.emtable thead td {padding: 0 0.2em;}'+
            '.emathtable[tabletype="theorytable"] table.emtable {border-collapse: collapse;}'+
            '.emathtable[tabletype="theorytable"] table.emtable tbody td {border: 1px solid black; padding: 0.5em 1em; background-color: white; min-width: 3em;}'+
            '.emathtable[tabletype="theorytable"] table.emtable thead td {padding: 0.5 1em;}'+
            '.emathtable[tabletype="noborder"] table.emtable {border-collapse: collapse;}'+
            '.emathtable[tabletype="noborder"] table.emtable tbody td {border: none; padding: 0.2em; min-width: 3em;}'+
            '.emathtable[tabletype="blank"] table.emtable {border-collapse: collapse; background-color: white;}'+
            '.emathtable[tabletype="blank"] table.emtable tbody td {border: none; padding: 0.2em; min-width: 3em;}'+
            '.emathtable[tabletype="blank"] table.emtable thead td {padding: 0 0.2em;}'+
            '.emathtable[tabletype="head_table"] table.emtable {border-collapse: collapse; background-color: white;}'+
            '.emathtable[tabletype="head_table"] table.emtable tbody {background-color: white;}'+
            '.emathtable[tabletype="head_table"] table.emtable tbody tr:first-child td {border-bottom: 2px solid black; text-shadow: 1px 0 0 black;}'+
            '.emathtable[tabletype="head_table"] table.emtable tbody td {border: none; padding: 0.2em 0.5em; min-width: 3em;}'+
            '.emathtable[tabletype="head_table"] table.emtable thead td {padding: 0 0.5em;}'+
            '.emathtable[tabletype="prop_table"] table.emtable {border-collapse: collapse;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody {background-color: white;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr:first-child td {border: 2px solid black; text-shadow: 1px 0 0 black; text-align: center;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr td:first-child {border: 2px solid black; text-shadow: 1px 0 0 black; min-width: 1.5em; text-align: center;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody td {border: 2px solid #aaa; padding: 0.2em 0.5em; min-width: 2em;}'+
            '.emathtable[tabletype="prop_table"] table.emtable thead td {padding: 0 0.5em;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr:last-child td {border-bottom: 2px solid black;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr td:last-child {border-right: 2px solid black;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr:first-child td:first-child {background-color: black;}'+
            '.emathtable[tabletype="prop_table"] table.emtable tbody tr:first-child td:first-child .mathquill-editable, .emathtable[tabletype="prop_table"] table.emtable tbody tr:first-child td:first-child .mathquill-embedded-latex {visibility: hidden;}'+
            '.emathtable .emtabletypelistwrapper a[ttype] span {display: inline-block; width: 20px; height: 20px; padding: 0; margin: 0;}'+
            
            '.emathtable a[ttype="noborder"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEvSURBVDiNzVUxjsIwEBwv4BR0pCQlokVKxYPyj5B/8KCrIqWhiK6E0hSEKPIG1tec0RUmAnFITGV5xuP1WF4r5xyKolhorbcislJKjfAEnHNXIqqYOcvz/FttNptFFEVfaZrO4jhWz5h5GGNcWZZHa+2atNbbV8wAII5jlabpTGu9JRFZvWL211REVmOfGREhiqKguO97AMBkMgny1lqICJRSo7GfnE6nWC6XwQX7/R4AkCRJkK/rGk3TAADoofM8gc83vGXIzDgcDkHR+XwGgLs8M9/G76tQa435fB4U+Vu+x7dtC2vteyr8fMNbhm3bYrfbBUX+6Z1OpyDv8wOAsXPuCgAigq7rBne/XC6D/G9vpMoY4waVD8AY44ioImbOyrI8vmLqGywzZ+q/v4AfEOqj8NZHkMAAAAAASUVORK5CYII=") center center no-repeat;}'+
            '.emathtable a[ttype="blank"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEZSURBVDiNzVUxisMwEJyVjZK4MnGXOr1B1T0o/4j9Dz/oKkH6g3TplCrEWMi7V8kcQYEYXyBTCa00u5qRViQiaNt2r7XumLkmogwzICKjUurkvT8cj8cfappmv1qtvo0x26qqaA5ZhHNOrLXXYRi+lNa6W0IGAFVVkTFmq7XuFDPXS8j+kjJznUfNdrsd1ut1crGIAACI0nmZGefzGUSU5XFys9mgLMvkhvv9DgAoiiIZv91uU1L10nlm4PMJJw3HcZy0ekQIAQCexpl5Gr+vwizLnrr4issRn2/K+zTs+3667Y+ILg7DkIyHEKZnmYvICACXy2VRZUQUe6M6OefSpc2Ac06UUiflvT9Ya69LSGOD9d4f6L+/gF+FRZwQUAoffgAAAABJRU5ErkJggg==") center center no-repeat;}'+
            '.emathtable a[ttype="value_table"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFDSURBVDiN7VWxbsIwED2fIyMxJsrAxsCOlCyd+jUM/EWShW9gYMh/sFSdEBIR3TuwZTLKFCVW7OvSuJhmIWLkSTe8d/bz6aQ7MyKCLMsWQoidMWbJGOPwAIhII+KXUmqVJMk3S9N0MZlMDlEU+UEQsEfMekgpqSiKa9u2byiE2PVmxhgYE0EQsCiKfCHEzjPGLPvKfN+H2WxmX95ut7Ber51q7rWyLKGqKvgtaOnd9oxzDtPp1B5GRIcPaZz/tZwxxr3bw1praJrG8q7rHD6kaa2dvGN4Pp9hv99bfjweIc9z58K9FoYhzOfzYcM4jp1k0zT/enivXS4XkFJajvBkvAxfhiPgEZGdHa011HVtk0ophw9pt6NHRJptNpuPOI7f+/U1BogIUko6nU6fqJRaFUVxlVISIsKY6BesUmrFnv0F/ACrpuO/ULqQBQAAAABJRU5ErkJggg==") center center no-repeat;}'+
            '.emathtable a[ttype="grid_table"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGsSURBVDiN7VW7igIxFL2ZHUZ8gThON83A9kK0sNrGxtKP8AP8A7XQ2g+w8EeEcatBzMB2AVd8IIxIxm4GDJhsZdgsLIu42+2FQM65Jye5l5AgKSUMBoNny7ImQogqQugJ7ggp5dUwjDfOeafX672jfr//nMlkAoxx2bZtdI/ZLeI4lmEYni+XS8O0LGtyMzscDpCm6V1muVwOXNdFGOMyIWRiCCGqt5P5vg+e56lBKQXHcTSOEKJh3/cBAMC2bSSEqJqfe1apVKDRaKjdKaVQr9ehVCopLggCTTObzdQcIfRk3NmuH8P8DDabDYzHY4UXiwVEUQTZbFZx8/kcvq751tDzPOh2uwpPp1Not9tayQCgaYbDoZb725KTJAFKqcJRFMFqtYJisai40+mkaZIk+d4wTVPYbrcKM8Zgv99DPp9X3Pl81jRf761m6DgOtFothY/HIzSbTa2HlFJNQwjRDP+vzeNhSimvN8AYgyAIVHK9XsNyuYRCoaC43W6naRhjai6lvKLRaOTXarWXB58viONYEkJeTc55JwzDAGNcdl33oQeWc95Bv/0FfACxFPVr51SxMAAAAABJRU5ErkJggg==") center center no-repeat;}'+
            '.emathtable a[ttype="head_table"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHASURBVDiNrZWxiupAGIXPTOIIlgkpIhEsFgUthIhwC7lP43uo7+GbaKfFBSFop7KFhWAhE2yUZHRmbnE3Gtmwmr17YJqTyZeT/zAJ0VpjOBy+McZGSqkWIcRADmmtJaV0KYTo9fv9dzIYDN6KxeIf3/ct27ZJHlgizrkOgiCM4/gXZYyNEphSCt9Ztm0T3/ctxtjIVEq1kmSWZcF13Vzp9vs9jscjPgK1zPTMDMNAqVRCp9PB4XAAAHieh9lsBgDodrvY7XYAAMdxMJ/PYRj3kRNCDDP9NCkloijCdDp9SBFFEQBgMpl88qWUD94DcLFYYDwe53plx3FQrVazge12++HiK9put+CcZwMTrddrXC4XAABjDLVaDQCw2WwghAAAFAoF1Ov1T/dmAiuVCpRSAABK6c33PC/Tfwo8nU63YSfNf+U/BabbM837ljiOcb1eb8CXE5bLZWitAQCE3E+j67qZ/lPgarV6KKXRaAD4V1a6lGaz+RowayOAG/grZVf1HzK11rezI6XE+XzOBUgfPa21NCmlS875b9u2SRiGCMMwdypKKTjnmlK6pEKIXhAE4YeB76zkAyuE6JGf/gX8BeftCu0bneKdAAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable a[ttype="prop_table"] span {background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHkSURBVDiNvZWxquJAFIb/GWMEsdGYLs3A7YUUYrWk9EF8AN9ALW6fB/BVhNjZJGiXYiEKNoLRgDExCWZucZnB7HpZZO/uX53JOfNx5sw5E8I5x2w2e1NVdV6WZY8QUsML4pzfKaWbPM9Hk8nkJ5lOp2+NRmNlmmZH0zTyCkwoDEPued4py7KBoqrqXMD2+z2SJHkJ1mw2YRgGMU2z47runJZl2ROZOY4DxhgYY3BdV9ppmiJN06c+x3EAAJqmkbIse8pjzbrdLgaDAQBgtVpJW+iZb7FYSD8hpEZfrdefpDwugiCAbdsAgOVyKb+fTieZGQC4rivjgiD4GsgYw3g8lmthn89nAEC73ZYQxhgA4P39vQL8t0e+Xq/wfR8AEEUR4jgGAKRpCgCo1+sAgCzLpE9RKogqMEkSbLdbAMDlcpGg2+1WARZFIX21WnWwKkBd1zEcDgEAvu9D1/VKFqKGcRxLX5ZlFeD/a5v1ei1bQoxjFEUAgDAM5Z5Wq/U18LFtbNuWrfFr24hYAPJyhL7/yJzzu1gcj0c5DbvdTtr3+2eIuNGiKHA4HOQeIc75XaGUbsIw/KFpGrEsS9at3+//NlbPZFkWgM83kVK6UfI8H3metzJNs2MYxl89sHmej8h3/wI+AMNJDG43soGGAAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable table.emtable_addremove {margin: 10px;}'+
            '.emathtable thead.emtableremovetr tr:first-child td {border: none; text-shadow: none; font-weight: bold; text-align: center;}'+
            '.emathtable tbody tr td:first-child a.emtableremoverow {display: block; font-weight: bold; text-align: center; position: relative;}'+
            '.emathtable tbody tr td:first-child a.emtableremoverow span {display: inline-block; position: absolute; width: 10px; left: -15px; top: 5px;}'+
            '.emathtable a.emtableremoverow, .emathtable a.emtableremovecol {'+
            '    display: block; position: relative; height: 0;}'+
            '.emathtable a.emtableremoverow:hover, .emathtable a.emtableremovecol:hover {'+
            '}'+
            '.emathtable a.emtableremoverow span, .emathtable a.emtableremovecol span {display: inline-block; width: 10px; height: 10px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAC+SURBVBiVfZBNCoJgFEWv8VIyokEEGUFIK2hU6wjciAtxC62kkdtwGAlFZH/W59P3GtTwyzs+3MO9Tpqmke/7seu6ASypqiovyzIhz/PiMAzXNuiXeZZlMRFRwMwtHEBEAakqLrc39qfSCs3GPlQVVNc1trsjDnfXCk4HD2yWgo6qQlT+akXl29g0DaLVEIezsTeO+uDXFSQi6HUVi4ldDSjMU0DMnDPzvG01M+dkjEmKoogdx7Eerqq5MSb5AHBcXly73qJbAAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable a.emtableremovecol span {position: absolute; top: -7px;}'+
            '.emathtable thead.emtableaddtr tr:first-child td {border: none; text-shadow: none; font-weight: bold; text-align: left;}'+
            '.emathtable thead.emtableaddtr tr:first-child td a.emtableaddcol {display: block; height: 0; position: relative;}'+
            '.emathtable thead.emtableaddtr tr:first-child td a.emtableaddcol span {position: absolute; left: -10px; top: -10px;}'+
            '.emathtable tr td a.emtableaddrow {display: block; font-weight: bold; height: 0; text-align: center; position: relative;}'+
            '.emathtable tr td a.emtableaddrow span {display: inline-block; position: absolute; width: 30px; right: -28px; top: -10px;}'+
            '.emathtable thead tr td a.emtableaddrow span {right: -28px;}'+
            '.emathtable a.emtableaddrow span, .emathtable a.emtableaddcol span {'+
            '    display: inline-block; width: 10px; height: 10px;}'+
            '.emathtable a.emtableaddcol span {height: 30px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAdCAYAAACT4f2eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHGSURBVDiNpZG/a1NRGIaf7+Sa5Fx7ETsFCk3o0KV31TX0T5AqQgvaf6Czzt0cXFw7mU2w4CKFbCFTx2JLbYaSDqKTNyX2QnLPD4dcS8hNNeC7nMNzXt7vO98n3num1YrjlwAvTk/fT3PFjJxSm06pzVkezALx/nqW5dzP4wUVSrfieL8Vx/v/LO2UWp2XOK/HLwsZR5XKu4WM5fH4IL/uTvPCZ+5SIRH4tKjx66LG1/m5Ow3/q8e384yFRPF+VbwvbKeQ6EWe5dfPf028S+K9l06n87RUKjUBXJoGACoMDYC1ttNsNj9Kt9ttNRqN51EUlQGuz84AeLCxAcBwOBz3+/0PQRiGj7TWZWMMN1dX/DzIV723x/16Ha11WWv9WImINsZgjGE0GKCsRVnLaDDgD1dKVQNrLcnJCaPLS8ZJQlUEgMHxMWmvR2VtDbu8TOCc49fREdUkQQPkRn1xMenx/By/s4NyzmGXlkhFSKfGkQKpCDaKcM5NEh9ub08eez3c4SEApa0twvV1AJIkmRiNMeQz416eaK295c45gizLvhlj6gClWo2blRUAyrXarTHLsu/SbrefiMirIAhq81ZnjPnhvX/zG0Gnw/phbkEiAAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable a.emtableaddrow span {width: 30px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAKCAYAAABIQFUsAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAC+wAAAvsB9mMCTwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGQSURBVDiNrZS9ThtBFIW/mf0Z2ZLXsuSClQBLFK6gTpNIpEnpR0iPeAK/AJUL0lCblipNJMuSq8RFekCCrVD4CShWZAsGe3d2boqgVCjV3vKe4tO59+goEaGqmU6nR41GY1drXX9Nz/P8xlo7UFVBR6PR2263+6XVaiUAj5eX/Do5gWaTzv4+SmsAsiz7HlZCBIwx72q1WlIUBQCPWUY0m7Gczcifn9FxDEAURWuVQQGcc9jra4rFAnt/j3nZ/z47Q4Uh9U4HEUENt7f3RKk32vu7j6en/eOdnU+iVFN7/y0qis8rYwYA2vtjJWLLINgDCJ3ruzB8D3xQInb98PDHWhwf5MMhQVGglEIpBYD3HoDV5ibS613pKp165+A/GRHv/zqtKkiTyaSfpulB8fBAOZ+zOj+ncXGBFUH3eugwxGxsMF8uryr7aVmWOOcI2m2Cdht3e/tPi7e20FGEAN5aKoN6779aaxfGmASANOUpSXD1OpEI5Uuq8zz/Wdl5Acbj8VEcx7vAq+Xgvb8py3LwB05BuvDbIBg7AAAAAElFTkSuQmCC") center center no-repeat;}'+
            '.emathtable a.emtableaddrow span:hover, .emathtable a.emtableaddcol span:hover {'+
            '}' +
            '.emathtable[tabletype="value_table"] a[ttype="value_table"], .emathtable[tabletype="grid_table"] a[ttype="grid_table"], .emathtable[tabletype="blank"] a[ttype="blank"], .emathtable[tabletype="noborder"] a[ttype="noborder"], .emathtable[tabletype="head_table"] a[ttype="head_table"], .emathtable[tabletype="prop_table"] a[ttype="prop_table"] {border: 1px solid red;}'+
            ''
    }

        
    /***************************************************************************
     * Default settings.
     **************************************************************************/
    Emathtable.defaults = {
        metadata : {
            creator : '',
            created : '',
            modifier : '',
            modified : '',
            tags : []
        },
        data : {
            rows: 2,
            cols: 2,
            values : [],
            chartVisible : true
        },
        settings : {
            mode : 'view',
            preview : false,
            uilang : 'en'
        }
    }

    Emathtable.elementinfo = {
        type : 'emathtable',
        elementtype : 'elements',
        jquery : 'emathtable',
        name : 'Emath table',
        icon : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" viewBox="0 0 30 30" class="mini-icon mini-icon-equationarray"><path style="stroke: none;" d="M4 7 l3 3 l3 -3 l1 1 l-3 3 l3 3 l-1 1 l-3 -3 l-3 3 l-1 -1 l3 -3 l-3 -3z m8 2 l6 0 l0 1 l-6 0z m0 3 l6 0 l0 1 l-6 0z m8 -5 l3 3 l3 -3 l1 1 l-3 3 l3 3 l-1 1 l-3 -3 l-3 3 l-1 -1 l3 -3 l-3 -3z M7 17 a3 3 0 0 0 0 6 a3 3 0 0 0 0 -6z m0 1 a2 2 0 0 1 0 4 a2 2 0 0 1 0 -4z m5 0 l6 0 l0 1 l-6 0z m0 3 l6 0 l0 1 l-6 0z m11 -4 a3 3 0 0 0 0 6 a3 3 0 0 0 0 -6z m0 1 a2 2 0 0 1 0 4 a2 2 0 0 1 0 -4z" /></svg>',
        description : {
            en : 'Math tables',
            fi : 'Matematiikkataulukot'
        },
        classes : [ 'math', 'content' ]
    }

    if (typeof ($.fn.elementset) === 'function') {
        $.fn.elementset('addelementtype', Emathtable.elementinfo);
    }

    if (typeof ($.fn.elementpanel) === 'function') {
        $.fn.elementpanel('addelementtype', Emathtable.elementinfo);
    }
    

})(jQuery)



// TiddlyWiki-macro for usage of tables in TiddlyWiki
//if (typeof(config) !== 'undefined' && typeof(config.macros) !== 'undefined'){
//    // Create macro for TiddlyWiki
//    config.macros.emathtable = {
//        /******************************
//         * Show emathtable
//         ******************************/
//        handler: function (place, macroName, params, wikifier, paramString, tiddler)
//        {
//            if (params.length < 1){
//                wikify('Missing table.', place, null, tiddler);
//                return false;
//            }
//            var tableid = params[0];
//            var iseditable = (params[1] === 'edit'|| params[1] === 'authordialog');
//            var emtabletext = '{{emathtable emathtable_'+tableid+'{\n}}}';
//            wikify(emtabletext, place);
//            if (tiddler) {
//                var settings = jQuery.extend(true, {}, tiddler.data('emathtable',{}));
//            } else {
//                var settings = {};
//            }
//            settings[tableid] = settings[tableid] || {};
//            settings[tableid].editable = iseditable;
//            var emtable = jQuery(place).find('.emathtable.emathtable_'+tableid).last().emathtable(settings[tableid])
//            if (iseditable &&  params[1] !== 'authordialog') {
//                emtable.bind('emathtable_changed', function(e){
//                    var $emtplace = jQuery(this);
//                    var data = $emtplace.emathtable('get');
//                    var settings = tiddler.data('emathtable', {});
//                    settings[tableid] = data;
//                    var autosavestatus = config.options.chkAutoSave;
//                    config.options.chkAutoSave = false;
//                    tiddler.setData('emathtable', settings);
//                    config.options.chkAutoSave = autosavestatus;
//                });
//            }
//            
//        }
//    }
//}
//}}}
