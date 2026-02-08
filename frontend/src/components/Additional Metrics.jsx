// Add this new component after line 293 in App.jsx

// --- ADDITIONAL METRICS COMPONENT (Google Trends + Reddit) ---
function AdditionalMetrics({ metrics }) {
  if (!metrics) return null;

  const { google_trends, reddit } = metrics;

  return (
    <div className="space-y-4">
      {/* Google Trends Section */}
      {google_trends && google_trends.metrics && (
        <div className="glass rounded-2xl p-6 border-l-4 border-cyan-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            📊 Google Trends Analysis
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Direction</div>
              <div className={`text-xl font-bold ${
                google_trends.metrics.direction === 'rising' ? 'text-emerald-400' :
                google_trends.metrics.direction === 'declining' ? 'text-red-400' :
                'text-amber-400'
              }`}>
                {google_trends.metrics.direction === 'rising' && '📈 Rising'}
                {google_trends.metrics.direction === 'declining' && '📉 Declining'}
                {google_trends.metrics.direction === 'stable' && '➡️ Stable'}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Search Interest</div>
              <div className="text-xl font-bold text-cyan-400">
                {google_trends.metrics.current_value.toFixed(0)}/100
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Slope</div>
              <div className={`text-xl font-bold ${
                google_trends.metrics.slope > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {google_trends.metrics.slope > 0 ? '+' : ''}{google_trends.metrics.slope.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Peak Value</div>
              <div className="text-xl font-bold text-purple-400">
                {google_trends.metrics.peak_value.toFixed(0)}
              </div>
            </div>
          </div>

          {google_trends.risk_analysis && (
            <div className={`p-4 rounded-xl border-2 ${
              google_trends.risk_analysis.risk_level === 'high' ? 'border-red-500/50 bg-red-500/10' :
              google_trends.risk_analysis.risk_level === 'medium' ? 'border-amber-500/50 bg-amber-500/10' :
              'border-emerald-500/50 bg-emerald-500/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">
                  Risk Level: <span className="capitalize">{google_trends.risk_analysis.risk_level}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-sm font-medium">
                  Score: {google_trends.risk_analysis.risk_score}/100
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{google_trends.risk_analysis.recommendation}</p>
              {google_trends.risk_analysis.signals && google_trends.risk_analysis.signals.length > 0 && (
                <div className="text-xs text-slate-400">
                  Signals: {google_trends.risk_analysis.signals.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reddit Section */}
      {reddit && reddit.metrics && (
        <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            💬 Reddit Community Analysis
          </h3>

          <div className="mb-4 text-sm text-slate-400">
            Analyzed from: {reddit.subreddits_analyzed?.join(', ') || 'various subreddits'} 
            ({reddit.total_posts || 0} posts)
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Avg Engagement</div>
              <div className="text-xl font-bold text-orange-400">
                {reddit.metrics.avg_engagement.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500 mt-1">upvotes + comments</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Engagement Δ</div>
              <div className={`text-xl font-bold ${
                reddit.metrics.engagement_velocity > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {reddit.metrics.engagement_velocity > 0 ? '+' : ''}{(reddit.metrics.engagement_velocity * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Post Frequency Δ</div>
              <div className={`text-xl font-bold ${
                reddit.metrics.post_velocity > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {reddit.metrics.post_velocity > 0 ? '+' : ''}{(reddit.metrics.post_velocity * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-1">Sentiment Shift</div>
              <div className={`text-xl font-bold ${
                reddit.metrics.sentiment_shift > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {reddit.metrics.sentiment_shift > 0 ? '+' : ''}{reddit.metrics.sentiment_shift.toFixed(2)}
              </div>
            </div>
          </div>

          {reddit.risk_analysis && (
            <div className={`p-4 rounded-xl border-2 ${
              reddit.risk_analysis.risk_level === 'high' ? 'border-red-500/50 bg-red-500/10' :
              reddit.risk_analysis.risk_level === 'medium' ? 'border-amber-500/50 bg-amber-500/10' :
              'border-emerald-500/50 bg-emerald-500/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">
                  Community Risk: <span className="capitalize">{reddit.risk_analysis.risk_level}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-sm font-medium">
                  Score: {reddit.risk_analysis.risk_score}/100
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{reddit.risk_analysis.recommendation}</p>
              {reddit.risk_analysis.signals && reddit.risk_analysis.signals.length > 0 && (
                <div className="text-xs text-slate-400">
                  Signals: {reddit.risk_analysis.signals.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg text-xs text-slate-400">
            <strong>Data Source:</strong> Scraped from old.reddit.com • {reddit.metrics.current_posts} recent posts • No API key required
          </div>
        </div>
      )}

      {/* Info about additional metrics */}
      {(!google_trends || !reddit) && (
        <div className="glass rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-400">
            ℹ️ Additional metrics {!google_trends && !reddit ? 'are being collected' : 'partially available'}...
          </p>
        </div>
      )}
    </div>
  );
}
