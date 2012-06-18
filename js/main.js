var displayname = "Bob";
var user = "bob";
var pwd = "try123";
var server = "vz-conductor-cmc-01.ebiz.verizon.com";
// if BOSH SSL is disabled, can connect to condcutor BOSH directly, Apache proxy
// is unnecessary
var boshUrl = "http://113.128.128.42:5280/httpbinding";
// SASL mechanism

var client = new jabberwerx.Client("");
function successConCallBack() {
	jabberwerx.$('#title').text("Welcome " + displayname);
}

function clearImage(miliseconds) {
	var count = 1;
	var intervalid = setInterval(function() {
		if(count == 0) {
			clearInterval(intervalid);
			jabberwerx.$("#imageDiv").html("<img src=''/>");
	                jabberwerx.$('body').css('background-image', 'url(/images/background.jpg)');
		}
		count = count - 1;
	}, miliseconds);
}

function clearImageAfterPubsub(miliseconds) {
        var count = 1;
        var intervalid = setInterval(function() {
                if(count == 0) {
                        clearInterval(intervalid);
                        jabberwerx.$("#imageDiv").html("<img src=''/>");
                }
                count = count - 1;
        }, miliseconds);
}

function errorConCallback(err) {
	//alert("-debug infor: login   failed");
	jabberwerx.$('#title').text(err.xml);
}

function reminderLink() {
//alert("Reminder message clicked");
//jabberwerx.$("#imageDiv").html("<img src='/images/reminderLink.jpg'/>");
jabberwerx.$('#title').text("");
jabberwerx.$('body').css('background-image', 'url(/images/reminderLink.jpg)');
jabberwerx.$("#imageDiv").html("<img src=''/>");
}

function _onBeforeMessagedReceived(event) {
	//alert("- method called:  _onBeforeMessageReceived");
	var msgStanza = event.data;
	//alert(msgStanza.xml());
	//alert("- debug info:  " + msgStanza.getSubject());
	if (msgStanza.getSubject() == "callerId") {
		//alert("- debug info :   caller  " + msgStanza.getBody());
                var blink = true;
                var count = 6;
                var intervalid = setInterval(function(){
                    if(blink){
                        jabberwerx.$('#title').text(msgStanza.getBody());
                        jabberwerx.$('#title').css("color", "red");
                        blink = false;
                        count = count-1;
                    }else{
                        jabberwerx.$('#title').text("");
                        blink = true;
                    } 
                    if(count==0)
                        clearInterval(intervalid);
                }, 500);
                return;
	} else if (msgStanza.getSubject() == "splashScreen") {
		//alert("- debug info :   caller  " + msgStanza.getBody());
		jabberwerx.$("#imageDiv").html(
				"<a href=\"/images/doublePlay.jpg\"><img src='" + msgStanza.getBody() + "'/></a>");
		clearImage(15000);
	        return;
        }

	// following handle the pubsub message
	var $items = jabberwerx
			.$(msgStanza.getNode())
			.find(
					"event[xmlns='http://jabber.org/protocol/pubsub#event'] items:first");
	if ($items == null) {
		return;
	}
	var msgContent = $items.find(
			"entry[xmlns='http://www.cisco.com/publisher']:first").text();
	//alert("-debug info: pubsub msgContent = " + msgContent);
        //jabberwerx.$("#imageDiv").html("<a href=\"/images/reminderLink.jpg\"><img src='" + msgContent + "'/></a>");
        jabberwerx.$("#imageDiv").html("<img onclick='reminderLink();' src='" + msgContent + "'/>");
        //clearImageAfterPubsub(10000);
}

function _onPresenceReceived(event) {
	//alert("- method called:  _onPresenceReceived");
	var presenceStanza = event.data;
	//alert(presenceStanza.xml());
	if(presenceStanza.getType() == 'subscribe'){
		client.sendStanza("presence", "subscribed", presenceStanza.getFrom(), "");
	}
}

function _onPresenceSent(event) {
	//alert("- method called:  _onPresenceSent");
	var presenceStanza = event.data;
	//alert(presenceStanza.xml());
}

function _onClientStatusChanged(evt) {
	//alert("- method called:  _onClientStatusChanged");
	var preStatus = evt.data.previous;
	var nextStatus = evt.data.next;
	//alert("-debug infor: status changed : " + preStatus + " --> " + nextStatus);
	if (nextStatus == jabberwerx.Client.status_connected) {
		client.sendPresence();
		client.sendIQ('get','','<query xmlns="jabber:iq:roster"/>'); 
        //client.sendStanza("presence", "subscribed", "admin@"+server, "");

	}
}

function initClientCon() {
	//alert("- method called:  initClientCon()");
	client.event("clientStatusChanged").bind(_onClientStatusChanged);
	client.event("beforeMessageReceived").bind(_onBeforeMessagedReceived);
	jabberwerx.globalEvents.bind("presenceReceived", _onPresenceReceived);
	client.event("presenceSent").bind(_onPresenceSent);
	
	var connectArgs = {
		httpBindingURL : boshUrl,
		successCallback : successConCallBack,
		errorCallback : errorConCallback
	};
	try {
		//alert("-debug infor:  prepare to login with: " + user+"@"+server);
		client.connect(user+"@"+server, pwd, connectArgs);
	} catch (e) {
		//alert("-debug infor:  Fail to connect to XCP server, " + e.message);
	}
}

function _subcallback(iqEle) {
	if (!iqEle || iqEle == null) {
		//alert("- debug info: Timeout! Failed to subscribe node: " + easNodeId);
	} else {
		//alert("- debug info: Subscription Response: " + iqEle.xml);
	}
}

function disposeClientCon() {
	//alert("- method called:  disposeClientCon()");
	client.event("beforeMessageReceived").unbind(_onBeforeMessagedReceived);
	client.event("clientStatusChanged").unbind(_onClientStatusChanged);
	jabberwerx.globalEvents.unbind("presenceReceived", _onPresenceReceived);
    client.event("presenceSent").unbind(_onPresenceSent);
    if (client.isConnected()) {
		client.disconnect();
	}
}

function keyDown(){
		  //alert("-debug keyDown");
          //jabberwerx.$('#title').css("color", "#99FFFF");
          //jabberwerx.$('#title').text("Currnet account: " + user+'@'+server + ", status: logged in");
          jabberwerx.$("#imageDiv").html("<img src=''/>");
}

//document.onkeydown = keyDown;
//document.onmousedown = keyDown;

jabberwerx.$(document).ready( function() {
	initClientCon();
});

jabberwerx.$(window).bind("unload", function() {
	disposeClientCon();
});
