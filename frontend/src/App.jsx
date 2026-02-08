import { useState, useEffect } from 'react';
import { Rocket, TrendingUp, TrendingDown, Search, BarChart3, Zap, Shield, AlertTriangle, CheckCircle, Activity, PieChart, RefreshCw, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import api from './api/client';
import './index.css';

// --- CAMPAIGN FORM COMPONENT ---
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      hashtags: formData.hashtags.split(',').map(h => h.trim()).filter(h => h)
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Topic *</label>
        <input
          type="text"
          required
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="e.g., Summer Fashion Collection 2025"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Hashtags (comma-separated) *</label>
        <input
          type="text"
          required
          value={formData.hashtags}
          onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
          placeholder="#SummerVibes, #OOTD, #Fashion2025"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Platform & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Platform *</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 text-white transition-all"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="twitter">X (Twitter)</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Duration (days)</label>
          <input
            type="number"
            min="7"
            max="365"
            value={formData.planned_duration_days}
            onChange={(e) => setFormData({ ...formData, planned_duration_days: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 text-white transition-all"
          />
        </div>
      </div>

      {/* Campaign Aim */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Aim *</label>
        <input
          type="text"
          required
          value={formData.campaign_aim}
          onChange={(e) => setFormData({ ...formData, campaign_aim: e.target.value })}
          placeholder="e.g., Increase brand awareness, drive product sales"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience *</label>
        <input
          type="text"
          required
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          placeholder="e.g., 18-25 females interested in fashion"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all"
        />
      </div>

      {/* Additional Context */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context</label>
        <textarea
          value={formData.additional_context}
          onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
          placeholder="Any other relevant information about your campaign..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Analyze Campaign
          </>
        )}
      </button>
    </form>
  );
}

// --- VIABILITY SCORE COMPONENT ---
function ViabilityScore({ score }) {
  const getColor = () => {
    if (score >= 70) return 'from-emerald-500 to-teal-500';
    if (score >= 40) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getLabel = () => {
    if (score >= 70) return 'High Potential';
    if (score >= 40) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className={`text-6xl font-bold bg-gradient-to-r ${getColor()} bg-clip-text text-transparent`}>
          {score}
        </div>
        <div className="text-slate-400 text-sm uppercase tracking-wider mt-1">{getLabel()}</div>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// --- RISK FACTOR COMPONENT ---
function RiskFactor({ risk, severity, mitigation }) {
  const severityStyles = {
    high: 'risk-high',
    medium: 'risk-medium',
    low: 'risk-low'
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-white">{risk}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityStyles[severity] || severityStyles.medium}`}>
          {severity}
        </span>
      </div>
      {mitigation && (
        <p className="text-sm text-slate-400 mt-2">{mitigation}</p>
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
      <div className="glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Campaign Viability Score</h3>
        <ViabilityScore score={results.viability_score || 50} />
      </div>

      {/* Summary */}
      {results.summary && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Executive Summary
          </h3>
          <p className="text-slate-300 leading-relaxed">{results.summary}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{results.predicted_lifecycle_days || '—'}</div>
          <div className="text-sm text-slate-400">Predicted Days</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400 capitalize">{results.market_status || '—'}</div>
          <div className="text-sm text-slate-400">Market Status</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 capitalize">
            {results.competitive_analysis?.market_saturation || '—'}
          </div>
          <div className="text-sm text-slate-400">Saturation</div>
        </div>
      </div>

      {/* Risk Factors */}
      {results.risk_factors && results.risk_factors.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
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
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {results.recommendations.slice(0, 5).map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimal Launch Window */}
      {results.optimal_launch_window && (
        <div className="glass rounded-2xl p-6 border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold text-white mb-2">🚀 Optimal Launch Window</h3>
          <p className="text-slate-300">{results.optimal_launch_window}</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => val ? val.slice(5, 10) : ''}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#f8fafc'
            }}
            labelStyle={{ color: '#94a3b8' }}
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
            labelLine={{ stroke: '#64748b' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#f8fafc'
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
    <div className="space-y-6">
      {/* Header with Trend Selector */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Trend Analytics Dashboard</h2>
            <p className="text-slate-400 mt-1">Select a meme or hashtag to analyze its lifecycle</p>
          </div>
          <button
            onClick={loadTrends}
            disabled={loadingList}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Trend Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedTrend || ''}
            onChange={(e) => handleTrendSelect(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-indigo-500 text-white text-lg font-medium appearance-none cursor-pointer transition-all hover:bg-slate-700/80"
          >
            <option value="">🔍 Select a Trend/Meme to Analyze...</option>
            {trends.map((trend, idx) => (
              <option key={idx} value={trend.trend_name}>
                {trend.trend_name} {trend.archetype ? `(${trend.archetype})` : ''} — {trend.data_points} days
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>

        {/* Quick Stats */}
        {trends.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-400">{trends.length}</div>
              <div className="text-sm text-slate-400">Total Trends</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {trends.filter(t => t.archetype === 'viral_crash').length}
              </div>
              <div className="text-sm text-slate-400">Viral Crashes</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">
                {trends.filter(t => t.archetype === 'controversy_spike').length}
              </div>
              <div className="text-sm text-slate-400">Controversies</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {trends.reduce((sum, t) => sum + (t.data_points || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Total Data Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass rounded-2xl p-6 border-l-4 border-red-500">
          <h3 className="text-red-400 font-semibold mb-2">Error</h3>
          <p className="text-slate-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass rounded-2xl p-12 text-center pulse-glow">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Trend</h3>
          <p className="text-slate-400">Running HMM inference and investigating decline...</p>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && trendAnalysis && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lifecycle Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Trend Lifecycle ({trendAnalysis.trend_name})
            </h3>
            <TrendLifecycleChart data={trendAnalysis.lifecycle_data} />
          </div>

          {/* State Distribution */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              HMM State Distribution
            </h3>
            <StateDistributionChart distribution={trendAnalysis.state_distribution} />

            {/* State Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {Object.entries(STATE_COLORS).map(([state, color]) => (
                <div key={state} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-slate-400">{state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decline Detection */}
          {trendAnalysis.decline_detected && trendAnalysis.decline_info && (
            <div className="glass rounded-2xl p-6 lg:col-span-2 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                ⚠️ Decline Detected on {trendAnalysis.decline_info.date}
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">State</div>
                  <div className="text-xl font-bold" style={{ color: STATE_COLORS[trendAnalysis.decline_info.state] }}>
                    {trendAnalysis.decline_info.state}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Velocity</div>
                  <div className="text-xl font-bold text-indigo-400">
                    {(trendAnalysis.decline_info.metrics?.velocity * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Fatigue</div>
                  <div className="text-xl font-bold text-amber-400">
                    {(trendAnalysis.decline_info.metrics?.fatigue * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              {trendAnalysis.decline_info.investigation?.explanation && (
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">AI Analysis</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
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
            <div className="glass rounded-2xl p-6 lg:col-span-2 border-l-4 border-emerald-500">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                ✅ No Decline Detected - Trend is Healthy!
              </h3>
              <p className="text-slate-400 mt-2">This trend is still in a growth or peak phase.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !trendAnalysis && !error && (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Select a Trend to Analyze</h3>
          <p className="text-slate-500">Choose a meme or hashtag from the dropdown above to see its lifecycle analysis</p>
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">TrendGuard</h1>
              <p className="text-xs text-slate-500">AI Campaign Advisor</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('campaign')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'campaign'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Rocket className="w-4 h-4 inline mr-2" />
              Campaign Advisor
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'trends'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="glass rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pre-Launch Campaign Analysis</h2>
                <p className="text-slate-400">Get AI-powered predictions before you launch. Our system uses real-time market data to forecast success.</p>
              </div>
              <CampaignForm onSubmit={handleCampaignSubmit} loading={loading} />
            </div>

            {/* Right: Results */}
            <div>
              {error && (
                <div className="glass rounded-2xl p-6 border-l-4 border-red-500 mb-6">
                  <h3 className="text-red-400 font-semibold mb-2">Analysis Error</h3>
                  <p className="text-slate-300">{error}</p>
                </div>
              )}

              {loading && (
                <div className="glass rounded-2xl p-12 text-center pulse-glow">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analyzing Campaign</h3>
                  <p className="text-slate-400">Searching real-time market data with Google...</p>
                </div>
              )}

              {!loading && results && <AnalysisResults results={results} />}

              {!loading && !results && !error && (
                <div className="glass rounded-2xl p-12 text-center">
                  <Search className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-500">Fill out the campaign form to get AI-powered predictions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && <TrendsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-500 text-sm">
          TrendGuard v3.0 — Powered by Gemini AI with Google Search Grounding
        </div>
      </footer>
    </div>
  );
}

export default App;
