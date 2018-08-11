/* define Parameters **************************************************************/
// BLEデバイス名接頭句 1
const DEVICE_NAME_PREFIX = 'BBC micro:bit'
// micro:bit BLE IO Pin UUID
const IOPINSERVICE_SERVICE_UUID = 'e95d127b-251d-470a-a062-fa1922dfa9a8'
const PINDATA_CHARACTERISTIC_UUID = 'e95d8d00-251d-470a-a062-fa1922dfa9a8'
const PINADCONFIGURATION_CHARACTERISTIC_UUID = 'e95d5899-251d-470a-a062-fa1922dfa9a8'
const PINIOCONFIGURATION_CHARACTERISTIC_UUID = 'e95db9fe-251d-470a-a062-fa1922dfa9a8'

// Messages
const MSG_CONNECTED = 'Connected!!'
const MSG_CONNECT_ERROR = 'Failed to Conect'
const MSG_DISCONNECTED = 'Disconnected'
/*********************************************************************************/

var ioPinDataCharacteristic = null;
var connectDevice = null;

// disconnect process
function disconnect () {
	if (!connectDevice)
		return
	connectDevice.gatt.disconnect()
	connectDevice = null;
	chosenIoPinService = null;
	alert(MSG_DISCONNECTED)
}

function connect() {
	navigator.bluetooth.requestDevice({
		filters: [{
			namePrefix: DEVICE_NAME_PREFIX
		}]
	})
	.then(device => {
		connectDevice = device
		return device.gatt.connect()
	.then(server => {
		return server.getPrimaryService(IOPINSERVICE_SERVICE_UUID)
	.then(service => {
		service.getCharacteristic(PINADCONFIGURATION_CHARACTERISTIC_UUID)
			.then(setPinAdConfiguration)
		service.getCharacteristic(PINIOCONFIGURATION_CHARACTERISTIC_UUID)
			.then(setPinIoConfiguration)
		service.getCharacteristic(PINDATA_CHARACTERISTIC_UUID)
			.then(startService)
	})
	.catch(error => {
		console.log(error)
		alert(error)
	})
}

function setPinAdConfiguration(characteristic) {
	alert("set AD");
	characteristic.writeValue(new Uint32Array([0x02])) // Configure pin 0 Digital, pin 1 Analog
	.catch(error => {
		alert(error);
	});
}
function setPinIoConfiguration(characteristic) {
	alert("set IO");
	characteristic.writeValue(new Uint32Array([0x02])) //   pin 0 Output, pin 1 Input
	.catch(error => {
		alert(error);
	});
}

var valueCallback = null;
function setValueCallback(cb) {
	valueCallback = cb;
}
// 973 243 2.82 v
// 500 126 1.51 v
function handleCharacteristicValueChanged(event) {
	let value = event.target.value.getUint8(1);
	//let v2 = int(value * 4 * 0.03) * 10
	//console.log(value);
	document.js.x.value = value; //v2 / 100;
	//document.js.y.value = event.target.value.getUint8(0);
	if (valueCallback) {
		valueCallback(value);
	}
}
	 
// start service event
function startService (characteristic) {
	alert("start");
	characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

	alert("start2");
	ioPinDataCharacteristic = characteristic;
	ioPinDataCharacteristic.writeValue(new Uint8Array([0x00, 0x00]))
	.catch(error => {
		alert(error);
	});
}

function ledOn() {
	if (ioPinDataCharacteristic == null) {
		return;
	}
	ioPinDataCharacteristic.writeValue(new Uint8Array([0x00, 0x01]))
	.catch(error => {
		alert(error);
	});
}

function ledOff() {
	if (ioPinDataCharacteristic == null) {
		return;
	}
	ioPinDataCharacteristic.writeValue(new Uint8Array([0x00, 0x00]))
	.catch(error => {
		alert(error);
	});
}

