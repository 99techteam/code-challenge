import express from "express";
import { IObject } from "./constants";
import { dateToDateStr } from "./dateUtils";

const NON_CAMEL_SPLIT_REGEX = /([-_][a-z0-9])/gi;
const NON_SNAKE_SPLIT_REGEX = /[A-Z]/g;

export const wait = (mili: number) =>
  new Promise((resolve) => setTimeout(resolve, mili));

export const strToCamel = (str: string): string => {
  return str.replace(NON_CAMEL_SPLIT_REGEX, (letter) =>
    letter.toUpperCase().replace(/-|_/g, "")
  );
};

export const strToSnake = (str: string): string => {
  return str.replace(
    NON_SNAKE_SPLIT_REGEX,
    (letter) => `_${letter.toLowerCase()}`
  );
};

type ObjectTransform =
  | unknown
  | IObject<ObjectTransform>
  | Array<ObjectTransform>;

export const objToCamel = (obj: ObjectTransform): ObjectTransform => {
  if (obj instanceof Array) return obj.map(objToCamel);
  if (!(obj instanceof Object)) return obj;
  const newObj: IObject<ObjectTransform> = {};
  Object.keys(obj).forEach((k) => {
    newObj[strToCamel(k)] = objToCamel((<IObject<ObjectTransform>>obj)[k]);
  });
  return newObj;
};

export const objToSnake = (obj: ObjectTransform): ObjectTransform => {
  if (obj instanceof Array) return obj.map(objToSnake);
  if (!(obj instanceof Object)) return obj;
  const newObj: IObject<ObjectTransform> = {};
  Object.keys(obj).forEach((k) => {
    newObj[strToSnake(k)] = objToSnake((<IObject<ObjectTransform>>obj)[k]);
  });
  return newObj;
};

// bind some locals data (ex: decode data token ...) to request
export const bindLocals = (req: express.Request, data = {}): void => {
  const locals = req.res?.locals || {};
  for (const key of Object.keys(data)) {
    locals[key] = (<IObject>data)[key];
  }
};

// get some locals data from request
export const getLocals = (req: express.Request, key?: string): any => {
  const locals = req.res?.locals || {};
  return key ? locals[String(key)] : locals;
};

export const objGet = (
  obj: any,
  defaultValue: any = undefined,
  ...destinations: string[]
) => {
  if (obj) {
    while (destinations.length) {
      let value = _objGet(obj, undefined, destinations[0]);
      if (value !== undefined) {
        if (value instanceof Date) {
          return dateToDateStr(value);
        }
        return value;
      } else {
        destinations.shift();
      }
    }
  }
  return defaultValue;
};

function _objGet(obj: any, defaultValue: any = undefined, destination: string) {
  if (obj && typeof destination === "string") {
    if (destination === ".") return obj;
    let arr = destination.split(".");
    while (arr.length && (obj = obj[String(arr.shift())])) {}
    return obj;
  }
  return defaultValue;
}

export const formatStringObj = (str: string, obj: IObject<any>) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key]) {
      str = str.replace(new RegExp(`{${key}}`, "g"), obj[key].toString());
    }
  });
  return str;
};

export const objArrToDict = <T>(arr: T[], indexKey: keyof T) => {
  const normalizedObject: any = {};
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][indexKey];
    if (typeof key === "string" || typeof key === "number") {
      normalizedObject[key.toString()] = arr[i];
    }
  }
  return normalizedObject as { [key: string]: T };
};

export const objArrDistinct = <T>(arr: T[], indexKey: keyof T) => {
  const normalizedObject: any = {};
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][indexKey];
    if (typeof key === "string" || typeof key === "number") {
      normalizedObject[key.toString()] = arr[i];
    }
  }
  return Object.values(normalizedObject) as T[];
};

export const objIncludeKeys = (objSrc: IObject<any>, keys: string[]) => {
  if (!(objSrc instanceof Object)) {
    objSrc = {};
  }
  const objDest: IObject<any> = {};
  for (const key of keys) {
    if (key in objSrc) {
      objDest[key] = objSrc[key];
    }
  }
  return objDest;
};

export const objIgnoreKeys = (objSrc: IObject<any>, keys: string[]) => {
  if (!(objSrc instanceof Object)) {
    objSrc = {};
  }
  const objDest: IObject<any> = objSrc;
  for (const key of keys) {
    if (key in objSrc) {
      delete objDest[key];
    }
  }
  return objDest;
};

export const getRequestBaseUrl = (req: express.Request) => {
  const referer = req.headers.referer;
  return referer ? new URL(referer).origin : `http://${req.headers.host}`;
};

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export function downloadFileFromPath(res: express.Response, filePath: string) {
  return new Promise((resolve, reject) => {
    res.download(filePath, (err) => {
      if (err) reject(err);
      res.end();
      resolve(undefined);
    });
  });
}

export function downloadFileFromStream(res: express.Response, fileStream: any) {
  return new Promise((resolve, reject) => {
    fileStream.pipe(res);
    fileStream.on("end", () => {
      res.end();
      resolve(undefined);
    });
    fileStream.on("error", reject);
  });
}
