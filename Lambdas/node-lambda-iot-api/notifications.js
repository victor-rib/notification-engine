var users = require('./users.js');
var shared = require('./shared.js');

module.exports = {
    getNotificationsByUser: async function (userid) {
        return new Promise(async function (resolve, reject) {
            console.log("getNotificationsByUser"); 
            let groupAndTypesList = await users.getGroupAndTypeListByUserId(userid);
            let notifications = [];
            for await (var item of groupAndTypesList){
                let notif = await shared.getAllNotificationsByTypeAndGroup(item.groupname, item.typename);
                notifications = notifications.concat(notif.Items);
            }
            return resolve(notifications);
        });
    },

    triggerNotificationCreator: async function () {
        return new Promise(async function (resolve, reject) {
            console.log("triggerNotificationCreator"); 
            await shared.triggerNotificationCreator();
            return resolve(true);
        });
    },

    deleteNotification: async function (deviceid, type) {
        return new Promise(async function (resolve, reject) {
            console.log("deleteNotificationById"); 
            await shared.deleteNotification(deviceid, type);
            return resolve(true);
        });
    }
};