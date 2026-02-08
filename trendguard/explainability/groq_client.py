import os
import logging
from groq import Groq
from dotenv import load_dotenv

# Setup simple logging (replaces the complex logger from the old project)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class GroqExplainer:
    """
    Direct Groq API client for generating trend explanations.
    Useful as a fallback if LangChain/Search is unavailable.
    """
    
    def __init__(self, model: str = "llama-3.3-70b-versatile"):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env")
            
        self.client = Groq(api_key=api_key)
        self.model = model
        logger.info(f"Initialized GroqExplainer with model: {model}")
    
    def explain_trend(self, topic: str, decline_date: str, metrics: dict) -> str:
        """
        Generates a narrative explanation based purely on the provided metrics.
        """
        logger.info(f"Generating explanation for topic: {topic}")
        
        # 1. Build the prompt
        prompt = self._build_prompt(topic, decline_date, metrics)
        
        try:
            # 2. Call Groq
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a senior Data Analyst for a social media agency. Be concise, professional, and brutal."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
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