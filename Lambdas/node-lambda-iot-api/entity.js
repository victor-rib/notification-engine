var shared = require('./shared.js');

module.exports = {
    getAllByEntityType: async function (entitytype) {
        return new Promise(async function (resolve, reject) {
            let query = 'select * from ';
            switch (entitytype){
                case shared.entity_entitytype_enum["users"] : query += 'users'; break;
                case shared.entity_entitytype_enum["alerttypes"] : query += 'alerttypes'; break;
                case shared.entity_entitytype_enum["devicegroups"] : query += 'devicegroups'; break;
                case shared.entity_entitytype_enum["channel"] : query += 'channels'; break;
                case shared.entity_entitytype_enum["frequency"] : query += 'frequency'; break;
                case shared.entity_entitytype_enum["grouptotype"] : 
                query = "select gtt.id as id, concat(d.groupname,' - ',a.typealias) as grouptotype, d.groupname, a.typename, d.id as groupid, a.id as typeid from grouptotype gtt join alerttypes a on a.id=gtt.alerttypeid join devicegroups d on d.id=gtt.devicegroupid "; break;
                default : throw "Invalid entity type" ;
            }
            return resolve(await shared.queryMySQL(query));
        });
    },
    createEntity: async function (entitytype, body) {
            let query = 'insert into ';
            switch (entitytype){
                case shared.entity_entitytype_enum["users"] : query += 'users'; break;
                case shared.entity_entitytype_enum["alerttypes"] : query += 'alerttypes'; break;
                case shared.entity_entitytype_enum["devicegroups"] : query += 'devicegroups'; break;
                case shared.entity_entitytype_enum["channel"] : query += 'channels'; break;
                case shared.entity_entitytype_enum["frequency"] : query += 'frequency'; break;
                case shared.entity_entitytype_enum["grouptotype"] : query += 'grouptotype'; break;
                default : throw "Invalid entity type" ;
            }
            const param = getBodyParametersKeyValuesListForInsert(body);
            query += ' ('+param.keys+') values ('+param.values+')';
            return shared.queryMySQL(query);
    },

    updateEntity: async function (entitytype, body) {
        let query = 'update ';
        switch (entitytype){
            case shared.entity_entitytype_enum["users"] : query += 'users set '; break;
            case shared.entity_entitytype_enum["alerttypes"] : query += 'alerttypes set'; break;
            case shared.entity_entitytype_enum["devicegroups"] : query += 'devicegroups set'; break;
            case shared.entity_entitytype_enum["channel"] : query += 'channels set'; break;
            case shared.entity_entitytype_enum["frequency"] : query += 'frequency set'; break;
            case shared.entity_entitytype_enum["grouptotype"] : query += 'grouptotype set'; break;
            default : throw "Invalid entity type" ;
        }
        query += getBodyParametersKeyValuesListForUpdate(body);
        query += ' where id = '+body.id;
        return shared.queryMySQL(query);
    },
    
    deleteEntity: async function (entitytype, id) {
        let query = 'delete from ';
        switch (entitytype){
            case shared.entity_entitytype_enum["users"] :
                await deleteFromTable ('usertoalerts','userid',id);
                await deleteFromTable ('subscription','userid',id);
                query += 'users'; break;
            case shared.entity_entitytype_enum["alerttypes"] : 
                await deleteUserToAlertByAlertTypeId(id);
                await deleteFromTable('grouptotype','alerttypeid',id);
                query += 'alerttypes'; break;
            case shared.entity_entitytype_enum["devicegroups"] : 
                await deleteFromTable('grouptotype','devicegroupid',id);
                query += 'devicegroups'; break;
            case shared.entity_entitytype_enum["channel"] : query += 'channels'; break;
            case shared.entity_entitytype_enum["frequency"] : query += 'frequency'; break;
            case shared.entity_entitytype_enum["grouptotype"] : 
                await deleteFromTable('usertoalerts','grouptotypeid',id);
                query += 'grouptotype'; break;
            default : throw "Invalid entity type" ;
        }
        query += ' where id = '+id;
        return shared.queryMySQL(query);
    }
};

function deleteFromTable( tablename, idcolumnname, idvalue){
    let query = 'delete from '+tablename+' where '+idcolumnname+' = '+idvalue;
    return shared.queryMySQL(query);
}

function deleteUserToAlertByAlertTypeId(id){
    let query = 'DELETE usertoalerts FROM usertoalerts INNER JOIN grouptotype ON usertoalerts.grouptotypeid = grouptotype.id	WHERE grouptotype.alerttypeid ='+ id;
    return shared.queryMySQL(query);
}

function getBodyParametersKeyValuesListForInsert (body){
    let keys = '';
    let values = '';
    for(var prop in body){
        keys += prop+',';
        if(prop == "rules"){
            values += '\''+JSON.stringify(body[prop])+'\',';
        }
        else{ 
            values += '\''+body[prop]+'\','; 
        }
    }
    return { keys : keys.substring(0, keys.length - 1) , values : values.substring(0, values.length - 1) };
}


function getBodyParametersKeyValuesListForUpdate (body){
    let updates = ' ';
    for(var prop in body){
        if(prop == "rules"){
            updates += " "+prop+" = '"+JSON.stringify(body[prop])+"',";
        }
        else{ 
            updates += " "+prop+" = '"+body[prop]+"',";
        }
    }
    return updates.substring(0, updates.length - 1);
}
