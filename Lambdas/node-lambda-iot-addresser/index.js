const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({region:'sa-east-1',accessKeyId: '', secretAccessKey: ''});
var mysql = require('mysql');
var lambda = new AWS.Lambda({region:'sa-east-1',accessKeyId: '', secretAccessKey: ''});

var connection = mysql.createConnection({
      host     : 'notification-settings.cx4xnazbt2gv.sa-east-1.rds.amazonaws.com',
      user     : '',
      password : '',
      database : 'notificationsettings'
});

// Queries
const getSubscriptions = `
            select 
              u.email,
              u.phone,
              f.frequencyname ,
              c.channelname,
              dg.groupname ,
              a.typename 
            from subscription s 
            join users u on u.id = s.userid
            join frequency f on f.id = s.frequencyid
            join channels c on c.id = s.channelid
            join usertoalerts uta on uta.userid = u.id 
            join grouptotype gtt on gtt.id = uta.grouptotypeid 
            join devicegroups dg on dg.id = gtt.devicegroupid 
            join alerttypes a on a.id = gtt.alerttypeid 
`;

var newNotifications = [];
var subscriptions = [];
var hoursAgo = 720;


exports.handler = async (event, context) => {
    console.log('Starting execution');
    let body;
    let statusCode = '200';

    try {
      newNotifications = (await getAllUnaddressedNotifications())?.Items;
      console.log("Addressing new "+newNotifications?.length+" notifications");
      subscriptions = await queryMySQL(getSubscriptions);
      let addressedNotif = await addressNotifications();
      await upsertNotifications(addressedNotif);
      console.log("Triggering dispatch function");
      await triggerDispatcherFunction();
      body = addressedNotif;
    } 
    catch (err) {
        statusCode = '400';
        body = err.message;
        console.error(err);
    } 
    finally {
        body = JSON.stringify(body);
    }

    console.log("Finishing execution");
    const headers = {   'Content-Type': 'application/json'   };
    return {
        statusCode,
        body,
        headers,
    };
};

function addressNotifications(){
  newNotifications.forEach((notif => {
    console.log(notif);
    let subs = subscriptions.filter(x => x.typename == notif.alerttype && x.groupname == notif.group);
    let dispatch = subs.map(({channelname, frequencyname, email, phone  }) => ({frequency : frequencyname, channel: channelname, status: "PENDING", target : channelname == "email" ? email : phone }));
    notif['dispatchlist'] = dispatch;
  }));
  return newNotifications;
}

async function upsertNotifications(notifications){
  notifications = notifications.map(obj=> ({ ...obj, "status" : "ADDRESSED" , "lastupdatedtime": getDateFormatted(0)}))
  console.log("Updating "+notifications.length + " notifications on DynamoDB ");
  if(notifications.length > 0 ){
    for await (const notif of notifications){
      const params = { TableName : 'sensor-notifications', Item: notif };
      await dynamo.put(params).promise();
      console.log(notif.deviceid+"-"+notif.alerttype+"- Alert Created!");
    }
    //Backup para S3
     await putObjectToS3('notification-raw-backup-001',getDateFormatted(0), JSON.stringify(notifications));
  }
}

function putObjectToS3(bucket, fileName, data){
  return new Promise(function (resolve, reject) {
  var s3 = new AWS.S3();
      var parameters = {
          Bucket : bucket,
          Key : fileName,
          Body : data
      }
      s3.putObject(parameters, function(err, data) {
        if (err) {console.log(err, err.stack); return reject(err);} // an error occurred
        else   { console.log('S3 backup created'); return resolve(parameters);} // successful response
      });
  });
}  

function getAllUnaddressedNotifications(){
  return dynamo.scan({ 
    TableName: 'sensor-notifications',
    ProjectionExpression:"deviceid, alerttype, #grp",
    FilterExpression : '#time between :val1 and :val2 and attribute_not_exists(#stat) and attribute_not_exists(dispatchlist)',
   // FilterExpression : '#time between :val1 and :val2',
    ExpressionAttributeValues : {
        ":val1" : getDateFormatted(hoursAgo),
        ":val2" : getDateFormatted(0)
    },
    ExpressionAttributeNames: {
      "#time": "lastupdatedtime",
      "#stat": "status",
      "#grp" : "group"
    }
  }).promise(); 
}

function getDateFormatted(hoursAgo){
  var currentdate = new Date(); 
  currentdate.setHours(currentdate.getHours() - hoursAgo)
  return currentdate.getFullYear() + "-"  +(addLeadingZeros(currentdate.getMonth()+1))+"-"
          + addLeadingZeros(currentdate.getDate()) + " "
          + addLeadingZeros(currentdate.getHours()) + ":"  
          + addLeadingZeros(currentdate.getMinutes()) + ":" 
          + addLeadingZeros(currentdate.getSeconds());
}

function addLeadingZeros(number){
  return (number+'').length == 1 ? "0"+number : number;
}

function queryMySQL (q) {
  return new Promise(function (resolve, reject) {
        connection.query(q ,
            function(err, result) {
                if (!err) {
                    return resolve(result);
                } else {
                    console.error(err);
                    return reject(err);
                }
            });
  });
}


async function triggerDispatcherFunction(){
  return new Promise(async function (resolve, reject) {
    lambda.invoke({
      FunctionName: 'notifications-dispatch',
      Payload: JSON.stringify({"body":{"frequency":"onceanhour"}}, null, 2) // pass params
    }, function(error, data) {
      if (error) {
        console.error( error);
        return reject();
      }
      if(data.Payload){
        console.log("Addresser function triggered!");
        return resolve(data.Payload);
      }
    });
  });
}