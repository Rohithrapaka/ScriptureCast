import React from 'react';
import { useLyricsStudioStore } from '@/hooks/use-lyrics-studio-store';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { Typography } from '@/components/ui/typography';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { FormRow } from '@/components/ui/form-row';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Move,
  Type,
  Palette,
  Sparkles,
} from 'lucide-react';
import { SUPPORTED_FONTS, TRANSITION_TYPES } from '@/types/lyrics';

export function LyricPropertyInspector() {
  const { 
    activeSlideConfig, 
    updateActiveSlideConfig, 
    slides, 
    selectedSlideId, 
    buildLyricPayload 
  } = useLyricsStudioStore();
  const presStore = usePresentationStore();

  const handleConfigChange = (patch: Partial<typeof activeSlideConfig>) => {
    updateActiveSlideConfig(patch);
    if (presStore.active && !presStore.cleared) {
      const activeSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];
      if (activeSlide) {
        const payload = {
          ...buildLyricPayload(activeSlide),
          ...patch,
        };
        presStore.setPresentationState({
          active: true,
          cleared: false,
          contentType: 'song',
          lyric: payload,
        });
        fetch('/api/presentation/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            active: true,
            cleared: false,
            contentType: 'song',
            lyric: payload,
          }),
        }).catch(console.error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 p-4 space-y-6 overflow-y-auto select-none">
      {/* Inspector Title */}
      <div className="border-b border-neutral-800 pb-3">
        <Typography variant="h4" className="font-semibold text-neutral-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          Style & Position
        </Typography>
        <Typography variant="caption" className="text-neutral-400">
          Customize typography, placement, and animations.
        </Typography>
      </div>

      {/* ── 1. Position & Layout ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Move className="w-3.5 h-3.5" />
          Position & Sizing
        </div>

        <FormRow label={`Horizontal X (${activeSlideConfig.x}%)`}>
          <Slider
            min={10}
            max={90}
            step={1}
            value={[activeSlideConfig.x]}
            onValueChange={([val]) => handleConfigChange({ x: val })}
          />
        </FormRow>

        <FormRow label={`Vertical Y (${activeSlideConfig.y}%)`}>
          <Slider
            min={10}
            max={90}
            step={1}
            value={[activeSlideConfig.y]}
            onValueChange={([val]) => handleConfigChange({ y: val })}
          />
        </FormRow>

        <FormRow label={`Max Width (${activeSlideConfig.width}%)`}>
          <Slider
            min={40}
            max={95}
            step={1}
            value={[activeSlideConfig.width]}
            onValueChange={([val]) => handleConfigChange({ width: val })}
          />
        </FormRow>
      </div>

      {/* ── 2. Typography ──────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Type className="w-3.5 h-3.5" />
          Typography
        </div>

        <FormRow label="Font Family">
          <Select
            value={activeSlideConfig.fontFamily}
            onValueChange={(val) => handleConfigChange({ fontFamily: val })}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
              <SelectValue placeholder="Choose font" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              {SUPPORTED_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label={`Font Size (${activeSlideConfig.fontSize}px)`}>
          <div className="flex items-center gap-2">
            <Slider
              min={24}
              max={96}
              step={2}
              value={[activeSlideConfig.fontSize]}
              onValueChange={([val]) => handleConfigChange({ fontSize: val })}
              className="flex-1"
            />
            <Input
              type="number"
              min={24}
              max={96}
              value={activeSlideConfig.fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 24 && val <= 96) {
                  handleConfigChange({ fontSize: val });
                }
              }}
              className="w-16 bg-neutral-800 border-neutral-700 text-white text-sm"
            />
          </div>
        </FormRow>

        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Font Weight">
            <Select
              value={activeSlideConfig.fontWeight}
              onValueChange={(val) => handleConfigChange({ fontWeight: val })}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="medium">Medium (500)</SelectItem>
                <SelectItem value="bold">Bold (700)</SelectItem>
                <SelectItem value="900">Black (900)</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow label="Text Alignment">
            <div className="flex bg-neutral-800 border border-neutral-700 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => handleConfigChange({ textAlign: 'left' })}
                className={`flex-1 py-1 flex items-center justify-center rounded ${
                  activeSlideConfig.textAlign === 'left' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleConfigChange({ textAlign: 'center' })}
                className={`flex-1 py-1 flex items-center justify-center rounded ${
                  activeSlideConfig.textAlign === 'center' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleConfigChange({ textAlign: 'right' })}
                className={`flex-1 py-1 flex items-center justify-center rounded ${
                  activeSlideConfig.textAlign === 'right' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </FormRow>
        </div>

        <FormRow label={`Line Height (${activeSlideConfig.lineHeight})`}>
          <Slider
            min={1.0}
            max={2.0}
            step={0.1}
            value={[activeSlideConfig.lineHeight]}
            onValueChange={([val]) => handleConfigChange({ lineHeight: val })}
          />
        </FormRow>
      </div>

      {/* ── 3. Colors & Visual Effects ──────────────────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Palette className="w-3.5 h-3.5" />
          Color & Shadow
        </div>

        <FormRow label="Text Color">
          <ColorPicker
            value={activeSlideConfig.textColor}
            onChange={(val) => handleConfigChange({ textColor: val })}
          />
        </FormRow>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-300">Stage Text Drop Shadow</span>
          <Switch
            checked={activeSlideConfig.shadow}
            onCheckedChange={(checked) => handleConfigChange({ shadow: checked })}
          />
        </div>
      </div>

      {/* ── 4. Transitions & Animations ─────────────────────────────────── */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          Transitions
        </div>

        <FormRow label="Transition Effect">
          <Select
            value={activeSlideConfig.transitionType}
            onValueChange={(val: any) => handleConfigChange({ transitionType: val })}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
              <SelectValue placeholder="Transition effect" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              {TRANSITION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label={`Duration (${activeSlideConfig.transitionDuration}ms)`}>
          <Slider
            min={100}
            max={1500}
            step={50}
            value={[activeSlideConfig.transitionDuration]}
            onValueChange={([val]) => handleConfigChange({ transitionDuration: val })}
          />
        </FormRow>
      </div>
    </div>
  );
}
