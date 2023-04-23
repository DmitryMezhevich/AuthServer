const ApiError = require('../exceptions/api-error')
const tokenServer = require('../service/token-service')
const {validationResult} = require("express-validator");

module.exports = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }

        const userData = await tokenServer.validationAccessToken(accessToken)
        if (!userData) {
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData

        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}