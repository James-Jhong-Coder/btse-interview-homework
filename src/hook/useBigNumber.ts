import BigNumber from "bignumber.js";
export const useBigNumber = () => {
  const formatWithComma = (value = 0) => {
    const _bigNumber = new BigNumber(value);
    return _bigNumber.toFormat();
  };

  return {
    formatWithComma,
  };
};
