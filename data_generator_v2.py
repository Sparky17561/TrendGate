"""
TrendGuard Data Generator v2
============================
Generates realistic synthetic data for social media trend decline prediction.
Supports 8 trend archetypes with 9 metrics for comprehensive analysis.
"""

import pandas as pd
import numpy as np
import os
import json
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# --- CONFIGURATION ---
OUTPUT_DIR = "data"
DEFAULT_OUTPUT_FILE = os.path.join(OUTPUT_DIR, "trends_dataset.csv")

# --- TREND ARCHETYPES ---
TREND_ARCHETYPES = {
    "viral_crash": {
        "description": "Explosive growth followed by sudden death",
        "growth_rate": 3.0,
        "peak_position": 0.25,  # Peak early in lifecycle
        "decline_steepness": 4.0,
        "fatigue_onset": 0.3,
        "noise_level": 0.08
    },
    "slow_burn": {
        "description": "Gradual rise and gradual fade",
        "growth_rate": 0.8,
        "peak_position": 0.5,
        "decline_steepness": 0.6,
        "fatigue_onset": 0.6,
        "noise_level": 0.05
    },
    "controversy_spike": {
        "description": "Trend revived by drama, double peak pattern",
        "growth_rate": 1.5,
        "peak_position": 0.35,
        "decline_steepness": 1.2,
        "fatigue_onset": 0.5,
        "noise_level": 0.1,
        "has_second_peak": True,
        "second_peak_position": 0.7,
        "second_peak_magnitude": 0.7
    },
    "algorithm_killed": {
        "description": "Platform algorithm change causes sudden cliff drop",
        "growth_rate": 1.2,
        "peak_position": 0.45,
        "decline_steepness": 8.0,  # Very steep cliff
        "fatigue_onset": 0.5,
        "noise_level": 0.06,
        "cliff_event": True
    },
    "saturated_death": {
        "description": "Content overdone, plateau then slow decline",
        "growth_rate": 1.0,
        "peak_position": 0.4,
        "decline_steepness": 0.4,
        "fatigue_onset": 0.35,  # Fatigue sets in early
        "noise_level": 0.04,
        "plateau_duration": 0.2
    },
    "seasonal": {
        "description": "Holiday/event-based predictable pattern",
        "growth_rate": 2.0,
        "peak_position": 0.5,
        "decline_steepness": 2.0,
        "fatigue_onset": 0.55,
        "noise_level": 0.03
    },
    "influencer_exodus": {
        "description": "Key creators leave causing retention-led decline",
        "growth_rate": 1.3,
        "peak_position": 0.5,
        "decline_steepness": 1.5,
        "fatigue_onset": 0.45,
        "noise_level": 0.06,
        "retention_drop_event": True,
        "retention_drop_position": 0.55
    },
    "competitor_replaced": {
        "description": "New trend takes over, intersection pattern",
        "growth_rate": 1.0,
        "peak_position": 0.4,
        "decline_steepness": 1.8,
        "fatigue_onset": 0.4,
        "noise_level": 0.05,
        "competitor_emergence": True
    }
}

# --- SAMPLE TREND NAMES BY CATEGORY ---
TREND_NAMES = {
    "memes": [
        "Skibidi Toilet", "Ohio Final Boss", "Grimace Shake", "Roman Empire Thinking",
        "Girl Dinner", "Quiet Luxury", "Barbenheimer", "NPC Streaming",
        "AI Drake", "Tube Girl", "Delulu Is The Solulu", "Demure Mindful"
    ],
    "hashtags": [
        "#TikTokMadeMeBuyIt", "#BookTok", "#CleanTok", "#GRWM",
        "#DayInMyLife", "#OOTD", "#FYP", "#Viral",
        "#GetReadyWithMe", "#StorytimeWhileIGetReady", "#WhatIEatInADay"
    ],
    "challenges": [
        "Ice Bucket Challenge", "Bottle Cap Challenge", "Kiki Challenge",
        "Mannequin Challenge", "Tide Pod Challenge", "Bird Box Challenge",
        "Milk Crate Challenge", "One Chip Challenge", "Silhouette Challenge"
    ],
    "sounds": [
        "Oh No Sound", "Somebody Come Get Her", "Corn Kid Song",
        "Its Corn Remix", "Running Up That Hill Revival", "Jiggle Jiggle",
        "About Damn Time", "Sunroof", "Made You Look"
    ]
}

