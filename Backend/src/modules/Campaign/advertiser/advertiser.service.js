const campaignRepository = require("../campaign.repository");

const { sequelize } = require("../../../config/sequelize");

const {
  resolveCampaignCategory,
} = require("../services/campaignCategory.service");
const {
  resolveCampaignCpc,
  getCurrencyForCountry,
} = require("../services/campaignCpc.service");
const {
  resolvePlatformCommission,
} = require("../services/campaignCommission.service");

const ALLOWED_STATUS_FILTERS = [
  "draft",
  "pending_approval",
  "active",
  "paused",
  "suspended",
  "rejected",
  "completed",
];

const getAdvertiserCampaigns = async ({ ownerId, status }) => {
  let normalizedStatus = null;

  if (status) {
    if (!ALLOWED_STATUS_FILTERS.includes(status)) {
      const error = new Error("Unsupported campaign status filter.");
      error.statusCode = 422;
      throw error;
    }

    normalizedStatus = status;
  }

  const campaigns = await campaignRepository.findCampaignsByOwnerId(
    ownerId,
    normalizedStatus
  );

  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    countryCode: campaign.country_code,
    currencyCode: campaign.currency_code,
    productName: campaign.product_name,
    unitPriceRange: campaign.unit_price_range,
    destination: campaign.destination,
    destinationValue: campaign.destination_value,
    allocatedBudget: campaign.allocated_budget,
    budgetSpent: campaign.budget_spent,
    minCpc: campaign.min_cpc,
    advertiserCpc: campaign.advertiser_cpc,
    effectiveCpc: campaign.effective_cpc,
    estimatedValidatedClickCapacity:
      campaign.estimated_validated_click_capacity,
    basePlatformPercentage: campaign.base_platform_percentage,
    extraPlatformPercentage: campaign.extra_platform_percentage,
    finalPlatformPercentage: campaign.final_platform_percentage,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    status: campaign.status,
    canonicalShortCode: campaign.canonical_short_code,
    canonicalShortUrl: campaign.canonical_short_url,
    rejectionReason: campaign.rejection_reason,
    submittedAt: campaign.submitted_at,
    approvedAt: campaign.approved_at,
    rejectedAt: campaign.rejected_at,
    pausedAt: campaign.paused_at,
    suspendedAt: campaign.suspended_at,
    completedAt: campaign.completed_at,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    category: campaign.category
      ? {
          id: campaign.category.id,
          name: campaign.category.name,
          status: campaign.category.status,
        }
      : null,
    media: Array.isArray(campaign.media)
      ? campaign.media.map((item) => ({
          id: item.id,
          mediaType: item.media_type,
          fileUrl: item.file_url,
          previewUrl: item.preview_url,
          fileName: item.file_name,
          mimeType: item.mime_type,
          fileSizeBytes: item.file_size_bytes,
          displayOrder: item.display_order,
        }))
      : [],
  }));
};

const pauseCampaign = async ({ campaign }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const updatedCampaign = await campaignRepository.pauseCampaign(
      campaign,
      transaction
    );

    await transaction.commit();

    return updatedCampaign;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
};




const resolveCampaignDestination = ({
  destination,
  externalUrl,
  whatsappNumber,
  qadsStoreId,
  qadsProductId,
}) => {
  if (destination === "external_url") {
    return {
      destinationSourceId: null,
      destinationValue: externalUrl,
    };
  }

  if (destination === "whatsapp") {
    return {
      destinationSourceId: null,
      destinationValue: `https://wa.me/${normalizePhoneForWhatsapp(
        whatsappNumber
      )}`,
    };
  }

  if (destination === "qads_store") {
    return {
      destinationSourceId: qadsStoreId,
      destinationValue: buildInternalDestinationValue({
        destination,
        destinationSourceId: qadsStoreId,
      }),
    };
  }

  if (destination === "qads_product") {
    return {
      destinationSourceId: qadsProductId,
      destinationValue: buildInternalDestinationValue({
        destination,
        destinationSourceId: qadsProductId,
      }),
    };
  }

  const error = new Error("Unsupported destination.");
  error.statusCode = 422;
  throw error;
};

