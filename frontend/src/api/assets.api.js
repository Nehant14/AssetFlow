import axiosClient from './axiosClient';

export const getAssets = (params = {}) => axiosClient.get('/assets', { params });
export const createAsset = (assetData) => axiosClient.post('/assets', assetData);
export const updateAsset = (id, assetData) => axiosClient.patch(`/assets/${id}`, assetData);
export const deleteAsset = (id) => axiosClient.delete(`/assets/${id}`);
