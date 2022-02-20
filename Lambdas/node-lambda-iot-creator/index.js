const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'sa-east-1', accessKeyId: '', secretAccessKey: '' });
var mysql = require('mysql');
var lambda = new AWS.Lambda({ region: 'sa-east-1', accessKeyId: '', secretAccessKey: '' });

var connection = mysql.createConnection({
  host: 'notification-settings.cx4xnazbt2gv.sa-east-1.rds.amazonaws.com',
  user: '',
  password: '',
  database: 'notificationsettings'
});

var newMeasures = null;
var hoursAgo = 720;
const getAlertTypesByGroup = "select typename, rules, al.description, JSON_ARRAYAGG(gr.groupname) as groupnames from alerttypes al join grouptotype gtt on gtt.alerttypeid = al.id join devicegroups gr on gr.id = gtt.devicegroupid group by al.typename, al.rules, al.description";


exports.handler = async (event, context) => {
  console.log('Starting execution');
  let body;
  let statusCode = '200';

  try {
    newMeasures = await getAllUnotifiedNewMeasures(),
      alertTypes = await queryMySQL(getAlertTypesByGroup);
    console.log(newMeasures.Items.length + " new measures to be processed");
    let newAlerts = await createNotifications(newMeasures, alertTypes);
    await upsertNotifications(newAlerts);
    await triggerAddresserFunction();
    body = newAlerts;
  }
  catch (err) {
    statusCode = '400';
    body = err.message;
    console.error(err);
  }
  finally {
    body = JSON.stringify(body);
  }

  const headers = { 'Content-Type': 'application/json' };
  console.log("Finishing execution");
  return {
    statusCode,
    body,
    headers,
  };
};

function limitMeasuresByGroup(objectArray, key, limit) {
  let keys = objectArray.map(x => x[key]);
  let output = [];
  keys.forEach(device => {
    const filtered = objectArray.filter(x => x.deviceid == device);
    if (filtered.length > limit) {
      let orderedData = filtered.sort((a, b) => (a.timestamp > b.timestamp) ? -1 : 1).slice(0, limit);
      output = output.concat(orderedData);
    }
    else {
      output = output.concat(filtered);
    }
  });
  return output;
}

function averageGroupBy(objectArray, key, averagePropertyName, limit) {
  // Calculate the sums and group data (while tracking count)  
  let limitedArray = limitMeasuresByGroup(objectArray, key, limit);
  const reduced = limitedArray.reduce(function (m, d) {
    if (!m[d[key]]) {
      d.count = 1
      m[d[key]] = JSON.parse(JSON.stringify(d));
      return m;
    }
    m[d[key]][averagePropertyName] += d[averagePropertyName];
    m[d[key]].count += 1;
    return m;
  }, {});


  // Create new array from grouped data and compute the average
  return Object.keys(reduced).map(function (k) {
    const item = reduced[k];
    let response = {};
    response[key] = item[key];
    response.group = item.group;
    response.provider = item.provider;
    //response[averagePropertyName] =  parseFloat(item[averagePropertyName]/item.count).toFixed(2);
    response[averagePropertyName] = item[averagePropertyName] / item.count;
    return response;
  });
}

function createNotifications(NewMeasures, AlertTypes) {
  return new Promise(function (resolve, reject) {
    let newAlerts = [];
    for (var type in AlertTypes) {
      console.log(" Processing " + AlertTypes[type].typename);
      const rules = JSON.parse(AlertTypes[type].rules);
      measuresCopy = JSON.parse(JSON.stringify(NewMeasures.Items));
      let filteredMeasures = measuresCopy.filter(x => x.group && AlertTypes[type].groupnames.includes(x.group));
      let deviceAverageMeasures = averageGroupBy(filteredMeasures, 'deviceid', rules.propertyFiltered, rules.averageamount);
      let alerts = [];
      if (rules && rules.type == "between") {
        alerts = checkBaselines(rules, deviceAverageMeasures, rules.propertyFiltered);
      }
      else if (rules && rules.type == "count-equals") {
        alerts = checkEqualsZero(rules, deviceAverageMeasures, rules.propertyFiltered);
      }
      //alerts = alerts.map(obj=> ({ ...obj, "alerttype" : alertTypes[type].typename ,"timestamp":getDateFormatted(0), "lastupdatedtime": getDateFormatted(0)}))
      alerts = alerts.map(obj => { obj["alerttype"] = AlertTypes[type].typename; obj["timestamp"] = getDateFormatted(0); obj["lastupdatedtime"] = getDateFormatted(0); return obj });
      console.log("Adding " + alerts.length + " new alerts - " + AlertTypes[type].typename);
      newAlerts = newAlerts.concat(alerts);
    }
    // console.log(newAlerts);
    return resolve(newAlerts);
  });
}

async function upsertNotifications(notifications) {
  return new Promise(async function (resolve, reject) {
    console.log("Creating "+notifications.length + " new notifications on DynamoDB ");
    if(notifications.length > 0 ){
      for await (const notif of notifications){
        const params = { TableName : 'sensor-notifications', Item: notif };
        await dynamo.put(params).promise();
        console.log(notif.deviceid+"-"+notif.alerttype+"- Alert Created!");
      }
    }
    return resolve(notifications);
  });
}

function checkEqualsZero(rules, data, propertyKey) {
  let output = [];
  data.forEach(device => {
    if (device.deviceid && device[propertyKey] == rules.equalsto) {
      output.push(device);
    }
  });
  return output;
}

function checkBaselines(rules, data, propertyKey) {
  let output = [];
  data.forEach(device => {
    if (device.deviceid && (device[propertyKey] >= rules.lowerLimit && device[propertyKey] <= rules.upperLimit)) {
      output.push(device);
      console.log(device);
    }
  });
  return output;
}

function getAllUnotifiedNewMeasures() {
  return dynamo.scan({
    TableName: 'sensor-data',
    //KeyConditionExpression : 'yearkey = :hkey and title = :rkey',
    FilterExpression: '#time between :val1 and :val2',
    ExpressionAttributeValues: {
      ":val1": getDateFormatted(hoursAgo),
      ":val2": getDateFormatted(0)
    },
    ExpressionAttributeNames: {
      "#time": "timestamp"
    }
  }).promise();
}

function getDateFormatted(hoursAgo) {
  var currentdate = new Date();
  currentdate.setHours(currentdate.getHours() - hoursAgo);
  return currentdate.getFullYear() + "-" + (addLeadingZeros(currentdate.getMonth() + 1)) + "-"
    + addLeadingZeros(currentdate.getDate()) + " "
    + addLeadingZeros(currentdate.getHours()) + ":"
    + addLeadingZeros(currentdate.getMinutes()) + ":"
    + addLeadingZeros(currentdate.getSeconds());
}

function addLeadingZeros(number) {
  return (number + '').length == 1 ? "0" + number : number;
}

function queryMySQL(q) {
  return new Promise(function (resolve, reject) {
    connection.query(q,
      function (err, result) {
        if (!err) {
          return resolve(result);
        } else {
          console.error(err);
          return reject(err);
        }
      });
  });
}

async function triggerAddresserFunction() {
  return new Promise(async function (resolve, reject) {
    lambda.invoke({
      FunctionName: 'notifications-addresser',
      Payload: JSON.stringify({}, null, 2) // pass params
    }, function (error, data) {
      if (error) {
        console.error(error);
        return reject();
      }
      if (data.Payload) {
        console.log("Addresser function triggered!");
        return resolve(data.Payload);
      }
    });
  });
}