var Service, Characteristic, LastUpdate;
var energenie = require("energenie");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerPlatform("homebridge-platform-energenie", "Energenie", EnergeniePlatform);
}

function EnergeniePlatform(log, config) {
    var self = this;
    self.config = config;
    self.log = log;
}
EnergeniePlatform.prototype.accessories = function(callback) {
    var self = this;
    self.accessories = [];
    self.config.switches.forEach(function(sw) {
        self.accessories.push(new EnergenieAccessory(sw, self.log, self.config));
    });
    callback(self.accessories);
}

function EnergenieAccessory(sw, log, config) {
    var self = this;
    self.name = sw.name;
    self.sw = sw;
    self.log = log;
    self.config = config;
    self.currentState = false;

    self.service = new Service.Switch(self.name);

    self.service.getCharacteristic(Characteristic.On).value = self.currentState;

    self.service.getCharacteristic(Characteristic.On).on('get', function(cb) {
        cb(null, self.currentState);
    }.bind(self));

    self.service.getCharacteristic(Characteristic.On).on('set', function(state, cb) {
        self.currentState = state;
        if(self.currentState) {
          if(self.sw.on.command === "on") energenie.switchOn(self.sw.on.socket)
          else energenie.switchOf(self.sw.on.socket);
        } else {
          if(self.sw.off.command === "on") energenie.switchOn(self.sw.off.socket)
          else energenie.switchOf(self.sw.on.socket);
        }
        cb(null);
    }.bind(self));
}
EnergenieAccessory.prototype.getServices = function() {
    var self = this;
    var services = [];
    var service = new Service.AccessoryInformation();
    service.setCharacteristic(Characteristic.Name, self.name)
        .setCharacteristic(Characteristic.Manufacturer, 'Raspberry Pi')
        .setCharacteristic(Characteristic.Model, 'Raspberry Pi')
        .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi')
        .setCharacteristic(Characteristic.FirmwareRevision, '1.0.0')
        .setCharacteristic(Characteristic.HardwareRevision, '1.0.0');
    services.push(service);
    services.push(self.service);
    return services;
}
