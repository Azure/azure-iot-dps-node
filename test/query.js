// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

const provisioningServiceClient = require('azure-iot-provisioning-service').ProvisioningServiceClient;

const argv = require('yargs')
  .usage('Usage: $0 --connectionString <DEVICE PROVISIONING CONNECTION STRING> ')
  .option('connectionString', {
    alias: 'c',
    describe: 'The connection string for the Device Provisioning instance',
    type: 'string',
    demandOption: true
  })
  .argv;

const connectionString = argv.connectionString;
const serviceClient = provisioningServiceClient.fromConnectionString(connectionString);

const queryForEnrollments = serviceClient.createIndividualEnrollmentQuery({
  "query": "*"
}, 10);
const queryForEnrollmentGroups = serviceClient.createEnrollmentGroupQuery({
  "query": "*"
}, 10);

const onEnrollmentResults = function (err, results) {
  if (err) {
    console.error('Failed to fetch the results: ' + err.message);
  } else {
    // Do something with the results
    results.forEach(function (enrollment) {
      console.log(JSON.stringify(enrollment, null, 2));
    });

    if (queryForEnrollments.hasMoreResults) {
      queryForEnrollments.next(onEnrollmentResults);
    } else {
      console.log('Querying for the Enrollment Groups');
      queryForEnrollmentGroups.next(onEnrollmentGroupResults);
    }
  }
};

const onEnrollmentGroupResults = function (err, results) {
  if (err) {
    console.error('Failed to fetch the results: ' + err.message);
  } else {
    // Do something with the results
    results.forEach(function (enrollmentGroup) {
      console.log(JSON.stringify(enrollmentGroup, null, 2));
      let alreadyPrintedSomeDeviceRegistrations = false;
      const queryForDeviceRegistrationState = serviceClient.createEnrollmentGroupDeviceRegistrationStateQuery({
        "query": "*"
      }, enrollmentGroup.enrollmentGroupId, 10);
      const onDeviceRegistrationStateResults = function (err, results) {
        if (err) {
          console.error('Failed to fetch the results: ' + err.message);
        } else {
          // Do something with the results
          results.forEach(function (deviceRegistrationState) {
            if (!alreadyPrintedSomeDeviceRegistrations) {
              alreadyPrintedSomeDeviceRegistrations = true;
              console.log('For ' + enrollmentGroup.enrollmentGroupId + ', all of its the Device Registrations Status objects: ');
            }
            console.log(JSON.stringify(deviceRegistrationState, null, 2));
          });
          if (queryForDeviceRegistrationState.hasMoreResults) {
            queryForDeviceRegistrationState.next(onDeviceRegistrationStateResults);
          }
        }
      };
      queryForDeviceRegistrationState.next(onDeviceRegistrationStateResults);
    });

    if (queryForEnrollmentGroups.hasMoreResults) {
      queryForEnrollmentGroups.next(onEnrollmentGroupResults);
    }
  }
};


console.log('Querying for the enrollments: ');
queryForEnrollments.next(onEnrollmentResults);
