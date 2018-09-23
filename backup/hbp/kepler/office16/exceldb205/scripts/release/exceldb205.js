// exceldb205.js
(function(){
Type.registerNamespace('ExcelDB205');ExcelDB205.Top10AutoFilterClient=function(){ExcelDB205.Top10AutoFilterClient.initializeBase(this);var $0=ExcelDB205.ExcelDB205App.get_excelDB205().get_appName();this.$4_0=new Kepler.Engine.UI.Controls.Label('Show',new Kepler.Framework.UI.Point(6,11),null,null,'1001'+$0);this.$4_1=new Kepler.Engine.UI.Controls.LabelLine('',new Kepler.Framework.UI.Point(37,13),null,new Kepler.Framework.UI.Size(239,1),'1002'+$0);this.$4_2=new Kepler.Engine.UI.Controls.DropDownListCtrl(null,new Kepler.Framework.UI.Size(88,28),-1,null,null,null,null,'1003'+$0);this.$4_2.addItemToList('Top');this.$4_2.addItemToList('Bottom');this.$4_4=new Kepler.Engine.UI.Controls.ComboCtrl(new Kepler.Framework.UI.Point(15,27),new Kepler.Framework.UI.Size(92,22),this.$4_2,new Kepler.Framework.UI.Point(1,2),Kepler.Engine.UI.Controls.EComboCtrlType.eDropList,'1004'+$0);this.$4_3=new Kepler.Engine.UI.Controls.DropDownListCtrl(null,new Kepler.Framework.UI.Size(88,28),-1,null,null,null,null,'1005'+$0);this.$4_3.addItemToList('Items');this.$4_3.addItemToList('Percent');this.$4_5=new Kepler.Engine.UI.Controls.ComboCtrl(new Kepler.Framework.UI.Point(184,27),new Kepler.Framework.UI.Size(92,22),this.$4_3,new Kepler.Framework.UI.Point(1,2),Kepler.Engine.UI.Controls.EComboCtrlType.eDropList,'1006'+$0);this.$4_6=new Kepler.Engine.UI.Controls.EditSpinCtrl(new Kepler.Framework.UI.Point(116,28),new Kepler.Framework.UI.Size(59,20),true,1,1,500,0,42,'1007'+$0);this.$4_7=new Kepler.Engine.UI.Controls.Button('OK',new Kepler.Framework.UI.Point(117,65),new Kepler.Framework.UI.Size(74,22),'1008'+$0);this.$4_8=new Kepler.Engine.UI.Controls.Button('Cancel',new Kepler.Framework.UI.Point(201,65),new Kepler.Framework.UI.Size(74,22),'1009'+$0);this.$4_9=new Kepler.Engine.UI.Controls.Label('by',new Kepler.Framework.UI.Point(285,34),null,null,'1010'+$0);this.$4_A=new Kepler.Engine.UI.Controls.DropDownListCtrl(null,new Kepler.Framework.UI.Size(103,28),-1,null,null,null,null,'1011'+$0);this.$4_B=new Kepler.Engine.UI.Controls.ComboCtrl(new Kepler.Framework.UI.Point(306,27),new Kepler.Framework.UI.Size(107,22),this.$4_A,new Kepler.Framework.UI.Point(1,2),Kepler.Engine.UI.Controls.EComboCtrlType.eDropList,'1012'+$0);}
ExcelDB205.Top10AutoFilterClient.prototype={$4_0:null,$4_1:null,$4_2:null,$4_3:null,$4_4:null,$4_5:null,$4_6:null,$4_7:null,$4_8:null,$4_9:null,$4_A:null,$4_B:null,$4_C:null,$4_D:function($p0,$p1){try{var $0=false;(this.get_parent()).set_WIP(true);var $1=$p0.get_notificationMsg();var $2=$p0.get_data();switch($1){case Kepler.Framework.UI.Controls.NotificationCode.dialoG_CLOSE:this.$4_11(null,$p1);break;case Kepler.Framework.UI.Controls.NotificationCode.buttoN_CLICK:this.$4_12(null,$p1);$0=true;break;}(this.get_parent()).set_WIP(false);return $0;}finally{(this.get_parent()).set_WIP(false);}},onLoad:function(){ExcelDB205.Top10AutoFilterClient.callBaseMethod(this, 'onLoad');this.$4_C=(ExcelDB205.ExcelDB205App.get_dialog());this.add(this.$4_0);this.add(this.$4_1);this.add(this.$4_4);this.add(this.$4_6);this.add(this.$4_5);this.add(this.$4_9);this.add(this.$4_B);this.add(this.$4_7);this.add(this.$4_8);this.$4_E();this.$4_F();},$4_E:function(){this.attachMessage(Kepler.Engine.UI.Controls.Control.msG_COMMAND,ss.Delegate.create(this,this.$4_10));},getCancelButtonCtrlId:function(){var $0=(this.get_parent()).get_overrideRepository();for(var $1=0;$1<$0.length;$1++){if($0[$1]._iCommandId===this.$4_8.get_id()){return $0[$1]._scControlId;}}return null;},$4_F:function(){var $0=[];$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(0,new Kepler.Engine.Core.CONTROL_ID(0,10),this.$4_7.get_id(),Kepler.Engine.Core.EControlTypes.BUTTON,true,0,0,null,'OK Button',-1,-1));$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(1,new Kepler.Engine.Core.CONTROL_ID(0,20),this.$4_8.get_id(),Kepler.Engine.Core.EControlTypes.BUTTON,true,0,0,null,'Cancel Button',-1,-1));$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(2,new Kepler.Engine.Core.CONTROL_ID(0,30),this.$4_4.get_id(),Kepler.Engine.Core.EControlTypes.combO_DROPLIST,true,0,0,null,'Top Combo Control',-1,-1));$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(3,new Kepler.Engine.Core.CONTROL_ID(0,40),this.$4_6.get_id(),Kepler.Engine.Core.EControlTypes.spiN_CONTROL,true,0,0,'10','Number Spin control',-1,-1));$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(4,new Kepler.Engine.Core.CONTROL_ID(0,50),this.$4_5.get_id(),Kepler.Engine.Core.EControlTypes.combO_DROPLIST,true,0,0,'','Items combo control','O',-1));$0.add(new Kepler.Engine.Core.REPOSITORY_INFO(4,new Kepler.Engine.Core.CONTROL_ID(0,60),this.$4_B.get_id(),Kepler.Engine.Core.EControlTypes.combO_DROPLIST,true,0,0,'','Criteria combo control',-1,-1));if(ss.isValue(this.get_parent())){(this.get_parent()).initializeRepository($0);}},onPretranslateEvent:function(sender,eventArgs){if(eventArgs.get_type()===Kepler.Framework.UI.Events.EventArgsNs.EventType.keyDown){var $0=eventArgs;if(eventArgs.get_type()===Kepler.Framework.UI.Events.EventArgsNs.EventType.keyDown){var $1=eventArgs;if($0.get_key()===Kepler.Framework.UI.Events.EventArgsNs.Keys.tab){$0.set_defaultPrevented(true);}if((this.get_parent()).get_simMode()===ESIM_MODE.modE_ASSESSMENT){if($1.get_altKey()&&$1.get_key()!==Kepler.Framework.UI.Events.EventArgsNs.Keys.menu){var $2=(this.get_parent()).sendMessage(Kepler.Engine.Core.DialogApp.msG_HANDLE_ALT_KEY_NAVIGATION,$1,this);if($2){$1.set_defaultPrevented(true);}return $2;}}}}return ExcelDB205.Top10AutoFilterClient.callBaseMethod(this, 'onPretranslateEvent',[sender,eventArgs]);},isExitButtonClicked:function(iCommandId){ExcelDB205.Top10AutoFilterClient.callBaseMethod(this, 'isExitButtonClicked',[iCommandId]);if(iCommandId===this.$4_7.get_id()||iCommandId===this.$4_8.get_id()){return true;}else{return false;}},setDefaultFocus:function(){ExcelDB205.Top10AutoFilterClient.callBaseMethod(this, 'setDefaultFocus');this.$4_7.setFocus();},$4_10:function($p0,$p1){if((this.get_parent()).get_WIP()){return true;}var $0=$p1;var $1=$p0;if(ss.isValue((this.get_parent()))&&(this.get_parent()).get_simMode()===ESIM_MODE.modE_TUTORIAL){(this.get_parent()).handleUserEvent($0.get_id(),$1.get_notificationMsg());return true;}if(ss.isNullOrUndefined($1)){return false;}var $2=false;$2=this.$4_D($1,$0);return $2;},$4_11:function($p0,$p1){(this.get_parent()).handleUserEvent(this.$4_8.get_id(),Kepler.Framework.UI.Controls.NotificationCode.buttoN_CLICK);return null;},$4_12:function($p0,$p1){var $0=$p1;if(ss.isValue($0)&&($0===this.$4_7||$0===this.$4_8)){if($0.get_id()!==-1){if(!(this.get_parent()).get_parseWIP()){(this.get_parent()).handleUserEvent($0.get_id(),Kepler.Framework.UI.Controls.NotificationCode.buttoN_CLICK);}}}},setDialogMode:function(iDBMode){if(iDBMode===2){this.$4_9.show(true);this.$4_A.show(true);this.$4_B.show(true);this.$4_1.set_size(new Kepler.Framework.UI.Size(373,1));this.$4_7.set_position(new Kepler.Framework.UI.Point(254,65));this.$4_8.set_position(new Kepler.Framework.UI.Point(338,65));this.$4_C.set_size(new Kepler.Framework.UI.Size(423,123));}else{this.$4_9.show(false);this.$4_A.show(false);this.$4_B.show(false);this.$4_1.set_size(new Kepler.Framework.UI.Size(239,1));this.$4_7.set_position(new Kepler.Framework.UI.Point(117,65));this.$4_8.set_position(new Kepler.Framework.UI.Point(201,65));this.$4_C.set_size(new Kepler.Framework.UI.Size(288,123));}}}
ExcelDB205.ExcelDB205$0=function(strId,strDialogName,oTypeDialogClient,oDialodFrameType){ExcelDB205.ExcelDB205$0.initializeBase(this,[strId,strDialogName,oTypeDialogClient,false,oDialodFrameType]);}
ExcelDB205.ExcelDB205$0.prototype={setControlToState:function($p0){ExcelDB205.ExcelDB205$0.callBaseMethod(this, 'setControlToState',[$p0]);if($p0._iCommandId===1012){var $0=this.getControlFromCommandId($p0._iCommandId);var $1=null;if(!String.isNullOrEmpty($p0._sContents)){$1=$p0._sContents.split(Kepler.Framework.Core.Seperators.doublE_CROSS);$0.get_attachedList().resetList();$0.get_attachedList().addItemsFromArray($1);$0.removeList();}var $2=$0.getSelectedIndex();if($p0._iSelIndex!==$2){$0.setSelectedIndex($p0._iSelIndex);}if($p0._iSelIndex<0){$0.setText('');}else if(ss.isValue($1)){$0.setText($1[0]);}if($p0._iStartIndex>-1){$0.setTopIndex($p0._iStartIndex);}}},parseFrameTags:function(){ExcelDB205.ExcelDB205$0.callBaseMethod(this, 'parseFrameTags');var $0=parseInt((parseInt(this._mapFrameData['db_mode'])/10).toString());this._iSimMode=parseInt((parseInt(this._mapFrameData['db_mode'])%10).toString());(this.get_client()).setDialogMode($0);}}
ExcelDB205.ExcelDB205App=function(){ExcelDB205.ExcelDB205App.initializeBase(this,['exceldb205',false]);this.precacheImages();}
ExcelDB205.ExcelDB205App.get_excelDB205=function(){return ExcelDB205.ExcelDB205App.$4_0;}
ExcelDB205.ExcelDB205App.get_dialog=function(){return ExcelDB205.ExcelDB205App.$4_1;}
ExcelDB205.ExcelDB205App.prototype={createDialog:function(){ExcelDB205.ExcelDB205App.$4_1=new ExcelDB205.ExcelDB205$0('exceldb205','Top 10 AutoFilter',ExcelDB205.Top10AutoFilterClient,Kepler.Engine.UI.DialogFrameType.normalDialog);ExcelDB205.ExcelDB205App.$4_1.set_size(new Kepler.Framework.UI.Size(288,123));return ExcelDB205.ExcelDB205App.$4_1;}}
ExcelDB205.Top10AutoFilterClient.registerClass('ExcelDB205.Top10AutoFilterClient',Kepler.Engine.UI.DialogClient);ExcelDB205.ExcelDB205$0.registerClass('ExcelDB205.ExcelDB205$0',Kepler.Engine.UI.KeplerDialog);ExcelDB205.ExcelDB205App.registerClass('ExcelDB205.ExcelDB205App',Kepler.Engine.Core.DialogApp);ExcelDB205.ExcelDB205App.$4_0=null;ExcelDB205.ExcelDB205App.$4_1=null;(function(){window.setTimeout(function(){
ExcelDB205.ExcelDB205App.$4_0=new ExcelDB205.ExcelDB205App();ExcelDB205.ExcelDB205App.$4_0.init();},1);})();
})();// This script was generated using Script# v0.7.4.0