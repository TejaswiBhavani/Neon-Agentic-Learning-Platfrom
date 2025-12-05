import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth interceptor removed

export const learnerService = {
    getProfile: (id: string) => api.get(`/learners/${id}`),
    switchDomain: (id: string, domain: string) => api.post(`/learners/${id}/switch-domain`, { domain }),
    getAffectiveState: (id: string) => api.get(`/learners/${id}/affective-state`),
    getProgress: (id: string) => api.get(`/learners/${id}/progress`),
    getBadges: (id: string) => api.get(`/learners/${id}/badges`),
    updateSettings: (id: string, data: any) => api.put(`/learners/${id}/settings`, data),
};

export const studyPlanService = {
    generate: () => api.post('/study-plans/generate'),
    getGraph: (domain: string) => api.get(`/domains/${domain}/graph/visualization`),
    getDomains: () => api.get('/domains'),
    getQuestion: (conceptId: string) => api.get(`/questions/${conceptId}`),
};

export const interactionService = {
    log: (data: any) => api.post('/interactions', data),
};

export default api;
