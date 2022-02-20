var notifications = require('./notifications.js');
var entity = require('./entity.js');
var shared = require('./shared.js');
var user = require('./users.js');

exports.handler = async (event) => {

    let queryStringParams= event.queryStringParameters;
    let response = [];
    let statusCode = '200';
    
    console.log('Received request!');

    let endpoint = event.path.replace(/\//g,'').replace('notifications-api','');
    let method = event.httpMethod;
    let body = event.body? JSON.parse(event.body) : null;
    console.log({"endpoint":endpoint, "method": method, "body":event.body});
    
    try{
      if(!endpoint){ throw "Empty endpoint in query string parameter!" }
      else if(endpoint == "notifications"){
        switch (method) {
          case 'GET':   
            const userid = queryStringParams.userid;
            if(!userid) { throw "Empty userid!" }
            response = await notifications.getNotificationsByUser(userid);
            console.log(response.length+" notifications retrieved");
            break;
          case 'POST':   
            response = await notifications.triggerNotificationCreator();
            console.log("Notification creator triggered!");
            break;
          case 'DELETE':
            const deviceid = queryStringParams.deviceid;
            const alerttype  = queryStringParams.alerttype;
            if(!deviceid || !alerttype) { throw "Missing deviceid or type!" }
            response = await notifications.deleteNotification(deviceid,alerttype);
            console.log("Notification deleted");
            break;
          case 'OPTIONS':  result = {'options': true};  break;
          default: throw new Error(`Unsupported method "${method}"`);
        }
      }
      else if (endpoint == "usersettings"){
        const usersettingstype = queryStringParams.usersettingstype;
        switch (method) {
          case 'GET':   
            const userid = queryStringParams.userid;
            const useremail = queryStringParams.useremail;
            if((!userid && !useremail) || !usersettingstype || !checkValueInList(usersettingstype, shared.usersettings_type_enum)) { throw "Invalid userid or usersettingstype!" }
            const useridentif = userid ? userid : useremail;
            response = await user.getUserSettingsByTypeAndUserId(usersettingstype, useridentif);
            console.log(response.length+" user settings retrieved");
            console.log(response);
            break;
          case 'POST':   
            if(!body || !usersettingstype || !checkValueInList(usersettingstype, shared.usersettings_type_enum)) { throw "Invalid userid or usersettingstype or body!" }
            response = await user.createUserSetting(usersettingstype, body);
            console.log("New user setting created");
            break;
          case 'DELETE':
            const usersettingstypeid = queryStringParams.usersettingstypeid;
            if(!usersettingstypeid || !usersettingstype ||!checkValueInList(usersettingstype, shared.usersettings_type_enum)) { throw "Missing usersettingstypeid or usersettingstype!" }
            response = await user.deleteUserSettingsByid(usersettingstype,usersettingstypeid);
            console.log(usersettingstype+ " deleted");
            break;
          case 'OPTIONS':  result = {'options': true};  break;
          default: throw new Error(`Unsupported method "${method}"`);
        }
      }
      else if (endpoint == "entity"){
        const entitytype = queryStringParams.entitytype;
        switch (method) {
          case 'GET':  
            if(!entitytype || !checkValueInList(entitytype, shared.entity_entitytype_enum)) { throw "Invalid entitytype!" }
            response = await entity.getAllByEntityType(entitytype);
            console.log(response.length+" entities retrieved");
            break;
          case 'POST':   
            if(!body || !entitytype || !checkValueInList(entitytype, shared.entity_entitytype_enum)) { throw "Invalid entitytype or body!" }
            await entity.createEntity(entitytype, body).then( result => response = result, err => {throw new Error(err)} );
            console.log("New entity created");
           break;
          case 'PUT':   
            if(!body || !body.id || !entitytype || !checkValueInList(entitytype, shared.entity_entitytype_enum)) { throw "Invalid entitytype or body or id!" }
            await entity.updateEntity(entitytype, body).then( result => response = result, err => {throw new Error(err)} );
            console.log("Entity updated");
            break;
          case 'DELETE':   
            const entityid = queryStringParams.entityid;
            if(!entityid || !entitytype || !checkValueInList(entitytype, shared.entity_entitytype_enum)) { throw "Invalid entitytype or id!" }
            await entity.deleteEntity(entitytype, entityid).then( result => response = result, err => {throw new Error(err)} );
            console.log("Entity deleted");
            break;
          case 'OPTIONS':  result = {'options': true};  break;
          default:
             throw new Error(`Unsupported method "${method}"`);
        }
      }
      else{
        throw "Invalid endpoint in query string parameter!" 
      }
    } 
    catch (err) {
        statusCode = '400';
        response = err.message;
        console.error(err);
    } 

    console.log("Finishing Execution");
    const headers = { 
      'Content-Type': 'application/json' ,
      "Access-Control-Allow-Credentials" : true,
      "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, x-api-key,Access-Control-Request-Method, Access-Control-Request-Headers",
      "Access-Control-Allow-Origin": "https://d1bv20otut5zed.cloudfront.net",
     // "Access-Control-Allow-Origin": 'http://localhost:4200',
      "Access-Control-Allow-Methods": "*"
    };
    const responseObj = {
        "statusCode": statusCode,
        "headers": headers,
        "body": JSON.stringify(response),
        "isBase64Encoded": false
    };
    
    console.log(response);
    return responseObj;
};


function checkValueInList(value, list){
  for(var i in list){
    if(list[i] == value){
      return true
    }
  }
  return false
}