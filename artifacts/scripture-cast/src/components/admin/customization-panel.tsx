import React, { useRef } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, ImageIcon, X, Info } from 'lucide-react';
import type { Typography, Background, Transition } from '@workspace/api-client-react';

// ── Telugu font catalog ───────────────────────────────────────────────────────

const TELUGU_FONTS = [
  { label: 'Modern',            font: 'Noto Sans Telugu',    sample: 'నమస్కారం', multiWeight: true  },
  { label: 'Classic Serif',     font: 'Noto Serif Telugu',   sample: 'నమస్కారం', multiWeight: true  },
  { label: 'Rounded',           font: 'Baloo Tammudu 2',     sample: 'నమస్కారం', multiWeight: true  },
  { label: 'Clean',             font: 'Mandali',             sample: 'నమస్కారం', multiWeight: false },
  { label: 'Readable',         font: 'Mallanna',            sample: 'నమస్కారం', multiWeight: false },
  { label: 'Slim',              font: 'NTR',                 sample: 'నమస్కారం', multiWeight: false },
  { label: 'Light & Airy',      font: 'Gidugu',              sample: 'నమస్కారం', multiWeight: false },
  { label: 'Script',            font: 'Vaza',                sample: 'నమస్కారం', multiWeight: false },
  { label: 'Bold Display',      font: 'Ramabhadra',          sample: 'నమస్కారం', multiWeight: false },
  { label: 'Elegant',           font: 'Gurajada',            sample: 'నమస్కారం', multiWeight: false },
  { label: 'Traditional',       font: 'Suranna',             sample: 'నమస్కారం', multiWeight: false },
  { label: 'Calligraphic',      font: 'Ramaraja',            sample: 'నమస్కారం', multiWeight: false },
  { label: 'Decorative',        font: 'Ponnala',             sample: 'నమస్కారం', multiWeight: false },
  { label: 'Vintage',           font: 'Tenali Ramakrishna',  sample: 'నమస్కారం', multiWeight: false },
  { label: 'Condensed',         font: 'Dhurjati',            sample: 'నమస్కారం', multiWeight: false },
  { label: 'Handwritten',       font: 'Timmana',             sample: 'నమస్కారం', multiWeight: false },
] as const;

const MULTI_WEIGHT_FONT_NAMES = new Set<string>(
  TELUGU_FONTS.filter((f) => f.multiWeight).map((f) => f.font)
);

