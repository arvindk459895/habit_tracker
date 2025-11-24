export interface UserMetadata {
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    userAgent?: string;
    language?: string;
    screenResolution?: string;
}

export const fetchUserMetadata = async (): Promise<UserMetadata> => {
    const metadata: UserMetadata = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
    };

    try {
        // Using ipapi.co for IP and location data (free tier, no key required for low volume)
        // Alternative: ip-api.com
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            metadata.ip = data.ip;
            metadata.city = data.city;
            metadata.region = data.region;
            metadata.country = data.country_name;
        }
    } catch (error) {
        console.warn('Failed to fetch IP metadata:', error);
    }

    return metadata;
};
