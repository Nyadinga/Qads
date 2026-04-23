const { sequelize } = require("../../../config/sequelize");
const campaignRepository = require("../campaign.repository");
const {
  resolveCampaignCategory,
} = require("./campaignCategory.service");
const {
  resolveCampaignCpc,
  getCurrencyForCountry,
} = require("./campaignCpc.service");
const {
  resolvePlatformCommission,
} = require("./campaignCommission.service");

const buildInternalDestinationValue = ({ destination, destinationSourceId }) => {
  if (destination === "qads_store") {
    return `/stores/${destinationSourceId}`;
  }

  if (destination === "qads_product") {
    return `/products/${destinationSourceId}`;
  }

  return null;
};

const normalizePhoneForWhatsapp = (phone) => {
  return String(phone || "").replace(/[^\d]/g, "");
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

const mapMediaRefsToRows = (campaignId, mediaRefs = []) => {
  return mediaRefs.map((media, index) => ({
    campaign_id: campaignId,
    media_type: media.mediaType,
    drive_file_id: media.driveFileId,
    file_url: media.fileUrl,
    preview_url: media.previewUrl || null,
    file_name: media.fileName || null,
    mime_type: media.mimeType || null,
    file_size_bytes: media.fileSizeBytes,
    display_order:
      Number.isInteger(media.displayOrder) ? media.displayOrder : index,
  }));
};

const createCampaign = async ({ userId, payload }) => {
  const transaction = await sequelize.transaction();

  try {
    const category = await resolveCampaignCategory({
      categoryId: payload.categoryId,
      newCategoryName: payload.newCategoryName,
      userId,
      transaction,
    });

    const pricing = resolveCampaignCpc({
      countryCode: payload.countryCode,
      categoryMinCpc: category.min_cpc,
      unitPriceRange: payload.unitPriceRange,
      destination: payload.destination,
      advertiserCpc: payload.advertiserCpc,
      budget: payload.budget,
    });

    const commission = resolvePlatformCommission({
      extraPlatformPercentage: category.extra_platform_percentage,
    });

    const resolvedDestination = resolveCampaignDestination({
      destination: payload.destination,
      externalUrl: payload.externalUrl,
      whatsappNumber: payload.whatsappNumber,
      qadsStoreId: payload.qadsStoreId,
      qadsProductId: payload.qadsProductId,
    });

    const action = payload.action === "launch" ? "launch" : "draft";
    const now = new Date();

    const campaign = await campaignRepository.createCampaign(
      {
        user_id: userId,
        category_id: category.id,
        title: payload.title,
        description: payload.description,
        country_code: payload.countryCode,
        currency_code: getCurrencyForCountry(payload.countryCode),
        product_name: payload.productName,
        unit_price_range: payload.unitPriceRange,
        destination: payload.destination,
        destination_source_id: resolvedDestination.destinationSourceId,
        destination_value: resolvedDestination.destinationValue,
        allocated_budget: payload.budget,
        min_cpc: pricing.minCpc,
        advertiser_cpc: pricing.advertiserCpc,
        effective_cpc: pricing.effectiveCpc,
        estimated_validated_click_capacity:
          pricing.estimatedValidatedClickCapacity,
        pricing_flags: pricing.pricingFlags,
        base_platform_percentage: commission.basePlatformPercentage,
        extra_platform_percentage: commission.extraPlatformPercentage,
        final_platform_percentage: commission.finalPlatformPercentage,
        start_date: payload.startDate || null,
        end_date: payload.endDate || null,
        status: action === "launch" ? "pending_approval" : "draft",
        submitted_at: action === "launch" ? now : null,
      },
      transaction
    );

    const mediaRows = mapMediaRefsToRows(campaign.id, payload.mediaRefs || []);
    await campaignRepository.bulkCreateCampaignMedia(mediaRows, transaction);

    await transaction.commit();

    return {
      campaign,
      category,
      pricing,
      commission,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createCampaign,
};