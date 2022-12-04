// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;
const httpModule = require('azure-iot-provisioning-device-http');
const amqpModule = require('azure-iot-provisioning-device-amqp');
const mqttModule = require('azure-iot-provisioning-device-mqtt');

const dpsDeviceClientEndpoint = process.env.DPS_GLOBAL_DEVICE_ENDPOINT_INVALID_CERT;

const correctDisconnectMessage = function (err, done) {
  if (err) {
    if (err.amqpError && (err.amqpError.name === 'NotConnectedError')) {
      done();
    } else if (err.name && (err.name  === 'NotConnectedError')) {
      done();
    } else if (err.code && (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
      done();
    } else {
      done();
    }
  } else {
    done(new Error('client did NOT detect bad cert.'));
  }
};

describe('Invalid Certificate Validation', function () {
  const enrollment1 = {
    registrationId: 'first',
    attestation: {
      type: 'tpm',
      tpm: {
        endorsementKey: 'a'
      }
    }
  };
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should fail to create enrollment', function (done) {
    const dpsServiceClient = provisioningServiceClient.fromConnectionString(process.env.DPS_CONN_STRING_INVALID_CERT);
    dpsServiceClient.createOrUpdateIndividualEnrollment(enrollment1, function (err) {
      correctDisconnectMessage(err, done);
    });
  });
});

describe('DPS registration client', function () {
  const deviceCert = {
    cert: Buffer.from(process.env.IOTHUB_CA_ROOT_CERT, 'base64').toString('ascii'),
    key: Buffer.from(process.env.IOTHUB_CA_ROOT_CERT_KEY, 'base64').toString('ascii')
  };
  [
    httpModule.Http,
    amqpModule.Amqp,
    amqpModule.AmqpWs,
    mqttModule.Mqtt,
    mqttModule.MqttWs
  ].forEach(function (DeviceTransport) {
    describe('Over ' + DeviceTransport.name, function () {
      const X509Security = require('azure-iot-security-x509').X509Security;
      const ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
      // eslint-disable-next-line mocha/no-skipped-tests
      it.skip ('Should fail to register a device', function (done) {
        // eslint-disable-next-line no-invalid-this
        this.timeout(30000);
        const transport = new DeviceTransport();
        const securityClient = new X509Security('abcd', deviceCert);
        const deviceClient = ProvisioningDeviceClient.create(dpsDeviceClientEndpoint, 'scope', transport, securityClient);
        deviceClient.register(function (err) {
          correctDisconnectMessage(err, done);
        });
      });
    });
  });
});
