import BigNumber from "bignumber.js";
import { compact } from "lodash";
export const useBigNumber = () => {
  const formatWithComma = (value = 0) => {
    const _bigNumber = new BigNumber(value);
    return _bigNumber.toFormat();
  };
  const sumArray = (values: Array<number | string>): number => {
    if (!Array.isArray(values)) {
      return 0;
    }
    const filteredValues = compact(values);
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