const mapCampaignDetail = (campaign) => ({
  id: campaign.id,
  title: campaign.title,
  description: campaign.description,
  countryCode: campaign.country_code,
  currencyCode: campaign.currency_code,
  productName: campaign.product_name,
  unitPriceRange: campaign.unit_price_range,
  destination: campaign.destination,
  destinationSourceId: campaign.destination_source_id,
  destinationValue: campaign.destination_value,
  allocatedBudget: campaign.allocated_budget,
  budgetSpent: campaign.budget_spent,
  minCpc: campaign.min_cpc,
  advertiserCpc: campaign.advertiser_cpc,
  effectiveCpc: campaign.effective_cpc,
  estimatedValidatedClickCapacity:
    campaign.estimated_validated_click_capacity,
  basePlatformPercentage: campaign.base_platform_percentage,
  extraPlatformPercentage: campaign.extra_platform_percentage,
  finalPlatformPercentage: campaign.final_platform_percentage,
  startDate: campaign.start_date,
  endDate: campaign.end_date,
  status: campaign.status,
  canonicalShortCode: campaign.canonical_short_code,
  canonicalShortUrl: campaign.canonical_short_url,
  rejectionReason: campaign.rejection_reason,
  submittedAt: campaign.submitted_at,
  approvedAt: campaign.approved_at,
  rejectedAt: campaign.rejected_at,
  pausedAt: campaign.paused_at,
  suspendedAt: campaign.suspended_at,
  completedAt: campaign.completed_at,
  createdAt: campaign.created_at,
  updatedAt: campaign.updated_at,
  category: campaign.category
    ? {
        id: campaign.category.id,
        name: campaign.category.name,
        status: campaign.category.status,
        minCpc: campaign.category.min_cpc,
        extraPlatformPercentage:
          campaign.category.extra_platform_percentage,
      }
    : null,
  media: Array.isArray(campaign.media)
    ? campaign.media.map((item) => ({
        id: item.id,
        mediaType: item.media_type,
        driveFileId: item.drive_file_id,
        fileUrl: item.file_url,
        previewUrl: item.preview_url,
        fileName: item.file_name,
        mimeType: item.mime_type,
        fileSizeBytes: item.file_size_bytes,
        displayOrder: item.display_order,
      }))
    : [],
});

const getAdvertiserCampaignDetail = async ({ campaignId, ownerId }) => {
  const campaign = await campaignRepository.findCampaignDetailByOwnerId(
    campaignId,
    ownerId
  );

  if (!campaign) {
    const error = new Error("Campaign not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapCampaignDetail(campaign);
};

const updateAdvertiserCampaign = async ({ campaign, ownerId, payload }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const category = await resolveCampaignCategory({
      categoryId: payload.categoryId || campaign.category_id,
      newCategoryName: payload.newCategoryName || null,
      userId: ownerId,
      transaction,
    });

    const nextDestination = payload.destination || campaign.destination;
    const nextUnitPriceRange =
      payload.unitPriceRange || campaign.unit_price_range;
    const nextBudget = payload.budget ?? campaign.allocated_budget;
    const nextAdvertiserCpc =
      payload.advertiserCpc ?? campaign.advertiser_cpc;

    const pricing = resolveCampaignCpc({
      countryCode: campaign.country_code,
      categoryMinCpc: category.min_cpc,
      unitPriceRange: nextUnitPriceRange,
      destination: nextDestination,
      advertiserCpc: nextAdvertiserCpc,
      budget: nextBudget,
    });

    const commission = resolvePlatformCommission({
      extraPlatformPercentage: category.extra_platform_percentage,
    });

    const resolvedDestination = resolveCampaignDestination({
      destination: nextDestination,
      externalUrl: payload.externalUrl,
      whatsappNumber: payload.whatsappNumber,
      qadsStoreId: payload.qadsStoreId,
      qadsProductId: payload.qadsProductId,
    });

    const updatedCampaign = await campaignRepository.updateCampaign(
      campaign,
      {
        category_id: category.id,
        title: payload.title ?? campaign.title,
        description: payload.description ?? campaign.description,
        currency_code: getCurrencyForCountry(campaign.country_code),
        product_name: payload.productName ?? campaign.product_name,
        unit_price_range: nextUnitPriceRange,
        destination: nextDestination,
        destination_source_id: resolvedDestination.destinationSourceId,
        destination_value: resolvedDestination.destinationValue,
        allocated_budget: nextBudget,
        min_cpc: pricing.minCpc,
        advertiser_cpc: pricing.advertiserCpc,
        effective_cpc: pricing.effectiveCpc,
        estimated_validated_click_capacity:
          pricing.estimatedValidatedClickCapacity,
        pricing_flags: pricing.pricingFlags,
        base_platform_percentage: commission.basePlatformPercentage,
        extra_platform_percentage: commission.extraPlatformPercentage,
        final_platform_percentage: commission.finalPlatformPercentage,
        start_date:
          payload.startDate !== undefined ? payload.startDate : campaign.start_date,
        end_date:
          payload.endDate !== undefined ? payload.endDate : campaign.end_date,

        status: "pending_approval",
        submitted_at: new Date(),
        approved_at: null,
        rejected_at: null,
        paused_at: null,
        suspended_at: null,
        completed_at: null,
        rejection_reason: null,
        updated_at: new Date(),
      },
      transaction
    );

    await transaction.commit();

    const freshCampaign = await campaignRepository.findCampaignDetailByOwnerId(
      updatedCampaign.id,
      ownerId
    );

    return mapCampaignDetail(freshCampaign);
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
};

module.exports = {
  getAdvertiserCampaigns,
  pauseCampaign,
  updateAdvertiserCampaign
};