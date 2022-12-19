import { unref, Ref } from "vue";

export function getUrlQuerys(): commonObject | null {
  let query: commonObject | null = null;
  const queryArray = window.location.search
    .substring(1)
    .split("&")
    .filter((item) => item !== "");
  if (queryArray.length > 0) {
    const reg = /(\S*)=(\S*)/;
    query = {};
    for (const queryItem of queryArray) {
      const r = queryItem.match(reg);
      if (r != null) {
        query[r[1]] = decodeURI(r[2]);
      }
    }
  }
  return query;
}

export function getUrlQuery(name: string): string | null {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  const r = window.location.search.substring(1).match(reg);
  if (r != null) {
    return decodeURI(r[2]);
  }
  return null;
}

export function setStorage(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStorage(key: string): any {
  const data = JSON.parse(localStorage.getItem(key) as string);
  return data;
}

interface keyRefObject {
  [index: string]: Ref | any;
}

export function unrefObject(object: keyRefObject): commonObject {
  const newObject: commonObject = {};
  for (const key in object) {
    newObject[key] = unref(object[key]);
  }
  return newObject;
}
