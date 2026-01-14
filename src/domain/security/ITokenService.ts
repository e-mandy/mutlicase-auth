interface ITokenService {
    generateAccessToken: (payload: { userId: string }) => string,
    generateRefreshToken: (payload: { userId: string }) => string,
    verifyToken: (token: string) => any
}