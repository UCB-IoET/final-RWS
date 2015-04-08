cordova.define("com.randdusing.bluetoothle.BluetoothLe", function(require, exports, module) { var bluetoothleName = "BluetoothLePlugin";
var bluetoothle = {
  initialize: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "initialize", [params]); 
  },
  enable: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "enable", []);
  },
  disable: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "disable", []);
  },
  startScan: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "startScan", [params]); 
  },
  stopScan: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "stopScan", []);
  },
  retrieveConnected: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "retrieveConnected", [params]);
  },
  connect: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "connect", [params]);
  },
  reconnect: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "reconnect", [params]);
  },
  disconnect: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "disconnect", [params]);
  },
  close: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "close", [params]);
  },
  discover: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "discover", [params]);
  },
  services: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "services", [params]);
  },
  characteristics: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "characteristics", [params]);
  },
  descriptors: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "descriptors", [params]);
  },
  read: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "read", [params]);
  },
  subscribe: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "subscribe", [params]);
  },
  unsubscribe: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "unsubscribe", [params]);
  },
  write: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "write", [params]);
  },
  readDescriptor: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "readDescriptor", [params]);
  },
  writeDescriptor: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "writeDescriptor", [params]);
  },
  rssi: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "rssi", [params]);
  },
  isInitialized: function(successCallback) {
    cordova.exec(successCallback, successCallback, bluetoothleName, "isInitialized", []);
  },
  isEnabled: function(successCallback) {
  	cordova.exec(successCallback, successCallback, bluetoothleName, "isEnabled", []);
  },
  isScanning: function(successCallback) {
    cordova.exec(successCallback, successCallback, bluetoothleName, "isScanning", []);
  },
  isConnected: function(successCallback, params) {
    cordova.exec(successCallback, successCallback, bluetoothleName, "isConnected", [params]);
  },
  isDiscovered: function(successCallback, params) {
    cordova.exec(successCallback, successCallback, bluetoothleName, "isDiscovered", [params]);
  },
  requestConnectionPriority: function(successCallback, errorCallback, params) {
    cordova.exec(successCallback, errorCallback, bluetoothleName, "requestConnectionPriority", [params]); 
  },
  encodedStringToBytes: function(string) {
    var data = atob(string);
    var bytes = new Uint8Array(data.length);
    for (var i = 0; i < bytes.length; i++)
    {
      bytes[i] = data.charCodeAt(i);
    }
    return bytes;
  },
  bytesToEncodedString: function(bytes) {
    return btoa(String.fromCharCode.apply(null, bytes));
  },
  stringToBytes: function(string) {
  	var bytes = new ArrayBuffer(string.length * 2);
		var bytesUint16 = new Uint16Array(bytes);
		for (var i = 0; i < string.length; i++) {
			bytesUint16[i] = string.charCodeAt(i);
		}
		return new Uint8Array(bytesUint16);
  },
  bytesToString: function(bytes) {
  	return String.fromCharCode.apply(null, new Uint16Array(bytes));
  }
}
module.exports = bluetoothle;
});
