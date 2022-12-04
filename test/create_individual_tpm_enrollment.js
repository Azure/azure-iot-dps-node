// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;

const argv = require('yargs')
  .usage('Usage: $0 --endorsementkey <ENDORSEMENT KEY> --connectionstring <DEVICE PROVISIONING CONNECTION STRING> ')
  .option('endorsementKey', {
    alias: 'e',
    describe: 'Endorsement key for TPM',
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

const endorsementKey = argv.endorsementKey;
const connectionString = argv.connectionString;
const serviceClient = provisioningServiceClient.fromConnectionString(connectionString);

const enrollment = {
  registrationId: 'first',
  attestation: {
    type: 'tpm',
    tpm: {
      endorsementKey: endorsementKey
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
