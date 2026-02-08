import os
import logging
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# Setup simple logging (replaces the complex logger from the old project)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class GroqExplainer:
    """
    Featherless AI client for generating trend explanations using DeepSeek-V3.2.
    Uses LangChain's ChatOpenAI interface for compatibility.
    """
    
    def __init__(self, model: str = "deepseek-ai/DeepSeek-V3"):
        api_key = os.getenv("FEATHERLESS_API_KEY")
        if not api_key:
            raise ValueError("FEATHERLESS_API_KEY not found in .env")
            
        self.client = ChatOpenAI(
            api_key=api_key,
            base_url="https://api.featherless.ai/v1",
            model=model
        )
        self.model = model
        logger.info(f"Initialized Featherless AI Explainer with model: {model}")
    
    def explain_trend(self, topic: str, decline_date: str, metrics: dict) -> str:
        """
        Generates a narrative explanation based purely on the provided metrics.
        """
        logger.info(f"Generating explanation for topic: {topic}")
        
        # 1. Build the prompt
        prompt = self._build_prompt(topic, decline_date, metrics)
        
        try:
            # 2. Call Featherless AI via LangChain
            messages = [
                (
                    "system", 
                    "You are a senior Data Analyst for a social media agency. Be concise, professional, and brutal."
                ),
                (
                    "human", 
                    prompt
                )
            ]
            
            response = self.client.invoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Featherless AI API Error: {e}")
            return f"Error generating explanation: {str(e)}"

    def _build_prompt(self, topic, date, metrics):
        return f"""
        ANOMALY DETECTED:
        Trend: {topic}
        Date of Crash: {date}
        
        DIAGNOSTIC METRICS:
        - Velocity (Engagement Speed): {metrics.get('velocity', 0):.2f} / 1.0
        - Fatigue (Audience Boredom): {metrics.get('fatigue', 0):.2f} / 1.0
        - Retention (Influencer Loyalty): {metrics.get('retention', 0):.2f} / 1.0
        
        ANALYSIS REQUIRED:
        Based *only* on these numbers, hypothesize why this trend is dying.
        - If Fatigue is high (>0.7), cite "Audience Saturation".
        - If Retention is low (<0.3), cite "Creator Abandonment".
        - If Velocity dropped sharply, cite "Algorithm Shift".
        
        Provide a 3-bullet point executive summary.
        """