(function (lib, img, cjs, ss, an) {

var p; // shortcut to reference prototypes
var ss={};var img={};
lib.ssMetadata = [];


// symbols:
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.Tween1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#333616").s().p("AkTkSIB3hEIEzAAIB9BIIkTJlg");
	this.shape.setTransform(-0.1,59.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E4E18D").s().p("ACWE4IkzAAIh3BDIkbr5IRfAAIkdL+g");
	this.shape_1.setTransform(0,-6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-56,-44.4,112.1,138.1);


(lib.Path_15 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E2B060").s().p("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");
	this.shape.setTransform(214.5,102.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_15, new cjs.Rectangle(0,0,429,205.3), null);


(lib.Path_14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F4A660").s().p("A/YAhIAAhBMA+xAAAIAABBg");
	this.shape.setTransform(200.9,3.3);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_14, new cjs.Rectangle(0,0,401.8,6.6), null);


(lib.Path_13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("EgkrAAAMBJXAAA");
	this.shape.setTransform(234.8,0.3);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_13, new cjs.Rectangle(-1,-0.7,471.7,2), null);


(lib.Path_12 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("EgkrAAAMBJXAAA");
	this.shape.setTransform(234.8,0.3);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_12, new cjs.Rectangle(-1,-0.7,471.7,2), null);


(lib.Path_11 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F4A660").s().p("ASrEKMgjsAAAI48B+IAAsPMBT7AAAIAAMPg");
	this.shape.setTransform(268.6,39.2);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_11, new cjs.Rectangle(0,0,537.2,78.4), null);


(lib.Path_9 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("AAAu5IAAdz");
	this.shape.setTransform(0.3,95.4);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_9, new cjs.Rectangle(-0.7,-1,2.1,192.8), null);


(lib.Path_6 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("AABJAIgBx/");
	this.shape.setTransform(0.3,57.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_6, new cjs.Rectangle(-0.7,-1,2.2,117.3), null);


(lib.Path_3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("AABu2IgBdt");
	this.shape.setTransform(0.4,95.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_3, new cjs.Rectangle(-0.7,-1,2.2,192.1), null);


(lib.Path_2_0 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("Af3AAMg/tAAA");
	this.shape.setTransform(203.9,0.3);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_2_0, new cjs.Rectangle(-1,-0.7,409.7,2), null);


(lib.Path_0 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(0.5).p("AAAo/IAAR/");
	this.shape.setTransform(0.3,57.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Path_0, new cjs.Rectangle(-0.7,-1,2,117.3), null);


(lib.table1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Path_14();
	this.instance.parent = this;
	this.instance.setTransform(-0.4,-18.3,2.25,2.25,0,0,0,200.8,3.3);
	this.instance.alpha = 0.398;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#BF6922").s().p("A/YCUIAAknMA+xAAAIAAEng");
	this.shape.setTransform(0.2,0,2.25,2.25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.instance}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-452.2,-33.3,904.4,66.6);


(lib.table_2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Path_9();
	this.instance.parent = this;
	this.instance.setTransform(-397.4,10.7,2.25,2.25,0,0,0,0.3,95.4);
	this.instance.alpha = 0.602;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#6C3604").s().p("AgYvbIAugEIADdtIgxBRg");
	this.shape.setTransform(-392,2.2,2.25,2.25);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#A35402").s().p("AhrPaIAA+zIDXAAIAAezg");
	this.shape_1.setTransform(-422,3.5,2.25,2.25);

	this.instance_1 = new lib.Path_6();
	this.instance_1.parent = this;
	this.instance_1.setTransform(-336.8,-73.2,2.25,2.25,0,0,0,0.4,57.6);
	this.instance_1.alpha = 0.602;

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#6C3604").s().p("AgOpWIAdgbIAASVIgdBOg");
	this.shape_2.setTransform(-333.4,-84.4,2.25,2.25);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#A35402").s().p("AhdJlIAAzFIC7gEIAATJg");
	this.shape_3.setTransform(-357.9,-81.3,2.25,2.25);

	this.instance_2 = new lib.Path_3();
	this.instance_2.parent = this;
	this.instance_2.setTransform(398.2,11.4,2.25,2.25,0,0,0,0.4,95);
	this.instance_2.alpha = 0.602;

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#6C3604").s().p("AgYOeIAA99IAxAFIAAe6g");
	this.shape_4.setTransform(392.2,2,2.25,2.25);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#A35402").s().p("AhrPaIAA+zIDXAAIAAezg");
	this.shape_5.setTransform(422.2,3.5,2.25,2.25);

	this.instance_3 = new lib.Path_0();
	this.instance_3.parent = this;
	this.instance_3.setTransform(336.7,-73.2,2.25,2.25,0,0,0,0.3,57.6);
	this.instance_3.alpha = 0.602;

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#6C3604").s().p("AgMIoIAAyVIAZATIAATIg");
	this.shape_6.setTransform(334,-83.5,2.25,2.25);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#A35402").s().p("AhdJlIAAzJIC7AEIAATFg");
	this.shape_7.setTransform(358.1,-81.3,2.25,2.25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_7},{t:this.shape_6},{t:this.instance_3},{t:this.shape_5},{t:this.shape_4},{t:this.instance_2},{t:this.shape_3},{t:this.shape_2},{t:this.instance_1},{t:this.shape_1},{t:this.shape},{t:this.instance}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-446.2,-225.3,892.7,451.2);


(lib.Pencil = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_13
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#F666B4").s().p("AoxA1IAAhoIIxhLIIyBLIAABoIoyBKg");
	this.shape.setTransform(0,-702);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F666B4").s().p("AoxBMIAAiWIIxhsIIyBsIAACWIoyBrg");
	this.shape_1.setTransform(0,-582.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F666B4").s().p("AoxBjIAAjEIIxiMIIyCMIAADEIoyCLg");
	this.shape_2.setTransform(0,-464);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F666B4").s().p("AoxB6IAAjyIIxitIIyCtIAADyIoyCsg");
	this.shape_3.setTransform(0,-345.3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#F666B4").s().p("AoxCLIAAkUIIxjGIIyDGIAAEUIoyDFg");
	this.shape_4.setTransform(0,-230.3);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#F666B4").s().p("AoxCdIAAk4IIxjeIIyDeIAAE4IoyDcg");
	this.shape_5.setTransform(0,-115.3);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#F666B4").s().p("AoxCxIAAlhIIxj6IIyD6IAAFhIoyD7g");
	this.shape_6.setTransform(0,-62.9);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#F666B4").s().p("AoxDGIAAmKIIxkZIIyEZIAAGKIoyEYg");
	this.shape_7.setTransform(0,-10.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#F666B4").s().p("AoxDbIAAmzIIxk3IIyE3IAAGzIoyE0g");
	this.shape_8.setTransform(0,41.7);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#F666B4").s().p("AoxDwIAAndIIxlUIIyFUIAAHdIoyFSg");
	this.shape_9.setTransform(0,94);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#F666B4").s().p("AoxEEIAAoGIIxlxIIyFxIAAIGIoyFwg");
	this.shape_10.setTransform(0,146.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[{t:this.shape_10}]},1).wait(1));

	// Layer_12
	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#BC558A").s().p("AoxB6IAAjyIIxitIIyCtIAADyIoyCsg");
	this.shape_11.setTransform(0,-334.4);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#BC558A").s().p("AoxCLIAAkUIIxjGIIyDGIAAEUIoyDFg");
	this.shape_12.setTransform(0,-213.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#BC558A").s().p("AoxCdIAAk4IIxjeIIyDeIAAE4IoyDcg");
	this.shape_13.setTransform(0,-92.9);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#BC558A").s().p("AoxCyIAAlhIIxj8IIyD8IAAFhIoyD5g");
	this.shape_14.setTransform(0,-45);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#BC558A").s().p("AoxDGIAAmJIIxkZIIyEZIAAGJIoyEYg");
	this.shape_15.setTransform(0,2.8);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#BC558A").s().p("AoxDbIAAm0IIxk2IIyE2IAAG0IoyE1g");
	this.shape_16.setTransform(0,50.7);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#BC558A").s().p("AoxDvIAAncIIxlUIIyFUIAAHcIoyFTg");
	this.shape_17.setTransform(0,98.5);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#BC558A").s().p("AoxEEIAAoGIIxlxIIyFxIAAIGIoyFwg");
	this.shape_18.setTransform(0,146.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_11}]},3).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_13}]},1).to({state:[{t:this.shape_14}]},1).to({state:[{t:this.shape_15}]},1).to({state:[{t:this.shape_16}]},1).to({state:[{t:this.shape_17}]},1).to({state:[{t:this.shape_18}]},1).wait(1));

	// Layer_6
	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#F666B4").s().p("AovFPIAAnVIIvjIIIwDIIAAHVg");
	this.shape_19.setTransform(0,-707.5);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#F666B4").s().p("AovEjIAAl9IIvjIIIwDIIAAF9g");
	this.shape_20.setTransform(0,-589.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#F666B4").s().p("AovEGIAAlDIIvjIIIwDIIAAFDg");
	this.shape_21.setTransform(0,-471.1);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F666B4").s().p("AovDpIAAkJIIvjIIIwDIIAAEJg");
	this.shape_22.setTransform(0,-353);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#F666B4").s().p("AovDMIAAjPIIvjIIIwDIIAADPg");
	this.shape_23.setTransform(0,-234.9);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#F666B4").s().p("AovCwIAAiXIIvjHIIwDHIAACXg");
	this.shape_24.setTransform(0,-116.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_19}]}).to({state:[{t:this.shape_20}]},1).to({state:[{t:this.shape_21}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_23}]},1).to({state:[{t:this.shape_24}]},1).to({state:[]},1).wait(5));

	// Layer_5
	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#FEF8CB").s().p("AovA5IAAhxIRfAAIAABxg");
	this.shape_25.setTransform(0,-668.7);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#FEF8CB").s().p("AovA6IAAhzIRfAAIAABzg");
	this.shape_26.setTransform(0,-555.4);
	this.shape_26._off = true;

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#FEF8CB").s().p("AovA5IAAhyIRfAAIAAByg");
	this.shape_27.setTransform(0,-442);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#FEF8CB").s().p("AovA6IAAhyIRfAAIAAByg");
	this.shape_28.setTransform(0,-215.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_25}]}).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_27,p:{y:-442}}]},1).to({state:[{t:this.shape_27,p:{y:-328.7}}]},1).to({state:[{t:this.shape_28}]},1).to({state:[{t:this.shape_27,p:{y:-102}}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_27,p:{y:104.1}}]},1).to({state:[{t:this.shape_26}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.shape_26).wait(1).to({_off:false},0).to({_off:true},1).wait(4).to({_off:false,y:-50.5},0).wait(1).to({y:1},0).wait(1).to({y:52.6},0).to({_off:true},1).wait(1).to({_off:false,y:155.6},0).wait(1));

	// Layer_3
	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#F3983C").s().p("EgENA4iMAAAhxDIIbAAMAAABxDg");
	this.shape_29.setTransform(-0.4,-313.7);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#F3983C").s().p("EgD/AwSMgAchgjII3AAMgAeBgjg");
	this.shape_30.setTransform(-0.4,-248.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("#F3983C").s().p("EgDxAoCMgA5hQDIJUAAMgA7BQDg");
	this.shape_31.setTransform(-0.3,-182.9);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("#F3983C").s().p("AjifyMgBWg/jIJxAAMgBaA/jg");
	this.shape_32.setTransform(-0.2,-117.5);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("#F3983C").s().p("AjUXiMgBygvDIKNAAMgB4AvDg");
	this.shape_33.setTransform(-0.1,-52.1);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("#F3983C").s().p("AjGPSIiO+jIKpAAIiWejg");
	this.shape_34.setTransform(-0.1,13.3);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("#F3983C").s().p("Ai4MeIir47ILGAAIi0Y7g");
	this.shape_35.setTransform(0,42.7);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("#F3983C").s().p("AipJqIjIzTILjAAIjSTTg");
	this.shape_36.setTransform(0.1,72);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("#F3983C").s().p("AibG2IjktrIL/AAIjwNrg");
	this.shape_37.setTransform(0.2,101.4);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("#F3983C").s().p("AiNECIkAoDIMbAAIkOIDg");
	this.shape_38.setTransform(0.2,130.8);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("#F3983C").s().p("Ah+BOIkeibIM5AAIktCbg");
	this.shape_39.setTransform(0.3,160.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_29}]}).to({state:[{t:this.shape_30}]},1).to({state:[{t:this.shape_31}]},1).to({state:[{t:this.shape_32}]},1).to({state:[{t:this.shape_33}]},1).to({state:[{t:this.shape_34}]},1).to({state:[{t:this.shape_35}]},1).to({state:[{t:this.shape_36}]},1).to({state:[{t:this.shape_37}]},1).to({state:[{t:this.shape_38}]},1).to({state:[{t:this.shape_39}]},1).wait(1));

	// Layer_4
	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("#F5D23B").s().p("EgCTA4iMAAAhxDIEnAAMAAABxDg");
	this.shape_40.setTransform(41.3,-313.7);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("#F5D23B").s().p("EgChAwSMAAdhgjIEnAAMgAkBgjIkgAAg");
	this.shape_41.setTransform(39.8,-248.3);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("#F5D23B").s().p("EgCxAoCMAA8hQDIEnAAMgBIBQDIkbAAg");
	this.shape_42.setTransform(38.3,-182.9);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("#F5D23B").s().p("AjAfyMABag/jIEnAAMgBsA/jIkVAAg");
	this.shape_43.setTransform(36.8,-117.5);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("#F5D23B").s().p("AjOXiMAB3gvDIEnAAMgCQAvDIkOAAg");
	this.shape_44.setTransform(35.3,-52.1);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("#F5D23B").s().p("AjePSICW+jIEnAAIi0ejIkJAAg");
	this.shape_45.setTransform(33.8,13.3);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("#F5D23B").s().p("AjsMeICz47IEnAAIjYY7IkCAAg");
	this.shape_46.setTransform(32.3,42.7);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("#F5D23B").s().p("Aj7JqIDRzTIEnAAIj8TTIj8AAg");
	this.shape_47.setTransform(30.8,72);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("#F5D23B").s().p("AkLG2IDwtrIEnAAIkfNrIj4AAg");
	this.shape_48.setTransform(29.3,101.4);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("#F5D23B").s().p("AkaECIEOoDIEnAAIlDIDIjyAAg");
	this.shape_49.setTransform(27.8,130.8);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("#F5D23B").s().p("AkoBOIEqibIEoAAIlnCbg");
	this.shape_50.setTransform(26.3,160.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_40}]}).to({state:[{t:this.shape_41}]},1).to({state:[{t:this.shape_42}]},1).to({state:[{t:this.shape_43}]},1).to({state:[{t:this.shape_44}]},1).to({state:[{t:this.shape_45}]},1).to({state:[{t:this.shape_46}]},1).to({state:[{t:this.shape_47}]},1).to({state:[{t:this.shape_48}]},1).to({state:[{t:this.shape_49}]},1).to({state:[{t:this.shape_50}]},1).wait(1));

	// Layer_2
	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("#ED6E6E").s().p("EgCOA4iMAAAhxDIEdAAMAAABxDg");
	this.shape_51.setTransform(-41.7,-313.7);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("#ED6E6E").s().p("EgB5AwSMgAkhgjIEdAAMAAeBgjg");
	this.shape_52.setTransform(-40.2,-248.3);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("#ED6E6E").s().p("EgBkAoCMgBIhQDIEdAAMAA8BQDg");
	this.shape_53.setTransform(-38.7,-182.9);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("#ED6E6E").s().p("AhPfyMgBsg/jIEdAAMABaA/jg");
	this.shape_54.setTransform(-37.2,-117.5);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("#ED6E6E").s().p("Ag6XiMgCQgvDIEdAAMAB4AvDg");
	this.shape_55.setTransform(-35.7,-52.1);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("#ED6E6E").s().p("AglPSIi0+jIEdAAICWejg");
	this.shape_56.setTransform(-34.2,13.3);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("#ED6E6E").s().p("AgQMeIjY47IEdAAIC0Y7g");
	this.shape_57.setTransform(-32.7,42.7);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#ED6E6E").s().p("AAEJqIj7zTIEdAAIDSTTg");
	this.shape_58.setTransform(-31.2,72);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("#ED6E6E").s().p("AAZG2IkftrIEdAAIDwNrg");
	this.shape_59.setTransform(-29.7,101.4);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#ED6E6E").s().p("AAuECIlDoDIEdAAIEOIDg");
	this.shape_60.setTransform(-28.2,130.8);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("#ED6E6E").s().p("ABDBOIlnibIEeAAIErCbg");
	this.shape_61.setTransform(-26.7,160.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_51}]}).to({state:[{t:this.shape_52}]},1).to({state:[{t:this.shape_53}]},1).to({state:[{t:this.shape_54}]},1).to({state:[{t:this.shape_55}]},1).to({state:[{t:this.shape_56}]},1).to({state:[{t:this.shape_57}]},1).to({state:[{t:this.shape_58}]},1).to({state:[{t:this.shape_59}]},1).to({state:[{t:this.shape_60}]},1).to({state:[{t:this.shape_61}]},1).wait(1));

	// Layer_1
	this.instance = new lib.Tween1("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(0,184.7,1,1,0,0,0,0,93.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:0.69,scaleY:0.55},5).to({regY:93.8,scaleX:0.36,scaleY:0.12},5).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-56.2,-741.1,112.4,925.8);


(lib.Group_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Path_12();
	this.instance.parent = this;
	this.instance.setTransform(234.8,1.6,1,1,0,0,0,234.8,0.3);
	this.instance.alpha = 0.602;

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#C17633").ss(0.5).p("EgkrAAAMBJXAAA");
	this.shape.setTransform(234.8,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#A35402").ss(1.1).p("EgkrAAAMBJXAAA");
	this.shape_1.setTransform(234.8,0.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Group_1, new cjs.Rectangle(-1,-0.7,471.7,2.6), null);


(lib.Group = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.Path_13();
	this.instance.parent = this;
	this.instance.setTransform(234.8,1.6,1,1,0,0,0,234.8,0.3);
	this.instance.alpha = 0.602;

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#C17633").ss(0.5).p("EgkrAAAMBJXAAA");
	this.shape.setTransform(234.8,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#A35402").ss(1.1).p("EgkrAAAMBJXAAA");
	this.shape_1.setTransform(234.8,0.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Group, new cjs.Rectangle(-1,-0.7,471.7,2.6), null);


(lib.ClipGroup_3_0 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("A/2EQIEiofMA2qAAAIEhIfg");
	mask.setTransform(270.8,68.8);

	// Layer_3
	this.instance = new lib.Path_11();
	this.instance.parent = this;
	this.instance.setTransform(268.6,39.1,1,1,0,0,0,268.6,39.1);
	this.instance.alpha = 0.301;

	var maskedShapeInstanceList = [this.instance];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.ClipGroup_3_0, new cjs.Rectangle(66.9,41.6,407.8,36.8), null);


(lib.ClipGroup_2_0 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("A/2EQIEiofMA2qAAAIEhIfg");
	mask.setTransform(232,27.2);

	// Layer_3
	this.instance = new lib.Group();
	this.instance.parent = this;
	this.instance.setTransform(234.8,16,1,1,0,0,0,234.8,0.9);
	this.instance.alpha = 0.602;

	this.instance_1 = new lib.Group_1();
	this.instance_1.parent = this;
	this.instance_1.setTransform(234.8,33.7,1,1,0,0,0,234.8,0.9);
	this.instance_1.alpha = 0.602;

	var maskedShapeInstanceList = [this.instance,this.instance_1];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.ClipGroup_2_0, new cjs.Rectangle(28.1,15.1,407.8,19.6), null);


(lib.ClipGroup_1_3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("A/2EQIEiofMA2qAAAIEhIfg");
	mask.setTransform(216.8,96.3);

	// Layer_3
	this.instance = new lib.Path_15();
	this.instance.parent = this;
	this.instance.setTransform(214.5,102.7,1,1,0,0,0,214.5,102.7);

	var maskedShapeInstanceList = [this.instance];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.ClipGroup_1_3, new cjs.Rectangle(13,69.1,407.8,54.4), null);


(lib.tabletop = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.ClipGroup_1_3();
	this.instance.parent = this;
	this.instance.setTransform(-5.2,10.8,2.25,2.25,0,0,0,214.5,102.7);
	this.instance.alpha = 0.5;

	this.instance_1 = new lib.ClipGroup_2_0();
	this.instance_1.parent = this;
	this.instance_1.setTransform(6.4,-3.7,2.25,2.25,0,0,0,234.8,27.2);

	this.instance_2 = new lib.Path_2_0();
	this.instance_2.parent = this;
	this.instance_2.setTransform(-0.2,57.6,2.25,2.25,0,0,0,203.8,0.3);
	this.instance_2.alpha = 0.602;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#EA934B").s().p("A/1AQIAAgfMA/sAAAIAAAfg");
	this.shape.setTransform(0,61.2,2.25,2.25);

	this.instance_3 = new lib.ClipGroup_3_0();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-4.9,-50.4,2.25,2.25,0,0,0,268.6,48);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F4A660").s().p("A/2EQIEiofMA2qAAAIEhIfg");
	this.shape_1.setTransform(0.1,-3.7,2.25,2.25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.instance_3},{t:this.shape},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-609.2,-220.3,1208.7,462);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.tabletop("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(-4.9,-233,1,1,0,0,0,-4.9,10.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regY:10.7,scaleX:1.33,scaleY:6.51,y:-328.2},6).wait(14));

	// Layer_3
	this.instance_1 = new lib.table1("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(-5.2,79.1,1,1,0,0,0,-5.1,231.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:-352.9},6).wait(14));

	// Layer_2
	this.instance_2 = new lib.table_2("synched",0);
	this.instance_2.parent = this;
	this.instance_2.setTransform(0.4,302.8,1,1,0,0,0,0.4,219.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({y:-129.2},6).wait(14));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-459.7,-308.5,919.4,618);


(lib.pencils = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(1,1,1).p("ATfgYQCGACAtAcQAlAZgkAaQgjAbg1gIQgdgEg/hgQBQgPAggaQAagWgSgOQgSgNgiAQQgoAUgcA2gANdgYIGCAAANdAIIGCAAA1lASIGBAAA1lgNIAFAAIF8AAA1lASQAEgRABgOQACgWgDgSQgCgIgDgHQgNgdgWAAQgWAAgFAdQgCANAZAaQAgAfAIAQQgkAHgHAdQgFAXAPAUQAPATALgQQANgTgGg/gA1lg1IAEAAMApAAAA");
	this.shape.setTransform(138.4,61.1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#000000").ss(1,1,1).p("ATfgUQCGACAtAYQAlAUgkAWQgjAXg1gHQgdgEg/hQQBQgNAggVQAagTgSgLQgSgMgiAOQgoARgcAtgANdAHIGCAAANdgUIGCAAA1hgsQgCgHgDgGQgNgYgWAAQgWAAgFAZQgCAKAZAWQAgAaAIANQAEgOABgMIF8AAA1ggLQACgSgDgPMApAAAAA1lgsIAEAAA1lgLIAFAAA1lAPIGBAAA1lAPQgkAGgHAYQgFAUAPARQAPAQALgOQANgPgGg2g");
	this.shape_1.setTransform(138.4,61.1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#000000").ss(1,1,1).p("AS3gPQCGABAtASQAlAQgkARQgjASg1gGQgdgCg/g+QBQgKAggRQAagOgSgJQgSgJgiALQgoANgcAjgAOLAGIEsAAAOLgPIEsAAA09AMQgkAEgHATQgFAQAPAMQAPANALgLQANgMgGgpQAEgLABgJQACgOgDgMQgCgFgDgFQgNgTgWABQgWAAgFATQgCAIAZAQQAgAVAIAKIExAAA09giIAEAAMAnwAAAA09gIIAFAAIEsAA");
	this.shape_2.setTransform(137.4,82.1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("#000000").ss(1,1,1).p("AAUgRIACAAQACAGAAAGQAAADgBADAAWgVQgCgEgBgBQgJgLgOAAQgQAAgDALQgBAEARAKQAVAMAGAEQgZADgEALQgEAIALAIQAJAHAIgGQAHgFgBgPQAAgCAAgBQAAgCgBgBIACAAQAAgCABgCQAAgDAAgBAAUABIADAAAAVAMQAAgCABgBAAUAJQAAgCAAgD");
	this.shape_3.setTransform(4.4,93.8);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#000000").ss(1,1,1).p("Ag7ABQAYgCAOgGQAEgBARgKQATgKgNgGQgMgGgXAHQgLAEgGAKQgLASgBABQgBABAAAAQAuAAAWAEQAWACAQAHQANAGAAABQAAACgMAGQgYAMglgEQgJgBgIgGQgCgDgbgag");
	this.shape_4.setTransform(260.3,93.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#000000").ss(1,1,1).p("AzgAAMAnBAAA");
	this.shape_5.setTransform(130,93.8);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#000000").ss(1,1,1).p("AzjAAMAnHAAA");
	this.shape_6.setTransform(130.3,93.8);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#000000").ss(1,1,1).p("AAWgVQgCgEgBgBQgJgLgOAAQgQAAgDALQgBAEARAKQAVAMAGAEQgZADgEALQgEAIALAIQAJAHAIgGQAHgFgBgPQAAgCAAgBQAAgCgBgBIACAAQAAgCABgCQAAgDAAgBAAUgRIACAAQACAGAAAGQAAADgBADAAUABIADAAAAVAMQAAgCABgBAAUAJQAAgCAAgD");
	this.shape_7.setTransform(7.6,104.3);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#000000").ss(1,1,1).p("Ag7ABQAuAAAWAEQAWACAQAHQANAGAAABQAAACgMAGQgYAMglgEQgJgBgIgGQgCgDgbgaQAYgCAOgGQAEgBARgKQATgKgNgGQgMgGgXAHQgLAEgGAKQgLASgBABQgBABAAAAg");
	this.shape_8.setTransform(259.1,104.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f().s("#000000").ss(1,1,1).p("AzOAAMAmdAAA");
	this.shape_9.setTransform(131.5,104.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_5},{t:this.shape_4,p:{x:260.3}},{t:this.shape_3}]},1).to({state:[{t:this.shape_6},{t:this.shape_4,p:{x:262.3}},{t:this.shape_3}]},1).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7}]},1).to({state:[]},1).wait(36));

	// Layer_1
	this.instance = new lib.Pencil("synched",0,false);
	this.instance.parent = this;
	this.instance.setTransform(243.4,70.2,0.343,0.343,0,0,0,0.1,0.3);

	this.instance_1 = new lib.Pencil("synched",0,false);
	this.instance_1.parent = this;
	this.instance_1.setTransform(19.4,70.2,0.343,0.343,0,0,0,0.1,0.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).to({state:[]},28).wait(14));

	// Layer_3
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#000000").ss(1,1,1).p("AgdgMQAjgHAGgdQAFgXgOgUQgOgTgLAQQgOATAHA/QgCBPADAHQAMAdAVAAQAWAAAFgdQACgNgZgaQgfgggHgPg");
	this.shape_10.setTransform(265.6,124.7);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f().s("#000000").ss(1,1,1).p("AAeANQAChPgDgHQgMgdgVAAQgWAAgFAdQgCANAZAaQAfAgAHAPQgjAHgGAdQgFAXAOAUQAOATALgQQAOgTgHg/g");
	this.shape_11.setTransform(-3.2,124.7);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#000000").ss(1,1,1).p("A0NAAMAoGAAAIAVAA");
	this.shape_12.setTransform(133,125.7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},10).to({state:[]},18).wait(14));

	// Layer_5
	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AUigMQAkgHAHgdQAFgYgPgTQgPgUgLARQgOASAHBAQAAAMAAAKAz7AKMAoFAAAIAYAAQgCA6ADAGQAMAdAWgBQAXAAAFgcQACgNgZgaQgggggIgPA0hANQgkAHgHAdQgFAXAPAUQAPATALgQQANgTgGg/QAChPgDgHQgNgdgWAAQgWAAgFAdQgCANAZAaQAgAgAIAPg");
	this.shape_13.setTransform(131.2,126.2);
	this.shape_13._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape_13).wait(10).to({_off:false},0).to({_off:true},18).wait(14));

	// Layer_4
	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.rf(["rgba(0,0,0,0.149)","rgba(0,0,0,0.098)"],[0,1],0,0,0,0,0,27.3).s().p("AjPDNQhWhUABh5QgBh5BWhYQBXhUB4AAQB6AABVBUQBXBYAAB5QAAB5hXBUQhVBZh6AAQh4AAhXhZg");
	this.shape_14.setTransform(18.2,119.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.rf(["rgba(0,0,0,0.149)","rgba(0,0,0,0.098)"],[0,1],0,0,0,0,0,27.3).s().p("AjPDNQhWhUAAh5QAAh5BWhYQBYhUB3AAQB5AABWBUQBXBYAAB5QAAB5hXBUQhWBZh5AAQh3AAhYhZg");
	this.shape_15.setTransform(242.4,119.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_15},{t:this.shape_14}]},10).to({state:[]},18).wait(14));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-7,-184.1,291,317.5);


