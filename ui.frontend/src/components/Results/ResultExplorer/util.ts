import {compare, defaults} from "ast-compare";
import traverse from "traverse";

export function categorizeValue(value: any): 'array' | 'object' | 'primitive' {
  if (Array.isArray(value)) {
    return 'array';
  } else if (value !== null && typeof value === 'object') {
    return 'object';
  } else {
    return 'primitive';
  }
}


// Function to search for values
export function searchJSON(json: any, searchTerm: string) {
  const results:any = [];

  function search(obj: any, key: string) {
    if (typeof obj === 'object') {
      for (const k in obj) {
        if (obj[k] && typeof obj[k] === 'object') {
          search(obj[k], key);
        } else if (obj[k] === key) {
          results.push(obj);
        }
      }
    }
  }

  search(json, searchTerm);
  return results;
}

export const CONTENT_OBJECT_KEY = 'sling:resourceType';
export function isContentObject(obj: any) {
  return obj.hasOwnProperty(CONTENT_OBJECT_KEY);
}

export function compareObjects(bigObj: any, smallObj: any, verbose = false) {
  return compare(bigObj, smallObj, {...defaults, verboseWhenMismatches: verbose});
}

function mergeArraysByProperties<T extends { [key: string]: any }>(
  array1: T[],
  array2: T[]
): T[] {
  const properties: (keyof T)[] = ['path', 'sourceLeaf', 'targetLeaf'];
  const map = new Map<string, T>();

  const getKey = (item: T) => properties.map(prop => item[prop]).join('|');

  array1.forEach(item => map.set(getKey(item), item));
  array2.forEach(item => map.set(getKey(item), item));

  return Array.from(map.values());
}

export function getMismatchedLeaves(source: traverse.Traverse<any>, target: traverse.Traverse<any>) {
  const targetMismatches = source.reduce(function (acc, x) {
    if (this.isLeaf){
      const targetLeaf = target.get(this.path)
      // if targetLeaf is a boolean, that means there is a value
      if (typeof targetLeaf !== 'boolean' && !Array.isArray(targetLeaf) && !targetLeaf) {
        // missing targetLeaf
        acc.push({
          path: this.path,
          sourceLeaf: x,
          targetLeaf: null
        })
      } else if (!compareObjects(x, targetLeaf)) {
        // mismatched leaf values
        acc.push({
          path: this.path,
          sourceLeaf: x,
          targetLeaf
        })
      }
      // match
    }
    return acc;
  }, []);

  const sourceMismatches = target.reduce(function (acc, x) {
    if (this.isLeaf){
      const sourceLeaf = source.get(this.path)
      // if sourceLeaf is a boolean, that means there is a value
      if (typeof sourceLeaf !== 'boolean' && !Array.isArray(sourceLeaf) && !sourceLeaf) {
        // missing sourceLeaf
        acc.push({
          path: this.path,
          sourceLeaf: null,
          targetLeaf: x
        })
      } else if (!compareObjects(x, sourceLeaf)) {
        // mismatched leaf values
        acc.push({
          path: this.path,
          sourceLeaf,
          targetLeaf: x
        })
      }
      // match
    }
    return acc;
  }, []);

  return mergeArraysByProperties(targetMismatches, sourceMismatches);
}

export function findModifiedContentObjects(source: any, target: any) {
  const start = performance.now();
  const topLevelCompare = compareObjects(source, target, true);
  if (typeof topLevelCompare === 'string') {
    console.log("modifications detected: ", topLevelCompare);
    const traversedSource = traverse(source);
    const traversedTarget = traverse(target);
    const mismatches = getMismatchedLeaves(traversedSource, traversedTarget);
    if (mismatches.length > 0) {
      console.log("found mismatched leaves: ", mismatches);
      mismatches.forEach((mismatch)=>{
        if (!mismatch.sourceLeaf) {
          console.log(`${mismatch.path}:[${mismatch.targetLeaf}] was added by the user`);
        } else if (!mismatch.targetLeaf) {
          console.log(`${mismatch.path}:[${mismatch.sourceLeaf}] was deleted by the user`);
        } else {
          console.log(`${mismatch.path}:[${mismatch.sourceLeaf}] was updated by the user to [${mismatch.targetLeaf}]`);
        }
      })
    } else {
      console.log("no mismatched leaves found");
    }
  }
  const end = performance.now();
  console.log(`findModifiedContentObjects took ${end - start} milliseconds.`);
}
