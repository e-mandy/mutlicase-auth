export interface IOTPService {
    generateSecret: (email: string) => string
}