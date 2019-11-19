var connected = false;
var services_discovered = false;
var selected_device;
var connected_server;
var dev_characteristics;
/* default bulb colour */
var def_red_val = "138";
var def_green_val = "28";
var def_blue_val = "239";

function setConnectedStatus(status) {
	connected = status;
	document.getElementById('status_connected').textContent = status;
	if (status == true) {
	document.getElementById('btn_scan').textContent = "Disconnect MagicBulb";
	} else {
	document.getElementById('btn_scan').textContent = "Discover MagicBulbs";
	}
}

function isBulbConnected() {
	var ret = document.getElementById('status_connected').textContent;

	return ret;
}

function setDiscoveryStatus(status) {
	services_discovered = status;
	document.getElementById('status_discovered').textContent = status;
}

function deviceDisconnect() {
	var data = new Uint8Array([0xcc, 0x24, 0x33]);
	dev_characteristics.writeValue(data)
	.then(function(){
		selected_device.gatt.disconnect();
		resetUI();
		resetUIColor()
	})
	.catch(error => {
		console.log('ERROR: ' + error);
	});

}

function resetUI() {
	setConnectedStatus(false);
	setDiscoveryStatus(false);
}
function discoverDevicesOrDisconnect() {
	document.body.style.backgroundColor = "#dbfaf8";
	console.log("discoverDevicesOrDisconnect");
	if (document.getElementById('btn_scan').textContent == "Disconnect MagicBulb") {
		deviceDisconnect();
	} else if (document.getElementById('btn_scan').textContent == "Discover MagicBulbs") {
		discoverDevices();
	}
}

function discoverDevices() {
	console.log("discoverDevices");

	/* Scan for a magic blue light service */
	navigator.bluetooth.requestDevice({
	  filters: [{ services: [0xffe5] }]
	})
	  .then(function(device) {
	    /* Connect to bulb */
	    selected_device = device;
		setDiscoveryStatus(true);
	    return device.gatt.connect();
	  })
	  .then(function(server) {
	    setConnectedStatus(true);
	    /* Get the Server info */
	    connected_server = server;
	    return server.getPrimaryService(0xffe5);
	  })
	  .then(function(service) {
	    /* Get the service Characteristic */
	    return service.getCharacteristic(0xffe9);
	  })
	  .then(function(characteristic) {
		var r = document.getElementById('valRed').textContent;
    	var g = document.getElementById('valGreen').textContent;
    	var b = document.getElementById('valBlue').textContent;
    	var data = new Uint8Array([0x56, parseInt(r, 10), parseInt(g, 10),
					parseInt(b, 10), 0x00, 0xf0, 0xaa]);
    	var dataStr = "#"+("0"+parseInt(r, 10).toString(16)).slice(-2)+
					  ("0"+parseInt(g, 10).toString(16)).slice(-2)+
					  ("0"+parseInt(b, 10).toString(16)).slice(-2);

	    dev_characteristics = characteristic;

	    /* Write to the service characteristic */
	    var data1 = new Uint8Array([0xcc, 0x23, 0x33]);

		dev_characteristics.writeValue(data1).then(()=>{
			document.getElementById('btn_bulb_on_off').value = "OFF";
			document.getElementById('btn_bulb_on_off').className= "off";
			changeBulbColorTo(dataStr);
		    return dev_characteristics.writeValue(data);
		},
		error => {
			console.log('ERROR: ' + error);
		});

	  })
	  .catch(function(error) {
	    console.error('Connection failed!', error);
	    setConnectedStatus(false);
	  });

}

function changeRed(value) {
    document.getElementById('valRed').textContent = value;
    changeAll();
}
function changeGreen(value) {
    document.getElementById('valGreen').textContent = value;
    changeAll();
}
function changeBlue(value) {
    document.getElementById('valBlue').textContent = value;
    changeAll();
}

function inputRed(value) {
    document.getElementById('valRed').textContent = value;
    inputChangeAll();
}
function inputGreen(value) {
    document.getElementById('valGreen').textContent = value;
    inputChangeAll();
}
function inputBlue(value) {
    document.getElementById('valBlue').textContent = value;
    inputChangeAll();
}

function inputChangeAll() {
    var r = document.getElementById('valRed').textContent;
    var g = document.getElementById('valGreen').textContent;
    var b = document.getElementById('valBlue').textContent;
    var dataStr = "#"+("0"+parseInt(r, 10).toString(16)).slice(-2)+
				("0"+parseInt(g, 10).toString(16)).slice(-2)+
				("0"+parseInt(b, 10).toString(16)).slice(-2);

    document.getElementById("bulb_clr_picker").value = dataStr;

}

