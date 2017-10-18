const AWS = require("aws-sdk");
var DynamoRestore = require('dynamo-backup-to-s3').Restore;

// setting the region like this throws a wrong
// authorization mechanism error
// AWS.config.update({ region: "eu-central-1" });

const jobs = [
    {
        // This file may not have a backslash in it!
        source: 's3://rapquiz-backups/some-data-rapquiz.artists.json',
        table: 'rapquiz.artists',
        partitionkey: 'name',
    },
    {
        // This file may not have a backslash in it!
        source: 's3://rapquiz-backups/some-data-rapquiz.lines.json',
        table: 'rapquiz.lines',
        partitionkey: 'id',
    }
]

jobs.forEach(job => {
    const restore = new DynamoRestore(Object.assign({}, job, {
        overwrite: true,
        concurrency: .5, // for large restores use 1 unit per MB as a rule of thumb (ie 1000 for 1GB restore)
        // these are automatically infered from aws-sdk
        // awsAccessKey: AWS.config.accessKeyId,
        // awsSecretKey: AWS.config.secretAccessKey,
        awsRegion: 'eu-central-1',
    }));

    restore.on('error', function(message) {
        console.log(message);
        process.exit(-1);
    });

    restore.on('warning', function(message) {
        console.log(message);
    });

    restore.on('send-batch', function(batches, requests, streamMeta) {
        console.log('Batch sent. %d in flight. %d Mb remaining to download...', requests, streamMeta.RemainingLength / (1024 * 1024));
    });

    restore.run(function() {
        console.log('Finished restoring DynamoDB table');
    });
})