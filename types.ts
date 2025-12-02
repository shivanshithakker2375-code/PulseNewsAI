export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedTime?: string;
  category: string;
  imageUrl?: string;
  groundingUrls: GroundingUrl[];
}

export interface GroundingUrl {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface LiveMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: string; // e.g., "LIVE 32'", "FT", "Today 20:00"
  isLive: boolean;
}

export interface MatchStats {
  label: string;
  home: string;
  away: string;
}

export interface ScorecardSection {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface MatchDetails {
  stats: MatchStats[];
  scorecard: ScorecardSection[];
}

export enum Category {
  TOP_STORIES = "Top Stories",
  TECHNOLOGY = "Technology",
  BUSINESS = "Business",
  SCIENCE = "Science",
  HEALTH = "Health",
  SPORTS = "Sports",
  ENTERTAINMENT = "Entertainment",
  WORLD = "World"
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';