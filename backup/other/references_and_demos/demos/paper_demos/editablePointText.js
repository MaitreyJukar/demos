paper.install(window);

paper.PointText.prototype.wordwrap = function (txt, max) {
	var lines = [];
	var space = -1;
	times = 0;
	function cut() {
		for (var i = 0; i < txt.length; i++) {
			(txt[i] == ' ') && (space = i);
			if (i >= max) {
				(space == -1 || txt[i] == ' ') && (space = i);
				if (space > 0) {
					lines.push(txt.slice((txt[0] == ' ' ? 1 : 0), space));
				}
				txt = txt.slice(txt[0] == ' ' ? (space + 1) : space);
				space = -1;
				break;
			}
		}
		check();
	}
	function check() {
		if (txt.length <= max) {
			lines.push(txt[0] == ' ' ? txt.slice(1) : txt);
			txt = '';
		} else if (txt.length) {
			cut();
		}
		return;
	}
	check();
	return this.content = lines.join('\n');
}


var $canvas = $('#myCanvas');

var $textEditor = $('#textEditor');

var text = null;

var boundingRect = null;

var setupPaperscope = function(){
	paper.setup($canvas[0]);
}

var drawPointText = function(props){
    props = props || {};
    var obj = $.extend({
        point: [50, 50],
        content: 'The contents of the point text',
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontWeight: 'bold',
        fontSize: 12,
        justification: 'left'
    },props);
	text = new PointText(obj);
}

var attachEvents = function(){
	text.onClick = onTextClick;
    text.onMouseEnter = onTextMouseEnter;
    text.onMouseLeave = onTextMouseLeave;
}

var onTextClick = function(event){
    var verticalPadding = 1,
    	left = text.position.x-text.bounds.width/2,
        top = text.position.y-text.bounds.height/2+verticalPadding,
        maxHeight = $canvas.height() - top,
        maxWidth = $canvas.width() - left;
    $textEditor.css({
    	/*height: text.bounds.height,
        width: text.bounds.width,*/
        top: top,
        left: left,
        'max-height': maxHeight,
        'max-width': maxWidth
    }).html(text.content);
	text.visible=false;
	paper.view.draw();
    $textEditor.show()
        .focus()
        .on('blur.updateCanvas',updateCanvas);
}

var onTextMouseEnter = function(){
	$canvas.css('cursor','text');
}

var onTextMouseLeave = function(){
	$canvas.css('cursor','default');
}

var createBoundingRect = function(){
    var left = text.position.x-text.bounds.width/2,
        top = text.position.y-text.bounds.height/2,
        height = $textEditor.height(),
        width = $textEditor.width();
    console.log([left, top],[width, height]);
    boundingRect = new paper.Rectangle({
    	point:[left, top],
        size: [width, height]
    });
}

var updateCanvas = function(){
    createBoundingRect();
	$textEditor.hide()
    	.off('blur.updateCanvas');
    text.wordwrap($textEditor.html(),$textEditor.width());
    text.visible = true;
	paper.view.draw();
}

setupPaperscope();
drawPointText();
attachEvents();
paper.view.draw();

    









