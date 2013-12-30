Emathtable
==============

See the [demo page](http://e-math.github.io/emathtable).

What?
-----
A tool for creating tables with mathematical content and charts
from that data.

How?
----
Emathtable is a jQuery-plugin and can be embedded on any web page
by including `jquery.emathtable.js`-file and defining some html-element
as a graphtool with: `$('#mydiv').emathtable()`.

If you want to draw charts from the data in table you will also need
`chart.js` and `calculator.js`.

Emathtable depends on external JavaScript libraries:
* MathQuill
* jQuery
* jQuery-ui

Chart-plugin needs also
* JSXGraph

Who?
----
The tool was developed in EU-funded [E-Math -project](http://emath.eu) by
* Petri Salmela
* Rolf Lindén
* Petri Sallasmaa

and the copyrights are owned by [Four Ferries oy](http://fourferries.fi).

License?
--------
The tool is licensed under [GNU AGPL](http://www.gnu.org/licenses/agpl-3.0.html).
The tool depends on some publicly available open source components with other licenses:
* [jQuery](http://jquery.com) (MIT-license)
* [jQuery-ui](http://jqueryui.com) (MIT-license or GNU GPL)
* [MathQuill](http://mathquill.com/) (GNU LGPL)
* [JSXGraph](http://jsxgraph.uni-bayreuth.de/) (GNU LGPL and MIT-license)



Usage
======
Initing a table
----
Init a new, empty, editable table. (size: 2x2)
```javascript
jQuery('#box').emathtable({editable: true});
```

Init a new 5x2 table in editing mode with existing data.
```javascript
jQuery('.box').emathtable({
     editable: true,
     rows: 5,
     cols: 2,
     values: [["x","f(x)"],["0","2"],["1","3"],["2","4"],["3","5"]]
});
```

Init a new graph in view mode with existing data.
```
jQuery('#box').emathtable({
    rows: 5,
    cols: 2,
    values: [["x","f(x)"],["0","2"],["1","3"],["2","4"],["3","5"]]
});
```

Getting data from table
-----------------------

Get the data as a JavaScript object from the table in html-element with
id `#box`.
```javascript
var data = jQuery('#box').emathtable('get');
```

Edit mode
-----------

In edit mode you can:
* **Change the style** of the table from the menu behind the gear button.
* **Add or remove** rows and columns in add/remove mode which is started and stopped with plus/minus button.
* **Edit the cells.** Cells are in math mode as default, but one can toggle between math mode and text mode with **$ (dollar)** key.
* **Move** between cells:
** **Up** and **down** arrows go up and down respectively.
** **Left** and **right** arrows together with *ctrl-key* or *alt-key* (or *command* in Mac) move the focus to the cell on the left or right respectively.
** **Enter** moves the focus downwards to the next cell.
** **Tabulator** key moves the focus to the next cell (left to right, top to bottom) and shift+tab to the previous cell.
** **Esc**-key loses the focus from the cell.
