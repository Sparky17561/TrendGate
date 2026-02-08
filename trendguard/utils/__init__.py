"""
TrendGuard Utilities
====================
Helper modules for data collection and analysis.
"""

from .google_trends_helper import (
    fetch_google_trends_metrics,
    analyze_trends_decline_risk
)

from .reddit_scraper import (
    scrape_subreddit,
    aggregate_reddit_metrics,
    analyze_reddit_decline_risk,
    simple_sentiment_score
)

__all__ = [
    'fetch_google_trends_metrics',
    'analyze_trends_decline_risk',
    'scrape_subreddit',
    'aggregate_reddit_metrics',
    'analyze_reddit_decline_risk',
    'simple_sentiment_score'
]
