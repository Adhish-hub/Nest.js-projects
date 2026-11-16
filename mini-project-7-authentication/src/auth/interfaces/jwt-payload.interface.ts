export interface JwtPayload{
    sub: string;
    sessionId: string;
    type: "access" | "refresh";
}