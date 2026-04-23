const BASE_PLATFORM_PERCENTAGE = 30;

const resolvePlatformCommission = ({ extraPlatformPercentage = 0 }) => {
  const cleanExtra = Number(extraPlatformPercentage || 0);

  return {
    basePlatformPercentage: BASE_PLATFORM_PERCENTAGE,
    extraPlatformPercentage: cleanExtra,
    finalPlatformPercentage: BASE_PLATFORM_PERCENTAGE + cleanExtra,
  };
};

module.exports = {
  resolvePlatformCommission,
};