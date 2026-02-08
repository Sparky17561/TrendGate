// TrendGuard v4.0 - Enhanced Frontend
// Premium Black/White Theme with AI-Powered Insights

import { useState, useEffect } from 'react';
import { Rocket, TrendingUp, TrendingDown, Search, BarChart3, Zap, Shield, AlertTriangle, CheckCircle, Activity, PieChart, RefreshCw, ChevronDown, Upload, Sparkles, Eye, Lightbulb, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import api from './api/client';
import PostUpload from './components/PostUpload';
import './index.css';

// --- CAMPAIGN FORM COMPONENT WITH POST UPLOAD ---
function CampaignForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    topic: '',
    hashtags: '',
    platform: 'instagram',
    campaign_aim: '',
    target_audience: '',
    planned_duration_days: 30,
    additional_context: ''
  });

  const [uploadedPost, setUploadedPost] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      hashtags: formData.hashtags.split(',').map(h => h.trim()).filter(h => h),
      uploaded_post_content: uploadedPost?.content || null
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Post Upload Section - NEW */}
      <div className="p-6 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Upload Post (Optional)</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Upload an example post to get AI-powered insights tailored to your content
        </p>
        <PostUpload onPostExtracted={setUploadedPost} />
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Topic *</label>
        <input
          type="text"
          required
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="e.g., Summer Fashion Collection 2026"
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 focus:ring-2 focus:ring-white/10 text-white placeholder-gray-500 transition-all"
        />
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags (comma-separated) *</label>
        <input
          type="text"
          required
          value={formData.hashtags}
          onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
          placeholder="#SummerVibes, #OOTD, #Fashion2026"
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 focus:ring-2 focus:ring-white/10 text-white placeholder-gray-500 transition-all"
        />
      </div>

      {/* Platform & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 text-white transition-all"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
          <input
            type="number"
            min="7"
            max="365"
            value={formData.planned_duration_days}
            onChange={(e) => setFormData({ ...formData, planned_duration_days: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 text-white transition-all"
          />
        </div>
      </div>

      {/* Campaign Aim */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Aim *</label>
        <input
          type="text"
          required
          value={formData.campaign_aim}
          onChange={(e) => setFormData({ ...formData, campaign_aim: e.target.value })}
          placeholder="e.g., Increase brand awareness, drive product sales"
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 focus:ring-2 focus:ring-white/10 text-white placeholder-gray-500 transition-all"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience *</label>
        <input
          type="text"
          required
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          placeholder="e.g., 18-35 environmentally conscious consumers"
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 focus:ring-2 focus:ring-white/10 text-white placeholder-gray-500 transition-all"
        />
      </div>

      {/* Additional Context */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Additional Context</label>
        <textarea
          value={formData.additional_context}
          onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
          placeholder="Any other relevant information about your campaign..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] focus:border-white/20 focus:ring-2 focus:ring-white/10 text-white placeholder-gray-500 transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <div className="loading-spinner" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Analyze Campaign
          </>
        )}
      </button>
    </form>
  );
}

