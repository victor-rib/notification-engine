var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({region:'sa-east-1',accessKeyId: '', secretAccessKey: ''});

var transporter = nodemailer.createTransport(ses({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'sa-east-1' 
}));

var notifications = [];
var frequency = null;

exports.handler = async (event, context) => {
    console.log('Starting execution');
    frequency = event.body.frequency;
    let body = event.body;
    let statusCode = '200';
    const headers = {   'Content-Type': 'application/json'   };
    if(!frequency){
      statusCode = '400';
      console.log('Error - Empty frequency');
      return { statusCode, body, headers };
    }
    else{
      try {
        notifications = (await getAllUndeliveredNotifications())?.Items;
        console.log("Dispatching "+notifications?.length+" notifications to users");
        await sendNotifications();
        console.log("Updating Notification Status");
        await upsertNotifications();
        body = notifications;
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
      return { statusCode,  body,   headers  };
    }
};

async function sendNotifications(){
  return new Promise(async function (resolve, reject) {
    for await (var notif of notifications){
      for await (var subscription of notif.dispatchlist){
        let currentEl = subscription;
        if(currentEl.frequency == frequency && currentEl.channel == "email" && currentEl.status == "PENDING"){
          //Send Emails
          currentEl.status = "SENT";
          let statusSent =  await sendEmail(notif, currentEl.target);
         // console.log(statusSent);
        }
        else if(currentEl.frequency == frequency && currentEl.channel == "sms" && currentEl.status == "PENDING"){
          //SMS
          //notif[subscription].status == "SENT"
          //await sendSMS(notif);
        }
        else{
          // UNKNOWN CHANNELS
        }
      }
    }
    return resolve(notifications);
  });
}

async function sendEmail(notif, target){
  return new Promise(async function (resolve, reject) {
    return transporter.sendMail({
      from: 'test@hotmail.com',
      to: target,
      subject: notif.deviceid+" - " +notif.alerttype,
      html: '<p>A new notification related to '+notif.alerttype+' was created for '+notif.deviceid+' ('+notif.group+') at '+notif.lastupdatedtime+'</p>',
      attachments: []
    }
    , function(err, data) {
        if(err){ console.error(err); return reject(err);}
        else{ console.log("Email sent to "+ target); return resolve(data);}
    });
  });
}

function getAllUndeliveredNotifications(){
  return dynamo.scan({ 
   TableName: 'sensor-notifications',
   FilterExpression : '#stat = :val1',
   ExpressionAttributeValues : {
       ":val1" : "ADDRESSED"
   },
   ExpressionAttributeNames: {
     "#stat": "status"
   }
 }).promise(); 
}

async function upsertNotifications(){
  notifications = updateCompletelyDeliveredStatus();
  notifications = notifications.map(obj=> ({ ...obj, "lastupdatedtime": getDateFormatted(0)}))
  console.log("Updating "+notifications.length + " notification delivery status on DynamoDB ");
  if(notifications.length > 0 ){
    for await (const notif of notifications){
      const params = { TableName : 'sensor-notifications', Item: notif };
      await dynamo.put(params).promise();
      console.log(notif.deviceid+"-"+notif.alerttype+"- Alert Delivered!");
    }
  }
}

function updateCompletelyDeliveredStatus(){
  notifications.forEach( notif => {
    let allSent = notif.dispatchlist.filter( x => x.status == "PENDING");
    if(!allSent || allSent.length == 0){
      notif.status = "SENT";
      console.log("Completed Delivered! - "+notif.deviceid+"-"+notif.alerttype);
    }
  });
  return notifications;
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


