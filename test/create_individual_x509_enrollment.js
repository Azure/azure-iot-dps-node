// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';
const fs = require('fs');
const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;
const path = require('path');

const argv = require('yargs')
  .usage('Usage: $0 --deviceid <DEVICE ID> --connectionstring <DEVICE PROVISIONING CONNECTION STRING> ')
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
  .argv;

const deviceID = argv.deviceid;
const connectionString = argv.connectionstring;

const serviceClient = provisioningServiceClient.fromConnectionString(connectionString);

const certFile = path.join(__dirname, "cert", deviceID + "-cert.pem");


// eslint-disable-next-line security/detect-non-literal-fs-filename
if (!fs.existsSync(certFile)) {
  console.log('Certificate File not found:' + certFile);
  process.exit();
}

// eslint-disable-next-line security/detect-non-literal-fs-filename
const certificate = fs.readFileSync(certFile, 'utf-8').toString();

const enrollment = {
  registrationId: deviceID,
  deviceID: deviceID,
  attestation: {
    type: 'x509',
    x509: {
      clientCertificates: {
        primary: {
          certificate: certificate
        }
      }
    }
  }
};

serviceClient.createOrUpdateIndividualEnrollment(enrollment, function (err, enrollmentResponse) {
  if (err) {
    console.log('error creating the individual enrollment: ' + err);
  } else {
    console.log("enrollment record returned: " + JSON.stringify(enrollmentResponse, null, 2));
  }
});
