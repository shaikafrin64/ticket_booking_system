import api from './api';

export const getAllEvents = (activeOnly = false) =>
  api.get(`/events?activeOnly=${activeOnly}`);

export const getEvent = (id) => api.get(`/events/${id}`);

export const getSeatsForEvent = (eventId) =>
  api.get(`/seats/event/${eventId}`);

// Admin
export const createEvent = (data) => api.post('/admin/events', data);
export const cancelEvent = (id, reason) =>
  api.put(`/admin/events/${id}/cancel`, { reason });
export const updateEventStatus = (id, status) =>
  api.put(`/admin/events/${id}/status?status=${status}`);
export const getAdminEvents = () => api.get('/admin/events');
