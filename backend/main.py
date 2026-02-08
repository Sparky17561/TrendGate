"""
TrendGuard FastAPI Backend
==========================
REST API for campaign analysis and trend prediction.
"""

import os
import sys
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

# Helper function to resolve data file paths
def get_data_file_path(filename: str) -> str:
    """Get absolute path to data file, handling different working directories."""
    # Try relative to current directory first
    if os.path.exists(filename):
        return filename
    
    # Try relative to parent directory (if running from backend/)
    parent_path = os.path.join("..", filename)
    if os.path.exists(parent_path):
        return parent_path
    
    # Try relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    abs_path = os.path.join(parent_dir, filename)
    if os.path.exists(abs_path):
        return abs_path
    
    # Return original path as fallback
    return filename


# --- PYDANTIC SCHEMAS ---

class CampaignInput(BaseModel):
    """Input schema for campaign analysis."""
    topic: str = Field(..., description="Main campaign topic/theme")
    hashtags: List[str] = Field(..., description="List of planned hashtags")
    platform: str = Field(..., description="Target platform (instagram, tiktok, twitter, etc.)")
    campaign_aim: str = Field(..., description="What the campaign wants to achieve")
    target_audience: str = Field(..., description="Who the campaign targets")
    planned_duration_days: int = Field(30, description="How long the campaign will run")
    additional_context: Optional[str] = Field(None, description="Any extra info")

class TrendHealthInput(BaseModel):
    """Input schema for trend health check."""
    trend_name: str = Field(..., description="Name of the trend or hashtag")

class HashtagCompareInput(BaseModel):
    """Input schema for hashtag comparison."""
    hashtags: List[str] = Field(..., description="List of hashtags to compare")
    platform: str = Field("instagram", description="Target platform")

class TrendAnalysisInput(BaseModel):
    """Input schema for trend file analysis."""
    trend_name: Optional[str] = Field(None, description="Specific trend to analyze")

# --- FASTAPI APP ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 TrendGuard API Starting...")
    yield
    print("👋 TrendGuard API Shutting down...")

