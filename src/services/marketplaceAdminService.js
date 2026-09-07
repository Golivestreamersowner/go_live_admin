import api from './api';

export const marketplaceAdminService = {
  async getSettings() {
    const response = await api.get('/admin/marketplace/settings');
    return response.data.data;
  },

  async updateSettings({
    platformMarkup,
    vendorMarkupCapPct,
    taxRatePct,
    requireProductApproval,
    requireBannerApproval,
    themeColor,
  }) {
    const response = await api.patch('/admin/marketplace/settings', {
      platformMarkup,
      vendorMarkupCapPct,
      taxRatePct,
      requireProductApproval,
      requireBannerApproval,
      themeColor,
    });
    return response.data.data;
  },

  async getOrders(params = {}) {
    const { page = 1, limit = 20, status, vendorId } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(vendorId && { vendorId }),
    });
    const response = await api.get(`/admin/marketplace/orders?${queryParams}`);
    return response.data.data;
  },

  async getEarnings(params = {}) {
    const { startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await api.get(`/admin/marketplace/earnings?${queryParams}`);
    return response.data.data;
  },

  async getProducts(params = {}) {
    const { status, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await api.get(`/admin/marketplace/products?${queryParams}`);
    return response.data.data;
  },

  async getProduct(id) {
    const response = await api.get(`/admin/marketplace/products/${id}`);
    return response.data.data;
  },

  async approveProduct(id, edits = {}) {
    const response = await api.patch(`/admin/marketplace/products/${id}/approve`, edits);
    return response.data.data;
  },

  async rejectProduct(id, note) {
    const response = await api.patch(`/admin/marketplace/products/${id}/reject`, { note });
    return response.data.data;
  },

  async getVendors(params = {}) {
    const { search, suspended, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(suspended !== undefined && suspended !== '' && { suspended: String(suspended) }),
    });
    const response = await api.get(`/admin/marketplace/vendors?${queryParams}`);
    return response.data.data;
  },

  async getVendor(id) {
    const response = await api.get(`/admin/marketplace/vendors/${id}`);
    return response.data.data;
  },

  async setVendorSuspended(id, suspended, reason) {
    const response = await api.patch(`/admin/marketplace/vendors/${id}/suspend`, {
      suspended,
      reason,
    });
    return response.data.data;
  },

  async cancelSuborder(id, reason) {
    const response = await api.patch(`/admin/marketplace/orders/${id}/cancel`, { reason });
    return response.data.data;
  },

  async approveBanner(vendorId) {
    const response = await api.patch(`/admin/marketplace/banners/${vendorId}/approve`);
    return response.data.data;
  },

  async rejectBanner(vendorId, note) {
    const response = await api.patch(`/admin/marketplace/banners/${vendorId}/reject`, { note });
    return response.data.data;
  },
};
