/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr = []) {
  const myMap = new Map();
  arr.forEach((value) => {
    myMap.set(value, value);
  });
  return Array.from(myMap.values());
}
