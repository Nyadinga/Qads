const { body, validationResult } = require('express-validator');

const validateCampaignCreation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Campaign title is required')
        .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),

    body('destination_type')
        .notEmpty().withMessage('Destination type is required')
        .isIn(['external_url', 'whatsapp', 'qads_store', 'qads_product'])
        .withMessage('Invalid destination type'),

    body('destination_value')
        .trim()
        .notEmpty().withMessage('Destination value (link or ID) is required'),

    body('allocated_budget')
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Allocated budget must be a valid decimal amount')
        .custom((value) => {
            if (parseFloat(value) < 0) throw new Error('Budget cannot be negative');
            return true;
        }),

    body('min_cpc')
        .isDecimal().withMessage('Minimum CPC must be a valid number'),

    body('advertiser_cpc')
        .isDecimal().withMessage('Advertiser CPC must be a valid number'),

    body('status')
        .optional()
        .isIn(['draft', 'pending_approval', 'active', 'paused', 'suspended', 'rejected', 'completed'])
        .withMessage('Invalid status value'),

    // Logic: Require budget > 0 if the user is submitting for approval
    body('allocated_budget').custom((value, { req }) => {
        if (req.body.status === 'pending_approval' && parseFloat(value) <= 0) {
            throw new Error('A budget greater than 0 is required to submit for approval');
        }
        return true;
    }),
];

const handleCampaignValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

module.exports = { validateCampaignCreation, handleCampaignValidationErrors };