# --- PLATFORM CONFIGURATIONS ---
PLATFORMS = ["tiktok", "instagram", "twitter", "reddit", "youtube"]


def generate_base_curve(days: int, archetype: dict) -> np.ndarray:
    """Generate the base engagement curve for a trend."""
    t = np.linspace(0, 1, days)
    peak_pos = archetype["peak_position"]
    growth = archetype["growth_rate"]
    decline = archetype["decline_steepness"]
    
    # Asymmetric bell curve
    curve = np.where(
        t < peak_pos,
        np.exp(-((t - peak_pos) ** 2) * growth * 20),
        np.exp(-((t - peak_pos) ** 2) * decline * 20)
    )
    
    # Handle special patterns
    if archetype.get("has_second_peak"):
        second_pos = archetype["second_peak_position"]
        second_mag = archetype["second_peak_magnitude"]
        second_peak = second_mag * np.exp(-((t - second_pos) ** 2) * 30)
        curve = np.maximum(curve, second_peak)
    
    if archetype.get("cliff_event"):
        cliff_point = int(days * 0.5)
        curve[cliff_point:] *= 0.15  # Sudden 85% drop
    
    if archetype.get("plateau_duration"):
        plateau_start = int(days * archetype["peak_position"])
        plateau_end = int(days * (archetype["peak_position"] + archetype["plateau_duration"]))
        plateau_value = curve[plateau_start]
        curve[plateau_start:plateau_end] = plateau_value
    
    return np.clip(curve, 0, 1)


def generate_velocity(base_curve: np.ndarray, archetype: dict) -> np.ndarray:
    """Engagement velocity - rate of new interactions."""
    noise = np.random.normal(0, archetype["noise_level"], len(base_curve))
    velocity = base_curve * 0.95 + noise
    return np.clip(velocity, 0, 1)


def generate_fatigue(days: int, archetype: dict, base_curve: np.ndarray) -> np.ndarray:
    """Audience fatigue - boredom/oversaturation signal."""
    t = np.linspace(0, 1, days)
    onset = archetype["fatigue_onset"]
    
    # Fatigue grows over time, accelerates after peak
    fatigue = 0.1 + 0.8 * (1 / (1 + np.exp(-10 * (t - onset))))
    
    # Inverse correlation with velocity at end
    late_phase = t > 0.6
    fatigue[late_phase] += 0.1 * (1 - base_curve[late_phase])
    
    noise = np.random.normal(0, archetype["noise_level"], days)
    return np.clip(fatigue + noise, 0, 1)


def generate_retention(days: int, archetype: dict, base_curve: np.ndarray) -> np.ndarray:
    """Influencer retention - how many creators are still participating."""
    retention = base_curve * 0.9 + 0.1
    
    if archetype.get("retention_drop_event"):
        drop_point = int(days * archetype["retention_drop_position"])
        # Sudden influencer exodus
        retention[drop_point:] *= 0.4
        # Gradual further decline
        remaining_days = days - drop_point
        retention[drop_point:] *= np.linspace(1, 0.5, remaining_days)
    
    noise = np.random.normal(0, archetype["noise_level"], days)
    return np.clip(retention + noise, 0, 1)


def generate_sentiment(days: int, archetype: dict, base_curve: np.ndarray) -> np.ndarray:
    """Sentiment score from -1 (negative) to 1 (positive)."""
    # Start positive, trend negative as decline happens
    sentiment = base_curve * 1.5 - 0.3
    
    # Controversy archetype has sentiment swings
    if archetype.get("has_second_peak"):
        controversy_zone = np.linspace(0.3, 0.8, days) 
        sentiment -= 0.3 * np.sin(controversy_zone * 10)
    
    noise = np.random.normal(0, archetype["noise_level"] * 2, days)
    return np.clip(sentiment + noise, -1, 1)


def generate_hashtag_diversity(days: int, base_curve: np.ndarray) -> np.ndarray:
    """Diversity of related hashtags - high early, low when stale."""
    diversity = np.zeros(days)
    
    # Peaks slightly after main curve peak (creative expansion)
    peak_idx = np.argmax(base_curve)
    shift = min(5, days - peak_idx - 1)
    
    for i in range(days):
        if i < peak_idx + shift:
            diversity[i] = min(0.9, base_curve[i] * 1.2)
        else:
            # Declining diversity - everyone uses same tags
            decay = (i - peak_idx - shift) / (days - peak_idx - shift)
            diversity[i] = max(0.1, 0.7 * (1 - decay))
    
    noise = np.random.normal(0, 0.05, days)
    return np.clip(diversity + noise, 0, 1)


