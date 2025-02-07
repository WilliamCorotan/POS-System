export const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("checkk >>", API_URL);
export const createHeaders = (userId: string) => ({
    "Content-Type": "application/json",
    "X-User-ID": userId,
    Authorization: `Bearer ${userId}`,
});