app = FastAPI(
    title="TrendGuard API",
    description="Explainable AI for Social Media Trend Decline Prediction",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LAZY IMPORTS FOR SERVICES ---
_gemini_advisor = None
_hmm_analyzer = None

def get_gemini_advisor():
    """Lazy load Gemini advisor."""
    global _gemini_advisor
    if _gemini_advisor is None:
        try:
            from trendguard.gemini_advisor import CampaignAdvisor
            _gemini_advisor = CampaignAdvisor()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini initialization failed: {str(e)}")
    return _gemini_advisor

def get_hmm_analyzer():
    """Lazy load HMM analyzer components."""
    global _hmm_analyzer
    if _hmm_analyzer is None:
        try:
            import numpy as np
            import pandas as pd
            from trendguard.hmm_engine.hmm import HiddenMarkovModel
            from trendguard.hmm_engine.decoder import viterbi_gaussian
            from trendguard.explainability.langchain_agent import TrendInvestigator
            
            # Create 5-state HMM
            states = ["Emerging", "Growth", "Peak", "Saturation", "Decline"]
            emission_means = np.array([
                [0.3, 0.1, 0.4], [0.8, 0.2, 0.8], [0.9, 0.4, 0.9],
                [0.5, 0.6, 0.6], [0.2, 0.8, 0.3]
            ])
            emission_covs = np.array([
                np.eye(3)*0.08, np.eye(3)*0.05, np.eye(3)*0.04,
                np.eye(3)*0.08, np.eye(3)*0.10
            ])
            transition_matrix = np.array([
                [0.6, 0.35, 0.05, 0.0, 0.0],
                [0.0, 0.5, 0.45, 0.05, 0.0],
                [0.0, 0.0, 0.4, 0.5, 0.1],
                [0.0, 0.0, 0.0, 0.5, 0.5],
                [0.0, 0.0, 0.0, 0.0, 1.0]
            ])
            initial_probs = np.array([0.8, 0.2, 0.0, 0.0, 0.0])
            
            hmm = HiddenMarkovModel(
                states=states, emission_means=emission_means,
                emission_covs=emission_covs, transition_matrix=transition_matrix,
                initial_probs=initial_probs
            )
            investigator = TrendInvestigator()
            
            _hmm_analyzer = {
                "hmm": hmm, "decoder": viterbi_gaussian,
                "investigator": investigator, "pd": pd, "np": np
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HMM initialization failed: {str(e)}")
    return _hmm_analyzer

# --- API ENDPOINTS ---

@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "TrendGuard API",
        "version": "3.0.0",
        "status": "running",
        "endpoints": {
            "campaign_analyze": "POST /api/campaign/analyze",
            "trend_health": "POST /api/campaign/health",
            "hashtag_compare": "POST /api/campaign/compare-hashtags",
            "trend_analyze": "POST /api/trends/analyze",
            "trend_list": "GET /api/trends/list"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "gemini": os.getenv("GEMINI_API_KEY") is not None,
            "groq": os.getenv("GROQ_API_KEY") is not None,
            "serper": os.getenv("SERPER_API_KEY") is not None
        }
    }

@app.post("/api/campaign/analyze")
async def analyze_campaign(campaign: CampaignInput):
    """
    Analyze a campaign before launch using Gemini with Google Search grounding.
    Returns viability score, predictions, and recommendations.
    """
    advisor = get_gemini_advisor()
    
    result = advisor.analyze_campaign(
        topic=campaign.topic,
        hashtags=campaign.hashtags,
        platform=campaign.platform,
        campaign_aim=campaign.campaign_aim,
        target_audience=campaign.target_audience,
        planned_duration_days=campaign.planned_duration_days,
        additional_context=campaign.additional_context
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@app.post("/api/campaign/health")
async def check_trend_health(input: TrendHealthInput):
    """
    Quick health check on an existing trend using real-time search.
    """
    advisor = get_gemini_advisor()
    result = advisor.check_trend_health(input.trend_name)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@app.post("/api/campaign/compare-hashtags")
async def compare_hashtags(input: HashtagCompareInput):
    """
    Compare multiple hashtags to find the best performing ones.
    """
    advisor = get_gemini_advisor()
    result = advisor.compare_hashtags(input.hashtags, input.platform)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@app.get("/api/trends/list")
async def list_trends():
    """
    List available trends from the dataset.
    """
    try:
        analyzer = get_hmm_analyzer()
        pd = analyzer["pd"]
        
        # Use helper to find data file
        data_file = get_data_file_path("data/trends_dataset.csv")
        if not os.path.exists(data_file):
            data_file = get_data_file_path("data/trend_data.csv")
        
        if not os.path.exists(data_file):
            return {"trends": [], "count": 0, "message": "No data files found"}
        
        df = pd.read_csv(data_file)
        
        if "trend_name" in df.columns:
            trends = df.groupby("trend_name").agg({
                "date": ["min", "max", "count"]
            }).reset_index()
            trends.columns = ["trend_name", "start_date", "end_date", "data_points"]
            
            if "archetype" in df.columns:
                archetypes = df.groupby("trend_name")["archetype"].first().to_dict()
                trends["archetype"] = trends["trend_name"].map(archetypes)
            
            return {
                "trends": trends.to_dict(orient="records"),
                "count": len(trends)
            }
        
        return {"trends": [{"trend_name": "Default", "data_points": len(df)}], "count": 1}
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in list_trends: {error_details}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to load trends: {str(e)}"
        )

@app.post("/api/trends/analyze")
async def analyze_trend(input: TrendAnalysisInput):
    """
    Run HMM analysis on trend data and generate explanation.
    """
    try:
        analyzer = get_hmm_analyzer()
        pd = analyzer["pd"]
        np = analyzer["np"]
        hmm = analyzer["hmm"]
        decoder = analyzer["decoder"]
        
        data_file = get_data_file_path("data/trends_dataset.csv")
        if not os.path.exists(data_file):
            data_file = get_data_file_path("data/trend_data.csv")
        
        if not os.path.exists(data_file):
            raise HTTPException(status_code=404, detail="No trend data found")
        
        df = pd.read_csv(data_file)
        
        # Filter by trend name if specified
        if input.trend_name and "trend_name" in df.columns:
            df = df[df["trend_name"] == input.trend_name].copy()
            if len(df) == 0:
                raise HTTPException(status_code=404, detail=f"Trend '{input.trend_name}' not found")
        
        # Reset index to ensure alignment
        df = df.reset_index(drop=True)
        
        # Run HMM inference
        observations = df[["velocity", "fatigue", "retention"]].values
        state_sequence = decoder(hmm, observations)
        
        # Find decline point (without expensive AI investigation for speed)
        decline_info = None
        for i, state in enumerate(state_sequence):
            if state in ["Saturation", "Decline"]:
                row = df.iloc[i]
                metrics = {
                    "velocity": float(row["velocity"]),
                    "fatigue": float(row["fatigue"]),
                    "retention": float(row["retention"])
                }
                
                # Add extended metrics if available
                for col in ["sentiment", "engagement_rate", "content_originality"]:
                    if col in df.columns:
                        metrics[col] = float(row[col])
                
                archetype = str(row["archetype"]) if "archetype" in df.columns else None
                
                decline_info = {
                    "detected": True,
                    "date": str(row["date"]),
                    "index": i,
                    "state": state,
                    "metrics": metrics,
                    "archetype": archetype,
                    "investigation": {
                        "explanation": f"Trend '{input.trend_name or 'Unknown'}' detected entering {state} phase on {row['date']}. Velocity dropped to {metrics['velocity']:.2f}, fatigue increased to {metrics['fatigue']:.2f}. Pattern matched: {archetype}.",
                        "confidence_score": 0.85
                    }
                }
                break
        
        # Build lifecycle data with proper indexing
        lifecycle_data = []
        for idx in range(len(df)):
            row = df.iloc[idx]
            lifecycle_data.append({
                "date": str(row["date"]),
                "velocity": float(row["velocity"]),
                "fatigue": float(row["fatigue"]),
                "retention": float(row["retention"]),
                "state": state_sequence[idx]
            })
        
        return {
            "trend_name": input.trend_name or "Default",
            "total_points": len(df),
            "state_distribution": {s: state_sequence.count(s) for s in set(state_sequence)},
            "decline_detected": decline_info is not None,
            "decline_info": decline_info,
            "lifecycle_data": lifecycle_data[:100]  # Limit to 100 points
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


# --- RUN SERVER ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