def generate_cross_platform_spread(days: int, archetype: dict, base_curve: np.ndarray) -> np.ndarray:
    """How widely the trend has spread across platforms."""
    # Slow to spread, then saturates, then declines
    t = np.linspace(0, 1, days)
    spread = 1 / (1 + np.exp(-8 * (t - 0.3)))
    spread *= base_curve ** 0.5  # Decays with main trend
    
    noise = np.random.normal(0, 0.04, days)
    return np.clip(spread + noise, 0, 1)


def generate_influencer_count(days: int, base_curve: np.ndarray) -> np.ndarray:
    """Number of active influencers/creators participating."""
    # Scale to realistic numbers
    max_influencers = np.random.randint(500, 50000)
    influencer_curve = base_curve ** 0.7  # Slower decay than engagement
    
    counts = (influencer_curve * max_influencers).astype(int)
    # Add some noise
    noise = np.random.randint(-50, 50, days)
    return np.clip(counts + noise, 10, max_influencers)


def generate_engagement_rate(days: int, base_curve: np.ndarray, fatigue: np.ndarray) -> np.ndarray:
    """Engagement rate (likes+comments/views) - inversely related to fatigue."""
    base_rate = 0.08  # 8% baseline
    rate = base_rate + 0.12 * base_curve - 0.06 * fatigue
    noise = np.random.normal(0, 0.01, days)
    return np.clip(rate + noise, 0.01, 0.25)


def generate_content_originality(days: int, base_curve: np.ndarray) -> np.ndarray:
    """Original content vs reposts ratio - declines as trend saturates."""
    # Starts high, decreases as trend ages
    t = np.linspace(0, 1, days)
    originality = 0.9 - 0.7 * t
    originality *= (base_curve ** 0.3)  # Some correlation with engagement
    
    noise = np.random.normal(0, 0.05, days)
    return np.clip(originality + noise, 0.05, 0.95)


def generate_decline_signals(days: int, base_curve: np.ndarray) -> Dict[str, np.ndarray]:
    """Generate explicit decline warning signals."""
    peak_idx = np.argmax(base_curve)
    
    signals = {
        "velocity_drop_rate": np.zeros(days),
        "fatigue_acceleration": np.zeros(days),
        "retention_risk": np.zeros(days)
    }
    
    # Calculate rolling changes
    for i in range(3, days):
        # Velocity drop rate (negative is bad)
        signals["velocity_drop_rate"][i] = base_curve[i] - base_curve[i-3]
        
    # After peak, calculate risk signals
    for i in range(peak_idx, days):
        progress = (i - peak_idx) / max(1, days - peak_idx)
        signals["fatigue_acceleration"][i] = progress * 0.8
        signals["retention_risk"][i] = progress * (1 - base_curve[i])
    
    return signals


def create_trend_data(
    trend_name: str,
    archetype_name: str,
    start_date: datetime,
    duration_days: int = 60,
    platform: str = "tiktok"
) -> pd.DataFrame:
    """Generate complete trend dataset for a single trend."""
    
    archetype = TREND_ARCHETYPES[archetype_name]
    dates = [start_date + timedelta(days=i) for i in range(duration_days)]
    
    # Generate base curve
    base_curve = generate_base_curve(duration_days, archetype)
    
    # Generate all metrics
    velocity = generate_velocity(base_curve, archetype)
    fatigue = generate_fatigue(duration_days, archetype, base_curve)
    retention = generate_retention(duration_days, archetype, base_curve)
    sentiment = generate_sentiment(duration_days, archetype, base_curve)
    hashtag_diversity = generate_hashtag_diversity(duration_days, base_curve)
    cross_platform_spread = generate_cross_platform_spread(duration_days, archetype, base_curve)
    influencer_count = generate_influencer_count(duration_days, base_curve)
    engagement_rate = generate_engagement_rate(duration_days, base_curve, fatigue)
    content_originality = generate_content_originality(duration_days, base_curve)
    
    # Generate decline signals
    decline_signals = generate_decline_signals(duration_days, base_curve)
    
    df = pd.DataFrame({
        "date": dates,
        "trend_name": trend_name,
        "archetype": archetype_name,
        "platform": platform,
        # Core metrics
        "velocity": velocity,
        "fatigue": fatigue,
        "retention": retention,
        # Extended metrics
        "sentiment": sentiment,
        "hashtag_diversity": hashtag_diversity,
        "cross_platform_spread": cross_platform_spread,
        "influencer_count": influencer_count,
        "engagement_rate": engagement_rate,
        "content_originality": content_originality,
        # Decline signals
        "velocity_drop_rate": decline_signals["velocity_drop_rate"],
        "fatigue_acceleration": decline_signals["fatigue_acceleration"],
        "retention_risk": decline_signals["retention_risk"]
    })
    
    return df


