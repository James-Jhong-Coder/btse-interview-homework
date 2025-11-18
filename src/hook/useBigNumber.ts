import BigNumber from "bignumber.js";
export const useBigNumber = () => {
  const formatWithComma = (value = 0) => {
    const _bigNumber = new BigNumber(value);
    return _bigNumber.toFormat();
  };
  const sumArray = (values: Array<number | string>): number => {
    if (!Array.isArray(values)) {
      return 0;
    }
    const filteredValues = values.filter((item) => {
      if (item === null || item === undefined || item === "") {
        return false;
      }
      return true;
    });
    if (filteredValues.length === 0) {
      return 0;
    }
    return BigNumber.sum.apply(null, filteredValues).toNumber();
  };
  return {
    formatWithComma,
    sumArray,
  };
};
