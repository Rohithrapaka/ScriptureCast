/**
 * ScriptureCast Design System — UI Component Barrel Export
 *
 * All components re-exported from a single surface.
 * Import from "@/components/ui" or specific files.
 *
 * @example
 *   import { Button, Modal, Typography, SearchInput } from "@/components/ui";
 */

// ── Foundations ───────────────────────────────────────────────────────────────
export { Typography } from "./typography";
export type { TypographyProps } from "./typography";

// ── Actions ───────────────────────────────────────────────────────────────────
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { IconButton } from "./icon-button";
export type { IconButtonProps } from "./icon-button";

// ── Inputs ────────────────────────────────────────────────────────────────────
export { Input } from "./input";
export type { InputProps } from "./input";

export { SearchInput } from "./search-input";
export type { SearchInputProps } from "./search-input";

export { PasswordInput } from "./password-input";

export { Textarea } from "./textarea";

export { Checkbox } from "./checkbox";

export { Switch } from "./switch";

export { Slider } from "./slider";

export { RadioGroup, RadioGroupItem } from "./radio-group";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "./select";

export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

export { Toggle } from "./toggle";

export { ColorPicker } from "./color-picker";
export type { ColorPickerProps } from "./color-picker";

// ── Containers ────────────────────────────────────────────────────────────────
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

export { Panel } from "./panel";
export type { PanelProps } from "./panel";

export { PropertyPanel } from "./property-panel";
export type { PropertyPanelProps } from "./property-panel";

export { InspectorPanel } from "./inspector-panel";
export type { InspectorPanelProps, InspectorTab } from "./inspector-panel";

// ── Overlays ──────────────────────────────────────────────────────────────────
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./dialog";

export { Modal } from "./modal";
export type { ModalProps } from "./modal";

export { ConfirmationDialog } from "./confirmation-dialog";
export type { ConfirmationDialogProps } from "./confirmation-dialog";

export { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerTrigger } from "./drawer";

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "./sheet";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "./dropdown-menu";

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuLabel } from "./context-menu";

export { Popover, PopoverContent, PopoverTrigger } from "./popover";

// ── Navigation ────────────────────────────────────────────────────────────────
export { TopNavigation } from "./top-navigation";
export type { TopNavigationProps } from "./top-navigation";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";

export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "./sidebar";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

// ── Status & Feedback ─────────────────────────────────────────────────────────
export { Badge, badgeVariants } from "./badge";

export { Progress } from "./progress";

export { Skeleton } from "./skeleton";

export { Spinner } from "./spinner";

export { Empty } from "./empty";

export { Kbd } from "./kbd";

export { ShortcutHint } from "./shortcut-hint";
export type { ShortcutHintProps } from "./shortcut-hint";

export { Toaster } from "./toaster";

// ── Layout Utilities ──────────────────────────────────────────────────────────
export { Divider } from "./divider";
export type { DividerProps } from "./divider";

export { Separator } from "./separator";

export { FormRow } from "./form-row";
export type { FormRowProps } from "./form-row";

export { SectionHeader } from "./section-header";
export type { SectionHeaderProps } from "./section-header";

export { Label } from "./label";

export { ScrollArea, ScrollBar } from "./scroll-area";
