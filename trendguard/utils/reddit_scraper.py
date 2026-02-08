"""
Reddit Scraper
===============
Scrapes public Reddit data using BeautifulSoup (no API required).
Provides engagement and sentiment metrics.
"""

import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
import logging

HEADERS = {
    "User-Agent": "Mozilla/5.0 (TrendGuard Bot)"
}


def simple_sentiment_score(text: str) -> int:
    """
    Simple rule-based sentiment proxy.
    Intentionally basic for explainability.
    
    Args:
        text: Text to analyze
        
    Returns:
        Positive integer for positive sentiment, negative for negative
    """
    if not text:
        return 0
    
    text = text.lower()
    
    positive_words = ["good", "great", "love", "awesome", "amazing", "excellent", 
                      "interesting", "useful", "helpful", "best", "cool", "fun"]
    negative_words = ["bad", "boring", "dead", "overused", "hate", "worst", 
                      "terrible", "awful", "trash", "cringe", "annoying"]
    
    pos_count = sum(text.count(word) for word in positive_words)
    neg_count = sum(text.count(word) for word in negative_words)
    
    return pos_count - neg_count


def scrape_subreddit(subreddit: str, limit: int = 100, delay: float = 1.0) -> List[Dict[str, Any]]:
    """
    Scrape posts from a subreddit using old.reddit.com.
    
    Args:
        subreddit: Subreddit name (without r/)
        limit: Maximum number of posts to scrape
        delay: Delay between requests (seconds)
        
    Returns:
        List of post dictionaries containing:
        - title: Post title
        - score: Upvotes
        - comments: Comment count
        - created_utc: Post timestamp
        - engagement: Combined score + comments
        - sentiment: Sentiment score
    """
    records = []
    after = None
    
    try:
        while len(records) < limit:
            url = f"https://old.reddit.com/r/{subreddit}/"
            if after:
                url += f"?after={after}"
            
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code != 200:
                logging.warning(f"Failed to fetch r/{subreddit}: HTTP {response.status_code}")
                break
            
            soup = BeautifulSoup(response.text, "html.parser")
            things = soup.find_all("div", class_="thing")
            
            if not things:
                break
            
            for thing in things:
                if len(records) >= limit:
                    break
                
                # Extract title
                title_tag = thing.find("a", class_="title")
                title = title_tag.text if title_tag else ""
                
                # Extract timestamp
                time_tag = thing.find("time")
                created = datetime.now(timezone.utc)
                if time_tag and time_tag.has_attr("datetime"):
                    try:
                        created = datetime.fromisoformat(time_tag["datetime"].replace("Z", "+00:00"))
                    except:
                        pass
                
                # Extract score
                score = int(thing.get("data-score") or 0)
                
                # Extract comment count
                comments = 0
                comments_tag = thing.find("a", string=lambda x: x and "comment" in x)
                if comments_tag:
                    try:
                        comments = int(comments_tag.text.split()[0])
                    except:
                        pass
                
                records.append({
                    "subreddit": subreddit,
                    "title": title,
                    "score": score,
                    "comments": comments,
                    "created_utc": created,
                    "engagement": score + comments,
                    "sentiment": simple_sentiment_score(title)
                })
                
                # Get pagination token
                after = thing.get("data-fullname")
            
            time.sleep(delay)
        
        logging.info(f"Scraped {len(records)} posts from r/{subreddit}")
        return records
        
    except Exception as e:
        logging.error(f"Error scraping r/{subreddit}: {e}")
        return records


