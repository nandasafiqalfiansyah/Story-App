import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`,

  REPORT_LIST: `${BASE_URL}/stories`,
  REPORT_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_REPORT: `${BASE_URL}/stories`,

  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

async function apiRequest(url, options = {}) {
  try {
    const fetchResponse = await fetch(url, options);
    if (fetchResponse.ok) {
      if ('caches' in window) {
        const cache = await caches.open('api-cache');
        cache.put(url, fetchResponse.clone());
      }
    }
    const json = await fetchResponse.json();
    return { ...json, ok: fetchResponse.ok };
  } catch (error) {
    console.warn('Fetch gagal, mencoba cache:', error);
    if ('caches' in window) {
      const cache = await caches.open('api-cache');
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        return await cachedResponse.json();
      }
    }
    return { error: 'Gagal menghubungi server', ok: false };
  }
}

export const getRegistered = async ({ name, email, password }) =>
  apiRequest(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

export const getLogin = async ({ email, password }) =>
  apiRequest(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const getMyUserInfo = async () =>
  apiRequest(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

// Reports API
export const getAllReports = async () =>
  apiRequest(ENDPOINTS.REPORT_LIST, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

export const getReportById = async (id) =>
  apiRequest(ENDPOINTS.REPORT_DETAIL(id), {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

export const AddNewStory = async ({ description, photo, lat, lon }) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat !== undefined) formData.append('lat', lat);
  if (lon !== undefined) formData.append('lon', lon);

  return apiRequest(ENDPOINTS.STORE_NEW_REPORT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });
};

// Push Notification API
export const subscribePushNotification = async ({ endpoint, keys: { p256dh, auth } }) =>
  apiRequest(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ endpoint, keys: { p256dh, auth } }),
  });

export const unsubscribePushNotification = async ({ endpoint }) =>
  apiRequest(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ endpoint }),
  });
