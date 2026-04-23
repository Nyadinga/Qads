const COUNTRY_TO_CURRENCY = {
  CM: "XAF",
};

const UNIT_PRICE_RANGE_MULTIPLIERS = {
  range_0_5000: 1.0,
  range_5001_20000: 1.2,
  range_20001_100000: 1.5,
  range_100001_500000: 2.0,
  range_500001_plus: 3.0,
};

const DESTINATION_MULTIPLIERS = {
  external_url: 1.1,
  whatsapp: 1.2,
  qads_store: 1.0,
  qads_product: 1.0,
};

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

const ensurePositiveNumber = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} must be greater than 0.`);
    error.statusCode = 422;
    throw error;
  }

  return roundMoney(parsed);
};

const getCurrencyForCountry = (countryCode) => {
  const currencyCode = COUNTRY_TO_CURRENCY[countryCode];

  if (!currencyCode) {
    const error = new Error("Unsupported campaign country.");
    error.statusCode = 422;
    throw error;
  }

  return currencyCode;
};

const getUnitPriceRangeMultiplier = (unitPriceRange) => {
  const multiplier = UNIT_PRICE_RANGE_MULTIPLIERS[unitPriceRange];

  if (!multiplier) {
    const error = new Error("Unsupported unit price range.");
    error.statusCode = 422;
    throw error;
  }

  return Number(multiplier);
};

const getDestinationMultiplier = (destination) => {
  const multiplier = DESTINATION_MULTIPLIERS[destination];

  if (!multiplier) {
    const error = new Error("Unsupported destination.");
    error.statusCode = 422;
    throw error;
  }

  return Number(multiplier);
};

const calculateMinimumCpc = ({
  countryCode,
  categoryMinCpc,
  unitPriceRange,
  destination,
}) => {
  const currencyCode = getCurrencyForCountry(countryCode);

  const baseMinCpc = ensurePositiveNumber(categoryMinCpc, "Category minimum CPC");
  const unitPriceRangeMultiplier = getUnitPriceRangeMultiplier(unitPriceRange);
  const destinationMultiplier = getDestinationMultiplier(destination);

  const minCpc = roundMoney(
    baseMinCpc * unitPriceRangeMultiplier * destinationMultiplier
  );

  return {
    countryCode,
    currencyCode,
    baseMinCpc,
    unitPriceRangeMultiplier,
    destinationMultiplier,
    minCpc,
  };
};

const calculateEstimatedValidatedClickCapacity = ({ budget, effectiveCpc }) => {
  const cleanBudget = ensurePositiveNumber(budget, "Budget");
  const cleanEffectiveCpc = ensurePositiveNumber(effectiveCpc, "Effective CPC");

  const estimatedValidatedClickCapacity = Math.floor(
    cleanBudget / cleanEffectiveCpc
  );

  if (estimatedValidatedClickCapacity < 1) {
    const error = new Error("Campaign budget is too low for the selected CPC.");
    error.statusCode = 422;
    error.details = {
      budget: cleanBudget,
      effectiveCpc: cleanEffectiveCpc,
      estimatedValidatedClickCapacity,
    };
    throw error;
  }

  return estimatedValidatedClickCapacity;
};

const resolveCampaignCpc = ({
  countryCode,
  categoryMinCpc,
  unitPriceRange,
  destination,
  advertiserCpc,
  budget,
}) => {
  const cleanAdvertiserCpc = ensurePositiveNumber(
    advertiserCpc,
    "Advertiser CPC"
  );

  const calculation = calculateMinimumCpc({
    countryCode,
    categoryMinCpc,
    unitPriceRange,
    destination,
  });

  if (cleanAdvertiserCpc < calculation.minCpc) {
    const error = new Error(
      `Chosen CPC is below the minimum allowed CPC of ${calculation.minCpc} ${calculation.currencyCode}.`
    );
    error.statusCode = 422;
    error.details = {
      countryCode,
      currencyCode: calculation.currencyCode,
      minCpc: calculation.minCpc,
      advertiserCpc: cleanAdvertiserCpc,
    };
    throw error;
  }

  const estimatedValidatedClickCapacity =
    calculateEstimatedValidatedClickCapacity({
      budget,
      effectiveCpc: cleanAdvertiserCpc,
    });

  return {
    countryCode,
    currencyCode: calculation.currencyCode,
    baseMinCpc: calculation.baseMinCpc,
    minCpc: calculation.minCpc,
    advertiserCpc: cleanAdvertiserCpc,
    effectiveCpc: cleanAdvertiserCpc,
    estimatedValidatedClickCapacity,
    pricingFlags: [],
  };
};

module.exports = {
  resolveCampaignCpc,
  calculateMinimumCpc,
  calculateEstimatedValidatedClickCapacity,
  getCurrencyForCountry,
};