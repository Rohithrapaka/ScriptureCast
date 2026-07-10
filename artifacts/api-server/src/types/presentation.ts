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
}

export interface Background {
  type: "solid" | "gradient" | "image";
  color: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  imageUrl: string | null;
}

export interface Transition {
  type: "fade" | "slide" | "crossfade";
  duration: number;
}

export interface VerseDetail {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface PresentationState {
  active: boolean;
  cleared: boolean;
  verse: VerseDetail | null;
  typography: Typography;
  background: Background;
  transition: Transition;
}
