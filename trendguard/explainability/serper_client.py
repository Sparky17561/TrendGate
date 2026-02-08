"""
Serper API Client for TrendGuard
================================
Provides real-time web search capabilities to find news, 
controversies, and context about trending topics.
"""

import os
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class SerperClient:
    """
    Client for Serper.dev API - Google Search wrapper.
    Searches for real news and discussions about trends.
    """
    
    BASE_URL = "https://google.serper.dev"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPER_API_KEY")
        if not self.api_key:
            raise ValueError("SERPER_API_KEY not found in environment")
        
        self.headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
    
    def search_news(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        Search Google News for articles about the query.
        
        Args:
            query: Search query (e.g., "Skibidi Toilet trend decline")
            num_results: Number of results to return
            
        Returns:
            List of news article objects with title, link, snippet, date
        """
        endpoint = f"{self.BASE_URL}/news"
        
        payload = {
            "q": query,
            "num": num_results,
            "gl": "us",  # Geographic location
            "hl": "en"   # Language
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            news = data.get("news", [])
            return [
                {
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "source": item.get("source", ""),
                    "date": item.get("date", "")
                }
                for item in news[:num_results]
            ]
        except requests.RequestException as e:
            print(f"⚠️ Serper API error: {e}")
            return []
    
    def search_web(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        General web search for broader context.
        
        Args:
            query: Search query
            num_results: Number of results to return
            
        Returns:
            List of search result objects
        """
        endpoint = f"{self.BASE_URL}/search"
        
        payload = {
            "q": query,
            "num": num_results
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            organic = data.get("organic", [])
            return [
                {
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "position": item.get("position", 0)
                }
                for item in organic[:num_results]
            ]
        except requests.RequestException as e:
            print(f"⚠️ Serper API error: {e}")
            return []
    
    def search_social_discussions(self, trend_name: str) -> Dict[str, List[Dict]]:
        """
        Search for social media discussions about a trend.
        
        Args:
            trend_name: Name of the trend to research
            
        Returns:
            Dict with Reddit and Twitter discussion results
        """
        results = {
            "reddit": [],
            "twitter": [],
            "general": []
        }
        
        # Reddit discussions
        reddit_query = f"{trend_name} site:reddit.com"
        reddit_results = self.search_web(reddit_query, 3)
        results["reddit"] = reddit_results
        
        # Twitter/X discussions  
        twitter_query = f"{trend_name} site:twitter.com OR site:x.com"
        twitter_results = self.search_web(twitter_query, 3)
        results["twitter"] = twitter_results
        
        # General discussions
        general_query = f'"{trend_name}" decline OR "dying" OR "dead" OR "over"'
        general_results = self.search_web(general_query, 3)
        results["general"] = general_results
        
        return results
    
    def investigate_trend_decline(
        self, 
        trend_name: str, 
        decline_date: str,
        search_window_days: int = 14
    ) -> Dict:
        """
        Comprehensive investigation of a trend's decline.
        
        Args:
            trend_name: Name of the declining trend
            decline_date: Date when decline was detected
            search_window_days: Days around decline to search
            
        Returns:
            Investigation report with news, discussions, and context
        """
        print(f"🔍 Investigating: {trend_name}")
        
        investigation = {
            "trend_name": trend_name,
            "decline_date": decline_date,
            "investigated_at": datetime.now().isoformat(),
            "news_coverage": [],
            "controversy_signals": [],
            "social_discussions": {},
            "competitor_trends": [],
            "summary_context": ""
        }
        
        # 1. Search for news about the trend
        print("   📰 Searching news coverage...")
        news_query = f'"{trend_name}" trend'
        investigation["news_coverage"] = self.search_news(news_query, 5)
        
        # 2. Search for controversy/drama
        print("   🔥 Checking for controversies...")
        controversy_query = f'"{trend_name}" controversy OR drama OR backlash OR cancelled'
        controversy_results = self.search_news(controversy_query, 3)
        investigation["controversy_signals"] = controversy_results
        
        # 3. Search social discussions
        print("   💬 Gathering social discussions...")
        investigation["social_discussions"] = self.search_social_discussions(trend_name)
        
        # 4. Search for competitor/replacement trends  
        print("   🔄 Looking for replacement trends...")
        competitor_query = f'new trend replacing "{trend_name}" OR "instead of {trend_name}"'
        competitor_results = self.search_web(competitor_query, 3)
        investigation["competitor_trends"] = competitor_results
        
        # 5. Build summary context for AI
        context_parts = []
        
        if investigation["news_coverage"]:
            context_parts.append("Recent News:")
            for news in investigation["news_coverage"][:3]:
                context_parts.append(f"- {news['title']}: {news['snippet']}")
        
        if investigation["controversy_signals"]:
            context_parts.append("\nControversy/Drama:")
            for item in investigation["controversy_signals"][:2]:
                context_parts.append(f"- {item['title']}: {item['snippet']}")
        
        if investigation["social_discussions"]["reddit"]:
            context_parts.append("\nReddit Discussions:")
            for item in investigation["social_discussions"]["reddit"][:2]:
                context_parts.append(f"- {item['title']}")
        
        investigation["summary_context"] = "\n".join(context_parts)
        
        return investigation


# --- TESTING ---
if __name__ == "__main__":
    print("🧪 Testing Serper Client")
    print("=" * 40)
    
    try:
        client = SerperClient()
        
        # Test news search
        print("\n📰 Testing news search...")
        news = client.search_news("Skibidi Toilet meme", 3)
        for item in news:
            print(f"  • {item['title'][:60]}...")
        
        # Test investigation
        print("\n🔍 Testing trend investigation...")
        report = client.investigate_trend_decline(
            trend_name="Skibidi Toilet",
            decline_date="2025-02-01"
        )
        print(f"\n📋 Investigation Summary:")
        print(f"  News articles found: {len(report['news_coverage'])}")
        print(f"  Controversy signals: {len(report['controversy_signals'])}")
        print(f"  Reddit discussions: {len(report['social_discussions']['reddit'])}")
        
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("Make sure SERPER_API_KEY is set in .env")
