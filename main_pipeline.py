"""
TrendGuard Main Pipeline v2
===========================
Enhanced pipeline for social media trend decline prediction with:
- Multi-trend analysis support
- Extended 5-state HMM (Emerging → Growth → Peak → Saturation → Decline)
- Real-time Serper web search integration
- Explainable AI reports with confidence scoring
- JSON report generation
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Import our modules
from trendguard.hmm_engine.hmm import HiddenMarkovModel
from trendguard.hmm_engine.decoder import viterbi_gaussian
from trendguard.utils.data_loader import load_and_prep_data
from trendguard.explainability.langchain_agent import TrendInvestigator

# Load environment variables
load_dotenv()

# --- REPORT CONFIGURATION ---
REPORTS_DIR = "reports"


def create_5state_hmm():
    """
    Create enhanced 5-state HMM for finer trend lifecycle detection.
    States: Emerging → Growth → Peak → Saturation → Decline
    """
    states = ["Emerging", "Growth", "Peak", "Saturation", "Decline"]
    
    # Emission means for each state [velocity, fatigue, retention]
    # Extended to support more metrics if available
    emission_means = np.array([
        [0.3, 0.1, 0.4],   # Emerging: Low velocity (building), low fatigue, moderate retention
        [0.8, 0.2, 0.8],   # Growth: High velocity, low fatigue, high retention
        [0.9, 0.4, 0.9],   # Peak: Maximum velocity, rising fatigue, maximum retention
        [0.5, 0.6, 0.6],   # Saturation: Dropping velocity, high fatigue, dropping retention
        [0.2, 0.8, 0.3]    # Decline: Low velocity, very high fatigue, low retention
    ])
    
    # Covariance matrices (tighter = more confident)
    emission_covs = np.array([
        np.eye(3) * 0.08,  # Emerging
        np.eye(3) * 0.05,  # Growth
        np.eye(3) * 0.04,  # Peak (tight - distinctive)
        np.eye(3) * 0.08,  # Saturation
        np.eye(3) * 0.10   # Decline (looser - various patterns)
    ])
    
    # Transition matrix: Generally flows forward, but can skip states
    transition_matrix = np.array([
        # Em    Gr    Pk    Sat   Dec
        [0.6,  0.35, 0.05, 0.0,  0.0 ],  # Emerging → mostly Growth
        [0.0,  0.5,  0.45, 0.05, 0.0 ],  # Growth → Peak
        [0.0,  0.0,  0.4,  0.5,  0.1 ],  # Peak → Saturation (or quick decline)
        [0.0,  0.0,  0.0,  0.5,  0.5 ],  # Saturation → Decline
        [0.0,  0.0,  0.0,  0.0,  1.0 ]   # Decline → Decline (absorbing)
    ])
    
    # Start in Emerging state
    initial_probs = np.array([0.8, 0.2, 0.0, 0.0, 0.0])
    
    return HiddenMarkovModel(
        states=states,
        emission_means=emission_means,
        emission_covs=emission_covs,
        transition_matrix=transition_matrix,
        initial_probs=initial_probs
    )


def detect_decline_point(df: pd.DataFrame, state_sequence: list) -> dict:
    """
    Detect the first significant decline point in the state sequence.
    Returns info about when and why decline was detected.
    """
    # Find first Saturation or Decline state
    decline_states = ["Saturation", "Decline"]
    
    for i, state in enumerate(state_sequence):
        if state in decline_states:
            return {
                "detected": True,
                "index": i,
                "date": str(df.iloc[i]["date"]),
                "state": state,
                "metrics": {
                    "velocity": float(df.iloc[i]["velocity"]),
                    "fatigue": float(df.iloc[i]["fatigue"]),
                    "retention": float(df.iloc[i]["retention"])
                },
                # Check for extended metrics
                "extended_metrics": {
                    col: float(df.iloc[i][col])
                    for col in ["sentiment", "engagement_rate", "content_originality"]
                    if col in df.columns
                }
            }
    
    return {"detected": False}


def analyze_single_trend(
    df: pd.DataFrame,
    trend_name: str,
    hmm: HiddenMarkovModel,
    investigator: TrendInvestigator
) -> dict:
    """
    Analyze a single trend and generate report.
    """
    print(f"\n{'='*50}")
    print(f"📊 Analyzing: {trend_name}")
    print(f"{'='*50}")
    
    # Get observations (core metrics only for HMM)
    observations = df[["velocity", "fatigue", "retention"]].values
    
    # Run Viterbi inference
    print("🧠 Running HMM inference...")
    state_sequence = viterbi_gaussian(hmm, observations)
    df = df.copy()
    df["state"] = state_sequence
    
    # Detect archetype if available
    archetype = df["archetype"].iloc[0] if "archetype" in df.columns else None
    
    # Detect decline point
    decline_info = detect_decline_point(df, state_sequence)
    
    result = {
        "trend_name": trend_name,
        "archetype": archetype,
        "total_days": len(df),
        "state_sequence_summary": {
            state: state_sequence.count(state)
            for state in set(state_sequence)
        },
        "decline_detected": decline_info["detected"],
        "decline_info": decline_info if decline_info["detected"] else None,
        "investigation_report": None
    }
    
    if decline_info["detected"]:
        print(f"\n⚠️ DECLINE DETECTED on {decline_info['date']}")
        print(f"   State: {decline_info['state']}")
        print(f"   Velocity: {decline_info['metrics']['velocity']:.2f}")
        print(f"   Fatigue: {decline_info['metrics']['fatigue']:.2f}")
        print(f"   Retention: {decline_info['metrics']['retention']:.2f}")
        
        # Combine core and extended metrics for investigation
        all_metrics = {**decline_info["metrics"], **decline_info.get("extended_metrics", {})}
        
        # Run AI investigation
        print("\n🕵️ Running AI investigation with web search...")
        report = investigator.investigate(
            trend_name=trend_name,
            decline_date=decline_info["date"],
            metrics=all_metrics,
            archetype=archetype
        )
        result["investigation_report"] = report
        
        # Print summary
        print(f"\n📋 Investigation Summary:")
        print(f"   Confidence: {report['confidence_score']:.0%}")
        print(f"   Signals detected: {len(report['decline_signals'])}")
        if report.get("web_context"):
            news_count = len(report["web_context"].get("news_coverage", []))
            print(f"   News articles found: {news_count}")
    else:
        print("\n✅ No decline detected - trend is healthy!")
    
    return result


def save_json_report(results: list, output_path: str):
    """Save analysis results as JSON report."""
    report = {
        "generated_at": datetime.now().isoformat(),
        "total_trends_analyzed": len(results),
        "trends_with_decline": sum(1 for r in results if r["decline_detected"]),
        "trends": results
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, default=str)
    
    return report


def print_executive_summary(results: list):
    """Print executive summary of all analyzed trends."""
    print("\n")
    print("=" * 60)
    print("📊 EXECUTIVE SUMMARY - TrendGuard Analysis Report")
    print("=" * 60)
    
    total = len(results)
    declined = [r for r in results if r["decline_detected"]]
    healthy = [r for r in results if not r["decline_detected"]]
    
    print(f"\n📈 Trends Analyzed: {total}")
    print(f"   ✅ Healthy: {len(healthy)}")
    print(f"   ⚠️ Declining: {len(declined)}")
    
    if declined:
        print(f"\n🚨 DECLINING TRENDS REQUIRING ATTENTION:")
        for r in declined:
            report = r.get("investigation_report", {})
            confidence = report.get("confidence_score", 0)
            signals = report.get("decline_signals", [])
            
            high_severity = [s for s in signals if s.get("severity") == "high"]
            
            print(f"\n   📌 {r['trend_name']}")
            print(f"      Decline Date: {r['decline_info']['date']}")
            print(f"      Confidence: {confidence:.0%}")
            print(f"      High-Severity Signals: {len(high_severity)}")
            
            if report.get("recommendations"):
                print(f"      Top Recommendation: {report['recommendations'][0][:60]}...")
    
    print("\n" + "=" * 60)


def run():
    """Main entry point for TrendGuard pipeline."""
    print("🚀 TrendGuard v2 - Explainable AI for Trend Decline Prediction")
    print("=" * 60)
    
    # Create reports directory
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # 1. Initialize HMM
    print("\n📐 Initializing 5-state HMM...")
    hmm = create_5state_hmm()
    
    # 2. Initialize AI Investigator
    print("🧠 Initializing AI Investigator...")
    investigator = TrendInvestigator()
    
    # 3. Load data
    print("\n📂 Loading trend data...")
    data_file = "data/trends_dataset.csv"
    
    # Check if multi-trend dataset exists, fallback to single trend
    if not os.path.exists(data_file):
        data_file = "data/trend_data.csv"
        if not os.path.exists(data_file):
            print("❌ No data file found! Run data_generator_v2.py first.")
            return
    
    df = pd.read_csv(data_file)
    print(f"   Loaded {len(df)} records")
    
    # 4. Get unique trends
    if "trend_name" in df.columns:
        trends = df["trend_name"].unique()
    else:
        trends = ["Unknown Trend"]
        df["trend_name"] = "Unknown Trend"
    
    print(f"   Found {len(trends)} unique trend(s)")
    
    # 5. Analyze each trend
    results = []
    for trend_name in trends:
        trend_df = df[df["trend_name"] == trend_name].copy()
        
        # Skip if too few data points
        if len(trend_df) < 10:
            print(f"⏭️ Skipping {trend_name} - insufficient data ({len(trend_df)} days)")
            continue
        
        result = analyze_single_trend(
            df=trend_df,
            trend_name=trend_name,
            hmm=hmm,
            investigator=investigator
        )
        results.append(result)
    
    # 6. Print executive summary
    print_executive_summary(results)
    
    # 7. Save JSON report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(REPORTS_DIR, f"trend_report_{timestamp}.json")
    save_json_report(results, report_path)
    print(f"\n💾 Full report saved to: {report_path}")
    
    # 8. Print investigation for first declining trend
    declining = [r for r in results if r["decline_detected"]]
    if declining and declining[0].get("investigation_report"):
        print("\n")
        print("=" * 60)
        print("📄 SAMPLE INVESTIGATION REPORT")
        print("=" * 60)
        report = declining[0]["investigation_report"]
        print(f"\nTrend: {declining[0]['trend_name']}")
        print(f"\n{report.get('explanation', 'No explanation generated')}")
        
        if report.get("recommendations"):
            print("\n📌 RECOMMENDATIONS:")
            for i, rec in enumerate(report["recommendations"][:5], 1):
                print(f"   {i}. {rec}")


if __name__ == "__main__":
    run()