def aggregate_reddit_metrics(posts: List[Dict[str, Any]], window_days: int = 90) -> Dict[str, Any]:
    """
    Aggregate Reddit posts into explainable metrics.
    
    Args:
        posts: List of posts from scrape_subreddit()
        window_days: Days to compare (current vs previous period)
        
    Returns:
        Dictionary with metrics:
        - avg_engagement: Average engagement (score + comments)
        - engagement_velocity: Change rate from previous period
        - post_velocity: Change in post frequency
        - sentiment_shift: Change in sentiment
        - current_posts: Number of posts in current window
        - previous_posts: Number of posts in previous window
    """
    if not posts:
        return {
            "avg_engagement": 0,
            "engagement_velocity": 0,
            "post_velocity": 0,
            "sentiment_shift": 0,
            "current_posts": 0,
            "previous_posts": 0,
            "note": "No Reddit data available"
        }
    
    now = datetime.now(timezone.utc)
    current_start = now - timedelta(days=window_days)
    previous_start = current_start - timedelta(days=window_days)
    
    # Split into current and previous periods
    current_posts = [p for p in posts if p["created_utc"] >= current_start]
    previous_posts = [p for p in posts if previous_start <= p["created_utc"] < current_start]
    
    # Calculate current metrics
    current_eng = sum(p["engagement"] for p in current_posts) / len(current_posts) if current_posts else 0
    previous_eng = sum(p["engagement"] for p in previous_posts) / len(previous_posts) if previous_posts else 0
    
    current_sent = sum(p["sentiment"] for p in current_posts) / len(current_posts) if current_posts else 0
    previous_sent = sum(p["sentiment"] for p in previous_posts) / len(previous_posts) if previous_posts else 0
    
    # Calculate velocities (rate of change)
    if previous_eng > 0:
        engagement_velocity = (current_eng - previous_eng) / previous_eng
    else:
        engagement_velocity = 0.0
    
    if len(previous_posts) > 0:
        post_velocity = (len(current_posts) - len(previous_posts)) / len(previous_posts)
    else:
        post_velocity = 0.0
    
    sentiment_shift = current_sent - previous_sent
    
    return {
        "avg_engagement": float(current_eng),
        "engagement_velocity": float(engagement_velocity),
        "post_velocity": float(post_velocity),
        "sentiment_shift": float(sentiment_shift),
        "current_posts": len(current_posts),
        "previous_posts": len(previous_posts),
        "avg_sentiment": float(current_sent)
    }


def analyze_reddit_decline_risk(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze decline risk based on Reddit metrics.
    
    Args:
        metrics: Output from aggregate_reddit_metrics()
        
    Returns:
        Risk analysis with score and signals
    """
    signals = []
    risk_score = 0
    
    # Check engagement velocity
    if metrics["engagement_velocity"] < -0.3:
        signals.append("Sharp decline in engagement (>30%)")
        risk_score += 35
    elif metrics["engagement_velocity"] < -0.15:
        signals.append("Moderate decline in engagement")
        risk_score += 20
    elif metrics["engagement_velocity"] < 0:
        signals.append("Slight decline in engagement")
        risk_score += 10
    
    # Check post velocity
    if metrics["post_velocity"] < -0.2:
        signals.append("Decreasing post frequency")
        risk_score += 25
    elif metrics["post_velocity"] < -0.1:
        signals.append("Slight decrease in post frequency")
        risk_score += 10
    
    # Check sentiment
    if metrics["sentiment_shift"] < -0.5:
        signals.append("Negative sentiment shift detected")
        risk_score += 20
    elif metrics["sentiment_shift"] < -0.2:
        signals.append("Slight negative sentiment shift")
        risk_score += 10
    
    # Check absolute engagement
    if metrics["avg_engagement"] < 5:
        signals.append("Very low average engagement")
        risk_score += 15
    
    # Determine risk level
    if risk_score >= 50:
        risk_level = "high"
        recommendation = "Community engagement declining - consider pivoting strategy"
    elif risk_score >= 30:
        risk_level = "medium"
        recommendation = "Some decline signals - monitor and adjust content"
    elif risk_score >= 15:
        risk_level = "low"
        recommendation = "Minor concerns - continue with current approach"
    else:
        risk_level = "minimal"
        recommendation = "Community engagement healthy"
    
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "signals": signals if signals else ["No significant decline signals"],
        "recommendation": recommendation
    }
