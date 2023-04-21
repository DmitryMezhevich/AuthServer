const userService = require('../service/user-service')
class UserController {
    async registration(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.registration(email, password)
            // cookie
            return res.json(userData)
        } catch (e) {
            console.log(e)
        }
    }

    async login(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async logout(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async activate(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async refresh(req, res, next) {
        try {

        } catch (e) {

        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(['123', '456'])
        } catch (e) {

        }
    }
}

module.exports = new UserController()