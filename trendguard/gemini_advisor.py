"""
Gemini Campaign Advisor
=======================
Uses Google Gemini 2.5 Flash with Google Search grounding to:
1. Analyze campaign viability before launch
2. Predict trend lifecycle and decline risks
3. Provide competitive landscape analysis
4. Recommend optimal strategies
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

# Import Google GenAI
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ google-genai not installed. Run: pip install google-genai")


class CampaignAdvisor:
    """
    AI-powered campaign advisor using Gemini with Google Search grounding.
    Helps marketers predict trend success and avoid decline pitfalls.
    """
    
    def __init__(self):
        if not GEMINI_AVAILABLE:
            raise ImportError("google-genai package required. Run: pip install google-genai")
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash"
        
        # Configure tools for grounding
        self.tools = [
            types.Tool(google_search=types.GoogleSearch()),
        ]
        
        self.generate_config = types.GenerateContentConfig(
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="BLOCK_ONLY_HIGH",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="BLOCK_ONLY_HIGH",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="BLOCK_ONLY_HIGH",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_ONLY_HIGH",
                ),
            ],
            tools=self.tools,
        )
    
    def analyze_campaign(
        self,
        topic: str,
        hashtags: List[str],
        platform: str,
        campaign_aim: str,
        target_audience: str,
        planned_duration_days: int = 30,
        additional_context: Optional[str] = None
    ) -> Dict:
        """
        Analyze a campaign before launch and predict its success/decline trajectory.
        
        Args:
            topic: Main campaign topic/theme
            hashtags: List of planned hashtags
            platform: Target platform (instagram, tiktok, twitter, etc.)
            campaign_aim: What the campaign wants to achieve
            target_audience: Who the campaign targets
            planned_duration_days: How long the campaign will run
            additional_context: Any extra info about the campaign
            
        Returns:
            Comprehensive campaign analysis with predictions
        """
        
        hashtag_str = ", ".join(hashtags)
        
        prompt = f"""You are an expert social media strategist and trend analyst. Analyze this upcoming campaign and provide detailed predictions.

## CAMPAIGN DETAILS
- **Topic:** {topic}
- **Hashtags:** {hashtag_str}
- **Platform:** {platform}
- **Campaign Aim:** {campaign_aim}
- **Target Audience:** {target_audience}
- **Planned Duration:** {planned_duration_days} days
{f"- **Additional Context:** {additional_context}" if additional_context else ""}

## YOUR TASK
Using real-time Google Search data, analyze:

1. **Current Market Status**: Search for these hashtags and similar trends. Are they currently hot, declining, or saturated?

2. **Competitive Landscape**: What similar campaigns or trends are currently active? Who are the key players?

3. **Viability Score (0-100)**: Rate this campaign's likely success based on:
   - Market saturation level
   - Audience fatigue indicators
   - Platform algorithm favorability
   - Timing appropriateness

4. **Predicted Lifecycle**: Estimate how long this trend/campaign will stay relevant before decline signals appear.

5. **Top 5 Risk Factors**: What could cause this campaign to fail or decline prematurely?
   Examples: Content Saturation, Event Expiry, Controversy Fatigue, Algorithm Shift, Influencer Exodus

6. **Optimization Recommendations**: 5 actionable strategies to maximize success and extend lifecycle.

7. **Optimal Launch Window**: When is the best time to launch this campaign?

8. **Similar Past Trends**: Reference 2-3 similar trends from the past and what happened to them.