const WEIGHT_OPTIONS = [
  { value: 'light',   label: 'Light'   },
  { value: 'regular', label: 'Regular' },
  { value: 'medium',  label: 'Medium'  },
  { value: 'bold',    label: 'Bold'    },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export function CustomizationPanel() {
  const store = usePresentationStore();
  const { mutate: updateState } = useUpdatePresentationState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFont     = store.typography?.fontFamily ?? 'Noto Sans Telugu';
  const isMultiWeight   = MULTI_WEIGHT_FONT_NAMES.has(currentFont);

  // ── Broadcast helpers ────────────────────────────────────────────────────

  const broadcast = (patch: {
    typography?: Typography;
    background?: Background;
    transition?: Transition;
    language?: string;
    layout?: string;
  }) => {
    const s = usePresentationStore.getState();
    updateState({
      data: {
        active:     s.active,
        cleared:    s.cleared,
        verse:      s.verse,
        language:   (patch.language  ?? s.language)  as 'telugu' | 'english' | 'both',
        layout:     (patch.layout    ?? s.layout)    as 'stack' | 'side-by-side',
        typography: patch.typography ?? s.typography,
        background: patch.background ?? s.background,
        transition: patch.transition ?? s.transition,
      },
    });
  };

  const updateTypography = (key: string, value: unknown) => {
    const fresh = usePresentationStore.getState();
    const newTypo = { ...fresh.typography, [key]: value } as Typography;
    fresh.setPresentationState({ typography: newTypo });
    broadcast({ typography: newTypo });
  };

  const updateBackground = (key: string, value: unknown) => {
    const fresh = usePresentationStore.getState();
    const newBg = { ...fresh.background, [key]: value } as Background;
    fresh.setPresentationState({ background: newBg });
    broadcast({ background: newBg });
  };

  const updateTransition = (key: string, value: unknown) => {
    const fresh = usePresentationStore.getState();
    const newTrans = { ...fresh.transition, [key]: value } as Transition;
    fresh.setPresentationState({ transition: newTrans });
    broadcast({ transition: newTrans });
  };

  const updateLanguage = (lang: 'telugu' | 'english' | 'both') => {
    usePresentationStore.getState().setPresentationState({ language: lang });
    broadcast({ language: lang });
  };

  const updateLayout = (layout: 'stack' | 'side-by-side') => {
    usePresentationStore.getState().setPresentationState({ layout });
    broadcast({ layout });
  };

  // ── Image upload ─────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const MAX_W = 1920, MAX_H = 1080;
      let { width, height } = img;
      if (width > MAX_W)  { height = Math.round(height * MAX_W / width);  width  = MAX_W; }
      if (height > MAX_H) { width  = Math.round(width  * MAX_H / height); height = MAX_H; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(objectUrl);
      updateBackground('imageUrl', dataUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    img.src = objectUrl;
  };

  const clearImage = () => updateBackground('imageUrl', null);

  const currentLang   = store.language   ?? 'telugu';
  const currentLayout = store.layout     ?? 'stack';
  const showRef       = store.typography?.showReference ?? true;
  const refSize       = store.typography?.refFontSize   ?? 0;
  const refWeight     = store.typography?.refFontWeight ?? 'regular';

  return (
    <div className="flex flex-col h-full bg-card border-l border-border overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-border">
        <h2 className="font-semibold text-lg tracking-tight">Display Settings</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-6">

          {/* ── Language mode (top-level — affects everything) ── */}
          <div className="space-y-3 pb-4 border-b border-border">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Language Mode
            </Label>

            <div className="space-y-2">
              <Select value={currentLang} onValueChange={(v) => updateLanguage(v as 'telugu' | 'english' | 'both')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telugu">Telugu Only</SelectItem>
                  <SelectItem value="english">English Only (KJV)</SelectItem>
                  <SelectItem value="both">Telugu + English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentLang === 'both' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bilingual Layout</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['stack', 'side-by-side'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateLayout(opt)}
                      className={[
                        'flex flex-col items-center gap-1.5 p-2.5 rounded-md border text-xs font-medium transition-colors',
                        currentLayout === opt
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/40 text-muted-foreground',
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-0.5 w-full px-1">
                        {opt === 'stack' ? (
                          <>
                            <div className="h-1.5 rounded-sm bg-current opacity-80 w-full" />
                            <div className="h-1 rounded-sm bg-current opacity-40 w-4/5" />
                          </>
                        ) : (
                          <div className="flex gap-0.5 w-full">
                            <div className="flex-1 h-2.5 rounded-sm bg-current opacity-80" />
                            <div className="flex-1 h-2.5 rounded-sm bg-current opacity-40" />
                          </div>
                        )}
                      </div>
                      {opt === 'stack' ? 'Stacked' : 'Side by Side'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="typography" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="typography">Text</TabsTrigger>
              <TabsTrigger value="background">Bg</TabsTrigger>
              <TabsTrigger value="transition">Anim</TabsTrigger>
            </TabsList>

            {/* ── Typography ── */}
            <TabsContent value="typography" className="space-y-4 mt-4">

              {/* Font family with Telugu preview */}
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={store.typography?.fontFamily ?? 'Noto Sans Telugu'}
                  onValueChange={(v) => updateTypography('fontFamily', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TELUGU_FONTS.map(({ label, font, sample }) => (
                      <SelectItem key={font} value={font}>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-24 text-xs">{label}</span>
                          <span style={{ fontFamily: `"${font}", sans-serif` }} className="text-base">
                            {sample}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Font preview strip */}
                <div
                  className="px-3 py-2 rounded-md bg-muted/40 text-center text-sm border border-border/50"
                  style={{ fontFamily: `"${store.typography?.fontFamily ?? 'Noto Sans Telugu'}", sans-serif` }}
                >
                  దేవుడు లోకమును ప్రేమించెను
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Font Size</Label>
                  <span className="text-xs text-muted-foreground">{store.typography?.fontSize}px</span>
                </div>
                <Slider
                  min={20} max={120} step={1}
                  value={[store.typography?.fontSize || 56]}
                  onValueChange={([v]) => updateTypography('fontSize', v)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label htmlFor="autoscale-toggle">Auto Scale</Label>
                  <p className="text-xs text-muted-foreground">Adjust size by verse length</p>
                </div>
                <Switch
                  id="autoscale-toggle"
                  checked={store.typography?.autoScale ?? true}
                  onCheckedChange={(v) => updateTypography('autoScale', v)}
                />
              </div>

              {/* Font weight — with note for single-weight fonts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Font Weight</Label>
                  {!isMultiWeight && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Info className="h-3 w-3" />
                      Single weight only
                    </span>
                  )}
                </div>
                <Select
                  value={store.typography?.fontWeight}
                  onValueChange={(v) => updateTypography('fontWeight', v)}
                  disabled={!isMultiWeight}
                >
                  <SelectTrigger className={!isMultiWeight ? 'opacity-50' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEIGHT_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isMultiWeight && (
                  <p className="text-xs text-muted-foreground">
                    Switch to Noto Sans Telugu or Noto Serif Telugu for variable weight support.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={store.typography?.textColor}
                    onChange={(e) => updateTypography('textColor', e.target.value)}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={store.typography?.textColor}
                    onChange={(e) => updateTypography('textColor', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Line Height</Label>
                  <span className="text-xs text-muted-foreground">{store.typography?.lineHeight}</span>
                </div>
                <Slider
                  min={1} max={2.5} step={0.05}
                  value={[store.typography?.lineHeight || 1.4]}
                  onValueChange={([v]) => updateTypography('lineHeight', v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Text Align</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateTypography('textAlign', align)}
                      className={[
                        'py-1.5 rounded-md border text-xs font-medium capitalize transition-colors',
                        store.typography?.textAlign === align
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="shadow-toggle">Drop Shadow</Label>
                <Switch
                  id="shadow-toggle"
                  checked={store.typography?.shadow}
                  onCheckedChange={(v) => updateTypography('shadow', v)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="outline-toggle">Text Outline</Label>
                <Switch
                  id="outline-toggle"
                  checked={store.typography?.outline}
                  onCheckedChange={(v) => updateTypography('outline', v)}
                />
              </div>

              {store.typography?.outline && (
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Outline Width</Label>
                    <span className="text-xs text-muted-foreground">{store.typography?.outlineWidth}px</span>
                  </div>
                  <Slider
                    min={1} max={6} step={1}
                    value={[store.typography?.outlineWidth || 2]}
                    onValueChange={([v]) => updateTypography('outlineWidth', v)}
                  />
                </div>
              )}

              {/* ── Show Reference toggle + conditional ref controls ── */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label htmlFor="ref-toggle">Show Reference</Label>
                  <p className="text-xs text-muted-foreground">e.g. యోహాను 3:16</p>
                </div>
                <Switch
                  id="ref-toggle"
                  checked={showRef}
                  onCheckedChange={(v) => updateTypography('showReference', v)}
                />
              </div>

              {showRef && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Reference Styling
                  </p>

                  {/* Reference font size */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-muted-foreground text-sm">Size</Label>
                      <span className="text-xs text-muted-foreground">
                        {refSize > 0 ? `${refSize}px` : 'Auto'}
                      </span>
                    </div>
                    <Slider
                      min={0} max={80} step={2}
                      value={[refSize]}
                      onValueChange={([v]) => updateTypography('refFontSize', v)}
                    />
                    <p className="text-xs text-muted-foreground">0 = auto (≈52% of main size)</p>
                  </div>

                  {/* Reference font weight */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Weight</Label>
                    <Select
                      value={refWeight}
                      onValueChange={(v) => updateTypography('refFontWeight', v)}
                      disabled={!isMultiWeight}
                    >
                      <SelectTrigger className={!isMultiWeight ? 'opacity-50' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHT_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isMultiWeight && (
                      <p className="text-xs text-muted-foreground">
                        Requires Noto Sans or Noto Serif Telugu.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── Background ── */}
            <TabsContent value="background" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={store.background?.type}
                  onValueChange={(v) => updateBackground('type', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {store.background?.type === 'solid' && (
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={store.background?.color} onChange={(e) => updateBackground('color', e.target.value)} className="w-12 h-8 p-1 cursor-pointer" />
                    <Input type="text"  value={store.background?.color} onChange={(e) => updateBackground('color', e.target.value)} className="flex-1 font-mono text-sm" />
                  </div>
                </div>
              )}

              {store.background?.type === 'gradient' && (
                <>
                  <div className="space-y-2">
                    <Label>Start Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={store.background?.gradientStart} onChange={(e) => updateBackground('gradientStart', e.target.value)} className="w-12 h-8 p-1 cursor-pointer" />
                      <Input type="text"  value={store.background?.gradientStart} onChange={(e) => updateBackground('gradientStart', e.target.value)} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={store.background?.gradientEnd} onChange={(e) => updateBackground('gradientEnd', e.target.value)} className="w-12 h-8 p-1 cursor-pointer" />
                      <Input type="text"  value={store.background?.gradientEnd} onChange={(e) => updateBackground('gradientEnd', e.target.value)} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={store.background?.gradientDirection} onValueChange={(v) => updateBackground('gradientDirection', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to bottom">Top to Bottom</SelectItem>
                        <SelectItem value="to right">Left to Right</SelectItem>
                        <SelectItem value="to bottom right">Diagonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {store.background?.type === 'image' && (
                <div className="space-y-3">
                  <Label>Background Image</Label>
                  <div>
                    <input
                      ref={fileInputRef}
                      id="bg-image-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      {store.background?.imageUrl ? 'Replace Image' : 'Upload Image'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WEBP · Resized to 1920×1080</p>
                  </div>

                  {store.background?.imageUrl ? (
                    <div className="relative rounded-md overflow-hidden border border-border bg-muted/30">
                      <img src={store.background.imageUrl} alt="Background preview" className="w-full aspect-video object-cover" />
                      <button
                        onClick={clearImage}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                        <p className="text-xs text-white/80 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3 flex-shrink-0" />Image applied
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-md border border-dashed border-border bg-muted/20 aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-8 w-8 opacity-40" />
                      <p className="text-xs">Click to select an image</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── Transition ── */}
            <TabsContent value="transition" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Transition Type</Label>
                <Select value={store.transition?.type} onValueChange={(v) => updateTransition('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide Up</SelectItem>
                    <SelectItem value="crossfade">Crossfade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Duration</Label>
                  <span className="text-xs text-muted-foreground">{store.transition?.duration}ms</span>
                </div>
                <Slider
                  min={0} max={2000} step={100}
                  value={[store.transition?.duration || 500]}
                  onValueChange={([v]) => updateTransition('duration', v)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
