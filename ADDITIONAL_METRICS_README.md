# Google Trends & Reddit Integration

## Overview

This enhancement adds **real-time Google Trends and Reddit scraping** as additional metrics to all TrendGuard insights. These metrics provide:

1. **Google Trends**: Early warning signals for trend decline based on search interest
2. **Reddit Engagement**: Community sentiment and engagement metrics scraped from relevant subreddits

## Features Added

### 1. Google Trends Helper (`trendguard/utils/google_trends_helper.py`)

**Functions:**
- `fetch_google_trends_metrics(trend, timeframe="today 3-m")`: Fetches search interest data
  - Returns: slope, recent_mean, current_value, peak_value, direction, raw_series
  
- `analyze_trends_decline_risk(metrics)`: Analyzes decline risk
  - Returns: risk_level, risk_score, signals, recommendation

**Metrics Provided:**
- **Slope**: Trend direction (positive = growing, negative = declining)
- **Direction**: "rising", "stable", or "declining"
- **Current Interest**: Latest search interest value
- **Peak Value**: Maximum interest in timeframe
- **Risk Score**: 0-100 decline risk assessment

### 2. Reddit Scraper (`trendguard/utils/reddit_scraper.py`)

**Functions:**
- `scrape_subreddit(subreddit, limit=100)`: Scrapes posts from old.reddit.com (no API needed)
  - Returns: List of posts with title, score, comments, sentiment
  
- `aggregate_reddit_metrics(posts, window_days=90)`: Aggregates engagement metrics
  - Returns: avg_engagement, engagement_velocity, post_velocity, sentiment_shift
  
- `analyze_reddit_decline_risk(metrics)`: Analyzes community engagement decline
  - Returns: risk_level, risk_score, signals, recommendation

**Metrics Provided:**
- **Engagement Velocity**: Rate of change in engagement (upvotes + comments)
- **Post Velocity**: Rate of change in posting frequency
- **Sentiment Shift**: Change in sentiment (simple keyword-based)
- **Risk Score**: 0-100 decline risk assessment

### 3. Enhanced Gemini Advisor

All three main methods now include additional metrics:

#### `analyze_campaign()`
```json
{
  "viability_score": 75,
  "market_status": "growing",
  "additional_metrics": {
    "google_trends": {
      "metrics": {
        "slope": 1.2,
        "direction": "rising",
        "current_value": 65,
        "peak_value": 80
      },
      "risk_analysis": {
        "risk_level": "low",
        "risk_score": 15,
        "signals": ["No significant decline signals detected"]
      }
    },
    "reddit": {
      "metrics": {
        "avg_engagement": 45.3,
        "engagement_velocity": 0.12,
        "post_velocity": 0.08,
        "sentiment_shift": 0.15
      },
      "risk_analysis": {
        "risk_level": "minimal",
        "risk_score": 0,
        "signals": ["No significant decline signals"]
      }
    }
  }
}
```

#### `check_trend_health()`
Now includes Google Trends and Reddit metrics in addition to Gemini's grounded search analysis.

#### `compare_hashtags()`
Now includes individual Google Trends data for each hashtag being compared:
```json
{
  "comparison": [...],
  "hashtag_trends_data": {
    "#SummerVibes": {
      "direction": "rising",
      "current_value": 72,
      "slope": 0.8
    },
    "#OOTD": {
      "direction": "declining",
      "current_value": 45,
      "slope": -0.4
    }
  }
}
```

## Installation

```bash
pip install -r requirements.txt
```

New dependencies added:
- `pytrends`: Google Trends API
- `beautifulsoup4`: HTML parsing for Reddit scraping
- `requests`: HTTP requests for scraping

## Usage

### Automatic Integration

The additional metrics are automatically added to all insights. **No code changes needed** in your API calls.

### Example: Campaign Analysis

```python
from trendguard.gemini_advisor import CampaignAdvisor

advisor = CampaignAdvisor()

result = advisor.analyze_campaign(
    topic="Summer Fashion 2025",
    hashtags=["#SummerVibes", "#OOTD"],
    platform="instagram",
    campaign_aim="Launch new collection",
    target_audience="Gen Z fashion enthusiasts",
    planned_duration_days=45
)

# Access additional metrics
google_trends = result["additional_metrics"]["google_trends"]
reddit_data = result["additional_metrics"]["reddit"]

print(f"Search Interest Direction: {google_trends['metrics']['direction']}")
print(f"Reddit Risk Level: {reddit_data['risk_analysis']['risk_level']}")
```