//VIABILITY SCORE COMPONENT ---
function ViabilityScore({ score }) {
  const getColor = () => {
    if (score >= 75) return 'from-emerald-400 to-emerald-500';
    if (score >= 40) return 'from-amber-400 to-amber-500';
    return 'from-red-400 to-red-500';
  };

  const getLabel = () => {
    if (score >= 75) return 'High Potential';
    if (score >= 40) return 'Moderate Risk';
    return 'High Risk';
  };

  const getBgGlow = () => {
    if (score >= 75) return 'shadow-[0_0_40px_rgba(16,185,129,0.05)]';
    if (score >= 40) return 'shadow-[0_0_40px_rgba(245,158,11,0.05)]';
    return 'shadow-[0_0_40px_rgba(239,68,68,0.05)]';
  };

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className={`text-7xl font-bold bg-gradient-to-r ${getColor()} bg-clip-text text-transparent ${getBgGlow()}`}>
          {score}
        </div>
        <div className="text-gray-400 text-sm uppercase tracking-wider mt-2">{getLabel()}</div>
      </div>
      <div className="h-3 bg-[#141414] rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-1000 shadow-lg`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// --- RISK FACTOR COMPONENT ---
function RiskFactor({ risk, severity, mitigation }) {
  const severityStyles = {
    high: 'bg-white/10 text-white border-white/20',
    medium: 'bg-white/5 text-gray-300 border-white/10',
    low: 'bg-white/5 text-gray-400 border-white/10'
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover-lift">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-white" />
          <span className="font-medium text-white">{risk}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityStyles[severity] || severityStyles.medium}`}>
          {severity}
        </span>
      </div>
      {mitigation && (
        <p className="text-sm text-gray-400 mt-2">{mitigation}</p>
      )}
    </div>
  );
}

// --- ANALYSIS RESULTS COMPONENT ---
function AnalysisResults({ results }) {
  if (!results) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Viability Score Card */}
      <div className="glass rounded-2xl p-6 text-center hover-lift">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Campaign Viability Score</h3>
        <ViabilityScore score={results.viability_score || 50} />
      </div>

      {/* Summary */}
      {results.summary && (
        <div className="glass rounded-2xl p-6 hover-lift">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            Executive Summary
          </h3>
          <p className="text-gray-300 leading-relaxed">{results.summary}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center hover-lift">
          <div className="text-2xl font-bold text-white">{results.predicted_lifecycle_days || '—'}</div>
          <div className="text-sm text-gray-400 mt-1">Predicted Days</div>
        </div>
        <div className="glass rounded-xl p-4 text-center hover-lift">
          <div className="text-2xl font-bold text-white capitalize">{results.market_status || '—'}</div>
          <div className="text-sm text-gray-400 mt-1">Market Status</div>
        </div>
        <div className="glass rounded-xl p-4 text-center hover-lift">
          <div className="text-2xl font-bold text-white capitalize">
            {results.competitive_analysis?.market_saturation || '—'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Saturation</div>
        </div>
      </div>

      {/* Risk Factors */}
      {results.risk_factors && results.risk_factors.length > 0 && (
        <div className="glass rounded-2xl p-6 hover-lift">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            Risk Factors
          </h3>
          <div className="space-y-3">
            {results.risk_factors.slice(0, 5).map((rf, idx) => (
              <RiskFactor
                key={idx}
                risk={typeof rf === 'string' ? rf : rf.risk}
                severity={rf.severity || 'medium'}
                mitigation={rf.mitigation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Recommendations
          </h3>
          <div className="grid gap-4">
            {results.recommendations.slice(0, 5).map((rec, idx) => {
              // Parse markdown-style bold text (**text**)
              const parts = rec.split(/\*\*(.*?)\*\*/g);

              return (
                <div
                  key={idx}
                  className="glass rounded-xl p-5 hover-lift transition-all duration-300 border-l-4 border-amber-400/50"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-black text-sm flex items-center justify-center font-bold shadow-lg">
                      {idx + 1}
                    </span>
                    <div className="flex-1 text-gray-300 leading-relaxed">
                      {parts.map((part, i) =>
                        i % 2 === 0 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <strong key={i} className="text-white font-semibold">{part}</strong>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optimal Launch Window */}
      {results.optimal_launch_window && (
        <div className="glass rounded-2xl p-6 border-l-4 border-white hover-lift">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Optimal Launch Window
          </h3>
          <p className="text-gray-300">{results.optimal_launch_window}</p>
        </div>
      )}

      {/* Additional Metrics (Google Trends + Reddit) */}
      {results.additional_metrics && (
        <div className="mt-2">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-white" />
            Additional Market Intelligence
          </h2>

          {/* Google Trends */}
          {results.additional_metrics.google_trends && results.additional_metrics.google_trends.metrics && (
            <div className="glass rounded-2xl p-6 border-l-4 border-white/20 mb-4 hover-lift">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                📊 Google Trends Analysis
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Direction</div>
                  <div className={`text-xl font-bold ${results.additional_metrics.google_trends.metrics.direction === 'rising' ? 'text-white' :
                    results.additional_metrics.google_trends.metrics.direction === 'declining' ? 'text-gray-500' :
                      'text-gray-400'
                    }`}>
                    {results.additional_metrics.google_trends.metrics.direction === 'rising' && '📈 Rising'}
                    {results.additional_metrics.google_trends.metrics.direction === 'declining' && '📉 Declining'}
                    {results.additional_metrics.google_trends.metrics.direction === 'stable' && '➡️ Stable'}
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Search Interest</div>
                  <div className="text-xl font-bold text-white">
                    {results.additional_metrics.google_trends.metrics.current_value.toFixed(0)}/100
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Slope</div>
                  <div className={`text-xl font-bold ${results.additional_metrics.google_trends.metrics.slope > 0 ? 'text-white' : 'text-gray-500'
                    }`}>
                    {results.additional_metrics.google_trends.metrics.slope > 0 ? '+' : ''}{results.additional_metrics.google_trends.metrics.slope.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Peak Value</div>
                  <div className="text-xl font-bold text-white">
                    {results.additional_metrics.google_trends.metrics.peak_value.toFixed(0)}
                  </div>
                </div>
              </div>

              {results.additional_metrics.google_trends.risk_analysis && (
                <div className={`p-4 rounded-xl border-2 ${results.additional_metrics.google_trends.risk_analysis.risk_level === 'high' ? 'border-white/20 bg-white/5' :
                  results.additional_metrics.google_trends.risk_analysis.risk_level === 'medium' ? 'border-white/10 bg-white/[0.02]' :
                    'border-white/5 bg-white/[0.01]'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      Search Trend Risk: <span className="capitalize">{results.additional_metrics.google_trends.risk_analysis.risk_level}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-white">
                      Score: {results.additional_metrics.google_trends.risk_analysis.risk_score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{results.additional_metrics.google_trends.risk_analysis.recommendation}</p>
                  {results.additional_metrics.google_trends.risk_analysis.signals && results.additional_metrics.google_trends.risk_analysis.signals.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Signals: {results.additional_metrics.google_trends.risk_analysis.signals.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reddit */}
          {results.additional_metrics.reddit && results.additional_metrics.reddit.metrics && (
            <div className="glass rounded-2xl p-6 border-l-4 border-white/20 hover-lift">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-white" />
                💬 Reddit Community Analysis
              </h3>

              <div className="mb-4 text-sm text-gray-400">
                Scraped from old.reddit.com: {results.additional_metrics.reddit.subreddits_analyzed?.join(', ') || 'various subreddits'} • {results.additional_metrics.reddit.total_posts || 0} posts
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Avg Engagement</div>
                  <div className="text-xl font-bold text-white">
                    {results.additional_metrics.reddit.metrics.avg_engagement.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">upvotes + comments</div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Engagement Δ</div>
                  <div className={`text-xl font-bold ${results.additional_metrics.reddit.metrics.engagement_velocity > 0 ? 'text-white' : 'text-gray-500'
                    }`}>
                    {results.additional_metrics.reddit.metrics.engagement_velocity > 0 ? '+' : ''}{(results.additional_metrics.reddit.metrics.engagement_velocity * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Post Frequency Δ</div>
                  <div className={`text-xl font-bold ${results.additional_metrics.reddit.metrics.post_velocity > 0 ? 'text-white' : 'text-gray-500'
                    }`}>
                    {results.additional_metrics.reddit.metrics.post_velocity > 0 ? '+' : ''}{(results.additional_metrics.reddit.metrics.post_velocity * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <div className="text-sm text-gray-400 mb-1">Sentiment Shift</div>
                  <div className={`text-xl font-bold ${results.additional_metrics.reddit.metrics.sentiment_shift > 0 ? 'text-white' : 'text-gray-500'
                    }`}>
                    {results.additional_metrics.reddit.metrics.sentiment_shift > 0 ? '+' : ''}{results.additional_metrics.reddit.metrics.sentiment_shift.toFixed(2)}
                  </div>
                </div>
              </div>

              {results.additional_metrics.reddit.risk_analysis && (
                <div className={`p-4 rounded-xl border-2 ${results.additional_metrics.reddit.risk_analysis.risk_level === 'high' ? 'border-white/20 bg-white/5' :
                  results.additional_metrics.reddit.risk_analysis.risk_level === 'medium' ? 'border-white/10 bg-white/[0.02]' :
                    'border-white/5 bg-white/[0.01]'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      Community Risk: <span className="capitalize">{results.additional_metrics.reddit.risk_analysis.risk_level}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-white">
                      Score: {results.additional_metrics.reddit.risk_analysis.risk_score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{results.additional_metrics.reddit.risk_analysis.recommendation}</p>
                  {results.additional_metrics.reddit.risk_analysis.signals && results.additional_metrics.reddit.risk_analysis.signals.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Signals: {results.additional_metrics.reddit.risk_analysis.signals.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- TREND LIFECYCLE CHART ---
const STATE_COLORS = {
  Emerging: '#22d3ee',
  Growth: '#10b981',
  Peak: '#8b5cf6',
  Saturation: '#f59e0b',
  Decline: '#ef4444'
};

function TrendLifecycleChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fatigueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="date"
            stroke="#737373"
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => val ? val.slice(5, 10) : ''}
          />
          <YAxis stroke="#737373" tick={{ fontSize: 12 }} domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#ffffff'
            }}
            labelStyle={{ color: '#a3a3a3' }}
          />
          <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={2} fill="url(#velocityGradient)" name="Velocity" />
          <Area type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} fill="url(#fatigueGradient)" name="Fatigue" />
          <Area type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={2} fill="url(#retentionGradient)" name="Retention" />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- STATE DISTRIBUTION PIE CHART ---
function StateDistributionChart({ distribution }) {
  if (!distribution) return null;

  const data = Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    color: STATE_COLORS[name] || '#64748b'
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#737373' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#ffffff'
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

// --- TRENDS DASHBOARD COMPONENT ---
function TrendsDashboard() {
  const [trends, setTrends] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);

  // Load trends list on mount
  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await api.listTrends();
      setTrends(data.trends || []);
    } catch (err) {
      setError('Failed to load trends. Make sure the backend is running on port 8000.');
    } finally {
      setLoadingList(false);
    }
  };

  const analyzeTrend = async (trendName) => {
    setLoading(true);
    setError(null);
    setTrendAnalysis(null);
    try {
      const data = await api.analyzeTrend(trendName);
      setTrendAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelect = (trendName) => {
    setSelectedTrend(trendName);
    analyzeTrend(trendName);
  };

  return (
    <div className="space-y-8">
      {/* Header with Trend Selector */}
      <div className="glass rounded-2xl p-8 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Trend Analytics Dashboard</h2>
            <p className="text-gray-400">Select a meme or hashtag to analyze its lifecycle and get AI-powered insights</p>
          </div>
          <button
            onClick={loadTrends}
            disabled={loadingList}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover-lift border border-white/5"
            title="Refresh trends list"
          >
            <RefreshCw className={`w-5 h-5 text-gray-300 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Trend Selector Dropdown */}
        <div className="relative mb-6">
          <select
            value={selectedTrend || ''}
            onChange={(e) => handleTrendSelect(e.target.value)}
            className="w-full px-6 py-5 rounded-xl bg-[#141414] border-2 border-[#2a2a2a] focus:border-white/30 text-white text-lg font-medium appearance-none cursor-pointer transition-all hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">🔍 Select a Trend/Meme to Analyze...</option>
            {trends.map((trend, idx) => (
              <option key={idx} value={trend.trend_name}>
                {trend.trend_name} {trend.archetype ? `(${trend.archetype})` : ''} — {trend.data_points} days
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Quick Stats */}
        {trends.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-xl p-5 text-center border border-white/[0.08] hover-lift transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {trends.length}
                </div>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Trends</div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-5 text-center border border-red-500/20 hover-lift transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-red-400" />
                <div className="text-3xl font-bold text-red-300">
                  {trends.filter(t => t.archetype === 'viral_crash').length}
                </div>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Viral Crashes</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-5 text-center border border-amber-500/20 hover-lift transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div className="text-3xl font-bold text-amber-300">
                  {trends.filter(t => t.archetype === 'controversy_spike').length}
                </div>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Controversies</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-5 text-center border border-emerald-500/20 hover-lift transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <div className="text-3xl font-bold text-emerald-300">
                  {trends.reduce((sum, t) => sum + (t.data_points || 0), 0)}
                </div>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Data Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass rounded-2xl p-6 border-l-4 border-white/20">
          <h3 className="text-white font-semibold mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass rounded-2xl p-12 text-center pulse-glow">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Trend</h3>
          <p className="text-gray-400">Running HMM inference and investigating decline...</p>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && trendAnalysis && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lifecycle Chart */}
          <div className="glass rounded-2xl p-6 hover-lift">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-white" />
              Trend Lifecycle ({trendAnalysis.trend_name})
            </h3>
            <TrendLifecycleChart data={trendAnalysis.lifecycle_data} />
          </div>

          {/* State Distribution */}
          <div className="glass rounded-2xl p-6 hover-lift">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-white" />
              HMM State Distribution
            </h3>
            <StateDistributionChart distribution={trendAnalysis.state_distribution} />

            {/* State Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {Object.entries(STATE_COLORS).map(([state, color]) => (
                <div key={state} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-400">{state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decline Detection */}
          {trendAnalysis.decline_detected && trendAnalysis.decline_info && (
            <div className="glass rounded-2xl p-8 lg:col-span-2 border-l-4 border-red-500/50 hover-lift">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                    Decline Detected
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {trendAnalysis.decline_info.date}
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-medium border border-red-500/30">
                  Alert Active
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-xl p-5 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-400 uppercase tracking-wide">State</div>
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: STATE_COLORS[trendAnalysis.decline_info.state] }}>
                    {trendAnalysis.decline_info.state}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-5 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-400 uppercase tracking-wide">Velocity</div>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">
                    {(trendAnalysis.decline_info.metrics?.velocity * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-5 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-400 uppercase tracking-wide">Fatigue</div>
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-300">
                    {(trendAnalysis.decline_info.metrics?.fatigue * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* AI Metric Explanations - NEW */}
              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">AI Metric Analysis</h4>
                      <p className="text-sm text-gray-400">Detailed automated insights</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid gap-5">
                  {/* Velocity Analysis */}
                  <div className="glass rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-white text-lg">Velocity</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                        {(trendAnalysis.decline_info.metrics?.velocity || 0) > 0.6 ? 'Strong' :
                          (trendAnalysis.decline_info.metrics?.velocity || 0) > 0.3 ? 'Moderate' : 'Weak'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      Velocity measures the speed of trend adoption and growth. Current reading shows {
                        (trendAnalysis.decline_info.metrics?.velocity || 0) > 0.6 ? 'strong momentum' :
                          (trendAnalysis.decline_info.metrics?.velocity || 0) > 0.3 ? 'moderate pace' :
                            'declining interest'
                      }.
                    </p>
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        <strong className="text-gray-300">Cause:</strong> {
                          (trendAnalysis.decline_info.metrics?.velocity || 0) < 0.3
                            ? 'Reduced new user adoption and decreased content creation'
                            : 'Active community engagement and content virality'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Fatigue Analysis */}
                  <div className="glass rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-white text-lg">Fatigue</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                        {(trendAnalysis.decline_info.metrics?.fatigue || 0) < 0.4 ? 'Low' :
                          (trendAnalysis.decline_info.metrics?.fatigue || 0) < 0.7 ? 'Moderate' : 'High'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      Fatigue indicates audience saturation and repetition aversion. {
                        (trendAnalysis.decline_info.metrics?.fatigue || 0) > 0.7 ? 'High fatigue suggests content oversaturation' :
                          (trendAnalysis.decline_info.metrics?.fatigue || 0) > 0.4 ? 'Moderate fatigue indicates need for fresh content' :
                            'Low fatigue means audience is still engaged'
                      }.
                    </p>
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <p className="text-xs text-gray-400">
                        <strong className="text-gray-300">Cause:</strong> {
                          (trendAnalysis.decline_info.metrics?.fatigue || 0) > 0.7
                            ? 'Oversaturation of similar content, declining novelty, repetitive messaging'
                            : 'Content remains fresh and engaging with audience'
                        }
                      </p>
                      {(trendAnalysis.decline_info.metrics?.fatigue || 0) > 0.6 && (
                        <p className="text-xs text-white bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                          <strong>Action:</strong> Introduce new creative angles, collaborate with fresh creators, or pivot messaging
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Retention Analysis */}
                  <div className="glass rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-white text-lg">Retention</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                        {(trendAnalysis.decline_info.metrics?.retention || 0) > 0.7 ? 'Strong' :
                          (trendAnalysis.decline_info.metrics?.retention || 0) > 0.4 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      Retention tracks how well the trend keeps audience attention. {
                        (trendAnalysis.decline_info.metrics?.retention || 0) > 0.7 ? 'Strong retention indicates loyal community' :
                          (trendAnalysis.decline_info.metrics?.retention || 0) > 0.4 ? 'Fair retention with room for improvement' :
                            'Poor retention suggests audience drop-off'
                      }.
                    </p>
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        <strong className="text-gray-300">Cause:</strong> {
                          (trendAnalysis.decline_info.metrics?.retention || 0) < 0.4
                            ? 'Weak community bonds, lack of ongoing value, or competing trends'
                            : 'Strong community engagement and consistent value delivery'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Causal Chain */}
                <div className="glass rounded-xl p-6 hover-lift">
                  <h5 className="text-base font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    Causal Chain Analysis
                  </h5>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {trendAnalysis.decline_info.state === 'Decline' ? (
                      <>
                        The trend entered decline due to a combination of factors:
                        <strong className="text-white"> decreased velocity</strong> ({((trendAnalysis.decline_info.metrics?.velocity || 0) * 100).toFixed(0)}%)
                        reduced new user adoption →
                        <strong className="text-white"> increased fatigue</strong> ({((trendAnalysis.decline_info.metrics?.fatigue || 0) * 100).toFixed(0)}%)
                        from content oversaturation →
                        <strong className="text-white"> dropping retention</strong> ({((trendAnalysis.decline_info.metrics?.retention || 0) * 100).toFixed(0)}%)
                        as audience attention shifted to newer trends. This cascade effect is typical of {trendAnalysis.decline_info.archetype || 'standard'} patterns.
                      </>
                    ) : (
                      <>
                        The trend shows signs of maturation with
                        <strong className="text-white"> velocity</strong> at {((trendAnalysis.decline_info.metrics?.velocity || 0) * 100).toFixed(0)}% and
                        <strong className="text-white"> fatigue</strong> building to {((trendAnalysis.decline_info.metrics?.fatigue || 0) * 100).toFixed(0)}%.
                        Market saturation is approaching. Early intervention can prevent full decline.
                      </>
                    )}
                  </p>
                </div>

                {/* Recovery Actions */}
                {(trendAnalysis.decline_info.metrics?.velocity || 0) < 0.5 && (
                  <div className="glass rounded-xl p-6 border-l-4 border-white/30 hover-lift">
                    <h5 className="text-base font-semibold text-white mb-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      Recovery Actions
                    </h5>
                    <ul className="space-y-3">
                      <li className="text-sm text-gray-300 flex items-start gap-3 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                        Inject fresh creative angles - partner with new influencers or creators
                      </li>
                      <li className="text-sm text-gray-300 flex items-start gap-3 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                        Launch limited-time campaigns to create urgency and re-engage audience
                      </li>
                      <li className="text-sm text-gray-300 flex items-start gap-3 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                        Pivot messaging to address current audience interests and pain points
                      </li>
                      <li className="text-sm text-gray-300 flex items-start gap-3 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                        Reduce posting frequency to combat fatigue while maintaining quality
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Original AI Explanation */}
              {trendAnalysis.decline_info.investigation?.explanation && (
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Analysis
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {typeof trendAnalysis.decline_info.investigation.explanation === 'string'
                      ? trendAnalysis.decline_info.investigation.explanation.slice(0, 500)
                      : 'Analysis complete'}
                    ...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Decline Message */}
          {trendAnalysis && !trendAnalysis.decline_detected && (
            <div className="glass rounded-2xl p-6 lg:col-span-2 border-l-4 border-white/20 hover-lift">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                ✅ No Decline Detected - Trend is Healthy!
              </h3>
              <p className="text-gray-400 mt-2">This trend is still in a growth or peak phase.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !trendAnalysis && !error && (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Trend to Analyze</h3>
          <p className="text-gray-500">Choose a meme or hashtag from the dropdown above to see its lifecycle analysis</p>
        </div>
      )}
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('campaign');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCampaignSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await api.analyzeCampaign(data);
      setResults(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 bg-[#0a0a0a]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-gray-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TrendGuard</h1>
              <p className="text-xs text-gray-500">AI Campaign Advisor v4.0</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('campaign')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'campaign'
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Rocket className="w-4 h-4 inline mr-2" />
              Campaign Advisor
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'trends'
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Trend Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'campaign' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Sticky Form Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="glass rounded-2xl p-8 hover-lift">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Pre-Launch Campaign Analysis</h2>
                  <p className="text-gray-400">Get AI-powered predictions before you launch. Our system uses real-time market data to forecast success.</p>
                </div>
                <CampaignForm onSubmit={handleCampaignSubmit} loading={loading} />
              </div>
            </div>

            {/* Right: Scrollable Results */}
            <div>
              {error && (
                <div className="glass rounded-2xl p-6 border-l-4 border-white/20 mb-6">
                  <h3 className="text-white font-semibold mb-2">Analysis Error</h3>
                  <p className="text-gray-300">{error}</p>
                </div>
              )}

              {loading && (
                <div className="glass rounded-2xl p-12 text-center pulse-glow">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analyzing Campaign</h3>
                  <p className="text-gray-400">Searching real-time market data with Google...</p>
                </div>
              )}

              {!loading && results && <AnalysisResults results={results} />}

              {!loading && !results && !error && (
                <div className="glass rounded-2xl p-12 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze</h3>
                  <p className="text-gray-400">Fill out the form and submit to get AI-powered insights</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && <TrendsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          TrendGuard v4.0 — Powered by Gemini AI with Google Search Grounding • Premium Black/White Edition
        </div>
      </footer>
    </div>
  );
}

export default App;
