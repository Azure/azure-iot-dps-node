// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';
const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;

const argv = require('yargs')
  .usage('Usage: $0 --deviceid <DEVICE ID> --connectionstring <DEVICE PROVISIONING CONNECTION STRING> --webhookurl <URL OF THE AZURE FUNCTION>')
  .option('deviceid', {
    alias: 'd',
    describe: 'Unique identifier for the device that shall be created',
    type: 'string',
    demandOption: true
  })
  .option('connectionstring', {
    alias: 'c',
    describe: 'The connection string for the Device Provisioning instance',
    type: 'string',
    demandOption: true
  })
  .option('webhookurl', {
    alias: 'w',
    describe: 'web url of the azure function',
    type: 'string',
    demandOption: true
  })
  .argv;

const deviceID = argv.deviceid;
const connectionString = argv.connectionstring;
const webHookUrl = argv.webhookurl;

const serviceClient = provisioningServiceClient.fromConnectionString(connectionString);

const enrollment = {
  registrationId: deviceID,
  deviceID: deviceID,
  attestation: {
    type: 'symmetricKey'
  },
  provisioningStatus: 'enabled',
  allocationPolicy: 'custom',
  customAllocationDefinition: {
    webhookUrl: webHookUrl,
    apiVersion: '2019-03-31'
  }
};

serviceClient.createOrUpdateIndividualEnrollment(enrollment, function (err, enrollmentResponse) {
  if (err) {
    console.log('error creating the individual enrollment: ' + err);
  } else {
    console.log("enrollment record returned: " + JSON.stringify(enrollmentResponse, null, 2));
  }
});
