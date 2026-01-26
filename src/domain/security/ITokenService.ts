export interface ITokenService {
    generateAccessToken: (payload: { userId: string }) => string,
    generateRefreshToken: (payload: { userId: string }) => string,
    generateRequestResetToken: (payload: { userId: string }) => string,
    generateEmailToken: (payload: { email: string }) => string,
    verifyAccessToken: (token: string) => { userId: string } | null,
    verifyRefreshToken: (token: string) => { userId: string} | null,
    verifyResetPasswordToken: (token: string) => { userId: string } | null
}