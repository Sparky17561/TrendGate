"""
Test Script for Additional Metrics Integration
================================================
Tests Google Trends and Reddit scraping functionality
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_google_trends():
    """Test Google Trends helper."""
    print("\n" + "="*60)
    print("Testing Google Trends Integration")
    print("="*60)
    
    try:
        from trendguard.utils import fetch_google_trends_metrics, analyze_trends_decline_risk
        
        print("\n✓ Imports successful")
        
        # Test with a popular trend
        trend = "artificial intelligence"
        print(f"\n📊 Fetching Google Trends data for: {trend}")
        
        metrics = fetch_google_trends_metrics(trend)
        
        if metrics:
            print(f"\n✓ Data retrieved successfully!")
            print(f"  • Direction: {metrics['direction']}")
            print(f"  • Current Interest: {metrics['current_value']:.1f}")
            print(f"  • Slope: {metrics['slope']:.2f}")
            print(f"  • Data Points: {metrics['data_points']}")
            
            # Analyze risk
            risk = analyze_trends_decline_risk(metrics)
            print(f"\n📈 Risk Analysis:")
            print(f"  • Risk Level: {risk['risk_level']}")
            print(f"  • Risk Score: {risk['risk_score']}")
            print(f"  • Recommendation: {risk['recommendation']}")
            
            if risk['signals']:
                print(f"  • Signals: {', '.join(risk['signals'])}")
            
            return True
        else:
            print("⚠️ No data returned (this is OK if pytrends isn't installed)")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_reddit_scraping():
    """Test Reddit scraper."""
    print("\n" + "="*60)
    print("Testing Reddit Scraping")
    print("="*60)
    
    try:
        from trendguard.utils import scrape_subreddit, aggregate_reddit_metrics, analyze_reddit_decline_risk
        
        print("\n✓ Imports successful")
        
        # Test with a small subreddit
        subreddit = "python"
        limit = 20
        
        print(f"\n🔍 Scraping r/{subreddit} (limit: {limit} posts)")
        print("⏳ This may take a few seconds...")
        
        posts = scrape_subreddit(subreddit, limit=limit, delay=0.5)
        
        if posts:
            print(f"\n✓ Scraped {len(posts)} posts!")
            
            # Show sample post
            if len(posts) > 0:
                sample = posts[0]
                print(f"\n📝 Sample Post:")
                print(f"  • Title: {sample['title'][:60]}...")
                print(f"  • Score: {sample['score']}")
                print(f"  • Comments: {sample['comments']}")
                print(f"  • Engagement: {sample['engagement']}")
                print(f"  • Sentiment: {sample['sentiment']}")
            
            # Aggregate metrics
            metrics = aggregate_reddit_metrics(posts, window_days=30)
            print(f"\n📊 Aggregated Metrics:")
            print(f"  • Avg Engagement: {metrics['avg_engagement']:.1f}")
            print(f"  • Engagement Velocity: {metrics['engagement_velocity']:.2f}")
            print(f"  • Post Velocity: {metrics['post_velocity']:.2f}")
            print(f"  • Sentiment Shift: {metrics['sentiment_shift']:.2f}")
            print(f"  • Current Posts: {metrics['current_posts']}")
            
            # Analyze risk
            risk = analyze_reddit_decline_risk(metrics)
            print(f"\n📈 Risk Analysis:")
            print(f"  • Risk Level: {risk['risk_level']}")
            print(f"  • Risk Score: {risk['risk_score']}")
            print(f"  • Recommendation: {risk['recommendation']}")
            
            if risk['signals']:
                print(f"  • Signals:")
                for signal in risk['signals']:
                    print(f"    - {signal}")
            
            return True
        else:
            print("⚠️ No posts scraped")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_gemini_integration():
    """Test Gemini advisor with additional metrics."""
    print("\n" + "="*60)
    print("Testing Gemini Advisor Integration")
    print("="*60)
    
    try:
        # Check if Gemini API key is available
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("\n⚠️ GEMINI_API_KEY not found - skipping Gemini test")
            print("   (This is OK for testing just the data collection)")
            return False
        
        from trendguard.gemini_advisor import CampaignAdvisor
        
        print("\n✓ Imports successful")
        print("\n🤖 Initializing Gemini advisor...")
        
        advisor = CampaignAdvisor()
        
        print("\n📊 Running health check (this includes additional metrics)...")
        print("⏳ This may take 10-15 seconds...")
        
        result = advisor.check_trend_health("sustainable fashion")
        
        if "error" in result:
            print(f"❌ Error in analysis: {result['error']}")
            return False
        
        print(f"\n✓ Analysis complete!")
        
        # Check if additional metrics are present
        if "additional_metrics" in result:
            print(f"\n✅ Additional metrics successfully integrated!")
            
            am = result["additional_metrics"]
            
            if am.get("google_trends"):
                gt = am["google_trends"]
                if "metrics" in gt:
                    print(f"\n  📈 Google Trends:")
                    print(f"    • Direction: {gt['metrics']['direction']}")
                    print(f"    • Risk Level: {gt['risk_analysis']['risk_level']}")
            
            if am.get("reddit"):
                rd = am["reddit"]
                if "metrics" in rd:
                    print(f"\n  💬 Reddit:")
                    print(f"    • Subreddits: {', '.join(rd['subreddits_analyzed'])}")
                    print(f"    • Total Posts: {rd['total_posts']}")
                    print(f"    • Risk Level: {rd['risk_analysis']['risk_level']}")
        else:
            print(f"\n⚠️ Additional metrics not found in result")
            print(f"   Available keys: {list(result.keys())}")
        
        return True
        
    except ImportError as e:
        print(f"\n⚠️ Import error (this is OK if dependencies aren't installed yet): {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("TrendGuard Additional Metrics Test Suite")
    print("="*60)
    
    results = {
        "Google Trends": test_google_trends(),
        "Reddit Scraping": test_reddit_scraping(),
        "Gemini Integration": test_gemini_integration()
    }
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "⚠️ SKIP/FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "="*60)
    
    if all(results.values()):
        print("🎉 All tests passed!")
    elif any(results.values()):
        print("⚠️ Some tests passed - check failures above")
    else:
        print("❌ All tests failed - check errors above")
    
    print("="*60 + "\n")
