var shared = require('./shared.js');

module.exports = {
    getGroupAndTypeListByUserId: async function (userid) {
        return new Promise(async function (resolve, reject) {
            const getGroupsAndTypes = `
            select 
              uta.id as usertoalertsid,
              u.username,
              dg.groupname ,
              a.typename 
            from usertoalerts uta
            join grouptotype gtt on gtt.id = uta.grouptotypeid 
            join devicegroups dg on dg.id = gtt.devicegroupid 
            join alerttypes a on a.id = gtt.alerttypeid 
            join users u on u.id = uta.userid
            where uta.userid = `+userid + ";";
            return resolve(await shared.queryMySQL(getGroupsAndTypes));
        });
    },

    createUserSetting: async function (type, body) {
        return new Promise(async function (resolve, reject) {
            if(type == shared.usersettings_type_enum["subscription"]){
                if(!body.userid || !body.channelid || !body.frequencyid){  throw "Invalid channelid, frequencyid or userid"; }
                let query =  " insert into subscription (userid , channelid, frequencyid) values ("+body.userid+","+body.channelid+","+body.frequencyid+") ";
                return resolve(await shared.queryMySQL(query));
            }
            else if(type == shared.usersettings_type_enum["usertoalert"]){
                if(!body.userid || !body.grouptotypeid){  throw "Invalid userid or grouptotypeid provided"; }
                let query =  " insert into usertoalerts (userid , grouptotypeid) values ("+body.userid+","+body.grouptotypeid+") ";
                return resolve(await shared.queryMySQL(query));
            }
            else{
                throw "Invalid user settings type";
            }
        });
    },

    deleteUserSettingsByid: async function (type,id){
        return new Promise(async function (resolve, reject) {
            if(type == shared.usersettings_type_enum["subscription"]){
                let query =  " delete from subscription where id = "+id;
                return resolve(await shared.queryMySQL(query));
            }
            else if(type == shared.usersettings_type_enum["usertoalert"]){
                let query =  " delete from usertoalerts where id = "+id;
                return resolve(await shared.queryMySQL(query));
            }
            else{
                throw "Invalid user settings type";
            }
        });
    },

    getUserSettingsByTypeAndUserId: async function (type, useridentif) {
        return new Promise(async function (resolve, reject) {
            if(type == shared.usersettings_type_enum["usertoalert"]){
                return resolve(await module.exports.getGroupAndTypeListByUserId(useridentif));
            }
            else if(type == shared.usersettings_type_enum["subscription"]){
                let query =  `
                            select 
                            s.id as subscriptionid,
                            u.username,
                            f.frequencyname,
                            c.channelname
                            from subscription s 
                            join frequency f on f.id = s.frequencyid
                            join channels c on c.id = s.channelid
                            join users u on u.id = s.userid
                            where s.userid = `+useridentif;
                return resolve(await shared.queryMySQL(query));
            }
            else if (type == shared.usersettings_type_enum["authentication"]){
                let query =  " select id, isadmin from users where email = '"+useridentif+"'";
                return resolve(await shared.queryMySQL(query));
            }
            else{
                throw "Invalid user settings type";
            }
        });
    },
};