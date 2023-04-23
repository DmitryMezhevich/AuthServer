const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne( {email} )
        if(candidate) {
            throw ApiError.BadRequest(`User ${email} already exist`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if(!user) {
            throw ApiError.BadRequest(`User ${email} don't been find`)
        }
        user.isActivated = true
        await user.save()
    }

    async login(email, password){
        const user = await UserModel.findOne({email})
        if(!user) {
            throw ApiError.BadRequest(`User: ${email} not found`)
        }
        const isPasswordEquals = await bcrypt.compare(password, user.password)
        if(!isPasswordEquals) {
            throw ApiError.UnauthorizedError()
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(email) {
        const user = await UserModel.findOne({email})
        return await tokenService.removeTokenByUser(user)
    }

    async refresh(refreshToken) {
        if(refreshToken.isEmpty) {
            throw ApiError.UnauthorizedError()
        }
        const verifyToken = await tokenService.validationRefreshToken(refreshToken)
        const tokenDB = await tokenService.findToken(refreshToken)

        if(!verifyToken || !tokenDB) {
            throw ApiError.UnauthorizedError()
        }

        const user = await UserModel.findById(tokenDB.user)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        tokenDB.refreshToken = tokens.refreshToken
        await tokenDB.save()

        return {...tokens, user: userDto }
    }

    async getAllUsers() {
        return UserModel.find()
    }
}

module.exports = new UserService()