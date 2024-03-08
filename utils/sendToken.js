export const sendToken = (res, user, statusCode = 200, message) => {

    const token = user.getJWTToken()
    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: "none"
    }).json({
        success: true,
        message,
        user
    })
}