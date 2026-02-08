"""
Data Loader Utilities for TrendGuard
====================================
Handles loading and preprocessing trend data for HMM analysis.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List, Optional

# Core metrics required for HMM
CORE_METRICS = ['velocity', 'fatigue', 'retention']

# Extended metrics (optional, used for enhanced analysis)
EXTENDED_METRICS = [
    'sentiment', 
    'hashtag_diversity', 
    'cross_platform_spread',
    'influencer_count', 
    'engagement_rate', 
    'content_originality'
]


def load_and_prep_data(
    filepath: str,
    trend_name: Optional[str] = None
) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Loads CSV and returns raw DataFrame + observation matrix for HMM.
    
    Args:
        filepath: Path to CSV file
        trend_name: Optional - filter to specific trend
        
    Returns:
        Tuple of (DataFrame, numpy array of observations)
    """
    df = pd.read_csv(filepath)
    
    # Validate core columns exist
    if not all(col in df.columns for col in CORE_METRICS):
        raise ValueError(f"CSV must contain core metrics: {CORE_METRICS}")
    
    # Filter by trend if specified
    if trend_name and 'trend_name' in df.columns:
        df = df[df['trend_name'] == trend_name].copy()
        if len(df) == 0:
            raise ValueError(f"No data found for trend: {trend_name}")
    
    # Convert to numpy matrix for HMM (core metrics only)
    observations = df[CORE_METRICS].values
    
    return df, observations


def load_multi_trend_data(filepath: str) -> dict:
    """
    Load dataset with multiple trends and organize by trend name.
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        Dict mapping trend_name -> (DataFrame, observations)
    """
    df = pd.read_csv(filepath)
    
    if 'trend_name' not in df.columns:
        # Single trend - return as single entry
        observations = df[CORE_METRICS].values
        return {"default": (df, observations)}
    
    result = {}
    for trend_name in df['trend_name'].unique():
        trend_df = df[df['trend_name'] == trend_name].copy()
        observations = trend_df[CORE_METRICS].values
        result[trend_name] = (trend_df, observations)
    
    return result


def get_available_metrics(df: pd.DataFrame) -> dict:
    """
    Identify which metrics are available in the dataset.
    
    Returns:
        Dict with 'core' and 'extended' metric lists
    """
    available = {
        'core': [c for c in CORE_METRICS if c in df.columns],
        'extended': [c for c in EXTENDED_METRICS if c in df.columns]
    }
    return available


def compute_derived_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute additional derived metrics from existing data.
    
    Args:
        df: Input DataFrame with core metrics
        
    Returns:
        DataFrame with additional computed columns
    """
    df = df.copy()
    
    # Velocity change rate (momentum)
    df['velocity_momentum'] = df['velocity'].diff().fillna(0)
    
    # Fatigue acceleration
    df['fatigue_rate'] = df['fatigue'].diff().fillna(0)
    
    # Combined health score (higher = healthier)
    df['health_score'] = (
        df['velocity'] * 0.4 + 
        (1 - df['fatigue']) * 0.3 + 
        df['retention'] * 0.3
    )
    
    # Risk score (higher = more at risk)
    df['risk_score'] = (
        (1 - df['velocity']) * 0.4 +
        df['fatigue'] * 0.4 +
        (1 - df['retention']) * 0.2
    )
    
    return df