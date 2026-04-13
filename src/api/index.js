import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://trial-v1-syv7.onrender.com';

const getAuthHeaders = async () => {
  const rawToken = await AsyncStorage.getItem('userToken');
  const token = (rawToken && rawToken !== 'undefined' && rawToken !== 'null') ? rawToken.trim() : null;
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const fetchData = async (endpoint) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${text.substring(0, 500)}`);
  try { return JSON.parse(text); } catch { throw new Error('Received HTML instead of JSON.'); }
};

export const postData = async (endpoint, data) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${text.substring(0, 500)}`);
  try { return JSON.parse(text); } catch { throw new Error('Received HTML instead of JSON.'); }
};
