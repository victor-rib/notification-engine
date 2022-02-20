import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataParsingService {
  public static renameRowKeyToId(object) {
    if (Array.isArray(object)) {
      object?.forEach(function (row) {
        if (!row['Id'] && row['rowKey']) {
          row['Id'] = row['rowKey'];
          delete row['rowKey'];
        }
      });
    }
    else if (!object['Id'] && object['rowKey']) {
      object['Id'] = object['rowKey'];
      delete object['rowKey'];
    }
  }

  public static renameIdToRowKey(object) {
    if (Array.isArray(object)) {
      object?.forEach(function (row) {
        if (!row['rowKey'] && row['Id']) {
          row['rowKey'] = row['Id'];
          delete row['Id'];
        }
      });
    }
    else if (!object['rowKey'] && object['Id']) {
      object['rowKey'] = object['Id'];
      delete object['Id'];
    }
  }

  // public static removeIsValidProperty(object) {
  //   if (Array.isArray(object)) {
  //     object?.forEach(function (row) {
  //       if (row['isValid']) {
  //         delete row['isValid'];
  //       }
  //     });
  //   }
  //   else if (object['isValid']) {
  //     delete object['isValid'];
  //   }
  // }

  public static CreateGuid() {
    function _p8(s) {
      var p = (Math.random().toString(16) + "000000000").substr(2, 8);
      return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8(null) + _p8(true) + _p8(true) + _p8(null);
  }

  public static getAllPropertyNames(listOfObjects, hiddenColumns) {
    let names = [];
    listOfObjects.forEach(function (o) {
      Object.keys(o).forEach(function (k) {
        if (!hiddenColumns?.includes(k))
          names[k] = true;
      });
    });
    // return Object.keys(names)?.sort((a, b) => {
    //   return (a === "Id") ? -1 : a.localeCompare(b)
    // });
    return Object.keys(names);
  }
}
