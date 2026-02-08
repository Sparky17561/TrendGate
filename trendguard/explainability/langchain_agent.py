"""
TrendInvestigator - Explainable AI for Trend Decline Analysis
=============================================================
Combines HMM predictions with real-world context from Serper API
and Featherless AI for comprehensive, explainable decline predictions.
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

from .serper_client import SerperClient

load_dotenv()


class TrendInvestigator:
    """
    Main explainability engine that combines:
    1. Serper API - Real-time web search for news/context
    2. Featherless AI - Intelligent analysis and explanation generation using DeepSeek-V3
    """
    
    def __init__(self):
        # Initialize Featherless AI client via LangChain
        featherless_key = os.getenv("FEATHERLESS_API_KEY")
        if not featherless_key:
            raise ValueError("FEATHERLESS_API_KEY environment variable not set")
        
        self.llm = ChatOpenAI(
            api_key=featherless_key,
            base_url="https://api.featherless.ai/v1",
            model="deepseek-ai/DeepSeek-V3"
        )
        
        # Initialize Serper client (optional - graceful degradation)
        try:
            self.serper = SerperClient()
            self.serper_available = True
        except ValueError:
            print("⚠️ Serper API not configured - running without web search")
            self.serper = None
            self.serper_available = False
    
    def investigate(
        self,
        trend_name: str,
        decline_date: str,
        metrics: Dict,
        archetype: Optional[str] = None
    ) -> Dict:
        """
        Full investigation of a trend decline.
        
        Args:
            trend_name: Name of the trend
            decline_date: Date when decline was detected
            metrics: Current metric values (velocity, fatigue, retention, etc.)
            archetype: Optional - detected trend archetype
            
        Returns:
            Comprehensive investigation report
        """
        print(f"\n🕵️ Investigating decline: {trend_name}")
        
        report = {
            "trend_name": trend_name,
            "decline_date": decline_date,
            "generated_at": datetime.now().isoformat(),
            "metrics_snapshot": metrics,
            "archetype": archetype,
            "web_context": None,
            "decline_signals": [],
            "explanation": "",
            "confidence_score": 0.0,
            "recommendations": [],
            "evidence": []
        }
        
        # Step 1: Analyze metrics for decline signals
        print("   📊 Analyzing metric signals...")
        report["decline_signals"] = self._analyze_metrics(metrics)
        
        # Step 2: Gather real-world context (if Serper available)
        if self.serper_available:
            print("   🌐 Gathering web context...")
            report["web_context"] = self.serper.investigate_trend_decline(
                trend_name=trend_name,
                decline_date=decline_date
            )
        
        # Step 3: Generate AI explanation
        print("   🧠 Generating AI explanation...")
        explanation_result = self._generate_explanation(
            trend_name=trend_name,
            decline_date=decline_date,
            metrics=metrics,
            signals=report["decline_signals"],
            web_context=report["web_context"],
            archetype=archetype
        )
        
        report["explanation"] = explanation_result["explanation"]
        report["confidence_score"] = explanation_result["confidence"]
        report["recommendations"] = explanation_result["recommendations"]
        report["evidence"] = explanation_result["evidence"]
        
        return report
    
    def _analyze_metrics(self, metrics: Dict) -> List[Dict]:
        """Analyze metrics and return list of decline signals."""
        signals = []
        
        # Velocity analysis
        velocity = metrics.get("velocity", 0)
        if velocity < 0.3:
            signals.append({
                "signal": "LOW_VELOCITY",
                "severity": "high" if velocity < 0.15 else "medium",
                "value": velocity,
                "description": "Engagement speed has dropped significantly"
            })
        
        # Fatigue analysis
        fatigue = metrics.get("fatigue", 0)
        if fatigue > 0.6:
            signals.append({
                "signal": "HIGH_FATIGUE",
                "severity": "high" if fatigue > 0.8 else "medium",
                "value": fatigue,
                "description": "Audience showing signs of content saturation"
            })
        
        # Retention analysis
        retention = metrics.get("retention", 1)
        if retention < 0.4:
            signals.append({
                "signal": "INFLUENCER_EXODUS",
                "severity": "high" if retention < 0.2 else "medium",
                "value": retention,
                "description": "Key creators abandoning the trend"
            })
        
        # Sentiment analysis (if available)
        sentiment = metrics.get("sentiment", 0)
        if sentiment < -0.3:
            signals.append({
                "signal": "NEGATIVE_SENTIMENT",
                "severity": "high" if sentiment < -0.6 else "medium",
                "value": sentiment,
                "description": "Public opinion turning negative"
            })
        
        # Content originality (if available)
        originality = metrics.get("content_originality", 1)
        if originality < 0.3:
            signals.append({
                "signal": "CONTENT_STAGNATION",
                "severity": "medium",
                "value": originality,
                "description": "Mostly reposts, lacking fresh content"
            })
        
        # Engagement rate (if available)
        engagement = metrics.get("engagement_rate", 0.1)
        if engagement < 0.03:
            signals.append({
                "signal": "LOW_ENGAGEMENT",
                "severity": "high",
                "value": engagement,
                "description": "Engagement rate below healthy threshold"
            })
        
        return signals
    
    def _generate_explanation(
        self,
        trend_name: str,
        decline_date: str,
        metrics: Dict,
        signals: List[Dict],
        web_context: Optional[Dict],
        archetype: Optional[str]
    ) -> Dict:
        """Generate AI-powered explanation using Featherless AI via LangChain."""
        
        # Build context prompt
        prompt = self._build_explanation_prompt(
            trend_name, decline_date, metrics, signals, web_context, archetype
        )
        
        try:
            # Use LangChain's invoke method
            messages = [
                (
                    "system",
                    """You are an expert social media trend analyst specializing in 
                    decline prediction and explainability. Your analysis should be:
                    1. Data-driven - cite specific metrics
                    2. Context-aware - incorporate real-world news when available
                    3. Actionable - provide concrete recommendations
                    4. Clear - explain in business-friendly language
                    
                    Always structure your response in this JSON format:
                    {
                        "explanation": "2-3 paragraph analysis of why the trend is declining",
                        "confidence": 0.0-1.0,
                        "key_factors": ["factor1", "factor2", ...],
                        "recommendations": ["action1", "action2", ...],
                        "evidence": ["evidence1", "evidence2", ...]
                    }"""
                ),
                (
                    "human",
                    prompt
                )
            ]
            
            response = self.llm.invoke(messages)
            content = response.content
            
            # Try to parse as JSON
            try:
                # Find JSON in response
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end > start:
                    result = json.loads(content[start:end])
                    return {
                        "explanation": result.get("explanation", content),
                        "confidence": result.get("confidence", 0.7),
                        "recommendations": result.get("recommendations", []),
                        "evidence": result.get("evidence", [])
                    }
            except json.JSONDecodeError:
                pass
            
            # Fallback: return raw text
            return {
                "explanation": content,
                "confidence": 0.7,
                "recommendations": [],
                "evidence": []
            }
            
        except Exception as e:
            return {
                "explanation": f"Error generating explanation: {str(e)}",
                "confidence": 0.0,
                "recommendations": [],
                "evidence": []
            }
                "confidence": 0.0,
                "recommendations": [],
                "evidence": []
            }
    
    def _build_explanation_prompt(
        self,
        trend_name: str,
        decline_date: str,
        metrics: Dict,
        signals: List[Dict],
        web_context: Optional[Dict],
        archetype: Optional[str]
    ) -> str:
        """Build the prompt for Groq AI."""
        
        prompt_parts = [
            f"# Trend Decline Analysis: {trend_name}",
            f"**Decline Detected:** {decline_date}",
            ""
        ]
        
        # Add archetype if known
        if archetype:
            prompt_parts.append(f"**Detected Pattern:** {archetype}")
            prompt_parts.append("")
        
        # Add metrics
        prompt_parts.append("## Current Metrics")
        for key, value in metrics.items():
            if isinstance(value, float):
                prompt_parts.append(f"- {key}: {value:.3f}")
            else:
                prompt_parts.append(f"- {key}: {value}")
        prompt_parts.append("")
        
        # Add detected signals
        if signals:
            prompt_parts.append("## Decline Signals Detected")
            for signal in signals:
                prompt_parts.append(
                    f"- **{signal['signal']}** ({signal['severity']}): {signal['description']}"
                )
            prompt_parts.append("")
        
        # Add web context if available
        if web_context and web_context.get("summary_context"):
            prompt_parts.append("## Real-World Context (from web search)")
            prompt_parts.append(web_context["summary_context"])
            prompt_parts.append("")
        
        # Add task
        prompt_parts.extend([
            "## Task",
            "Analyze this trend decline and provide:",
            "1. A clear explanation of WHY the trend is declining",
            "2. Your confidence level (0-1) in this analysis",
            "3. 3-5 actionable recommendations for stakeholders",
            "4. Key evidence supporting your analysis",
            "",
            "Return your response as a JSON object."
        ])
        
        return "\n".join(prompt_parts)
    
    def explain_decline(
        self,
        trend_name: str,
        decline_date: str,
        metrics: Dict
    ) -> str:
        """
        Legacy compatible method - returns just the explanation text.
        Used by main_pipeline.py for backwards compatibility.
        """
        report = self.investigate(trend_name, decline_date, metrics)
        
        output_parts = [
            "=" * 50,
            "📊 TREND DECLINE ANALYSIS REPORT",
            "=" * 50,
            "",
            f"Trend: {trend_name}",
            f"Decline Date: {decline_date}",
            f"Confidence: {report['confidence_score']:.0%}",
            "",
            "--- EXPLANATION ---",
            report["explanation"],
            ""
        ]
        
        if report["recommendations"]:
            output_parts.append("--- RECOMMENDATIONS ---")
            for i, rec in enumerate(report["recommendations"], 1):
                output_parts.append(f"{i}. {rec}")
            output_parts.append("")
        
        if report["evidence"]:
            output_parts.append("--- EVIDENCE ---")
            for ev in report["evidence"]:
                output_parts.append(f"• {ev}")
        
        return "\n".join(output_parts)


# --- TESTING ---
if __name__ == "__main__":
    print("🧪 Testing TrendInvestigator")
    print("=" * 40)
    
    investigator = TrendInvestigator()
    
    test_metrics = {
        "velocity": 0.25,
        "fatigue": 0.72,
        "retention": 0.35,
        "sentiment": -0.2,
        "engagement_rate": 0.04,
        "content_originality": 0.28
    }
    
    report = investigator.investigate(
        trend_name="Skibidi Toilet",
        decline_date="2025-02-09",
        metrics=test_metrics,
        archetype="saturated_death"
    )
    
    print("\n📋 Full Report:")
    print(json.dumps(report, indent=2, default=str))