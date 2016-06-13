/***
|Name|Chart.js|
|Version|1.2|
|Author|Rolf Lindén (rolind@utu.fi)|
|Type|plugin|
|Requires|jQuery 1.4.3 or newer, calculator.js.|
|Description|Chart addon for E-Math table plugin.|
!!!!!Revisions
<<<
20141015.1222 ''Version 1.2''
* Fixed margins of barchart and mathquill for labels in barchart. (pesasa)
20130812.1127 ''Version 1.1''
* Fixed label color association bug.
20130611.1539 ''Version 1.00''
* First release.
<<<
!!!!!Code
***/

//{{{
    
/** chart.js
 * 
 * Chart plotter.
 * Created by: E-Math -project ( http://emath.eu )
 * Rolf Lindén
 * Copyright: Four Ferries oy
 *   http://fourferries.fi
 * License: GNU AGPL
 */
;(function ($) {
    { /**  CSS & glyphs                    **/
        var glyphs   =
            'iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAYAAAB7wJiVAAAAAXNSR0IArs4c6QAAAAZiS0dEAAAA' +
            'AAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90GCwUUKsnrC5gAAAAZdEVYdENv' +
            'bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAE70lEQVRYw+2YW6hXVRDGf9/JrlaS0sVu1EvY' +
            'GiTtQhKVXSCSeigSDR8KQS2s1w4ShL2YaBhIoYX5IF20ojCCCioiL5DRxaBZ503CtFII8wah2fSy' +
            'dmw3/+s5pwt0Bv6cveestWbW962ZWbNhTMZkTPoQM2upa6Ufk/6xbOp7wtbMzkopeUopzGxNr6T9' +
            '1ySl9K/4V7eVUpqQUlpkZk+llG6ujfnIzJY1SVGbBecBr9VUp7n78RZGXwKmAMvd/cN+wco5Y2a4' +
            'e1f9cEBxd8xsekTszTnv73VON12Pdq8EPgMuawyZC7wL/Fbe97j7ZdW+B9qsu6v2fDgijrcY8zCw' +
            'CLgVeK9fsHLOAJXzJ5HR1Hc5gS3H1UD8WtLTvfhVbK40s2fMbJmZzeyXjEoiYi5wvDxHUR9w9zeB' +
            '1dUw4NKU0vPVIRxow/DnwMyIGASmVINHS6pNmlmY2fkV+MXOC2Z2LKV0bqvT2ph/Sc75L/KaPqaU' +
            'ri2P7/Th3hMRcRC4C7i739RcfPlG0vKIeBY4JEmFmMEy7JHyVwCSbqvmjmuzIO6+BdjSLmwjYoOk' +
            'm6qUNYyQ3lBUu4Ezi24+8FhE7Mo5H2o1L6U0ALwr6d6IIKV0QtJD7v56C9JmRwQ55497TVEAOecV' +
            'ZjYe2G9mUfaLpGfdfbALGfcB08rpXxsRD0vaUPx42cxWleEbgfXu/kkV6ZJa15C/O9emlC6WtDci' +
            'fpI0GdgeEQuAIUmH3H1Cg7yKjLMkHS3grAJ2AEsjwiTtdPfpDfIOAkM55xnt/DOzlcDvBcBXgCF3' +
            'Vym4+4DV5f3JiDg75/xkF2zeB2ZFRJTAELAQuMrdB81sRslAmNnpwPXuvr2aP24kKaebrlkXKpFU' +
            'ndgrgDeA+yQNRQQRMbEDwV+U+ee4+5Gie8vMHgQ2ppQO5JzPK2RcL+lc4LlO/pUUtUTS7EJAOxkv' +
            'KXqAZ1a1zRop6yJifIm03Wb2VEQsLAV/H3DRiAgZRnpaEBG3A4PAdRFxtaR1OedjwP1mtg+4AJic' +
            'cz7RJKOskQADFrj7kXoud/dNKaVvgZxS+gWYJWkz8Ecpoh2llqJGW1Sibruka8zsPWBSifCqqF9Y' +
            'nzDwD5CxBFgnaZ6kPZJelYS7L6oHEnBHzvnnDqlvYQF/fUVS9SsXgiFJSdJESTuAycB1ffQgp4zG' +
            'viPigwK4A3MiYmpEvBgRDwBn1MZVhO1tSYiZndRIjaRDr+XwqRGxPCJ+ACaVf58TEQ/W13f3X9z9' +
            '0051KCJmAt+1ArjYwt2H3F0RMR043d13dqgdzcN4NCIOd3ovv46YSHpJ0uPAV5LelDRNEpLmAy/W' +
            't1T2tbkZUs2cv0LSjIhYm3PeNIIu+VRJx4rRcSUVLQaWuvuFw2i4Anjf3e/p9bLRzUZ1g+pT1rr7' +
            '4h58PakFKVffB4C36wXf3U/iYFwDxFklzyPp1pTSWznnE8PkpOrcb6jVhTVmtrlLkW0XIZdWJ7TX' +
            'y0YXMgaaYIzkllnXR8QtkrZGhEokVH3I1BItld1bmusNNMJt1L4h5ZzvBOa4+5dViBfDP/abBst6' +
            'e3POv45Wg+ruf4y0sW3Xw+Wct0XE5cD3NfCR9CiwodSNy919W5PcVilrpaQbS2huGi4hpXC3vPb+' +
            'H77yViCnlCYAcyVdAGyNiC055+iaUkezqI9J588sTZzHZEzGpFf5EycBAlhkz0fEAAAAAElFTkSu' +
            'QmCC';
            
        var chartCSS = '.chart {'
                        + '    display: table;'
                        + '    margin-left: auto;'
                        + '    margin-right: auto;'
                        + '}'
                        +'.frame {'
                        + '    width: 100%;'
                        + '    height: 100%;'
                        + '    background-color: white;'
                        + '    border: 1px solid gray;'
                        + '    margin: 8px;'
                        + '    padding: 0px;'
                        + '    padding-bottom: 30px;'
                        + '}'
                        + '.legend {'
                        + '    z-index: 10;'
                        + '    text-align: left;'
                        + '    position: absolute;'
                        + '    bottom: -7px;'
                        + '    right: 8px;'
                        + '    background-color: rgba(255, 255, 255, 0.75);'
                        + '    border: 1px solid gray;'
                        + '    padding: 8px;'
                        + '    border-radius: 2px;'
                        //+ '    -webkit-transition: all 0.5s ease;'
                        //+ '    -moz-transition: all 0.5s ease;'
                        //+ '    -o-transition: all 0.5s ease;'
                        //+ '    transition: all 0.5s ease;'
                        + '}'
                        + '.legend:empty { display: none; }'
                        + '.legendleft {'
                        + '    left: 8px;'
                        + '    right: auto;'
                        //+ '    -webkit-transition: all 0.5s ease;'
                        //+ '    -moz-transition: all 0.5s ease;'
                        //+ '    -o-transition: all 0.5s ease;'
                        //+ '    transition: all 0.5s ease;'
                        +'}'
                        // Chart type list.
                        + '.emtabletoolbar .emtablechartlistwrapper {position: absolute; right: -0.35em; top: -0.3em;}'
                        +' .emtabletoolbar .emtablechartlistwrapper ul {position: absolute; left: 0; top: 0; padding: 0; margin: 0; list-style: none; border: 1px solid #777; border-left: none; border-radius: 0 0.3em 0.3em 0; overflow: hidden;}'
                        + '.emtabletoolbar .emtablechartlistwrapper ul li {font-size: 80%; margin: 0; padding: 0; padding-right: 10px;'
                        + 'background: rgb(255,255,255); /* Old browsers */'
                        + 'background: -moz-linear-gradient(top,  rgba(255,255,255,1) 0%, rgba(229,229,229,1) 100%); /* FF3.6+ */'
                        +' background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255,255,255,1)), color-stop(100%,rgba(229,229,229,1))); /* Chrome,Safari4+ */'
                        + 'background: -webkit-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Chrome10+,Safari5.1+ */'
                        + 'background: -o-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* Opera 11.10+ */'
                        + 'background: -ms-linear-gradient(top,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* IE10+ */'
                        + 'background: linear-gradient(to bottom,  rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%); /* W3C */'
                        + 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#ffffff\', endColorstr=\'#e5e5e5\',GradientType=0 ); /* IE6-9 */}'
                        + '.emtabletoolbar .emtablechartlistwrapper ul li a {vertical-align: middle; margin: 0; padding: 0.2em; display: inline-block; width: 20px; height: 20px; margin-right: 5px;}'
                        + '.emathtable .emtablechartlistwrapper a[ctype] span {display: inline-block; width: 20px; height: 20px; padding: 0; margin: 0;}'
                        + 'div.emtabletoolbar div.emtablechartlistwrapper ul li a.selected {border: 1px solid red; }'
                        + '.emathtable a[ctype="scatter"] span { background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;background-position: 0px 0px !important; }'
                        + '.emathtable a[ctype="line"] span { background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;background-position: -20px 0px !important; }'
                        + '.emathtable a[ctype="spline"] span { background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;background-position: -40px 0px !important; }'
                        + '.emathtable a[ctype="bar"] span { background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;background-position: -60px 0px !important; }'
                        + '.emathtable a[ctype="pie"] span { background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;background-position: -80px 0px !important; }'
                        + '.emathtable a.emtablechartglyph span {'
                        + '   background: transparent url("data:image/png;base64,' + glyphs + '") no-repeat !important;'
                        + '   background-position: -80px 0px !important;'
                        + '}'
                        
                        + '.legend li { list-style-type: none; }'
                        + '.colorbox {'
                        + '    width: 8px;'
                        + '    height: 8px;'
                        + '    border-radius: 8px;'
                        + '    border: 1px solid gray;'
                        + '    display: inline-block;'
                        + '    vertical-align: middle;'
                        + '}';
        
    }
    { /**  Chart plotter                     **/
        
        function Chart(params) {
            //this.params = params;
            for (var item in params) {
                if (item === 'data') {
                    for (var dataItem in params[item]) {
                        this[dataItem] = params[item][dataItem];
                        params[dataItem] = params[item][dataItem];
                    }
                } else {
                    this[item] = params[item];                    
                }
                
            }
            
            
            
            // Checks if editor's CSS information is already written to document's head.
            if ($('head style#chartstyle').length == 0) {
                $('head').append('<style id="chartstyle" type="text/css">' + chartCSS + '</style>');
            }
            this.place.empty();
            var boxnum = 0;
            while ($( '#chartframe-' + boxnum ).length > 0) ++boxnum;
            this.boxnum = boxnum;
            
            this.place.append('<div id="chartframe-' + this.boxnum + '" class="frame" style="width: ' + this.width + '; height: ' + this.height + '"></div>')
            $('#chartframe-' + this.boxnum).data('params', params);
            
            this.maxWidth = this.place.width();
            this.maxHeight = this.place.height();
            if (this.showPlot) this.plot();
        }
        
        /** unique()
         * 
         * Derives a (sorted) array of unique items from the data array given as a parameter.
         * 
         * @param data : Data to be processed.
         * @param fCompare : Compare function, as defined for array.sort(). If undefined, the default comparison is used.
         */
        function unique(data, fCompare) {
            var sorted = data.sort(fCompare);
            var uniqueArr = new Array();
            for (var i = 0; i < sorted.length; ++i)
                if ( i == 0 || (fCompare(sorted[i - 1], sorted[i]) != 0) ) uniqueArr.push(sorted[i]);
            return uniqueArr;
        }
        
        /** 
        * Converts HSV to RGB value. 
        * 
        * @param {Integer} h Hue as a value between 0 - 360 degrees 
        * @param {Integer} s Saturation as a value between 0 - 100 % 
        * @param {Integer} v Value as a value between 0 - 100 % 
        * @returns {Array} The RGB values  EG: [r,g,b], [255,255,255] 
        */  
        function hsv2rgb(h,s,v) {  
        
            s = s / 100;
            v = v / 100;  
        
            var hi = Math.floor((h/60) % 6);  
            var f = (h / 60) - hi;  
            var p = v * (1 - s);  
            var q = v * (1 - f * s);  
            var t = v * (1 - (1 - f) * s);  
        
            var rgb = [];  
        
            switch (hi) {  
                case 0: rgb = [v,t,p]; break;  
                case 1: rgb = [q,v,p]; break;  
                case 2: rgb = [p,v,t]; break;  
                case 3: rgb = [p,q,v]; break;  
                case 4: rgb = [t,p,v]; break;  
                case 5: rgb = [v,p,q]; break;  
            }  
        
            var r = Math.min(255, Math.round(rgb[0] * 256)),  
                g = Math.min(255, Math.round(rgb[1] * 256)),  
                b = Math.min(255, Math.round(rgb[2] * 256));  
        
            return [r,g,b];
        }
        
        function rgb2hex(rgbArr) {
            
            var r = (rgbArr[0]).toString(16); if (r.length < 2) r = '0' + r;
            var g = (rgbArr[1]).toString(16); if (g.length < 2) g = '0' + g;
            var b = (rgbArr[2]).toString(16); if (b.length < 2) b = '0' + b;
            
            return ('#' + r + g + b)
        }
        
        function hsv2hex(h, s, v) { return rgb2hex(hsv2rgb(h, s, v)) }
        
        /** count()
         * 
         * Counts the occurences of unique items, and returns the result as an object / map.
         * 
         * @param data : Data to be processed.
         * @param fCompare : Compare function, as defined for array.sort(). If undefined, the default comparison is used.
         * @param fName : Naming function for the arrays.
         */
        function count(data, fCompare, fName) {
            // Initialize.
            if (typeof(fName) === 'undefined') fName = function(x) { return(x); }
            if (typeof(fCompare) === 'undefined') fCompare = function(a, b) { return(a-b); }
            var sorted = data.sort(fCompare);
            var counts = new Array();
            var bin = 0;
            
            // Loop through the sorted array and pick up the changes.
            for (var i = 0; i < sorted.length; ++i) {
                if ( i == 0 || (fCompare(sorted[i - 1], sorted[i]) != 0) ) {
                    bin = counts.length;
                    counts.push([fName(sorted[i]), 1]);
                }
                else counts[bin][1] = counts[bin][1] + 1;
            }
            return counts;
        }
        
        /**
         * Add flatten function to arrays.
         */
        //Array.prototype.flatten = function() {
        //    return ([].concat.apply([], this));
        //}
        
        function strToFloat(s) {
            try { var result = parseFloat($().calculator('calculate', s)); }
            catch (Invalidexpression) { var result = NaN; }
            finally { return(result); }
        }
        
        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        
        Chart.prototype.plot = function() {
            var values = this.values;
            { // Create row and column labels, if needed.
                var showRowLabels = this.rowLabels;
                var showColLabels = this.colLabels;
                
                if (showRowLabels === 'auto') {
                    var rowLabels = new Array();
                    
                    for (var row = 1; row < values.length; ++row)
                        if ( (values[row][0] !== '') && isNaN(strToFloat(values[row][0])) )
                            showRowLabels = true;
                    
                    if (showRowLabels === 'auto') showRowLabels = false;
                }
                if (showColLabels === 'auto') {
                    var colLabels = new Array();
                    
                    for (var col = 1; col < this.values[0].length; ++col)
                        if ( (values[0][col] !== '') && isNaN(strToFloat(values[0][col])) )
                            showColLabels = true;
                    
                    if (showColLabels === 'auto') showColLabels = false;
                }
                
                var startRow = (showColLabels === true ? 1 : 0);
                var startCol = (showRowLabels === true ? 1 : 0);
                
                if (showRowLabels) {
                    var rowLabels = new Array();
                    
                    for (var row = startRow; row < values.length; ++row)
                        rowLabels.push(values[row][0]);
                }
                if (showColLabels) {
                    var colLabels = new Array();
                    
                    for (var col = startCol; col < values[0].length; ++col)
                        colLabels.push(values[0][col]);
                }
            }
            { // Preprocess the data.
                
                if (this.dataMode === 'counts') {
                    values = new Array();
                    for (var i = startRow; i < this.values.length; ++i) {
                        values.push(new Array());
                        for (var j = startCol; j < this.values[i].length; ++j) {
                            values[values.length - 1].push(this.values[i][j]);
                        }
                    }
                    
                    //values = count(values.flatten(), this.fCompare, this.fName);
                    values = count([].concat.apply([], values), this.fCompare, this.fName);
                    showRowLabels = true;
                    showColLabels = false;
                    startRow = 0;
                    startCol = 1;
                    
                    rowLabels = new Array();
                    for (var row = startRow; row < values.length; ++row)
                        rowLabels.push(values[row][0]);
                    
                } else values = this.values;
            }
            { // Chart's type-wise settings -- bounding box, margins, styling etc.
                if (this.chartStyle === 'pie') {
                    xMin = -5;
                    yMin = -7;
                    yMax = 5;
                    xMax = 5 + 10 * (values[0].length - startCol - 1);
                    this.grid = false;
                    this.keepaspectratio = true;
                }
                else if (this.chartStyle === 'scatter') {
                    var xMin = Number.MAX_VALUE,
                        xMax = Number.MIN_VALUE,
                        yMin = Number.MAX_VALUE,
                        yMax = Number.MIN_VALUE,
                        value;
                        
                    for (var row = startRow; row < values.length; ++row) {
                        
                        var value = strToFloat(values[row][startCol]);
                        if (!isNaN(value)) {
                            xMin = Math.min(xMin, value);
                            xMax = Math.max(xMax, value);
                        }
                        
                        var value = strToFloat(values[row][startCol + 1]);
                        if (!isNaN(value)) {
                            yMin = Math.min(yMin, value);
                            yMax = Math.max(yMax, value);
                        }
                    }
                    
                    if (this.includeOrigo) {
                        xMin = Math.min(xMin, 0);
                        xMax = Math.max(xMax, 0);
                        yMin = Math.min(yMin, 0);
                        yMax = Math.max(yMax, 0);
                    }
                }
                else if ((this.chartStyle === 'line') || (this.chartStyle === 'spline')) {
                    var xMin = Number.MAX_VALUE,
                        xMax = Number.MIN_VALUE,
                        yMin = Number.MAX_VALUE,
                        yMax = Number.MIN_VALUE,
                        value;
                    
                    if ((this.repeatPattern === 'x')  || (this.repeatPattern === 'y')) {
                        for (var row = startRow; row < values.length; ++row)
                        for (var col = startCol; col < values.length; ++col) {
                        
                            var value = strToFloat(values[row][col]);
                            if (!isNaN(value)) {
                                if (this.repeatPattern === 'x') {
                                    xMin = Math.min(xMin, value);
                                    xMax = Math.max(xMax, value);
                                }
                                if (this.repeatPattern === 'y') {
                                    yMin = Math.min(yMin, value);
                                    yMax = Math.max(yMax, value);
                                }
                            }
                        }
                        
                        if (this.repeatPattern === 'x') {
                            yMin = 0;
                            yMax = values.length - 1;
                        }
                        if (this.repeatPattern === 'y') {
                            xMin = 0;
                            xMax = values.length - 1;
                        }
                    }
                    else if (this.repeatPattern === 'xyy') {
                        for (var row = startRow; row < values.length; ++row)
                        for (var col = startCol; col < values[row].length; ++col) {
                        
                            var value = strToFloat(values[row][col]);
                            if (!isNaN(value)) {
                                if (col == startCol) {
                                    xMin = Math.min(xMin, value);
                                    xMax = Math.max(xMax, value);
                                } else {
                                    yMin = Math.min(yMin, value);
                                    yMax = Math.max(yMax, value);
                                }
                            }
                        }
                    }
                    else if (this.repeatPattern === 'xyxy') {
                        for (var row = startRow; row < values.length; ++row)
                        for (var col = startCol; col < values.length; ++col) {
                        
                            var value = strToFloat(values[row][col]);
                            if (!isNaN(value)) {
                                if ((col - startCol) % 2 == 1) {
                                    xMin = Math.min(xMin, value);
                                    xMax = Math.max(xMax, value);
                                } else {
                                    yMin = Math.min(yMin, value);
                                    yMax = Math.max(yMax, value);
                                }
                            }
                        }
                    }
                    if (this.includeOrigo) {
                        xMin = Math.min(xMin, 0);
                        xMax = Math.max(xMax, 0);
                        yMin = Math.min(yMin, 0);
                        yMax = Math.max(yMax, 0);
                    }
                }
                else { // Bar charts
                    // Gather the minimums and maximums of the data.
                    var yMin = Number.MAX_VALUE,
                        yMax = Number.MIN_VALUE,
                        value;
                        
                    for (var row = startRow; row < values.length; ++row)
                    for (var col = startCol; col < values[row].length; ++col) {
                        
                        var value = strToFloat(values[row][col]);
                        if (!isNaN(value)) {
                            yMin = Math.min(yMin, value);
                            yMax = Math.max(yMax, value);
                        }
                    }
                    
                    // All columns are created equal.
                    var xMin = startCol;
                    var xMax = (values.length - startRow + 1) * (values[0].length - startCol) - 1;
                    
                }
                
                if (this.chartStyle === 'bar') {
                    yMin  = -1;
                    xMin  = -0.5;
                    xMax -= 0.5;
                    this.grid = false;
                }
                
                // Margins make 5% of each border.
                var xMargin = (xMax - xMin) * 0.08;
                var yMargin = (yMax - yMin) * 0.08;
                
                if (xMargin == 0) xMargin = 2;
                if (yMargin == 0) yMargin = 2;
            
            }    
            { // Initialize the board.
                var board = JXG.JSXGraph.initBoard(
                    'chartframe-' + this.boxnum,
                    {
                        boundingbox : [xMin - xMargin, yMax + yMargin, xMax + xMargin, yMin - yMargin] /* (upper left), (lower right)*/,
                        axis: this.grid,
                        showCopyright:false,
                        showNavigation:false,
                        zoom:false,
                        pan: false,
                        grid : false,
                        keepaspectratio: (this.chartStyle === 'pie') || this.keepaspectratio
                    }
                );
                $('.chart .frame svg').height($('.chart .frame').height() + 30);
                board.options.label.strokeColor = 'black';
            }
            { // Create the color palette.
                var colors = this.colors;
                var highlightColors = this.highlightColors;
                if (
                    ((typeof(colors) === 'string') && (colors === 'auto')) ||
                    ((typeof(highlightColors) === 'string') && (highlightColors === 'auto'))
                ) {
                    if (colors === 'auto') colors = new Array();
                    if (highlightColors === 'auto') highlightColors = new Array();
                    
                    // Determine amount of needed colors
                    var nrow = values.length - startRow;
                    var ncol = values[0].length - startCol;
                    
                    var n;
                    if ((this.chartStyle === 'pie') || (this.chartStyle === 'bar') || (this.chartStyle === 'scatter')) {
                        n = nrow;
                    } else if ((this.chartStyle === 'line') || (this.chartStyle === 'spline')) {
                        if (( this.repeatPattern === 'y' ) || ( this.repeatPattern === 'x' )) n = ncol;
                        else if ( this.repeatPattern === 'xy' ) n = ncol / 2;
                        else if ( this.repeatPattern === 'xyy' ) n = ncol - 1;
                    }
                    // Create the colors.
                    for (var i = 0; i < n; ++i) {
                        if (this.colors === 'auto') colors.push(hsv2hex(i * 360 / n, 100, 85)); // Them bright colors seem fancy, don't they?
                        if (this.highlightColors === 'auto') highlightColors.push(hsv2hex(i * 360 / n, 80, 100)); // Them bright colors seem fancy, don't they?
                    }
                }
            }
            { // Plot.
                if (this.showLegend)
                    this.place.find('.frame')
                        .append('<ul class=legend></ul>')
                        .find('.legend')
                            .mouseenter(
                                function() {
                                    $(this).toggleClass('legendleft');
                                }
                            );
                board.suspendUpdate();
                if (this.chartStyle === 'scatter') {
                    if ((values.length > startRow) && (values[0].length > startCol + 1)) {
                        var categories = new Array();
                        
                        for (var row = startRow; row < values.length; ++row) {
                            
                            var x = strToFloat(values[row][startCol]),
                                y = strToFloat(values[row][startCol + 1]),
                                size = null,
                                category;
                            
                            if (values[row].length > startCol + 2) {
                                    var category = categories.indexOf(values[row][startCol + 2]);
                                    
                                    if (category == -1) {
                                        categories.push(values[row][startCol + 2]);
                                        category = categories.length - 1;
                                        
                                        if (this.showLegend) {
                                            var legend = values[row][startCol + 2];
                                            if (legend.trim() === '') legend = 'NA' /* Not Acquired */;
                                            this.place.find('.legend')
                                                .append('<li><span class=colorbox style="background-color: ' + colors[category] + '">&nbsp;</span> <span class="legendCaption">' + legend + '</span></li>');
                                        }
                                    }
                                if (values[row].length > startCol + 3) size = strToFloat(values[row][startCol + 3])
                            } else category = 0;
                            
                            if (isNaN(x)) x = null;
                            if (isNaN(y)) y = null;
                            if (isNaN(size)) size = null;
     
                            // pairwise.complete.obs
                            if ((x !== null) && (y !== null)) {
                                board.create('point', [x, y],
                                    {
                                        name : (showRowLabels && (rowLabels[row - startRow].trim() !== '') ? '<span class="plotlabel">' + escapeRegExp(rowLabels[row - startRow])  + '</span>' : ''),
                                        size : (size !== null ? size : 3),
                                        withLabel : showRowLabels,
                                        visible : true,
                                        fixed : true,
                                        strokeColor: colors[category],
                                        highlightStrokeColor: colors[category],
                                        fillColor: colors[category],
                                        highlightFillColor: colors[category]
                                    }
                                );
                            }
                        }
                    }
                }
                else if ((this.chartStyle === 'line') || (this.chartStyle === 'spline')) {
                    
                    var x = new Array();
                    var y = new Array();
                    var colCounter = -1;
                    for (var col = startCol; col < this.cols; ++col) {
                        
                        // Flush columns if necessary.
                        if ( this.repeatPattern === 'x' )
                            x = new Array();
                        else if ( this.repeatPattern === 'xy' && ((col-startCol) % 2) ) {
                            x = new Array();
                            y = new Array();
                        }
                        else if ( ( this.repeatPattern === 'y' ) || ( this.repeatPattern === 'xyy' ) )
                            y = new Array();
                        
                        
                        for (var row = startRow; row < values.length; ++row) {
                            
                            var value = strToFloat(values[row][col]);
                            if (isNaN(value)) value = null;
                            
                            // Store data to the proper array.
                            if ( this.repeatPattern === 'x' ) {
                                x.push(value);
                                if (col == startCol) y.push(row - startRow + 1);
                            }
                            else if ( this.repeatPattern === 'y' ) {
                                if (col == startCol) x.push(row - startRow + 1);
                                y.push(value);
                            }
                            else if ( this.repeatPattern === 'xy' ) {
                                if ( (col - startCol) % 2 === 0 ) x.push(value);
                                else if ( (col - startCol) % 2 === 1 ) y.push(value);
                            }
                            else if ( this.repeatPattern === 'xyy' ) {
                                if ( (col - startCol) === 0 ) x.push(value);
                                else y.push(value);
                            }
                        }
                        
                        // Pairwise complete obs.
                        var tempX = new Array();
                        var tempY = new Array();
                        var i = 0;
                        
                        if (this.showLegend && showColLabels) {
                            var legend = colLabels[col - startCol];
                            if (legend.trim() === '') legend = 'NA';
                            // Store data to the proper array.
                            if (
                                ( this.repeatPattern === 'x' ) ||
                                ( this.repeatPattern === 'y' ) ||
                                ( ( this.repeatPattern === 'xy' )  && ( (col - startCol) % 2 === 1 ) )  ||
                                ( ( this.repeatPattern === 'xyy' ) && ( (col - startCol) !== 0 ) )
                            ) {
                                ++colCounter;
                                this.place.find('.legend')
                                    .append('<li><span class=colorbox style="background-color: ' +colors[colCounter] + '">&nbsp;</span> <span class="legendCaption">' + legend + '</span></li>');
                            }
                        }
                        
                        while (i <= x.length) {
                            if ( (i < x.length) && ((x[i] != null) && (y[i] != null)) ) {
                                tempX.push(x[i]);
                                tempY.push(y[i]);
                                
                                board.createElement(
                                    'point',
                                    [x[i],y[i]], 
                                    {
                                        name : (showRowLabels && (rowLabels[i].trim() !== '') ? '<span class="plotlabel">' + escapeRegExp(rowLabels[i])  + '</span>' : ''),
                                        size : 3,
                                        withLabel : showRowLabels,
                                        visible : true,
                                        fixed : true,
                                        strokeColor: colors[colCounter % colors.length],
                                        highlightStrokeColor: highlightColors[colCounter % highlightColors.length],
                                        fillColor: colors[colCounter % colors.length],
                                        highlightFillColor: highlightColors[colCounter % highlightColors.length]
                                    }
                                );
                                
                            } else { // Plot and flush.
                                if (tempX.length > 0) {
                                    board.createElement(
                                        (this.chartStyle === 'line' ? 'curve' : this.chartStyle),
                                        [tempX,tempY], 
                                        {
                                            strokeWidth : 2,
                                            strokeColor: colors[colCounter % colors.length],
                                            highlightStrokeColor: highlightColors[colCounter % highlightColors.length],
                                            //fillColor: colors[(col - startCol) % colors.length],
                                            //highlightFillColor: colors[(col - startCol) % colors.length],
                                            labels : (showRowLabels ? rowLabels : '')
                                        }
                                    );
                                    var tempX = new Array();
                                    var tempY = new Array();
                                }
                            }
                            ++i;
                        }
                    }
                }
                else /* bar chart, radar chart and pie chart */ {
                    for (var col = startCol; col < values[0].length; ++col) {
                        var data = new Array();
                        var rowList = new Array();
                        for (var row = startRow; row < values.length; ++row) {
                            
                            var value = strToFloat(values[row][col]);
                            if (isNaN(value)) value = null;
                            if  (value != null) {
                                data.push(value);
                                rowList.push( (values.length - startRow + 1) * (col - startCol) + row - startRow );
                            }
                        }
                        
                        if (col == startCol) {
                            for (var i = 0; i < rowLabels.length; ++i) {
                                if (this.showLegend) {
                                    var legend = rowLabels[i];
                                    if (legend.trim() === '') legend = 'NA';
                                    this.place.find('.legend')
                                        .append('<li><span class=colorbox style="background-color: ' +colors[i] + '">&nbsp;</span> <span class="legendCaption">' + legend + '</span></li>');
                                }
                            }
                        }
                        
                        if (data.length > 0) {
                            if (this.chartStyle === 'pie') {
                                board.create('chart', data,
                                    {
                                        chartStyle : this.chartStyle,
                                        strokeWidth : 3,
                                        strokeColor : 'white',
                                        highlightStrokeColor : 'white',
                                        colors: colors,
                                        highlightOnSector : true,
                                        highlightColorArray: highlightColors,
                                        opacity: 1.0,
                                        fillOpacity: 1.0,
                                        center: [10 * (col - startCol), 0]
                                    }
                                );
                                board.create('text', [(col - startCol) * 10, -5, escapeRegExp('<span class="a">' + colLabels[col - startCol] + '</span>')], {anchorX:'middle', anchorY: 'top'});
                            }
                            else if (this.chartStyle === 'bar') {
                                board.create('chart', [rowList, data],
                                    {
                                        chartStyle : this.chartStyle,
                                        strokeWidth : 3,
                                        strokeColor : 'white',
                                        highlightStrokeColor : 'white',
                                        colors: colors,
                                        highlightOnSector : true,
                                        highlightColorArray: highlightColors,
                                        opacity: 1.0,
                                        fillOpacity: 1.0
                                    }
                                );
                                board.create('text', [(col - startCol) * (values.length - startRow + 1) + (values.length - startRow) * 0.5, -0.5, escapeRegExp('<span class="columnCaption">' + colLabels[col - startCol] + '</span>')], {anchorX:'middle', anchorY: 'top'});
                            }
                        }
                    }
                }
                if (this.showLegend) this.place.find('.legend').find('.legendCaption').mathquill();
                if (this.showColumnCaption) this.place.find('.a, .columnCaption').mathquill();
                this.place.find('.plotlabel').mathquill();
               
                board.unsuspendUpdate();
                
                if (board.keepaspectratio) {
                    var ratio =  (yMax - yMin) / (xMax - xMin);
                    var minVal = this.place.find('.legend').height() + 36;
                    
                    var newH = Math.min(Math.max(this.place.find('div.frame').width() * ratio + 30 /* padding at the bottom */, minVal), this.maxHeight);
                    var newW = newH / ratio;
                    
                    this.place.find('div.frame').width(newW);
                    this.place.find('div.frame').height(newH);
                    
                    this.place.find('svg').width(newW);
                    this.place.find('svg').height(newH);
                    
                    
                    board.setBoundingBox([xMin - xMargin, yMax + yMargin, xMax + xMargin, yMin - yMargin] /* (upper left), (lower right)*/, true); 
                    if (this.grid) board.create('grid', []);
                    JXG.JSXGraph.boards.jxgBoard1.update()
                }
            }
        }
    }
    { /**  jQuery Plugin interface           **/
    
        var defaultParams = {
            chartStyle : 'scatter' /* \in ['line', 'spline', 'bar', 'pie', 'scatter'], radar not yet supported. */,
            grid : true /* boolean */,
            dataMode : 'normal' /* \in ['normal', 'counts']*/,
            mode : 'free' /* \in ['tiny', 'small', 'medium', 'large', 'full', anything other is interpreted as 'free'] */,
            main: 'auto' /* 'auto' or String */,
            sub: 'auto' /* 'auto' or String */,
            xlab: 'auto' /* 'auto' or String */,
            ylab: 'auto' /* 'auto' or String */,
            repeatPattern: 'xyy' /* \in ['x', 'y', 'xy', 'xyy'] */,
            isSquare : false /* boolean */,
            width : '500px' /* in any CSS-applicaple units */,
            showLegend : true /* boolean */,
            showColumnCaption : true /* boolean */,
            height : '300px' /* in any CSS-applicable units */,
            rowLabels : 'auto' /* 'auto' or an Array */,
            fName : function(x) { return(x.toString()); } /* Function that returns a string. */,
            fCompare : function(a, b) { return(a-b); } /* Function that implements comparison in JS. */,
            colLabels : 'auto' /* 'auto' or an Array */,
            colors : 'auto' /* 'auto' or an Array */,
            highlightColors : 'auto' /* 'auto' or an Array */,
            keepaspectratio : false /* boolean */,
            showPlot : true /* boolean */,
            includeOrigo : true
        }
    
        var methods = {
            'init' : function(params) {
                // call handler.
                params = $.extend( defaultParams, params );
                
                if (params.mode == 'tiny') {
                    params.width = '200px';
                    params.height = '150px';
                }
                else if (params.mode == 'small') {
                    params.width = '400px';
                    params.height = '300px';
                }
                else if (params.mode == 'medium') {
                    params.width = '512px';
                    params.height = '384px';
                }
                else if (params.mode == 'large') {
                    params.width = '640px';
                    params.height = '480px';
                }
                else if (params.mode == 'full') {
                    params.width = '100%';
                    params.height = '500px';
                }
                if (params.isSquare) params.width = params.height;
                
                return this.each( function() {
                    params.place = $(this);
                    var chart = new Chart(params);
                    params.place.data('chart', chart);
                });
            },
            'plot' : function(params) {
                // call handler.
                params = $.extend( defaultParams, params );
                
                return this.each( function() {
                    params.place = $(this);
                    var chart = params.place.data('chart');
                    chart.plot(params);
                });
            }
        }

        $.fn.chart = function( method ) {

            if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
            }
            else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
            }
            else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.exam' );
            return false;
            }
        }
    }
})(jQuery);

//}}}
