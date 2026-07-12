import axiosClient from './axiosClient';

// GET /api/assets?search=&category=&status=
export const getAssets = (params = {}) => {
  return axiosClient.get('/assets', { params });
};

// POST /api/assets (Admin, AssetManager) — the asset tag (e.g. AF-0001) is
// auto-generated server-side, so it isn't part of the payload.
export const createAsset = (assetData) => {
  return axiosClient.post('/assets', assetData);
};
