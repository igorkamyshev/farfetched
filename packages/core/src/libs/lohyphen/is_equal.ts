// Source: https://github.com/smelukov/nano-equal

export function isEqual(a: any, b: any): boolean {
  try {
    if (a === b) {
      return true;
    }

    if (Number.isNaN(a) && Number.isNaN(b)) {
      return true;
    }

    const typeA = getType(a);
    const typeB = getType(b);

    if (typeA !== typeB) {
      return false;
    }

    if (typeA === 'pure-object') {
      if (a === b) {
        return true;
      }

      const keysA = Object.keys(a);
      const keysBLength = Object.keys(b).length;

      if (keysA.length !== keysBLength) {
        return false;
      }

      for (let i = 0, l = keysA.length; i < l; i++) {
        const key = keysA[i];

        if (!Object.prototype.hasOwnProperty.call(b, keysA[i])) {
          return false;
        }

        const valA = a[key];
        const valB = b[key];

        // handle recursion
        if (valA === a || valB === b || valA === b || valB === a) {
          return valA === valB;
        }

        if (!isEqual(valA, valB)) {
          return false;
        }
      }

      return true;
    } else if (typeA === 'array') {
      if (a.length === b.length) {
        for (let j = 0; j < a.length; j++) {
          const elA = a[j];
          const elB = b[j];

          // handle recursion
          if (elA === a || elB === b || elA === b || elB === a) {
            return elA === elB;
          }

          if (!isEqual(elA, elB)) {
            return false;
          }
        }
      } else {
        return false;
      }

      return true;
    } else if (typeA === 'object') {
      if (a.valueOf && b.valueOf) {
        return a.valueOf() === b.valueOf();
      }
    }
  } catch (e) {
    // We got extremely weird objects, let us skip it and consider them not equal
  }

  return false;
}

function isArrayLike(a: any): boolean {
  if (Array.isArray(a)) {
    return true;
  }

  const len = a.length;

  if (typeof len === 'number' && len > -1) {
    if (len) {
      return 0 in a && len - 1 in a;
    }

    return true;
  }

  return false;
}

function getType(a: any): string {
  const type = typeof a;

  if (type === 'object') {
    if (a === null) {
      return 'null';
    } else if (isArrayLike(a)) {
      return 'array';
    } else if (a.constructor === Object || Object.getPrototypeOf(a) === null) {
      return 'pure-object';
    }

    return 'object';
  }

  return type;
}
