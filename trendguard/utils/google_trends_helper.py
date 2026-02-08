"""
Google Trends Helper
====================
Fetches Google Trends data to provide early warning signals for trend decline.
"""

import numpy as np
from typing import Dict, Optional, Any
import logging

try:
    from pytrends.request import TrendReq
    PYTRENDS_AVAILABLE = True
except ImportError:
    PYTRENDS_AVAILABLE = False
    logging.warning("pytrends not installed. Run: pip install pytrends")


def fetch_google_trends_metrics(trend: str, timeframe: str = "today 3-m") -> Optional[Dict[str, Any]]:
    """
    Fetch Google Trends metrics for a given trend.
    
    Args:
        trend: The trend/keyword to analyze
        timeframe: Timeframe for analysis (default: last 3 months)
        
    Returns:
        Dictionary containing:
        - slope: Trend direction (positive = growing, negative = declining)
        - recent_mean: Average interest in recent period
        - current_value: Most recent interest value
        - peak_value: Peak interest in timeframe
        - raw_series: Complete time series data
    """
    if not PYTRENDS_AVAILABLE:
        logging.warning("Google Trends unavailable - pytrends not installed")
        return None
    
    try:
        pytrends = TrendReq(hl='en-US', tz=0)
        pytrends.build_payload([trend], timeframe=timeframe)
        data = pytrends.interest_over_time()
        
        if data.empty or trend not in data.columns:
            logging.info(f"No Google Trends data found for: {trend}")
            return None
        
        series = data[trend].fillna(0)
        
        # Calculate metrics
        slope = float(np.polyfit(range(len(series)), series, 1)[0])
        recent_mean = float(series[-7:].mean()) if len(series) >= 7 else float(series.mean())
        current_value = float(series.iloc[-1])
        peak_value = float(series.max())
        
        # Determine trend direction
        if slope > 0.5:
            direction = "rising"
        elif slope < -0.5:
            direction = "declining"
        else:
            direction = "stable"
        
        return {
            "slope": slope,
            "recent_mean": recent_mean,
            "current_value": current_value,
            "peak_value": peak_value,
            "direction": direction,
            "raw_series": series.tolist(),
            "data_points": len(series)
        }
        
    except Exception as e:
        logging.error(f"Error fetching Google Trends data: {e}")
        return None


def analyze_trends_decline_risk(metrics: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze decline risk based on Google Trends metrics.
    
    Args:
        metrics: Output from fetch_google_trends_metrics()
        
    Returns:
        Risk analysis with score and signals
    """
    if not metrics:
        return {
            "risk_level": "unknown",
            "risk_score": 0,
            "signals": ["Google Trends data unavailable"],
            "recommendation": "Cannot assess trend health without search data"
        }
    
    signals = []
    risk_score = 0
    
    # Check slope (search interest declining)
    if metrics["slope"] < -0.5:
        signals.append("Search interest declining sharply")
        risk_score += 30
    elif metrics["slope"] < -0.1:
        signals.append("Search interest trending downward")
        risk_score += 15
    
    # Check if current value is far below peak
    if metrics["peak_value"] > 0:
        decline_from_peak = ((metrics["peak_value"] - metrics["current_value"]) / metrics["peak_value"]) * 100
        if decline_from_peak > 50:
            signals.append(f"Interest dropped {decline_from_peak:.0f}% from peak")
            risk_score += 25
        elif decline_from_peak > 30:
            signals.append(f"Interest dropped {decline_from_peak:.0f}% from peak")
            risk_score += 15
    
    # Check absolute interest level
    if metrics["current_value"] < 10:
        signals.append("Very low current search interest")
        risk_score += 20
    elif metrics["current_value"] < 25:
        signals.append("Low current search interest")
        risk_score += 10
    
    # Determine risk level
    if risk_score >= 50:
        risk_level = "high"
        recommendation = "Avoid investment - trend showing strong decline signals"
    elif risk_score >= 30:
        risk_level = "medium"
        recommendation = "Proceed with caution - monitor closely"
    elif risk_score >= 15:
        risk_level = "low"
        recommendation = "Safe to proceed with monitoring"
    else:
        risk_level = "minimal"
        recommendation = "Healthy trend - good opportunity"
    
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "signals": signals if signals else ["No significant decline signals detected"],
        "recommendation": recommendation,
        "trend_direction": metrics["direction"],
        "current_interest": metrics["current_value"]
    }
