const AWS = require("aws-sdk");
var DynamoBackup = require('dynamo-backup-to-s3');

// setting the region like this throws a wrong
// authorization mechanism error
// AWS.config.update({ region: "eu-central-1" });

var backup = new DynamoBackup({
    includedTables: ['rapquiz.artists', 'rapquiz.lines'],
    readPercentage: .5,
    bucket: 'rapquiz-backups',
    stopOnFailure: true,
    base64Binary: true,
    // these are automatically infered from aws-sdk
    // awsAccessKey: AWS.config.accessKeyId,
    // awsSecretKey: AWS.config.secretAccessKey,
    awsRegion: 'eu-central-1',
});

backup.on('error', function(data) {
    console.log('Error backing up ' + data.table);
    console.log(data.err);
});

backup.on('start-backup', function(tableName, startTime) {
    console.log('Starting to copy table ' + tableName);
});

backup.on('end-backup', function(tableName, backupDuration) {
    // backupDuration is a moment-range object
    console.log(`Done copying table "${tableName}" in ${backupDuration.valueOf() / 1000} seconds`);
});

backup.backupAllTables(function() {
    console.log('Finished backing up DynamoDB');
});
