// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';
const fs = require('fs');

const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;

const argv = require('yargs')
  .usage('Usage: $0 --connectionstring <DEVICE PROVISIONING CONNECTION STRING> --certificate <PATH TO CERTIFICATE> ')
  .option('connectionstring', {
    alias: 'c',
    describe: 'The connection string for the Device Provisioning instance',
    type: 'string',
    demandOption: true
  })
  .option('certificate', {
    alias: 'ce',
    describe: 'certificated used for group enrollment',
    type: 'string',
    demandOption: true
  })
  .argv;

const connectionString = argv.connectionString;
const certificate = argv.certificate;
const serviceClient = provisioningServiceClient.fromConnectionString(connectionString);

const enrollment = {
  enrollmentGroupId: 'first',
  attestation: {
    type: 'x509',
    x509: {
      signingCertificates: {
        primary: {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          certificate: fs.readFileSync(certificate, 'utf-8').toString()
        }
      }
    }
  },
  provisioningStatus: 'disabled'
};

serviceClient.createOrUpdateEnrollmentGroup(enrollment, function (err, enrollmentResponse) {
  if (err) {
    console.log('error creating the group enrollment: ' + err);
  } else {
    console.log("enrollment record returned: " + JSON.stringify(enrollmentResponse, null, 2));
    enrollmentResponse.provisioningStatus = 'enabled';
    serviceClient.createOrUpdateEnrollmentGroup(enrollmentResponse, function (err, enrollmentResponse) {
      if (err) {
        console.log('error updating the group enrollment: ' + err);
      } else {
        console.log("updated enrollment record returned: " + JSON.stringify(enrollmentResponse, null, 2));
      }
    });
  }
});
