export interface IOTPService {
    generateSecret: (email: string) => string,
    verifyOTPCode: (otp_code: string, secret: string) => boolean
}