/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const copyArr = [...arr];
  switch (param) {
    case "desc":
      return sortArr(copyArr, -1);
    case "asc":
    default:
      return sortArr(copyArr, 1);
  }
  function sortArr(array, direction) {
    return array.sort(
      (str1, str2) =>
        direction *
        str1.localeCompare(str2, ["ru", "en"], { caseFirst: "upper" })
    );
  }
}
