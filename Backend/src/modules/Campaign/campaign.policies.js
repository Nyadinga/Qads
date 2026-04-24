const campaignRepository = require("./advertiser/advertiser.repository");

const getCampaignIdFromRequest = (req) => {
  return req.params.id || req.params.campaignId || req.body.campaignId || null;
};

const requireAuthenticatedUser = (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      const error = new Error("Unauthorized request.");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
};

const loadCampaignById = async (req, res, next) => {
  try {
    const campaignId = getCampaignIdFromRequest(req);

    if (!campaignId) {
      const error = new Error("Campaign id is required.");
      error.statusCode = 400;
      throw error;
    }

    const campaign = await campaignRepository.findCampaignById(campaignId);

    if (!campaign) {
      const error = new Error("Campaign not found.");
      error.statusCode = 404;
      throw error;
    }

    req.campaign = campaign;
    next();
  } catch (error) {
    next(error);
  }
};

const requireCampaignOwner = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      const error = new Error("Unauthorized request.");
      error.statusCode = 401;
      throw error;
    }

    const campaignId = getCampaignIdFromRequest(req);

    if (!campaignId) {
      const error = new Error("Campaign id is required.");
      error.statusCode = 400;
      throw error;
    }

    const campaign = await campaignRepository.findCampaignByIdAndOwnerId(
      campaignId,
      req.auth.userId
    );

    if (!campaign) {
      const error = new Error(
        "You are not allowed to perform this action on this campaign."
      );
      error.statusCode = 403;
      throw error;
    }

    req.campaign = campaign;
    next();
  } catch (error) {
    next(error);
  }
};

const requirePromotableCampaign = async (req, res, next) => {
  try {
    const campaignId = getCampaignIdFromRequest(req);

    if (!campaignId) {
      const error = new Error("Campaign id is required.");
      error.statusCode = 400;
      throw error;
    }

    const campaign = await campaignRepository.findActiveCampaignById(campaignId);

    if (!campaign) {
      const error = new Error("This campaign is not available for promotion.");
      error.statusCode = 403;
      throw error;
    }

    req.campaign = campaign;
    next();
  } catch (error) {
    next(error);
  }
};

const requireCampaignStatus = (...allowedStatuses) => {
  return (req, res, next) => {
    try {
      if (!req.campaign) {
        const error = new Error("Campaign context is missing.");
        error.statusCode = 500;
        throw error;
      }

      if (!allowedStatuses.includes(req.campaign.status)) {
        const error = new Error(
          `This action is not allowed when campaign status is ${req.campaign.status}.`
        );
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const requireAdmin = (req, res, next) => {
  try {
    if (!req.auth?.isAdmin) {
      const error = new Error("Admin access required.");
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAuthenticatedUser,
  loadCampaignById,
  requireCampaignOwner,
  requirePromotableCampaign,
  requireCampaignStatus,
  requireAdmin,
};