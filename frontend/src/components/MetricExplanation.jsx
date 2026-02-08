import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, Info, AlertCircle } from 'lucide-react';

/**
 * MetricExplanation Component
 * Shows metric changes with AI-powered insights
 */
export function MetricExplanation({
    metric,
    current,
    previous,
    aiInsight,
    contributingFactors = [],
    trend = 'neutral'
}) {
    const change = current - previous;
    const percentChange = previous !== 0 ? ((change / previous) * 100).toFixed(1) : 0;
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    const getTrendIcon = () => {
        if (isIncrease) return <TrendingUp className="w-4 h-4 text-white" />;
        if (isDecrease) return <TrendingDown className="w-4 h-4 text-white" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (trend === 'positive' && isIncrease) return 'text-white';
        if (trend === 'positive' && isDecrease) return 'text-gray-500';
        if (trend === 'negative' && isDecrease) return 'text-white';
        if (trend === 'negative' && isIncrease) return 'text-gray-500';
        return 'text-gray-400';
    };

    return (
        <div className="metric-explanation space-y-4">
            {/* Metric Comparison */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <div className="flex items-center gap-3">
                    {getTrendIcon()}
                    <div>
                        <div className="text-sm text-gray-400">{metric}</div>
                        <div className="text-2xl font-bold text-white">{current.toFixed(2)}</div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500">Previous</div>
                    <div className="text-sm text-gray-400">{previous.toFixed(2)}</div>
                    <div className={`text-sm font-medium ${getTrendColor()}`}>
                        {change > 0 ? '+' : ''}{percentChange}%
                    </div>
                </div>
            </div>

            {/* AI Insight */}
            {aiInsight && (
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-white mb-1">AI Analysis</div>
                            <p className="text-sm text-gray-400 leading-relaxed">{aiInsight}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Contributing Factors */}
            {contributingFactors.length > 0 && (
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white mb-2">Why This Changed</div>
                            <ul className="space-y-2">
                                {contributingFactors.map((factor, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                        <span className="text-gray-600">•</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * MetricCard Component
 * Displays a metric with optional explanation
 */
export function MetricCard({
    title,
    value,
    previous,
    icon: Icon,
    explanation,
    aiInsight,
    factors = [],
    trend = 'neutral',
    expandable = true
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="metric-card">
            <div
                className={`flex items-center justify-between ${expandable ? 'cursor-pointer' : ''}`}
                onClick={() => expandable && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                    <div>
                        <div className="metric-label">{title}</div>
                        <div className="metric-value">{value}</div>
                        {explanation && (
                            <div className="text-xs text-gray-500 mt-1">{explanation}</div>
                        )}
                    </div>
                </div>

                {expandable && (
                    <AlertCircle className={`w-5 h-5 transition-all ${isExpanded ? 'rotate-180 text-white' : 'text-gray-600'}`} />
                )}
            </div>

            {/* Expanded View */}
            {isExpanded && previous !== undefined && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <MetricExplanation
                        metric={title}
                        current={value}
                        previous={previous}
                        aiInsight={aiInsight}
                        contributingFactors={factors}
                        trend={trend}
                    />
                </div>
            )}
        </div>
    );
}

export default MetricExplanation;
