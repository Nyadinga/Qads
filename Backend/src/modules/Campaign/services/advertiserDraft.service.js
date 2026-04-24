const { sequelize } = require("../../../config/sequelize");
const campaignRepository = require("../campaign.repository");
const {
  resolveCampaignCategory,
} = require("./campaignCategory.service");
const { getCurrencyForCountry } = require("./campaignCpc.service");

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

const resolveDraftDestination = ({
  destination,
  externalUrl,
  whatsappNumber,
  qadsStoreId,
  qadsProductId,
}) => {
  if (!destination) {
    return {
      destinationSourceId: null,
      destinationValue: null,
    };
  }

  if (destination === "external_url") {
    return {
      destinationSourceId: null,
      destinationValue: externalUrl || null,
    };
  }

  if (destination === "whatsapp") {
    return {
      destinationSourceId: null,
      destinationValue: whatsappNumber
        ? `https://wa.me/${normalizePhoneForWhatsapp(whatsappNumber)}`
        : null,
    };
  }

  if (destination === "qads_store") {
    return {
      destinationSourceId: qadsStoreId || null,
      destinationValue: qadsStoreId
        ? buildInternalDestinationValue({
            destination,
            destinationSourceId: qadsStoreId,
          })
        : null,
    };
  }

  if (destination === "qads_product") {
    return {
      destinationSourceId: qadsProductId || null,
      destinationValue: qadsProductId
        ? buildInternalDestinationValue({
            destination,
            destinationSourceId: qadsProductId,
          })
        : null,
    };
  }

  return {
    destinationSourceId: null,
    destinationValue: null,
  };
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

const saveNewDraftCampaign = async ({ ownerId, payload }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    let category = null;

    if (payload.categoryId || payload.newCategoryName) {
      category = await resolveCampaignCategory({
        categoryId: payload.categoryId || null,
        newCategoryName: payload.newCategoryName || null,
        userId: ownerId,
        transaction,
      });
    }

    const resolvedDestination = resolveDraftDestination({
      destination: payload.destination || null,
      externalUrl: payload.externalUrl,
      whatsappNumber: payload.whatsappNumber,
      qadsStoreId: payload.qadsStoreId,
      qadsProductId: payload.qadsProductId,
    });

    const campaign = await campaignRepository.createCampaign(
      {
        user_id: ownerId,
        category_id: category ? category.id : null,
        title: payload.title || null,
        description: payload.description || null,
        country_code: payload.countryCode || "CM",
        currency_code: getCurrencyForCountry(payload.countryCode || "CM"),
        product_name: payload.productName || null,
        unit_price_range: payload.unitPriceRange || null,
        destination: payload.destination || null,
        destination_source_id: resolvedDestination.destinationSourceId,
        destination_value: resolvedDestination.destinationValue,
        allocated_budget: payload.budget ?? 0,
        budget_spent: 0,
        min_cpc: null,
        advertiser_cpc: payload.advertiserCpc ?? null,
        effective_cpc: null,
        estimated_validated_click_capacity: 0,
        pricing_flags: [],
        base_platform_percentage: 30,
        extra_platform_percentage: category
          ? Number(category.extra_platform_percentage || 0)
          : 0,
        final_platform_percentage: category
          ? 30 + Number(category.extra_platform_percentage || 0)
          : 30,
        start_date: payload.startDate || null,
        end_date: payload.endDate || null,
        status: "draft",
        submitted_at: null,
      },
      transaction
    );

    if (Array.isArray(payload.mediaRefs)) {
      const mediaRows = mapMediaRefsToRows(campaign.id, payload.mediaRefs);
      await campaignRepository.replaceCampaignMedia(
        campaign.id,
        mediaRows,
        transaction
      );
    }

    await transaction.commit();

    return campaign;
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

const updateDraftCampaign = async ({ campaign, ownerId, payload }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    let category = null;

    if (payload.categoryId || payload.newCategoryName) {
      category = await resolveCampaignCategory({
        categoryId: payload.categoryId || campaign.category_id || null,
        newCategoryName: payload.newCategoryName || null,
        userId: ownerId,
        transaction,
      });
    }

    const nextDestination =
      payload.destination !== undefined ? payload.destination : campaign.destination;

    const resolvedDestination = resolveDraftDestination({
      destination: nextDestination,
      externalUrl: payload.externalUrl,
      whatsappNumber: payload.whatsappNumber,
      qadsStoreId: payload.qadsStoreId,
      qadsProductId: payload.qadsProductId,
    });

    const updatedCampaign = await campaignRepository.updateCampaign(
      campaign,
      {
        category_id: category ? category.id : campaign.category_id,
        title: payload.title ?? campaign.title,
        description: payload.description ?? campaign.description,
        country_code: payload.countryCode ?? campaign.country_code,
        currency_code: getCurrencyForCountry(
          payload.countryCode ?? campaign.country_code ?? "CM"
        ),
        product_name: payload.productName ?? campaign.product_name,
        unit_price_range: payload.unitPriceRange ?? campaign.unit_price_range,
        destination: nextDestination,
        destination_source_id:
          resolvedDestination.destinationSourceId ?? campaign.destination_source_id,
        destination_value:
          resolvedDestination.destinationValue ?? campaign.destination_value,
        allocated_budget: payload.budget ?? campaign.allocated_budget,
        advertiser_cpc: payload.advertiserCpc ?? campaign.advertiser_cpc,
        start_date:
          payload.startDate !== undefined ? payload.startDate : campaign.start_date,
        end_date:
          payload.endDate !== undefined ? payload.endDate : campaign.end_date,
        status: "draft",
        updated_at: new Date(),
      },
      transaction
    );

    if (Array.isArray(payload.mediaRefs)) {
      const mediaRows = mapMediaRefsToRows(updatedCampaign.id, payload.mediaRefs);
      await campaignRepository.replaceCampaignMedia(
        updatedCampaign.id,
        mediaRows,
        transaction
      );
    }

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

module.exports = {
  saveNewDraftCampaign,
  updateDraftCampaign,
};