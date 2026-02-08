# Running the TrendGuard Backend

## Prerequisites

Make sure you have all dependencies installed:

```bash
pip install -r requirements.txt
```

## Set Up Environment Variables

Create a `.env` file in the TrendGate directory:

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```

## Method 1: Direct Python Execution (Recommended for Development)

From the **TrendGate** directory:

```bash
python backend/main.py
```

This will start the server with:
- **Host**: 0.0.0.0 (accessible from all network interfaces)
- **Port**: 8000
- **Auto-reload**: Enabled (restarts on code changes)

## Method 2: Using Uvicorn CLI Directly

From the **backend** directory:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or from the **TrendGate** directory:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Method 3: Production Mode (No Auto-Reload)

For production deployment:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or using Gunicorn with Uvicorn workers:

```bash
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Verify the Server is Running

Once started, you should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
🚀 TrendGuard API Starting...
INFO:     Application startup complete.
```

## Test the API

### 1. Open API Documentation

Visit in your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2. Test Root Endpoint

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
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
```

### 3. Test Health Check

```bash
curl http://localhost:8000/api/health
```

### 4. Test Campaign Analysis (with additional metrics)

```bash
curl -X POST http://localhost:8000/api/campaign/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI Trends 2026",
    "hashtags": ["#AI", "#MachineLearning"],
    "platform": "instagram",
    "campaign_aim": "Promote AI tools",
    "target_audience": "Tech enthusiasts",
    "planned_duration_days": 30
  }'
```

This will return the analysis **with additional_metrics** from Google Trends and Reddit!

### 5. Test Trend Health Check

```bash
curl -X POST http://localhost:8000/api/campaign/health \
  -H "Content-Type: application/json" \
  -d '{"trend_name": "sustainable fashion"}'
```

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| POST | `/api/campaign/analyze` | Full campaign analysis with predictions |
| POST | `/api/campaign/health` | Quick trend health check |
| POST | `/api/campaign/compare-hashtags` | Compare multiple hashtags |
| POST | `/api/trends/analyze` | Analyze trend from dataset |
| GET | `/api/trends/list` | List available trends |

## Troubleshooting

### Port Already in Use

If port 8000 is already taken, use a different port:

```bash
uvicorn backend.main:app --port 8001
```

### Module Import Errors

Make sure you're in the correct directory:

```bash
# Should be in TrendGate directory
pwd  # or cd on Windows
# Output should be: .../trendguard/TrendGate

# Verify file structure
ls backend/main.py  # Should exist
```

### CORS Errors from Frontend

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- All origins (`*`) for development

### API Key Missing Warnings

If you see warnings about missing API keys, create a `.env` file:

```bash
# In TrendGate directory
echo "GEMINI_API_KEY=your_key_here" > .env
echo "GROQ_API_KEY=your_key_here" >> .env
```

### Additional Metrics Not Showing

If `additional_metrics` field is missing or showing errors:

1. Check if dependencies are installed:
   ```bash
   pip install pytrends beautifulsoup4
   ```

2. Check the logs for specific error messages

3. The API will still work - additional metrics are optional

## Quick Start Commands

```bash
# 1. Navigate to project
cd c:\Users\saipr\Desktop\trendguard\TrendGate

# 2. Install dependencies (if not done)
pip install -r requirements.txt

# 3. Create .env file with API keys
# (Edit .env manually or use echo commands above)

# 4. Run the backend
python backend/main.py

# 5. Open browser to test
# Visit: http://localhost:8000/docs
```

## Frontend Integration

If you have a frontend, ensure it points to:
```javascript
const API_BASE_URL = "http://localhost:8000";
```

The backend CORS is already configured to accept requests from common frontend ports.

## Logs

Server logs will show:
- Incoming requests
- Processing time
- Errors and warnings
- API key status
- Additional metrics collection status

Example log output:
```
INFO:     127.0.0.1:xxxxx - "POST /api/campaign/health HTTP/1.1" 200 OK
WARNING:  pytrends not installed. Run: pip install pytrends
INFO:     Scraped 50 posts from r/socialmedia
```