(lib.Symbol3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#444444").s().p("ElhNDVgQgyAAAAgyMAAAmpbQAAgyAyAAMLCfAAAQAuACAAAwMAAAGpbQAAAwguACgEhP+g6LMAAAB0XQAAB0BbAAMCdIAAAQBbAAAAh0MAAAh0XQAAh0hbAAMidIAAAQhbAAAAB0g");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(104));

	// Layer_2
	this.instance = new lib.pencils("single",0);
	this.instance.parent = this;
	this.instance.setTransform(3.5,-27.3,0.7,0.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(10).to({startPosition:0},0).to({y:79.9},7).wait(11).to({mode:"synched",loop:false},0).to({regX:0.1,regY:0.1,scaleX:1.4,scaleY:1.4,x:-26.7,y:-167.5,startPosition:12},12).wait(8).to({regX:19.8,regY:121,x:0.9,y:1.8,startPosition:10},0).wait(6).to({startPosition:10},0).to({rotation:-90,x:0.8},8).to({rotation:-180,x:0.9,y:1.9},8).to({rotation:-270,y:1.8},8).to({rotation:-360},8).wait(18));

	// Layer_3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,6.7).s().p("AgyALQgVgEAAgHQAAgGAVgEQAWgEAcgBQAeABAVAEQAVAEABAGQgBAHgVAEQgVAEgeABQgcgBgWgEg");
	this.shape_1.setTransform(173.4,174);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,9).s().p("AhDAOQgdgGABgIQgBgHAdgHQAdgFAmAAQAoAAAcAFQAcAHAAAHQAAAIgcAGQgcAGgoAAQgmAAgdgGg");
	this.shape_2.setTransform(173.4,174);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,11.2).s().p("AhUASQgkgHAAgLQAAgJAkgIQAkgIAwAAQAyAAAjAIQAjAIAAAJQAAALgjAHQgjAIgyAAQgwAAgkgIg");
	this.shape_3.setTransform(173.4,174);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,13.4).s().p("AhlAVQgqgIAAgNQAAgLAqgKQArgJA6AAQA8AAAqAJQArAKAAALQAAANgrAIQgqAKg8AAQg6AAgrgKg");
	this.shape_4.setTransform(173.4,174);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,15.7).s().p("Ah3AZQgxgKAAgPQAAgOAxgLQAzgKBEAAQBGAAAxAKQAyALAAAOQAAAPgyAKQgxALhGAAQhEAAgzgLg");
	this.shape_5.setTransform(173.4,174);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,17.9).s().p("AiIAcQg4gLAAgRQAAgQA4gMQA6gMBOAAQBQAAA4AMQA5AMAAAQQAAARg5ALQg4ANhQAAQhOAAg6gNg");
	this.shape_6.setTransform(173.4,174);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,20.1).s().p("AiYAgQhAgMAAgUQAAgSBAgOQBAgNBYAAQBZAABAANQBAAOAAASQAAAUhAAMQhAAOhZAAQhYAAhAgOg");
	this.shape_7.setTransform(173.4,174);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,22.4).s().p("AipAkQhHgOAAgWQAAgUBHgPQBIgPBhgBQBjABBHAPQBHAPAAAUQAAAWhHAOQhHAPhjABQhhgBhIgPg");
	this.shape_8.setTransform(173.4,174);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,23.9).s().p("Ai1A5QhLgXgBgiQABghBLgZQBNgXBoAAQBqAABMAXQBMAZgBAhQABAihMAXQhMAZhqAAQhoAAhNgZg");
	this.shape_9.setTransform(183.9,160.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,25.4).s().p("AjBBPQhQggAAgvQAAguBQghQBSghBvAAQBxAABQAhQBRAhAAAuQAAAvhRAgQhQAihxAAQhvAAhSgig");
	this.shape_10.setTransform(194.5,147.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,27).s().p("AjNBlQhUgpAAg8QAAg6BUgsQBXgpB2AAQB4AABVApQBVAsAAA6QAAA8hVApQhVArh4AAQh2AAhXgrg");
	this.shape_11.setTransform(205,134.3);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,28.5).s().p("AjYB6QhagyAAhIQAAhHBag1QBcgyB8AAQB+AABbAyQBZA1ABBHQgBBIhZAyQhbA1h+AAQh8AAhcg1g");
	this.shape_12.setTransform(215.6,121.1);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,30).s().p("AjkCQQheg8AAhUQAAhUBeg+QBgg6CEgBQCGABBeA6QBfA+AABUQAABUhfA8QheA9iGABQiEgBhgg9g");
	this.shape_13.setTransform(226.1,107.9);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,31.5).s().p("AjwClQhihEgBhhQABhhBihGQBmhECKAAQCMAABkBEQBkBGAABhQAABhhkBEQhkBHiMAAQiKAAhmhHg");
	this.shape_14.setTransform(236.7,94.6);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,33.1).s().p("Aj7C7QhohNAAhuQAAhtBohRQBqhMCRAAQCTAABoBMQBpBRAABtQAABuhpBNQhoBQiTAAQiRAAhqhQg");
	this.shape_15.setTransform(247.2,81.4);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,34.6).s().p("AkHDQQhthWAAh6QAAh6BthaQBvhVCYAAQCZAABuBVQBuBaAAB6QAAB6huBWQhuBaiZAAQiYAAhvhag");
	this.shape_16.setTransform(257.8,68.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,36.1).s().p("AkSDlQhyheAAiHQAAiHByhjQBzheCgAAQCgAABxBeQBzBjAACHQAACHhzBeQhxBjigABQiggBhzhjg");
	this.shape_17.setTransform(268.3,54.9);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,37.6).s().p("AkeD7Qh2hnAAiUQAAiUB2hrQB5hoCmAAQCmAAB3BoQB3BrAACUQAACUh3BnQh3BsimAAQimAAh5hsg");
	this.shape_18.setTransform(278.9,41.7);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,39.2).s().p("AkpERQh7hxgBigQABihB7h1QB9hvCsAAQCuAAB7BvQB8B1ABChQgBCgh8BxQh7B1iuAAQisAAh9h1g");
	this.shape_19.setTransform(289.4,28.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1}]}).to({state:[{t:this.shape_1}]},10).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_8}]},11).to({state:[{t:this.shape_9}]},1).to({state:[{t:this.shape_10}]},1).to({state:[{t:this.shape_11}]},1).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_13}]},1).to({state:[{t:this.shape_14}]},1).to({state:[{t:this.shape_15}]},1).to({state:[{t:this.shape_16}]},1).to({state:[{t:this.shape_17}]},1).to({state:[{t:this.shape_18}]},1).to({state:[{t:this.shape_19}]},1).to({state:[]},1).wait(64));

	// Layer_4
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,6.7).s().p("AgyALQgVgEAAgHQAAgGAVgEQAVgEAdgBQAeABAVAEQAVAEAAAGQAAAHgVAEQgVAEgeABQgdgBgVgEg");
	this.shape_20.setTransform(18.1,174);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,9).s().p("AhDAOQgcgGAAgIQAAgHAcgHQAcgFAnAAQAoAAAcAFQAcAHAAAHQAAAIgcAGQgcAGgoAAQgnAAgcgGg");
	this.shape_21.setTransform(18.1,174);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,11.2).s().p("AhUASQgkgHAAgLQAAgJAkgIQAkgIAwAAQAyAAAjAIQAjAIAAAJQAAALgjAHQgjAIgyAAQgwAAgkgIg");
	this.shape_22.setTransform(18.1,174);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,13.4).s().p("AhlAVQgqgIAAgNQAAgLAqgKQArgJA6AAQA8AAAqAJQArAKAAALQAAANgrAIQgqAKg8AAQg6AAgrgKg");
	this.shape_23.setTransform(18.1,174);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,15.7).s().p("Ah3AZQgxgKAAgPQAAgOAxgLQAzgKBEAAQBFAAAyAKQAyALAAAOQAAAPgyAKQgyALhFAAQhEAAgzgLg");
	this.shape_24.setTransform(18.1,174);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,17.9).s().p("AiIAcQg4gLAAgRQAAgQA4gMQA6gMBOAAQBPAAA5AMQA5AMAAAQQAAARg5ALQg5ANhPAAQhOAAg6gNg");
	this.shape_25.setTransform(18.1,174);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,20.1).s().p("AiYAgQhAgMAAgUQAAgSBAgOQBAgNBYAAQBZAABAANQBAAOAAASQAAAUhAAMQhAAOhZAAQhYAAhAgOg");
	this.shape_26.setTransform(18.1,174);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,22.4).s().p("AipAkQhHgOAAgWQAAgUBHgPQBIgPBhgBQBjABBHAPQBHAPAAAUQAAAWhHAOQhHAPhjABQhhgBhIgPg");
	this.shape_27.setTransform(18.1,174);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,23.9).s().p("Ai1A5QhLgXAAgiQAAghBLgZQBNgXBoAAQBqAABMAXQBLAZAAAhQAAAihLAXQhMAZhqAAQhoAAhNgZg");
	this.shape_28.setTransform(16.6,160.8);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,25.4).s().p("AjBBPQhQggAAgvQAAguBQghQBSghBvAAQBxAABQAhQBRAhAAAuQAAAvhRAgQhQAihxAAQhvAAhSgig");
	this.shape_29.setTransform(15.2,147.5);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,27).s().p("AjNBlQhUgpAAg8QAAg6BUgsQBXgpB2AAQB4AABVApQBVAsAAA6QAAA8hVApQhVArh4AAQh2AAhXgrg");
	this.shape_30.setTransform(13.7,134.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,28.5).s().p("AjYB6QhagyAAhIQAAhHBag1QBcgyB8AAQB/AABZAyQBbA1AABHQAABIhbAyQhZA1h/AAQh8AAhcg1g");
	this.shape_31.setTransform(12.2,121.1);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,30).s().p("AjkCQQheg8AAhUQAAhUBeg+QBhg6CDgBQCGABBeA6QBfA+AABUQAABUhfA8QheA9iGABQiDgBhhg9g");
	this.shape_32.setTransform(10.7,107.9);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,31.5).s().p("AjvClQhkhEAAhhQAAhhBkhGQBlhECKAAQCMAABjBEQBlBGAABhQAABhhlBEQhjBHiMAAQiKAAhlhHg");
	this.shape_33.setTransform(9.2,94.6);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,33.1).s().p("Aj7C7QhohNAAhuQAAhtBohRQBqhMCRAAQCSAABpBMQBpBRAABtQAABuhpBNQhpBQiSAAQiRAAhqhQg");
	this.shape_34.setTransform(7.8,81.4);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,34.6).s().p("AkGDQQhthWAAh6QAAh6BthaQBvhVCXAAQCZAABtBVQBuBaAAB6QAAB6huBWQhtBaiZAAQiXAAhvhag");
	this.shape_35.setTransform(6.3,68.1);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,36.1).s().p("AkSDlQhyheAAiHQAAiHByhjQB0heCeAAQCgAAByBeQBzBjAACHQAACHhzBeQhyBjigABQiegBh0hjg");
	this.shape_36.setTransform(4.8,54.9);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0.1,0,0,0.1,0,37.6).s().p("AkeD7Qh3hnAAiUQAAiUB3hrQB5hoClAAQCnAAB3BoQB4BrgBCUQABCUh4BnQh3BsinAAQilAAh5hsg");
	this.shape_37.setTransform(3.3,41.7);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.rf(["rgba(0,0,0,0.4)","rgba(0,0,0,0)"],[0,1],0,0,0,0,0,39.2).s().p("AkqERQh7hxAAigQAAihB7h1QB+hvCsAAQCuAAB7BvQB9B1AAChQAACgh9BxQh7B1iuAAQisAAh+h1g");
	this.shape_38.setTransform(1.8,28.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_20}]}).to({state:[{t:this.shape_20}]},10).to({state:[{t:this.shape_21}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_23}]},1).to({state:[{t:this.shape_24}]},1).to({state:[{t:this.shape_25}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_27}]},1).to({state:[{t:this.shape_27}]},11).to({state:[{t:this.shape_28}]},1).to({state:[{t:this.shape_29}]},1).to({state:[{t:this.shape_30}]},1).to({state:[{t:this.shape_31}]},1).to({state:[{t:this.shape_32}]},1).to({state:[{t:this.shape_33}]},1).to({state:[{t:this.shape_34}]},1).to({state:[{t:this.shape_35}]},1).to({state:[{t:this.shape_36}]},1).to({state:[{t:this.shape_37}]},1).to({state:[{t:this.shape_38}]},1).to({state:[]},1).wait(64));

	// Layer_5
	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f().s("rgba(69,69,69,0)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_39.setTransform(95.9,172.6);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f().s("rgba(69,69,69,0.02)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_40.setTransform(95.9,172.6);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f().s("rgba(69,69,69,0.043)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_41.setTransform(95.9,172.6);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f().s("rgba(69,69,69,0.063)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_42.setTransform(95.9,172.6);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f().s("rgba(69,69,69,0.086)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_43.setTransform(95.9,172.6);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f().s("rgba(69,69,69,0.106)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_44.setTransform(95.9,172.6);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f().s("rgba(69,69,69,0.129)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_45.setTransform(95.9,172.6);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AsTAAIYnAA");
	this.shape_46.setTransform(95.9,172.6);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AtJAAIaTAA");
	this.shape_47.setTransform(100.9,159.2);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AuAAAIcBAA");
	this.shape_48.setTransform(105.9,145.7);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("Au2AAIdtAA");
	this.shape_49.setTransform(110.9,132.3);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AvtAAIfbAA");
	this.shape_50.setTransform(115.9,118.8);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AwjAAMAhHAAA");
	this.shape_51.setTransform(120.9,105.4);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AxaAAMAi1AAA");
	this.shape_52.setTransform(125.9,91.9);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AyRAAMAkjAAA");
	this.shape_53.setTransform(130.9,78.4);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("AzHAAMAmPAAA");
	this.shape_54.setTransform(135.9,65);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("Az+AAMAn9AAA");
	this.shape_55.setTransform(140.9,51.5);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("A00AAMAppAAA");
	this.shape_56.setTransform(145.9,38.1);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f().s("rgba(69,69,69,0.149)").ss(1,1,1).p("A1rAAMArXAAA");
	this.shape_57.setTransform(150.9,24.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_39}]},10).to({state:[{t:this.shape_40}]},1).to({state:[{t:this.shape_41}]},1).to({state:[{t:this.shape_42}]},1).to({state:[{t:this.shape_43}]},1).to({state:[{t:this.shape_44}]},1).to({state:[{t:this.shape_45}]},1).to({state:[{t:this.shape_46}]},1).to({state:[{t:this.shape_46}]},11).to({state:[{t:this.shape_47}]},1).to({state:[{t:this.shape_48}]},1).to({state:[{t:this.shape_49}]},1).to({state:[{t:this.shape_50}]},1).to({state:[{t:this.shape_51}]},1).to({state:[{t:this.shape_52}]},1).to({state:[{t:this.shape_53}]},1).to({state:[{t:this.shape_54}]},1).to({state:[{t:this.shape_55}]},1).to({state:[{t:this.shape_56}]},1).to({state:[{t:this.shape_57}]},1).to({state:[]},1).wait(64));

	// Layer_6 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_55 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAgrZIADgBMAAAAraIgCAAgAn4ADIAABGIgDAAIAAhIIAAAAIgRAvIAHglIhqhZIAtAIIgegdIApjCIA8CLIAAmzIADgNIAAFGIAkCrIBCi1IgrDhIBAhAIhDBoIABACID9hcIkIBtIgBACIgtAAIAAACMAmPAmQIgBABgEguNAmRIAAAAIAAABgAnFAAMA0egJ8QA1EzAAFJgEgH7g2JIABAAIACAAIAAaKIgDAGg");
	var mask_graphics_56 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1IgrDhIBAhAIhDBoIABACID9hcMAtZgS0QD3JeAALFMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_57 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1IgrDhIBAhAIhDBoIABACIAXgJMArvgdyQJHNPAAQ/Mg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_58 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1IgrDhMAlVglUQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_59 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1IgrDhIBAhAMAcEgrNQEVC9D7D7IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_60 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1IgrDhIAQgPMAS3gxRQJ/D9IOIOIABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_61 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAMAAAAx1IAkCrIBCi1MAJKgwrQPlC+L6L5IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_62 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaMAAAgzvIABAAIACAAQWYABP3P2IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_63 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTIFZMaIAAiGMgKLgwxQE6g4FRAAIABAAIACAAQWYABP3P2IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_64 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIk1tTMgPagjWQJlj/LOAAIABAAIACAAQWYABP3P2IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_65 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmIiGiGICpBrIg0iQMgcigpeQNHo5QzgBIABAAIACAAQWYABP3P2IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_66 = new cjs.Graphics().p("EgH6A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIAAgBMAlPglPIAjg0IoaDDIHWjRIh3AAICIgdIjahPIDmAmMglLglLIAAgBQP4v3WaAAIABAAIACAAQWYABP3P2IABABQP2P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_67 = new cjs.Graphics().p("EgEcA2JIAAAAMAAAg2IIgBAAIgRAvIAHglMgmHAmHIgBgBMAlPglPIAjg0IoaDDIHXjRIh4AAICIgdIjahPIDnAmIiHiGMgqCgavQC/kZD+j9IAAgBQP4v3WbAAIAAAAIACAAQWZABP2P2IABABQP3P2AAWbMg2HAAAIAAACMAmPAmQIAAABMgmPgmQMAAAA2GIgCAAg");
	var mask_graphics_68 = new cjs.Graphics().p("EgB4A2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIgBgBMAlPglPIAjg0IoaDDIHXjRIh4AAICIgdIjahPIDnAmIgkglMgwrgStQD+p0IFoFIAAgBQP4v3WbAAIABAAIABAAQWZABP3P2IAAABQP3P2AAWbMg2HAAAIAAACMAmQAmQIgBABMgmPgmQMAAAA2GIgBAAg");
	var mask_graphics_69 = new cjs.Graphics().p("EgAZA2JIgBAAMAAAg2IIAAAAIgRAvIAHglMgmIAmHIgBgBMAlQglPIAig0IoZDDIHWjRIh3AAICIgdIjahPMgwngILQCywLMQsPIAAgBQP3v3WbAAIABAAIACAAQWYABP3P2IAAABQP3P2AAWbMg2GAAAIAAACMAmPAmQIgBABMgmOgmQMAAAA2GIgCAAg");
	var mask_graphics_70 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglMgmHAmHIgBgBMAlPglPIAjg0IoaDDIHXjRMg0mAAAQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_71 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglMgmHAmHIgBgBMAlPglPIAjg0IoaDDIHXjRIh4AAMgxsALBQhClTAAluQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_72 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglMgmHAmHIgBgBMAlPglPIAjg0IoaDDMgo/ASNQkQp2AAroQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_73 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglMgmHAmHIgBgBMAlPglPIAjg0IhpAmMgrAAdQQpAtLAAw5QAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_74 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglMgmHAmHIgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_75 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglIg6A7MgcjAsWQkkjDkGkHIgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_76 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvIAHglIgOAPMgT8Ax9Qp2j9oHoIIgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_77 = new cjs.Graphics().p("EAAAA2JIAAAAMAAAg2IIAAAAIgRAvMgJ7A0hQv9i3sIsIIgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_78 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQMAAAA2GIgCAAg");
	var mask_graphics_79 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmQgmQIAAAGMAK0A1AQlNBBlngBIgCAAg");
	var mask_graphics_80 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgmLgmLMAUwAyCQpmD/rPAAIgCAAg");
	var mask_graphics_81 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABMgl9gl+MAduAs1QtKI/w3AAIgCAAg");
	var mask_graphics_82 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIAAACMAmQAmQIAAABQv3P22ZAAIgCAAg");
	var mask_graphics_83 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIALACMAs/Ad/Qi+EWj8D7IAAAAIAAABQv3P22ZAAIgCAAg");
	var mask_graphics_84 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAIANADMAx/AUrQj+Jnn+H9IAAAAIAAABQv3P22ZAAIgCAAg");
	var mask_graphics_85 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbMg2IAAAMA1FALEQjBPbr0LzIAAAAIAAABQv3P22ZAAIgCAAg");
	var mask_graphics_86 = new cjs.Graphics().p("EAAAA2JIAAAAQ2aABv3v4IgBgBQv3v2AA2bQAA2bP3v2IAAgBQP4v3WaAAIAAAAIACAAQWaABP2P2IABABQP3P2AAWbQAAWcv4P2IAAAAIAAABQv3P22ZAAIgCAAg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:null,x:0,y:0}).wait(55).to({graphics:mask_graphics_55,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_56,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_57,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_58,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_59,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_60,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_61,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_62,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_63,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_64,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_65,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_66,x:50.5,y:0.1}).wait(1).to({graphics:mask_graphics_67,x:28.3,y:0.1}).wait(1).to({graphics:mask_graphics_68,x:12,y:0.1}).wait(1).to({graphics:mask_graphics_69,x:2.4,y:0.1}).wait(1).to({graphics:mask_graphics_70,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_71,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_72,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_73,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_74,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_75,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_76,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_77,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_78,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_79,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_80,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_81,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_82,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_83,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_84,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_85,x:-0.2,y:0.1}).wait(1).to({graphics:mask_graphics_86,x:-0.2,y:0.1}).wait(18));

	// Layer_7
	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#000000").s().p("AgIAJQgEgEAAgFQAAgEAEgEQADgEAFAAQAGAAADAEQAEAEAAAEQAAAFgEAEQgDAEgGAAQgFAAgDgEg");
	this.shape_58.setTransform(16.6,172.9);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("#000000").s().p("AgJAJQgDgEAAgFQAAgEADgEQAFgEAEAAQAFAAAEAEQAEAEAAAEQAAAFgEAEQgEAEgFAAQgEAAgFgEg");
	this.shape_59.setTransform(14,144.6);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#000000").s().p("AgIAJQgEgEAAgFQAAgEAEgEQADgEAFAAQAFAAAEAEQAEAEAAAEQAAAFgEAEQgEAEgFAAQgFAAgDgEg");
	this.shape_60.setTransform(10,102.1);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("#000000").s().p("AgJAJQgDgEAAgFQAAgEADgEQAEgEAFAAQAFAAAEAEQAEAEAAAEQAAAFgEAEQgEAEgFAAQgFAAgEgEg");
	this.shape_61.setTransform(7.3,73.8);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("#000000").s().p("AgIAJQgEgEAAgFQAAgEAEgEQAEgEAEAAQAGAAADAEQAEAEAAAEQAAAFgEAEQgDAEgGAAQgEAAgEgEg");
	this.shape_62.setTransform(6,59.6);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("#898686").s().p("EgjEAjGQujuiAA0kQAA0jOjuhQOhuiUjgBQUjABOjOiQOiOhgBUjQABUkuiOiQujOh0jABQ0jgBuhuhgEgihgihQuUOUAAUNQAAUOOUOUQOUOTUNAAQUPAAOTuTQOUuUAA0OQAA0NuUuUQuTuU0PABQ0NgBuUOUg");
	this.shape_63.setTransform(-0.2,0.1);

	var maskedShapeInstanceList = [this.shape_58,this.shape_59,this.shape_60,this.shape_61,this.shape_62,this.shape_63];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_58,p:{x:16.6,y:172.9}}]},17).to({state:[{t:this.shape_58,p:{x:16.6,y:172.9}}]},11).to({state:[{t:this.shape_58,p:{x:15.3,y:158.8}}]},1).to({state:[{t:this.shape_59,p:{x:14,y:144.6}}]},1).to({state:[{t:this.shape_59,p:{x:12.6,y:130.4}}]},1).to({state:[{t:this.shape_59,p:{x:11.3,y:116.3}}]},1).to({state:[{t:this.shape_60,p:{x:10,y:102.1}}]},1).to({state:[{t:this.shape_60,p:{x:8.6,y:87.9}}]},1).to({state:[{t:this.shape_61,p:{x:7.3,y:73.8}}]},1).to({state:[{t:this.shape_62,p:{x:6,y:59.6}}]},1).to({state:[{t:this.shape_62,p:{x:4.6,y:45.4}}]},1).to({state:[{t:this.shape_62,p:{x:3.3,y:31.3}}]},1).to({state:[{t:this.shape_61,p:{x:2,y:17.1}}]},1).to({state:[{t:this.shape_61,p:{x:0.6,y:2.9}}]},1).to({state:[{t:this.shape_63}]},15).wait(49));

	// Layer_8
	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f().s("#A69C85").ss(1,1,1).p("EAxIAAAQAAUXuZOYQuYOa0WAAQ0WAAuauaQuYuYAA0XQAA0XOYuYQOauZUWAAQUWAAOYOZQOZOYAAUXg");
	this.shape_64.setTransform(-0.9,-0.4);
	this.shape_64._off = true;

	var maskedShapeInstanceList = [this.shape_64];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.shape_64).wait(55).to({_off:false},0).wait(49));

	// Layer_14
	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f("#FAF4E8").s().p("Eg6XAGvIHgtdMBlkAAAIHrNdg");
	this.shape_65.setTransform(0.9,176.7);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("#FAF4E8").s().p("Eg7FAK7IHB13MBoNAABIG9V4Mh2LgACg");
	this.shape_66.setTransform(0.6,162);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f("#FAF4E8").s().p("Eg7yAPHIGi+QMBq1AADIGOeQMh3lgADg");
	this.shape_67.setTransform(0.2,147.2);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("#FAF4E8").s().p("Eg8fATTMAGBgmpMBteAAEMAFgAmpMh4/gAEg");
	this.shape_68.setTransform(-0.1,132.5);

	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f("#FAF4E8").s().p("Eg9NAXfMAFjgvDMBwGAAGMAEyAvDMh6bgAGg");
	this.shape_69.setTransform(-0.5,117.8);

	this.shape_70 = new cjs.Shape();
	this.shape_70.graphics.f("#FAF4E8").s().p("Eg97AbrMAFEg3cMByuAAHMAEFA3cMh73gAHg");
	this.shape_70.setTransform(-0.9,103);

	this.shape_71 = new cjs.Shape();
	this.shape_71.graphics.f("#FAF4E8").s().p("Eg+oAf2MAElg/1MB1WAAJMADWA/1g");
	this.shape_71.setTransform(-1.3,88.3);

	this.shape_72 = new cjs.Shape();
	this.shape_72.graphics.f("#FAF4E8").s().p("Eg/bAkBMAD2hIKMB4PAAIMACyBILg");
	this.shape_72.setTransform(-1.2,73.5);

	this.shape_73 = new cjs.Shape();
	this.shape_73.graphics.f("#FAF4E8").s().p("EhANAoMMADGhQgMB7IAAIMACNBQhg");
	this.shape_73.setTransform(-1.1,58.8);

	this.shape_74 = new cjs.Shape();
	this.shape_74.graphics.f("#FAF4E8").s().p("EhBAAsXMACXhY2MB+BAAJMABpBY2g");
	this.shape_74.setTransform(-1,44);

	this.shape_75 = new cjs.Shape();
	this.shape_75.graphics.f("#FAF4E8").s().p("EhByAwiMABmhhMMCA8AAJMABDBhMg");
	this.shape_75.setTransform(-0.9,29.3);

	this.shape_76 = new cjs.Shape();
	this.shape_76.graphics.f("#FAF4E8").s().p("EhCkA0sMAA2hpgMCD1AAIMAAeBphg");
	this.shape_76.setTransform(-0.8,14.5);

	this.shape_77 = new cjs.Shape();
	this.shape_77.graphics.f("#FAF4E8").s().p("EhDaA43MAAHhx2MCGuAAIMgAGBx3g");
	this.shape_77.setTransform(-0.4,-0.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_65}]}).to({state:[{t:this.shape_65}]},28).to({state:[{t:this.shape_66}]},1).to({state:[{t:this.shape_67}]},1).to({state:[{t:this.shape_68}]},1).to({state:[{t:this.shape_69}]},1).to({state:[{t:this.shape_70}]},1).to({state:[{t:this.shape_71}]},1).to({state:[{t:this.shape_72}]},1).to({state:[{t:this.shape_73}]},1).to({state:[{t:this.shape_74}]},1).to({state:[{t:this.shape_75}]},1).to({state:[{t:this.shape_76}]},1).to({state:[{t:this.shape_77}]},1).wait(64));

	// Layer_10
	this.shape_78 = new cjs.Shape();
	this.shape_78.graphics.f("rgba(0,0,0,0.149)").s().p("Eg5xAGmQgoAAAEgGIIftAQACgFAiAAMBimAAAQAhAAADAFIIeNAQAEAGgnAAg");
	this.shape_78.setTransform(-0.4,181.6);

	this.shape_79 = new cjs.Shape();
	this.shape_79.graphics.f("rgba(0,0,0,0.149)").s().p("Eg6pAK6QgogBADgJIH11hQACgIAjAAMBlpAAAQAiAAAEAIIH0VhQADAJgnABg");
	this.shape_79.setTransform(-0.4,166.5);

	this.shape_80 = new cjs.Shape();
	this.shape_80.graphics.f("rgba(0,0,0,0.149)").s().p("Eg7hAPOQgpgBADgMIHL+CQACgMAkABMBotAAAQAjgBADAMIHLeCQADAMgoABg");
	this.shape_80.setTransform(-0.4,151.3);

	this.shape_81 = new cjs.Shape();
	this.shape_81.graphics.f("rgba(0,0,0,0.149)").s().p("Eg8ZAThQgpgBADgPMAGhgmjQABgPAmABMBrwAAAQAkgBADAPMAGhAmjQACAPgoABg");
	this.shape_81.setTransform(-0.4,136.2);

	this.shape_82 = new cjs.Shape();
	this.shape_82.graphics.f("rgba(0,0,0,0.149)").s().p("Eg9RAX1QgqgBADgTMAF3gvDQABgTAnABMBu0AAAQAlgBADATMAF2AvDQACATgoABg");
	this.shape_82.setTransform(-0.4,121.1);

	this.shape_83 = new cjs.Shape();
	this.shape_83.graphics.f("rgba(0,0,0,0.149)").s().p("Eg+JAcJQgrgCADgWMAFNg3jQABgXAoABMBx4AAAQAmgBACAXMAFNA3jQACAWgpACg");
	this.shape_83.setTransform(-0.4,106);

	this.shape_84 = new cjs.Shape();
	this.shape_84.graphics.f("rgba(0,0,0,0.149)").s().p("Eg/BAgdQgrgDACgZMAEkhAEQABgaAoACMB07AAAQAngCADAaMAEjBAEQABAZgpADg");
	this.shape_84.setTransform(-0.4,90.9);

	this.shape_85 = new cjs.Shape();
	this.shape_85.graphics.f("rgba(0,0,0,0.149)").s().p("Eg/5AkwQgrgDACgcMAD5hIlQABgeAqADMB3+AAAQAogDADAeMAD5BIlQABAcgqADg");
	this.shape_85.setTransform(-0.4,75.8);

	this.shape_86 = new cjs.Shape();
	this.shape_86.graphics.f("rgba(0,0,0,0.149)").s().p("EhAxApEQgsgDACgfMADQhRGQAAgiArADMB7CAAAQApgDACAiMADQBRGQAAAfgqADg");
	this.shape_86.setTransform(-0.4,60.6);

	this.shape_87 = new cjs.Shape();
	this.shape_87.graphics.f("rgba(0,0,0,0.149)").s().p("EhBpAtYQgsgEABgiMACmhZmQAAgmAsADMB+GAAAQAqgDACAmMACmBZmQAAAigrAEg");
	this.shape_87.setTransform(-0.4,45.5);

	this.shape_88 = new cjs.Shape();
	this.shape_88.graphics.f("rgba(0,0,0,0.149)").s().p("EhChAxsQgtgEABgmMAB8hiGQAAgqAtAEMCBKAAAQArgEACAqMAB7BiGQAAAmgsAEg");
	this.shape_88.setTransform(-0.4,30.4);

	this.shape_89 = new cjs.Shape();
	this.shape_89.graphics.f("rgba(0,0,0,0.149)").s().p("EhDZA1/QgugEABgpMABShqnQAAgtAuAEMCEOAAAQAsgEABAtMABSBqnQgBApgsAEg");
	this.shape_89.setTransform(-0.4,15.3);

	this.shape_90 = new cjs.Shape();
	this.shape_90.graphics.f("rgba(0,0,0,0.149)").s().p("EhERA6TQgugEAAgsMAAphzIQgBgxAvAEMCHRAAAQAtgEACAxMAAoBzIQgBAsgtAEg");
	this.shape_90.setTransform(-0.4,0.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_78}]}).to({state:[{t:this.shape_78}]},28).to({state:[{t:this.shape_79}]},1).to({state:[{t:this.shape_80}]},1).to({state:[{t:this.shape_81}]},1).to({state:[{t:this.shape_82}]},1).to({state:[{t:this.shape_83}]},1).to({state:[{t:this.shape_84}]},1).to({state:[{t:this.shape_85}]},1).to({state:[{t:this.shape_86}]},1).to({state:[{t:this.shape_87}]},1).to({state:[{t:this.shape_88}]},1).to({state:[{t:this.shape_89}]},1).to({state:[{t:this.shape_90}]},1).wait(64));

	// Layer_11
	this.instance_1 = new lib.Symbol1("single",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(-4.9,595.9,1,1,0,0,0,-4.9,171.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(28).to({mode:"synched",loop:false},0).wait(76));

	// Layer_12
	this.shape_91 = new cjs.Shape();
	this.shape_91.graphics.f("#A9A9A9").s().p("EhP/ALJIAA2RMCf/AAAIAAWRg");
	this.shape_91.setTransform(0,312.9);

	this.shape_92 = new cjs.Shape();
	this.shape_92.graphics.f("#C9C9C9").s().p("EhP/A8AMAAAh3/MCf/AAAMAAAB3/g");
	this.shape_92.setTransform(0,0.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_92},{t:this.shape_91}]}).wait(104));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-2265.6,-1366.4,4531.2,2732.8);


// stage content:
(lib.Pencil_animation = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_103 = function() {
		this.stop();
		$(this).trigger("animation-complete");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(103).call(this.frame_103).wait(1));

	// Layer_6
	this.instance = new lib.Symbol3("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(256.7,192.5,0.501,0.501,0,0,0,0.2,0.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(104));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-623.1,-300,2271.4,1369.9);
// library properties:
lib.properties = {
	id: '3C61E065627B56408AF8C136373E2A42',
	width: 512,
	height: 385,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	cjs.Stage.call(this, canvas);
}).prototype = p = new cjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['3C61E065627B56408AF8C136373E2A42'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(window.lib= window.lib||{}, images = images||{}, window.createjs, ss = ss||{}, AdobeAn = AdobeAn||{});
var lib, images, createjs, ss, AdobeAn;