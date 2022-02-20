const AWS = require('aws-sdk');
var mysql = require('mysql');
const dynamo = new AWS.DynamoDB.DocumentClient({region:'sa-east-1',accessKeyId: '', secretAccessKey: ''});
var lambda = new AWS.Lambda({region:'sa-east-1',accessKeyId: '', secretAccessKey: ''});

var connection = mysql.createConnection({
      host     : 'notification-settings.cx4xnazbt2gv.sa-east-1.rds.amazonaws.com',
      user     : '',
      password : '',
      database : 'notificationsettings'
});

module.exports = {
  usersettings_type_enum : {"subscription":"1", "usertoalert":"2", "authentication":"3"},
  entity_entitytype_enum : {"users":"1", "alerttypes":"2", "devicegroups":"3","channel":"4", "frequency":"5", "grouptotype":"6"},
  triggerNotificationCreator : async function (){
    return new Promise(async function (resolve, reject) {
      lambda.invoke({
        FunctionName: 'notifications-creator',
        Payload: JSON.stringify({"body":{"test":"test"}}, null, 2) // pass params
      }, function(error, data) {
        if (error) {
          console.error( error);
          return reject();
        }
        if(data.Payload){
          console.log("Creator function triggered!");
          return resolve(data.Payload);
        }
      });
    });
  },
  queryMySQL : async function (query) {
    console.log(query);
    return new Promise(async function (resolve, reject) {
          connection.query(query ,
              function(err, result) {
                  if (!err) {
                      console.log(result.length+" results from sql query")
                      return resolve(result);
                  } else {
                      console.error(err);
                      return reject(err);
                  }
              });
    });
  },
  getAllNotificationsByTypeAndGroup : async function (group, type) {
    return dynamo.scan({ 
      TableName: 'sensor-notifications',
      FilterExpression : '#grp =:val1 and #tp =:val2',
      ExpressionAttributeValues : {
          ":val1" : group,
          ":val2" : type
      },
      ExpressionAttributeNames: {
        "#tp": "alerttype",
        "#grp" : "group"
      }
    }).promise(); 
  },
  deleteNotification : async function (deviceid, type){
    return new Promise(async function (resolve, reject) {
      console.log("Creating backup for notification");
      let notif = await getNotificationByDeviceIdAndType (deviceid, type);
      if(!notif.Items){ throw "Unable to find notification"};
      await putObjectToS3('notification-raw-backup-001',"DELETED-"+getDateFormatted(0), JSON.stringify(notif.Items));
      
      console.log("Deleting from database");
      const params = { TableName : 'sensor-notifications', "Key": {"deviceid":deviceid, "alerttype":type} };
      await dynamo.delete(params).promise();
      console.log(notif.deviceid+"-"+notif.alerttype+"- Notification Deleted!");
      return resolve(true);
    });
  }
  
  
};

async function getNotificationByDeviceIdAndType (deviceid, type){
  return dynamo.scan({ 
    TableName: 'sensor-notifications',
    FilterExpression : 'deviceid =:val1 and #tp =:val2',
    ExpressionAttributeValues : {
        ":val1" : deviceid,
        ":val2" : type
    },
    ExpressionAttributeNames: {
      "#tp": "alerttype"
    }
  }).promise(); 
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
