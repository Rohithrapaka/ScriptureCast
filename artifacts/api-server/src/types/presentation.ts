export type ContentType = "bible" | "song";

export interface LyricSlide {
  id: string;
  sectionId?: string;
  sectionLabel?: string;
  songTitle?: string;
  songArtist?: string;
  textPrimary: string;
  textSecondary?: string | null;
  // Percentage coordinates (0-100)
  x?: number;
  y?: number;
  width?: number;
  // Styling overrides
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  textColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
  shadow?: boolean;
  outline?: boolean;
  outlineWidth?: number;
  transitionType?: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right";
  transitionDuration?: number;
}

export interface Typography {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
  textColor: string;
  lineHeight: number;
  shadow: boolean;
  outline: boolean;
  outlineWidth: number;
  showReference: boolean;
  autoScale?: boolean;
  refFontSize?: number;
  refFontWeight?: string;
  letterSpacing?: number;
}

export interface Background {
  type: "solid" | "gradient" | "image" | "transparent";
  color: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  imageUrl: string | null;
}

export interface Transition {
  type: "fade" | "slide" | "crossfade" | "none" | "slide-up" | "slide-down" | "slide-left" | "slide-right";
  duration: number;
}

export interface VerseDetail {
  bookId: string;
  bookName: string;
  englishName?: string;
  chapter: number;
  verse: number;
  text: string;
  textEnglish?: string | null;
  reference: string;
  referenceEnglish?: string;
}

export interface PresentationState {
  active: boolean;
  cleared: boolean;
  contentType?: ContentType;
  verse?: VerseDetail | null;
  lyric?: LyricSlide | null;
  language?: "telugu" | "english" | "both";
  layout?: "stack" | "side-by-side";
  typography: Typography;
  background: Background;
  transition: Transition;
}