### Custom Subreddit Analysis

You can specify custom subreddits to scrape:

```python
# The _fetch_additional_metrics method accepts a subreddits parameter
# But it's internal - for custom subreddit analysis, use the utils directly:

from trendguard.utils import scrape_subreddit, aggregate_reddit_metrics

posts = scrape_subreddit("fashion", limit=100)
metrics = aggregate_reddit_metrics(posts, window_days=30)
```

## How It Works

### Data Collection Flow

1. **Gemini Analysis** runs first (grounded search using Google)
2. **Google Trends** fetches search interest data in parallel
3. **Reddit Scraper** collects recent posts from relevant subreddits
4. **Metrics are aggregated** and risk scores calculated
5. **Results are merged** into final response

### Graceful Degradation

- If `pytrends` is unavailable, Google Trends metrics return `None`
- If Reddit scraping fails, Reddit metrics return error message
- Main Gemini analysis continues regardless of additional metrics status
- All failures are logged but don't break the pipeline

### Performance Considerations

- Google Trends: ~1-2 seconds per query
- Reddit scraping: ~1-3 seconds per subreddit (respects rate limits)
- Total additional time: ~3-7 seconds per analysis
- Results can be cached if needed

## API Response Changes

### Before Integration
```json
{
  "viability_score": 75,
  "market_status": "growing",
  "recommendations": [...]
}
```

### After Integration
```json
{
  "viability_score": 75,
  "market_status": "growing",
  "recommendations": [...],
  "additional_metrics": {
    "google_trends": {...},
    "reddit": {...},
    "timestamp": "2026-02-08T06:37:49"
  }
}
```

**No breaking changes** - existing code continues to work. Additional metrics are added as optional fields.

## Risk Assessment Logic

### Google Trends Risk Scoring
- Declining slope: +15 to +30 points
- Low current interest (<25): +10 to +20 points
- Drop from peak (>30%): +15 to +25 points
- **Total < 15**: Minimal risk
- **15-30**: Low risk
- **30-50**: Medium risk
- **50+**: High risk

### Reddit Risk Scoring
- Engagement decline: +10 to +35 points
- Decreasing post frequency: +10 to +25 points
- Negative sentiment shift: +10 to +20 points
- Low absolute engagement: +15 points
- **Total < 15**: Minimal risk
- **15-30**: Low risk
- **30-50**: Medium risk
- **50+**: High risk

## Limitations

1. **Google Trends**:
   - Rate limited (429 errors if too many requests)
   - Data delayed by ~48 hours
   - Some keywords may have insufficient data

2. **Reddit Scraping**:
   - Limited to public subreddits
   - No historical data beyond what's on front pages
   - Sentiment analysis is keyword-based (not ML)
   - Subject to Reddit's rate limiting

3. **Both**:
   - No authentication required (hackathon-safe)
   - Not real-time (cached/aggregated data)
   - English-language biased

## Troubleshooting

### "pytrends not installed"
```bash
pip install pytrends
```

### "Utils not available"
Check that the utils modules are in the correct location:
```
TrendGate/
  trendguard/
    utils/
      __init__.py
      google_trends_helper.py
      reddit_scraper.py
```

### Google Trends 429 Error
Wait 60 seconds between requests or implement caching.

### Reddit Scraping Fails
- Check internet connection
- Verify subreddit exists and is public
- Reduce `limit` parameter (default: 100)

## Future Enhancements

Potential improvements:
- [ ] Cache results to avoid re-fetching
- [ ] Add Twitter/X scraping (requires API)
- [ ] ML-based sentiment analysis
- [ ] Historical data storage
- [ ] Trend correlation analysis
- [ ] Custom subreddit selection UI

## Dependencies

```txt
pytrends>=4.9.0        # Google Trends API
beautifulsoup4>=4.12.0 # HTML parsing
requests>=2.31.0       # HTTP client
pandas>=2.0.0          # Data manipulation
numpy>=1.24.0          # Numerical computing
```