function changeAll() {
    var r = document.getElementById('valRed').textContent;
    var g = document.getElementById('valGreen').textContent;
    var b = document.getElementById('valBlue').textContent;

    if (isBulbConnected() === 'true'){
	    var data = new Uint8Array([0x56, parseInt(r, 10), parseInt(g, 10),
					parseInt(b, 10), 0x00, 0xf0, 0xaa]);
    	var dataStr = "#"+("0"+parseInt(r, 10).toString(16)).slice(-2)+
					("0"+parseInt(g, 10).toString(16)).slice(-2)+
					("0"+parseInt(b, 10).toString(16)).slice(-2);

    	dev_characteristics.writeValue(data)
		.then(() => {
			document.getElementById("bulb_clr_picker").value = dataStr;
			changeBulbColorTo(dataStr);
		},
		error => {
			console.log('ERROR: ' + error);
		});

    }else{
		resetUIColor();
    }
}

function resetUIColor()
{
	var dataStr = "#"+("0"+parseInt(def_red_val, 10).toString(16)).slice(-2)+
				("0"+parseInt(def_green_val, 10).toString(16)).slice(-2)+
				("0"+parseInt(def_blue_val, 10).toString(16)).slice(-2);
	document.getElementById('valRed').textContent = def_red_val;
	document.getElementById('valGreen').textContent = def_green_val;
	document.getElementById('valBlue').textContent = def_blue_val;
	document.getElementById('slideRed').value= def_red_val;
	document.getElementById('slideGreen').value= def_green_val;
	document.getElementById('slideBlue').value= def_blue_val;
	document.getElementById('bulb_clr_picker').value = dataStr;
	changeBulbColorTo("#000000");
	document.getElementById('btn_bulb_on_off').value = "ON";
	document.getElementById('btn_bulb_on_off').className= "on";
	document.getElementById('btn_rnd_color').value = "ON";
	document.getElementById('btn_rnd_color').className= "on";
	document.getElementById("manual_color_edit").style.display="inline";

}

var E;
function prepare(){
	var S=document.getElementById("bulb_img");
	var SD=S.getSVGDocument();
	E=SD.getElementById('bulb_svg_path');
}

function changeBulbColorPicker()
{
	var v = document.getElementById('bulb_clr_picker').value;
	var r = parseInt(v.slice(1,3), 16);
    var g = parseInt(v.slice(3,5), 16);
    var b = parseInt(v.slice(5), 16);
	
	document.getElementById('valRed').textContent = r;
	document.getElementById('valGreen').textContent = g;
	document.getElementById('valBlue').textContent = b;
	document.getElementById('slideRed').value= r;
	document.getElementById('slideGreen').value= g;
	document.getElementById('slideBlue').value= b;
	changeAll();
}

function changeBulbColorTo(v)
{
	if(document.getElementById("btn_bulb_on_off").className == "off"){
		E.setAttribute("fill", v);
	}
}

function switchoff(item){
	document.getElementById(item).className = "off";
	document.getElementById(item).value="OFF";
}

function switchon(item){
	document.getElementById(item).className = "on";
	document.getElementById(item).value="ON";
}

function bulbOn(item){
	var data1 = new Uint8Array([0xcc, 0x23, 0x33]);
	var ret = "0";

	dev_characteristics.writeValue(data1).then(()=>{
		if(document.getElementById("btn_rnd_color").value == "ON"){
			changeAll();
			/* switch OFF should be in promise success, 
			 * else there will be race-conditions */
			switchoff(item);
		}else{
			bulbRandModeOn(document.getElementById("btn_rnd_color").id);
			/* switch OFF should be in promise success, 
			 * else there will be race-conditions */
			switchoff(item);
		}
	},
	error => {
		console.log('ERROR: ' + error);
		ret = "1";
	});

	return ret;
}

function bulbOff(item){
	var data1 = new Uint8Array([0xcc, 0x24, 0x33]);
	var ret = "0";

	dev_characteristics.writeValue(data1).then(()=>{
		changeBulbColorTo("#000000");
		/* switch ON should be in promise success, 
		 * else there will be race-conditions */
		switchon(item);
	},
	error => {
		console.log('ERROR: ' + error);
		ret = "1";
	});

	return ret;
}

function bulbRandModeOn(item){
	var ret = "0";

	if (document.getElementById("btn_bulb_on_off").value == "OFF"){
	    var data1 = new Uint8Array([0xbb, 0x25, 0x05, 0x44]);
		dev_characteristics.writeValue(data1).then(()=>{
			document.getElementById("manual_color_edit").style.display="none";
			changeBulbColorTo("#000000");
			switchoff(item);
		},
		error => {
			console.log('ERROR: ' + error);
			ret = "1";
		});
	}

	return ret;
}

function bulbRandModeOff(item){
	var ret = "0";

	document.getElementById("manual_color_edit").style.display="inline";
	switchon(item);
	
	if(document.getElementById("btn_bulb_on_off").value == "OFF"){
		changeAll();
	} else {
		bulbOff(document.getElementById("btn_bulb_on_off").id);
	}

	return ret;
}

function toggleState(item){
	if(item === "btn_bulb_on_off"){
			if(document.getElementById(item).className == "on"){
				bulbOn(item);
			}else{
				bulbOff(item);
			}
	}else if(item === "btn_rnd_color"){
			if(document.getElementById(item).className == "on"){
				bulbRandModeOn(item);
			}else{
				bulbRandModeOff(item);
			}
	}
}
