import React from 'react';
import { usePresentationStore } from '@/hooks/use-presentation-store';
import { useUpdatePresentationState } from '@workspace/api-client-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CustomizationPanel() {
  const store = usePresentationStore();
  const { mutate: updateState } = useUpdatePresentationState();

  const handleUpdate = (updates: any) => {
    const newState = {
      ...store,
      ...updates
    };
    store.setPresentationState(updates);
    
    // Only broadcast if it's active
    if (store.active) {
      updateState({ 
        data: {
          active: newState.active,
          cleared: newState.cleared,
          verse: newState.verse,
          typography: newState.typography,
          background: newState.background,
          transition: newState.transition
        } 
      });
    }
  };

  const updateTypography = (key: string, value: any) => {
    handleUpdate({ typography: { ...store.typography, [key]: value } });
  };

  const updateBackground = (key: string, value: any) => {
    handleUpdate({ background: { ...store.background, [key]: value } });
  };

  const updateTransition = (key: string, value: any) => {
    handleUpdate({ transition: { ...store.transition, [key]: value } });
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg tracking-tight">Display Settings</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="typography" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="typography" data-testid="tab-typography">Text</TabsTrigger>
              <TabsTrigger value="background" data-testid="tab-background">Bg</TabsTrigger>
              <TabsTrigger value="transition" data-testid="tab-transition">Anim</TabsTrigger>
            </TabsList>
            
            <TabsContent value="typography" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={store.typography?.fontFamily} 
                  onValueChange={(v) => updateTypography('fontFamily', v)}
                >
                  <SelectTrigger data-testid="select-font">
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
                  data-testid="slider-font-size"
                />
              </div>

              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select 
                  value={store.typography?.fontWeight} 
                  onValueChange={(v) => updateTypography('fontWeight', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  min={1} max={2} step={0.1}
                  value={[store.typography?.lineHeight || 1.5]}
                  onValueChange={([v]) => updateTypography('lineHeight', v)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="shadow-toggle">Drop Shadow</Label>
                <Switch 
                  id="shadow-toggle"
                  checked={store.typography?.shadow} 
                  onCheckedChange={(v) => updateTypography('shadow', v)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="outline-toggle">Text Outline</Label>
                <Switch 
                  id="outline-toggle"
                  checked={store.typography?.outline} 
                  onCheckedChange={(v) => updateTypography('outline', v)}
                />
              </div>

              {store.typography?.outline && (
                <div className="space-y-2 pl-4 border-l-2 border-border mt-2">
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

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="ref-toggle">Show Reference</Label>
                <Switch 
                  id="ref-toggle"
                  checked={store.typography?.showReference} 
                  onCheckedChange={(v) => updateTypography('showReference', v)}
                />
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select 
                  value={store.background?.type} 
                  onValueChange={(v) => updateBackground('type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select 
                      value={store.background?.gradientDirection} 
                      onValueChange={(v) => updateBackground('gradientDirection', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input 
                    type="url" 
                    placeholder="https://..."
                    value={store.background?.imageUrl || ''} 
                    onChange={(e) => updateBackground('imageUrl', e.target.value)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="transition" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Transition Type</Label>
                <Select 
                  value={store.transition?.type} 
                  onValueChange={(v) => updateTransition('type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
      </ScrollArea>
    </div>
  );
}
