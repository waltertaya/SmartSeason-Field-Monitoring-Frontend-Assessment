import api from './axios'

export const getFields = () => api.get('/fields/')
export const getField = (id) => api.get(`/fields/${id}/`)
export const createField = (data) => api.post('/fields/', data)
export const updateField = (id, data) => api.patch(`/fields/${id}/`, data)
export const deleteField = (id) => api.delete(`/fields/${id}/`)

export const getFieldUpdates = (id) => api.get(`/fields/${id}/updates/`)
export const createFieldUpdate = (id, data) => api.post(`/fields/${id}/updates/`, data)

export const getDashboard = () => api.get('/fields/dashboard/')