## RESPONSE FORMAT
Return a JSON object with this structure:
{{
    "viability_score": 75,
    "market_status": "growing|saturated|declining|emerging",
    "predicted_lifecycle_days": 45,
    "competitive_analysis": {{
        "active_competitors": ["...", "..."],
        "market_saturation": "low|medium|high",
        "key_players": ["...", "..."]
    }},
    "risk_factors": [
        {{"risk": "Content Saturation", "severity": "high|medium|low", "mitigation": "..."}},
        ...
    ],
    "recommendations": ["...", "...", "...", "...", "..."],
    "optimal_launch_window": "Description of best timing",
    "similar_past_trends": [
        {{"name": "...", "outcome": "...", "lesson": "..."}}
    ],
    "platform_insights": {{
        "algorithm_favorability": "high|medium|low",
        "trending_formats": ["...", "..."],
        "avoid_formats": ["...", "..."]
    }},
    "summary": "2-3 sentence executive summary"
}}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=self.generate_config,
            )
            
            # Extract text response
            response_text = response.text
            
            # Try to parse JSON from response
            try:
                # Find JSON in response
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end > start:
                    result = json.loads(response_text[start:end])
                    result["raw_analysis"] = response_text
                    result["analyzed_at"] = datetime.now().isoformat()
                    result["campaign_input"] = {
                        "topic": topic,
                        "hashtags": hashtags,
                        "platform": platform,
                        "campaign_aim": campaign_aim,
                        "target_audience": target_audience,
                        "planned_duration_days": planned_duration_days
                    }
                    return result
            except json.JSONDecodeError:
                pass
            
            # Fallback: return raw text
            return {
                "viability_score": 50,
                "raw_analysis": response_text,
                "analyzed_at": datetime.now().isoformat(),
                "parse_error": "Could not parse structured response"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "analyzed_at": datetime.now().isoformat()
            }
    
    def check_trend_health(self, trend_name: str) -> Dict:
        """
        Quick health check on an existing trend using real-time search.
        
        Args:
            trend_name: Name of the trend or hashtag to analyze
            
        Returns:
            Health status and current metrics
        """
        
        prompt = f"""Analyze the current health status of this social media trend: "{trend_name}"

Using Google Search, find:
1. Is this trend currently growing, peaking, declining, or dead?
2. What's the current engagement level?
3. Are there any controversies or negative sentiment?
4. Who are the main creators/influencers still participating?
5. What platforms is it most active on?

Return a JSON object:
{{
    "trend_name": "{trend_name}",
    "health_status": "growing|peaking|declining|dead|emerging",
    "health_score": 75,
    "sentiment": "positive|neutral|negative|mixed",
    "active_platforms": ["...", "..."],
    "key_creators": ["...", "..."],
    "recent_news": ["...", "..."],
    "decline_signals": ["...", "..."],
    "recommendation": "Continue investing|Reduce exposure|Exit immediately|Monitor closely"
}}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=self.generate_config,
            )
            
            response_text = response.text
            
            try:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end > start:
                    result = json.loads(response_text[start:end])
                    result["checked_at"] = datetime.now().isoformat()
                    return result
            except json.JSONDecodeError:
                pass
            
            return {
                "trend_name": trend_name,
                "raw_analysis": response_text,
                "checked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def compare_hashtags(self, hashtags: List[str], platform: str = "instagram") -> Dict:
        """
        Compare multiple hashtags to find the best performing ones.
        
        Args:
            hashtags: List of hashtags to compare
            platform: Target platform
            
        Returns:
            Ranked comparison of hashtags
        """
        
        hashtag_str = ", ".join(hashtags)
        
        prompt = f"""Compare these hashtags for a {platform} campaign: {hashtag_str}

For each hashtag, search and determine:
1. Current popularity/volume
2. Competition level
3. Engagement rate trend
4. Risk of saturation
5. Recommended or not

Return a JSON object:
{{
    "platform": "{platform}",
    "comparison": [
        {{
            "hashtag": "...",
            "popularity_score": 85,
            "competition": "low|medium|high",
            "trend_direction": "up|stable|down",
            "saturation_risk": "low|medium|high",
            "recommended": true,
            "reason": "..."
        }}
    ],
    "best_combination": ["...", "...", "..."],
    "avoid": ["..."],
    "strategy_tip": "..."
}}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=self.generate_config,
            )
            
            response_text = response.text
            
            try:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end > start:
                    return json.loads(response_text[start:end])
            except json.JSONDecodeError:
                pass
            
            return {"raw_analysis": response_text}
            
        except Exception as e:
            return {"error": str(e)}


# --- CLI TESTING ---
if __name__ == "__main__":
    print("🧪 Testing Gemini Campaign Advisor")
    print("=" * 50)
    
    try:
        advisor = CampaignAdvisor()
        
        # Test campaign analysis
        print("\n📊 Analyzing sample campaign...")
        result = advisor.analyze_campaign(
            topic="Summer Fashion Drop 2025",
            hashtags=["#SummerVibes", "#OOTD", "#Fashion2025", "#StreetStyle"],
            platform="instagram",
            campaign_aim="Launch new streetwear collection targeting Gen Z",
            target_audience="18-25 year olds interested in fashion and lifestyle",
            planned_duration_days=45
        )
        
        print(f"\n✅ Viability Score: {result.get('viability_score', 'N/A')}")
        print(f"📈 Market Status: {result.get('market_status', 'N/A')}")
        print(f"⏱️ Predicted Lifecycle: {result.get('predicted_lifecycle_days', 'N/A')} days")
        
        if result.get('recommendations'):
            print("\n💡 Recommendations:")
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"   {i}. {rec}")
        
        if result.get('risk_factors'):
            print("\n⚠️ Risk Factors:")
            for rf in result['risk_factors'][:3]:
                print(f"   • {rf.get('risk', rf)} ({rf.get('severity', 'unknown')})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure GEMINI_API_KEY is set and google-genai is installed")
