import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchLiveNews = async () => {
  try {
    // Fetch Google News RSS directly using axios (already installed)
    const response = await axios.get('https://news.google.com/rss', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const xml = response.data;
    
    // Parse XML using cheerio (already installed)
    const $ = cheerio.load(xml, { xmlMode: true });
    
    const liveNews = [];
    
    $('item').slice(0, 10).each((i, el) => {
      liveNews.push({
        title: $(el).find('title').text(),
        link: $(el).find('link').text(),
        pubDate: $(el).find('pubDate').text(),
        contentSnippet: 'Click analyze to check this live headline...',
        source: $(el).find('source').text() || 'Google News'
      });
    });

    return liveNews;
  } catch (error) {
    console.error("Error fetching live news:", error);
    // If RSS fails, return some mock live news for demonstration
    return [
      {
        title: "Global Markets Rally as Tech Stocks Hit New Highs",
        link: "https://example.com/market-rally",
        pubDate: new Date().toISOString(),
        contentSnippet: "Technology stocks surged today following a series of positive earnings reports.",
        source: "Mock Finance News"
      },
      {
        title: "Breakthrough in Renewable Energy Storage Solutions",
        link: "https://example.com/energy-breakthrough",
        pubDate: new Date().toISOString(),
        contentSnippet: "Researchers have developed a new battery technology capable of storing solar energy.",
        source: "Mock Science Daily"
      },
      {
        title: "Local Government Announces Shocking New Secret Scheme!",
        link: "https://example.com/shocking-scheme",
        pubDate: new Date().toISOString(),
        contentSnippet: "Click here to find out the free secret scheme the government doesn't want you to know about.",
        source: "Unverified Viral Blog"
      }
    ];
  }
};
