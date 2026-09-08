import api from './api';

const BASE = '/admin/theme';

export const themeService = {
  async getSettings() {
    const { data } = await api.get(BASE);
    return data?.data;
  },

  async updateSettings(payload) {
    const { data } = await api.put(BASE, payload);
    return data?.data;
  },

  async uploadBackground({ file, section, themeMode, enabled = true }) {
    const form = new FormData();
    form.append('file', file);
    form.append('section', section);
    form.append('themeMode', themeMode);
    form.append('enabled', enabled ? 'true' : 'false');
    const { data } = await api.post(`${BASE}/upload-background`, form);
    return data?.data;
  },

  async clearBackground(section, themeMode) {
    const { data } = await api.put(BASE, {
      backgroundSlot: {
        section,
        themeMode,
        clear: true,
      },
    });
    return data?.data;
  },

  async setBackgroundEnabled(section, themeMode, enabled, imageUrl) {
    const { data } = await api.put(BASE, {
      backgroundSlot: {
        section,
        themeMode,
        enabled,
        imageUrl,
      },
    });
    return data?.data;
  },
};
