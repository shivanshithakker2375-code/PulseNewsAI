import { GoogleGenAI } from "@google/genai";
import { NewsArticle, GroundingChunk, GroundingUrl, LiveMatch, MatchDetails, MatchStats, ScorecardSection } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = "gemini-2.5-flash";

// Helper to generate a relevant image using Pollinations.ai
const getRelevantImageUrl = (title: string, category: string, seedInput: string) => {
  // Create a consistent seed from the unique input
  let hash = 0;
  for (let i = 0; i < seedInput.length; i++) {
    hash = seedInput.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  
  // Construct a prompt for the image generator
  // We strip special characters to ensure a clean URL
  const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').slice(0, 6).join(' ');
  const prompt = encodeURIComponent(`editorial news photo of ${cleanTitle}, ${category} context, realistic, high quality, 4k`);
  
  return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
};

export const fetchNewsArticles = async (category: string, query?: string): Promise<NewsArticle[]> => {
  try {
    const searchTerm = query ? query : `${category} news`;
    // Reduced count to 6 for faster loading
    const prompt = `
      You are a high-speed news aggregator.
      Find the latest news about: "${searchTerm}".
      
      Requirements:
      1. Find exactly 6 distinct, recent stories.
      2. Output strictly in the specified format.
      3. Use Google Search for accuracy.
      4. Fields order: HEADLINE ||| SUMMARY (max 30 words) ||| SOURCE ||| TIME_AGO.
      5. Separator between stories: "|||STORY_SEPARATOR|||".
      6. Separator between fields: "|||FIELD_SEPARATOR|||".
      7. IMPORTANT: Do NOT write "Headline:" or "Summary:" labels. Just write the actual content.
      
      Example:
      SpaceX Launches New Starship |||FIELD_SEPARATOR||| The massive rocket achieved orbit for the first time... |||FIELD_SEPARATOR||| Reuters |||FIELD_SEPARATOR||| 2h ago
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "";
    
    // Extract grounding chunks to find real URLs
    const rawGroundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const allGroundingUrls: GroundingUrl[] = rawGroundingChunks
      .map((chunk: GroundingChunk) => {
        if (chunk.web) {
          return { uri: chunk.web.uri, title: chunk.web.title };
        }
        return null;
      })
      .filter((u): u is GroundingUrl => u !== null);

    // Parse the text response
    const storyStrings = text.split("|||STORY_SEPARATOR|||").filter(s => s.trim().length > 0);

    const articles: NewsArticle[] = storyStrings.map((storyStr, index) => {
      const parts = storyStr.split("|||FIELD_SEPARATOR|||").map(p => p.trim());
      
      const title = parts[0] || "News Update";
      const summary = parts[1] || "No summary available.";
      const source = parts[2] || "Unknown Source";
      const publishedTime = parts[3] || "Today";
      const uniqueId = `news-${index}-${Date.now()}`;

      // Distribute links
      const relevantLinks = allGroundingUrls.filter(url => 
        url.title.toLowerCase().includes(source.toLowerCase()) || 
        title.toLowerCase().split(' ').some(word => word.length > 4 && url.title.toLowerCase().includes(word.toLowerCase()))
      ).slice(0, 2); 
      
      const finalLinks = relevantLinks.length > 0 ? relevantLinks : [];

      return {
        id: uniqueId,
        title,
        summary,
        source,
        publishedTime,
        category,
        imageUrl: getRelevantImageUrl(title, category, uniqueId),
        groundingUrls: finalLinks
      };
    });

    return articles;

  } catch (error) {
    console.error("Failed to fetch news:", error);
    throw error;
  }
};

export const fetchArticleDetails = async (title: string, source: string): Promise<string> => {
  try {
    const prompt = `
      Write a professional news article about: "${title}".
      Use Google Search for facts.
      
      Format:
      - Plain text, double newline paragraphs.
      - ~300 words.
      - No markdown symbols.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Content currently unavailable.";
  } catch (error) {
    console.error("Failed to fetch article details:", error);
    return "We could not generate the full article at this time. Please try visiting the source link.";
  }
};

export const fetchLiveScores = async (): Promise<LiveMatch[]> => {
  try {
    const prompt = `
      Find current live sports matches and scores for major leagues (Soccer, NBA, Cricket, Tennis, NFL).
      If there are no live games right now, list major matches scheduled for today or results from today.
      
      Requirements:
      1. List exactly 5-8 matches.
      2. Format strictly: LEAGUE|HOME_TEAM|HOME_SCORE|AWAY_TEAM|AWAY_SCORE|STATUS
      3. Separator between matches: "|||MATCH_SEPARATOR|||".
      4. Status examples: "LIVE 32'", "FT", "Today 20:00", "Halftime".
      5. Scores: If match hasn't started, use "-" or "0".
      
      Example:
      Premier League|Arsenal|2|Chelsea|1|LIVE 78'
      |||MATCH_SEPARATOR|||
      NBA|Lakers|110|Celtics|105|FT
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const matchStrings = text.split("|||MATCH_SEPARATOR|||").filter(s => s.trim().length > 0);

    return matchStrings.map((str, index) => {
      const parts = str.split("|").map(p => p.trim());
      const status = parts[5] || "";
      const isLive = status.toLowerCase().includes("live") || status.toLowerCase().includes("'") || status.toLowerCase().includes("half");
      
      return {
        id: `match-${index}-${Date.now()}`,
        league: parts[0] || "Unknown League",
        homeTeam: parts[1] || "Home Team",
        homeScore: parts[2] || "0",
        awayTeam: parts[3] || "Away Team",
        awayScore: parts[4] || "0",
        status: status,
        isLive: isLive
      };
    });

  } catch (error) {
    console.error("Failed to fetch live scores:", error);
    return [];
  }
};

export const fetchMatchDetails = async (match: LiveMatch): Promise<MatchDetails> => {
    try {
        const prompt = `
          Get detailed real-time statistics and scorecard for the match: ${match.homeTeam} vs ${match.awayTeam} (${match.league}).
          
          Instructions:
          1. Use Google Search to find the ACTUAL live/final data.
          2. Section 1: "STATS". Find comparison statistics (e.g. Possession, Shots, FG%, Rebounds, Overs, Run Rate, Wickets).
          3. Section 2: "SCORECARD". Generate detailed tables for the scorecard.
             - For Cricket: Batting (Batter|R|B|4s|6s|SR), Bowling (Bowler|O|M|R|W|ECO).
             - For Soccer: Lineups, Match Events (Time|Event|Player).
             - For Basketball: Box Score (Player|PTS|REB|AST).
          
          Output strictly in this format:
          
          |||STATS_START|||
          Stat Label|Home Value|Away Value
          Stat Label|Home Value|Away Value
          |||STATS_END|||
          
          |||SCORECARD_START|||
          |||TABLE: [Table Title e.g. Home Batting]|||
          Header1|Header2|Header3|...
          Row1Col1|Row1Col2|Row1Col3|...
          ...
          |||TABLE_END|||
          |||TABLE: [Next Table Title]|||
          ...
          |||TABLE_END|||
          |||SCORECARD_END|||
        `;
    
        const response = await ai.models.generateContent({
          model: MODEL_ID,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
    
        const text = response.text || "";
        
        // Parsing Stats
        const stats: MatchStats[] = [];
        const statsMatch = text.match(/\|\|\|STATS_START\|\|\|([\s\S]*?)\|\|\|STATS_END\|\|\|/);
        if (statsMatch && statsMatch[1]) {
            const lines = statsMatch[1].trim().split('\n');
            lines.forEach(line => {
                const parts = line.split('|');
                if (parts.length >= 3) {
                    stats.push({
                        label: parts[0].trim(),
                        home: parts[1].trim(),
                        away: parts[2].trim()
                    });
                }
            });
        }

        // Parsing Scorecard Tables
        const scorecardSections: ScorecardSection[] = [];
        const scorecardBlock = text.match(/\|\|\|SCORECARD_START\|\|\|([\s\S]*?)\|\|\|SCORECARD_END\|\|\|/);
        
        if (scorecardBlock && scorecardBlock[1]) {
            const raw = scorecardBlock[1];
            // Regex to find tables defined by |||TABLE: ... ||| ... |||TABLE_END|||
            const tableRegex = /\|\|\|TABLE:\s*(.*?)\|\|\|([\s\S]*?)\|\|\|TABLE_END\|\|\|/g;
            let m;
            while ((m = tableRegex.exec(raw)) !== null) {
                const title = m[1].trim();
                const lines = m[2].trim().split('\n').filter(l => l.trim().length > 0);
                if (lines.length > 0) {
                    const headers = lines[0].split('|').map(x => x.trim());
                    const rows = lines.slice(1).map(row => row.split('|').map(x => x.trim()));
                    // Basic validation to ensure rows mostly match headers
                    if (headers.length > 0) {
                         scorecardSections.push({ title, headers, rows });
                    }
                }
            }
        }

        return { stats, scorecard: scorecardSections };

      } catch (error) {
        console.error("Failed to fetch match details:", error);
        return { stats: [], scorecard: [] };
      }
};