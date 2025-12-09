/**
 * Evolution API Service
 * Handles instance creation and QR code connection.
 * 
 * NOTE: Replace BASE_URL with your actual Evolution API or n8n webhook URL.
 */

// API Configuration
const BASE_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

if (!API_KEY) {
    console.error("Evolution API Key is missing in .env (VITE_EVOLUTION_API_KEY)");
} else {
    // Safe log to confirm key is present (first 4 chars)
    console.log(`Evolution API Key loaded: ${API_KEY.substring(0, 4)}...`);
}

export const apiService = {
    /**
     * Creates a new instance in Evolution API
     * @param {string} instanceName - Name of the instance (e.g., "warley-test")
     * @returns {Promise<Object>} - The created instance data
     */
    async createInstance(instanceName) {
        const WEBHOOK_URL = "https://n8n-n8n-start.kof6cn.easypanel.host/webhook/c95a71fd-1c44-4370-86c6-b24bee1ae69c";

        try {
            // Create Instance with Webhook Configuration
            // Append API Key to query string to satisfy Gateway requirements if headers fail
            const createResponse = await fetch(`${BASE_URL}/instance/create?apikey=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    instanceName: instanceName,
                    qrcode: true,
                    integration: "WHATSAPP-BAILEYS",
                    webhook: {
                        enabled: true,
                        url: WEBHOOK_URL,
                        byEvents: false,
                        base64: false,
                        events: [
                            "QRCODE_UPDATED",
                            "MESSAGES_UPSERT",
                            "MESSAGES_UPDATE",
                            "CONNECTION_UPDATE"
                        ]
                    }
                })
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                let errorMsg = 'Failed to create instance';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMsg = errorJson.message || errorJson.error || errorMsg;
                } catch (e) {
                    errorMsg = errorText || errorMsg;
                }
                throw new Error(errorMsg);
            }

            return await createResponse.json();
        } catch (error) {
            console.error('Error creating instance:', error);
            throw error;
        }
    },

    /**
     * Connects to an instance and retrieves the QR Code
     * @param {string} instanceName - Name of the instance to connect
     * @returns {Promise<Object>} - Object containing the QR code (base64 or url)
     */
    async connectInstance(instanceName) {
        try {
            const response = await fetch(`${BASE_URL}/instance/connect/${instanceName}?apikey=${API_KEY}`, {
                method: 'GET',
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch QR Code');
            }

            return await response.json();
        } catch (error) {
            console.error('Error connecting instance:', error);
            throw error;
        }
    },

    /**
     * Deletes an instance from Evolution API
     * @param {string} instanceName - Name of the instance to delete
     * @returns {Promise<Object>} - The deletion response
     */
    async deleteInstance(instanceName) {
        try {
            const response = await fetch(`${BASE_URL}/instance/delete/${instanceName}?apikey=${API_KEY}`, {
                method: 'DELETE',
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!response.ok) {
                // It might be 404 if already deleted, which is fine, but let's throw to handle it in UI
                throw new Error('Failed to delete instance');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting instance:', error);
            throw error;
        }
    },

    /**
     * Fetches the connection state of an instance
     * @param {string} instanceName - Name of the instance
     * @returns {Promise<Object>} - The connection state object
     */
    async fetchConnectionState(instanceName) {
        try {
            const response = await fetch(`${BASE_URL}/instance/connectionState/${instanceName}?apikey=${API_KEY}`, {
                method: 'GET',
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            if (!response.ok) {
                // Return null or throw? Let's throw to be handled
                throw new Error('Failed to fetch connection state');
            }

            return await response.json();
        } catch (error) {
            // Suppress log for polling noise, or keep it minimal
            // console.error('Error fetching state:', error);
            throw error;
        }
    }
};
