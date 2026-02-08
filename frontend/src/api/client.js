import axios from 'axios';

const API_BASE = '/api';

export const api = {
    // Campaign endpoints
    analyzeCampaign: async (campaignData) => {
        const response = await axios.post(`${API_BASE}/campaign/analyze`, campaignData);
        return response.data;
    },

    checkTrendHealth: async (trendName) => {
        const response = await axios.post(`${API_BASE}/campaign/health`, { trend_name: trendName });
        return response.data;
    },

    compareHashtags: async (hashtags, platform = 'instagram') => {
        const response = await axios.post(`${API_BASE}/campaign/compare-hashtags`, { hashtags, platform });
        return response.data;
    },

    // Trend endpoints
    listTrends: async () => {
        const response = await axios.get(`${API_BASE}/trends/list`);
        return response.data;
    },

    analyzeTrend: async (trendName) => {
        const response = await axios.post(`${API_BASE}/trends/analyze`, { trend_name: trendName });
        return response.data;
    },

    // Health check
    healthCheck: async () => {
        const response = await axios.get(`${API_BASE}/health`);
        return response.data;
    }
};

export default api;
