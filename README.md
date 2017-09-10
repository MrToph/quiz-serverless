## Development
### Invoke the function
* Create: `serverless webpack invoke --function create --path mocks/create-event.json`
* Get: `serverless webpack invoke --function get --path mocks/get-event.json`
* List: `serverless webpack invoke --function list --path mocks/list-event.json`
* Update: `serverless webpack invoke --function update --path mocks/update-event.json`
* Delete `serverless webpack invoke --function delete --path mocks/delete-event.json`

### Artists
* Create: `serverless webpack invoke --function artists-create --path mocks/artists/create-event.json`
* Get One: `serverless webpack invoke --function artists-get --path mocks/artists/get-event.json`
* Get All: `serverless webpack invoke --function artists-getAll`
* Update: `serverless webpack invoke --function artists-update --path mocks/artists/update-event.json`
* Delete: `serverless webpack invoke --function artists-delete --path mocks/artists/delete-event.json`
* Build Index: `serverless webpack invoke --function artists-createIndexes`

### Lines
* Create: `serverless webpack invoke --function artists-create --path mocks/artists/create-event.json`
* Get One: `serverless webpack invoke --function artists-get --path mocks/artists/get-event.json`
* Get All: `serverless webpack invoke --function artists-getAll`
* Update: `serverless webpack invoke --function artists-update --path mocks/artists/update-event.json`
* Delete: `serverless webpack invoke --function artists-delete --path mocks/artists/delete-event.json`
* Build Index: `serverless webpack invoke --function artists-createIndexes`


### Data Model
* https://aws.amazon.com/de/dynamodb/pricing/
* Lines has a `order` field that is sequential. Can I find out maxOrder easily? Can then _scan_ and condition by [0,...,naxOrder] randomly. Will be really costly https://stackoverflow.com/questions/31534624/read-capacity-cost-of-a-dynamodb-table-scan
* Better make order an index (?) but cannot update key attribute, need to fill in blanks.
* http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.AtomicCounters
* 3. Keep a list of primary keys that can easily be queried. It gets updated on insert/delete
* 4. The list of primary keys is kept only locally in the API endpoint. It does one scan when it initially starts to get all primary keys. Then updates its key list on insert/delete. But can't keep consistent key list in serverless framework? https://github.com/trek10inc/lambda-local-cache/issues
5. * DynamoDB: 1 RCU = Read 4KB (8KB) per second

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "mobileanalytics:PutEvents",
        "cognito-sync:*",
        "cognito-identity:*"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "execute-api:Invoke"
      ],
      "Resource": [
        "arn:aws:execute-api:eu-central-1:*:9dfnc73cv0/*"
      ]
    }
  ]
}