def generate_multi_trend_dataset(
    num_trends: int = 8,
    days_per_trend: int = 60,
    start_date: Optional[datetime] = None
) -> pd.DataFrame:
    """Generate dataset with multiple diverse trends."""
    
    if start_date is None:
        start_date = datetime(2025, 1, 1)
    
    all_trends = []
    archetype_names = list(TREND_ARCHETYPES.keys())
    all_trend_names = sum(TREND_NAMES.values(), [])
    
    for i in range(num_trends):
        # Cycle through archetypes to ensure variety
        archetype = archetype_names[i % len(archetype_names)]
        
        # Pick a random trend name
        trend_name = np.random.choice(all_trend_names)
        
        # Random platform
        platform = np.random.choice(PLATFORMS)
        
        # Stagger start dates
        trend_start = start_date + timedelta(days=np.random.randint(0, 30))
        
        # Random duration between 30-90 days
        duration = np.random.randint(30, 90)
        
        df = create_trend_data(
            trend_name=trend_name,
            archetype_name=archetype,
            start_date=trend_start,
            duration_days=duration,
            platform=platform
        )
        
        all_trends.append(df)
        print(f"  ✓ Generated: {trend_name} ({archetype}) on {platform}")
    
    return pd.concat(all_trends, ignore_index=True)


def generate_sample_report(df: pd.DataFrame, output_path: str):
    """Generate a summary report of the dataset."""
    report = {
        "generated_at": datetime.now().isoformat(),
        "total_records": len(df),
        "unique_trends": df["trend_name"].nunique(),
        "archetypes": df["archetype"].value_counts().to_dict(),
        "platforms": df["platform"].value_counts().to_dict(),
        "date_range": {
            "start": df["date"].min().isoformat() if hasattr(df["date"].min(), 'isoformat') else str(df["date"].min()),
            "end": df["date"].max().isoformat() if hasattr(df["date"].max(), 'isoformat') else str(df["date"].max())
        },
        "metrics_summary": {
            col: {
                "mean": float(df[col].mean()),
                "std": float(df[col].std()),
                "min": float(df[col].min()),
                "max": float(df[col].max())
            }
            for col in ["velocity", "fatigue", "retention", "sentiment", "engagement_rate"]
        }
    }
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    return report


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic trend data")
    parser.add_argument("--trends", type=int, default=8, help="Number of trends to generate")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT_FILE, help="Output CSV path")
    parser.add_argument("--single", type=str, help="Generate single archetype")
    args = parser.parse_args()
    
    print("🚀 TrendGuard Data Generator v2")
    print("=" * 40)
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    if args.single:
        print(f"\n📊 Generating single trend: {args.single}")
        df = create_trend_data(
            trend_name="Demo Trend",
            archetype_name=args.single,
            start_date=datetime(2025, 1, 1),
            duration_days=60
        )
    else:
        print(f"\n📊 Generating {args.trends} diverse trends...")
        df = generate_multi_trend_dataset(num_trends=args.trends)
    
    # Save to CSV
    df.to_csv(args.output, index=False)
    print(f"\n✅ Data saved to: {args.output}")
    print(f"   Total records: {len(df)}")
    
    # Generate report
    report_path = args.output.replace(".csv", "_report.json")
    report = generate_sample_report(df, report_path)
    print(f"📄 Report saved to: {report_path}")
    
    print("\n📈 Archetype Distribution:")
    for arch, count in report["archetypes"].items():
        print(f"   • {arch}: {count} records")
    
    print("\n🎯 Available archetypes for single generation:")
    for arch, config in TREND_ARCHETYPES.items():
        print(f"   • {arch}: {config['description']}")
