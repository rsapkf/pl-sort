export const formatNumber = (number) => {
  const options = {
    notation: 'compact',
    compactDisplay: 'short',
  };
  return new Intl.NumberFormat('en', options).format(number);
};
