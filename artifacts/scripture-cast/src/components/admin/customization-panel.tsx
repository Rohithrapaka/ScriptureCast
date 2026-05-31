import React, { useRef } from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, ImageIcon, X } from 'lucide-react';

export function CustomizationPanel() {
  const store = usePresentationStore();
  const { mutate: updateState } = useUpdatePresentationState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Record<string, unknown>) => {
    store.setPresentationState(updates as Parameters<typeof store.setPresentationState>[0]);
    if (store.active) {
      updateState({
        data: {
          active: store.active,
          cleared: store.cleared,
          verse: store.verse,
          typography: store.typography,
          background: store.background,
          transition: store.transition,
          ...updates,
        } as Parameters<typeof updateState>[0]['data']
      });
    }
  };

  const updateTypography = (key: string, value: unknown) => {
    handleUpdate({ typography: { ...store.typography, [key]: value } });
  };

  const updateBackground = (key: string, value: unknown) => {
    handleUpdate({ background: { ...store.background, [key]: value } });
  };

  const updateTransition = (key: string, value: unknown) => {
    handleUpdate({ transition: { ...store.transition, [key]: value } });
  };

  // Image upload — compress to max 1920×1080 JPEG to stay within localStorage limits
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const MAX_W = 1920;
      const MAX_H = 1080;
      let { width, height } = img;
      if (width > MAX_W) { height = Math.round(height * MAX_W / width); width = MAX_W; }
      if (height > MAX_H) { width = Math.round(width * MAX_H / height); height = MAX_H; }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(objectUrl);
      updateBackground('imageUrl', dataUrl);

      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    img.src = objectUrl;
  };

  const clearImage = () => updateBackground('imageUrl', null);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-border">
        <h2 className="font-semibold text-lg tracking-tight">Display Settings</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="typography" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="typography">Text</TabsTrigger>
              <TabsTrigger value="background">Bg</TabsTrigger>
              <TabsTrigger value="transition">Anim</TabsTrigger>
            </TabsList>

            {/* ── Typography ── */}
            <TabsContent value="typography" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={store.typography?.fontFamily}
                  onValueChange={(v) => updateTypography('fontFamily', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Noto Sans Telugu">Noto Sans Telugu</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="System">System Default</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={store.typography?.fontWeight}
                  onValueChange={(v) => updateTypography('fontWeight', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="ref-toggle">Show Reference</Label>
                <Switch
                  id="ref-toggle"
                  checked={store.typography?.showReference}
                  onCheckedChange={(v) => updateTypography('showReference', v)}
                />
              </div>
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
                    <Input
                      type="color"
                      value={store.background?.color}
                      onChange={(e) => updateBackground('color', e.target.value)}
                      className="w-12 h-8 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={store.background?.color}
                      onChange={(e) => updateBackground('color', e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {store.background?.type === 'gradient' && (
                <>
                  <div className="space-y-2">
                    <Label>Start Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={store.background?.gradientStart}
                        onChange={(e) => updateBackground('gradientStart', e.target.value)}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={store.background?.gradientStart}
                        onChange={(e) => updateBackground('gradientStart', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={store.background?.gradientEnd}
                        onChange={(e) => updateBackground('gradientEnd', e.target.value)}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={store.background?.gradientEnd}
                        onChange={(e) => updateBackground('gradientEnd', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select
                      value={store.background?.gradientDirection}
                      onValueChange={(v) => updateBackground('gradientDirection', v)}
                    >
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

                  {/* Upload button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      id="bg-image-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {store.background?.imageUrl ? 'Replace Image' : 'Upload Image'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports JPG, PNG, WEBP · Max displayed at 1920×1080
                    </p>
                  </div>

                  {/* Thumbnail preview */}
                  {store.background?.imageUrl ? (
                    <div className="relative rounded-md overflow-hidden border border-border bg-muted/30">
                      <img
                        src={store.background.imageUrl}
                        alt="Background preview"
                        className="w-full aspect-video object-cover"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                        <p className="text-xs text-white/80 truncate flex items-center gap-1">
                          <ImageIcon className="h-3 w-3 flex-shrink-0" />
                          Image applied
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-border bg-muted/20 aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
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
                <Select
                  value={store.transition?.type}
                  onValueChange={(v) => updateTransition('type', v)}
                >
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
