import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Palette, Image as ImageIcon, Save, Trash2, Upload } from 'lucide-react';
import { themeService } from '../services/themeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';

const SECTIONS = [
  { key: 'home', label: 'Home' },
  { key: 'feed', label: 'Feed' },
  { key: 'live', label: 'Live' },
];

const MODES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

const COLOR_FIELDS = [
  { key: 'background', label: 'Background' },
  { key: 'secondaryBackground', label: 'Secondary Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'card', label: 'Card' },
  { key: 'elevated', label: 'Elevated' },
  { key: 'primary', label: 'Primary' },
  { key: 'primaryStrong', label: 'Primary Strong' },
  { key: 'text', label: 'Text' },
  { key: 'secondaryText', label: 'Secondary Text' },
  { key: 'mutedText', label: 'Muted Text' },
  { key: 'border', label: 'Border' },
  { key: 'borderSubtle', label: 'Border Subtle' },
  { key: 'icon', label: 'Icon' },
  { key: 'accentSurface', label: 'Accent Surface' },
  { key: 'inputBackground', label: 'Input Background' },
  { key: 'overlay', label: 'Overlay Color' },
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function imageSrc(image) {
  if (!image) return '';
  if (image.startsWith('http') || image.startsWith('blob:')) return image;
  if (!API_BASE) return '';
  return `${API_BASE}/files?key=${encodeURIComponent(image)}`;
}

const emptyColors = () =>
  Object.fromEntries(COLOR_FIELDS.map((f) => [f.key, '']));

const emptyBackgrounds = () => ({
  home: {
    light: { enabled: false, imageUrl: '' },
    dark: { enabled: false, imageUrl: '' },
  },
  feed: {
    light: { enabled: false, imageUrl: '' },
    dark: { enabled: false, imageUrl: '' },
  },
  live: {
    light: { enabled: false, imageUrl: '' },
    dark: { enabled: false, imageUrl: '' },
  },
});

const ThemeAppearance = () => {
  const [loading, setLoading] = useState(true);
  const [savingColors, setSavingColors] = useState(false);
  const [savingOverlays, setSavingOverlays] = useState(false);
  const [lightColors, setLightColors] = useState(emptyColors);
  const [darkColors, setDarkColors] = useState(emptyColors);
  const [backgrounds, setBackgrounds] = useState(emptyBackgrounds);
  const [overlays, setOverlays] = useState({ light: 0.35, dark: 0.5 });
  const [uploadBusy, setUploadBusy] = useState('');
  const [version, setVersion] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await themeService.getSettings();
      setVersion(data?.version || 1);
      setLightColors({ ...emptyColors(), ...(data?.lightTheme?.colors || {}) });
      setDarkColors({ ...emptyColors(), ...(data?.darkTheme?.colors || {}) });
      setBackgrounds({
        ...emptyBackgrounds(),
        ...(data?.backgrounds || {}),
        home: {
          ...emptyBackgrounds().home,
          ...(data?.backgrounds?.home || {}),
        },
        feed: {
          ...emptyBackgrounds().feed,
          ...(data?.backgrounds?.feed || {}),
        },
        live: {
          ...emptyBackgrounds().live,
          ...(data?.backgrounds?.live || {}),
        },
      });
      setOverlays({
        light: data?.overlays?.light ?? 0.35,
        dark: data?.overlays?.dark ?? 0.5,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveColors = async () => {
    try {
      setSavingColors(true);
      const data = await themeService.updateSettings({
        lightTheme: { colors: lightColors },
        darkTheme: { colors: darkColors },
      });
      setVersion(data?.version || version + 1);
      toast.success('Theme colors saved — apps will pick this up on next fetch');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save theme colors');
    } finally {
      setSavingColors(false);
    }
  };

  const saveOverlays = async () => {
    try {
      setSavingOverlays(true);
      const data = await themeService.updateSettings({ overlays });
      setVersion(data?.version || version + 1);
      toast.success('Background overlay opacity saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save overlays');
    } finally {
      setSavingOverlays(false);
    }
  };

  const onUpload = async (section, themeMode, file) => {
    if (!file) return;
    const busyKey = `${section}-${themeMode}`;
    try {
      setUploadBusy(busyKey);
      const result = await themeService.uploadBackground({
        file,
        section,
        themeMode,
        enabled: true,
      });
      if (result?.theme?.backgrounds) {
        setBackgrounds({
          ...emptyBackgrounds(),
          ...result.theme.backgrounds,
        });
        setVersion(result.theme.version || version + 1);
      } else {
        await load();
      }
      toast.success(`${section} / ${themeMode} background uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadBusy('');
    }
  };

  const toggleEnabled = async (section, themeMode, enabled) => {
    const slot = backgrounds?.[section]?.[themeMode];
    try {
      setUploadBusy(`${section}-${themeMode}-toggle`);
      const data = await themeService.setBackgroundEnabled(
        section,
        themeMode,
        enabled,
        slot?.imageUrl || '',
      );
      if (data?.backgrounds) {
        setBackgrounds({ ...emptyBackgrounds(), ...data.backgrounds });
        setVersion(data.version || version + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update background');
    } finally {
      setUploadBusy('');
    }
  };

  const clearBg = async (section, themeMode) => {
    try {
      setUploadBusy(`${section}-${themeMode}-clear`);
      const data = await themeService.clearBackground(section, themeMode);
      if (data?.backgrounds) {
        setBackgrounds({ ...emptyBackgrounds(), ...data.backgrounds });
        setVersion(data.version || version + 1);
      }
      toast.success('Background removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove background');
    } finally {
      setUploadBusy('');
    }
  };

  const colorEditors = useMemo(
    () => [
      { title: 'Light Theme Colors', mode: 'light', value: lightColors, set: setLightColors },
      { title: 'Dark Theme Colors', mode: 'dark', value: darkColors, set: setDarkColors },
    ],
    [lightColors, darkColors],
  );

  if (loading) {
    return (
      <div className="p-8 text-gray-600">Loading theme settings…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="h-8 w-8 text-red-500" />
            App Theme
          </h1>
          <p className="text-gray-600 mt-1">
            Light theme defaults match the current mobile app palette. Dark theme uses charcoal
            surfaces. Backgrounds apply only to Home, Feed, and Live — each must choose Light or Dark.
          </p>
        </div>
        <Badge variant="outline">v{version}</Badge>
      </div>

      {colorEditors.map((editor) => (
        <Card key={editor.mode}>
          <CardHeader>
            <CardTitle>{editor.title}</CardTitle>
            <CardDescription>
              {editor.mode === 'light'
                ? 'Preserve existing app colors unless intentionally changing them.'
                : 'Charcoal dark mode tokens — not a simple invert of light.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_FIELDS.map((field) => (
                <div key={`${editor.mode}-${field.key}`} className="space-y-1.5">
                  <Label htmlFor={`${editor.mode}-${field.key}`}>{field.label}</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      aria-label={`${field.label} picker`}
                      className="h-10 w-12 rounded border border-gray-200 bg-white p-1"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(editor.value[field.key] || '')
                          ? editor.value[field.key]
                          : '#ffffff'
                      }
                      onChange={(e) =>
                        editor.set((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                    <Input
                      id={`${editor.mode}-${field.key}`}
                      value={editor.value[field.key] || ''}
                      onChange={(e) =>
                        editor.set((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder="#RRGGBB or rgba()"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={saveColors} disabled={savingColors}>
          <Save className="h-4 w-4 mr-2" />
          {savingColors ? 'Saving…' : 'Save theme colors'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Background overlays</CardTitle>
          <CardDescription>
            Opacity of the theme-aware overlay drawn above Home / Feed / Live background images.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((m) => (
            <div key={m.key} className="space-y-1.5">
              <Label>{m.label} overlay opacity (0–1)</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={overlays[m.key]}
                onChange={(e) =>
                  setOverlays((prev) => ({
                    ...prev,
                    [m.key]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="md:col-span-2 flex justify-end">
            <Button variant="outline" onClick={saveOverlays} disabled={savingOverlays}>
              {savingOverlays ? 'Saving…' : 'Save overlays'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Section backgrounds
          </CardTitle>
          <CardDescription>
            Only Home, Feed, and Live. Each upload must belong to Light or Dark. Light backgrounds
            never show in Dark mode (and vice versa).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.key} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{section.label}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MODES.map((mode) => {
                  const slot = backgrounds?.[section.key]?.[mode.key] || {
                    enabled: false,
                    imageUrl: '',
                  };
                  const busyKey = `${section.key}-${mode.key}`;
                  const busy = uploadBusy.startsWith(busyKey);
                  return (
                    <div
                      key={busyKey}
                      className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {section.label} · {mode.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            section={section.key} · themeMode={mode.key}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Enabled</Label>
                          <Switch
                            checked={!!slot.enabled && !!slot.imageUrl}
                            disabled={!slot.imageUrl || busy}
                            onCheckedChange={(checked) =>
                              toggleEnabled(section.key, mode.key, checked)
                            }
                          />
                        </div>
                      </div>

                      {slot.imageUrl ? (
                        <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50 aspect-[16/7]">
                          <img
                            src={imageSrc(slot.imageUrl)}
                            alt={`${section.label} ${mode.label} background`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[16/7] flex items-center justify-center text-sm text-gray-500">
                          No image — app uses theme background color
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100">
                          <Upload className="h-4 w-4" />
                          {busy ? 'Working…' : slot.imageUrl ? 'Replace' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={busy}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (file) void onUpload(section.key, mode.key, file);
                            }}
                          />
                        </label>
                        {slot.imageUrl ? (
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={busy}
                            onClick={() => clearBg(section.key, mode.key)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeAppearance;
