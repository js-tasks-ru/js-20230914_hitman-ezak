/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  } else if (size === undefined) {
    return string;
  }

  const firstSlice = string.slice(0, size);
  const restString = [...string.slice(size)];
  return restString.reduce((accumString, char) => {
    if (!accumString.endsWith(char.repeat(size))) {
      accumString += char;
    }
    return accumString;
  }, firstSlice);
}
