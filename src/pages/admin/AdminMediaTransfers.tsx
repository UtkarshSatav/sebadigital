import { useEffect, useState } from 'react';
import { Film, Disc, Send, Package, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import {
    getAllMediaTransferJobs,
    sendQuote,
    markMediaReceived,
    startTransfer,
    completeTransfer,
    markReturned,
    SUPPORTED_VIDEO_FORMATS,
    SUPPORTED_AUDIO_FORMATS,
    type MediaTransferJob,
    type MediaTransferStatus,
} from '../../services/mediaTransferService';
import { toast } from 'sonner';

const STATUS_LABELS: Record<MediaTransferStatus, string> = {
    quote_requested: 'Quote Requested',
    quote_sent: 'Quote Sent',
    customer_confirmed: 'Confirmed',
    media_received: 'Media Received',
    in_transfer: 'In Transfer',
    completed: 'Completed',
    invoiced: 'Invoiced',
    returned: 'Returned',
};

const STATUS_COLORS: Record<MediaTransferStatus, string> = {
    quote_requested: 'bg-yellow-100 text-yellow-700',
    quote_sent: 'bg-blue-100 text-blue-700',
    customer_confirmed: 'bg-indigo-100 text-indigo-700',
    media_received: 'bg-orange-100 text-orange-700',
    in_transfer: 'bg-purple-100 text-purple-700',
    completed: 'bg-teal-100 text-teal-700',
    invoiced: 'bg-emerald-100 text-emerald-700',
    returned: 'bg-gray-100 text-gray-600',
};

export function AdminMediaTransfers() {
    const [jobs, setJobs] = useState<MediaTransferJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [quoteInput, setQuoteInput] = useState<Record<string, string>>({});
    const [trackInput, setTrackInput] = useState<Record<string, string>>({});

    useEffect(() => { loadJobs(); }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setJobs(await getAllMediaTransferJobs());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const doAction = async (jobId: string, fn: () => Promise<void>) => {
        setActing(jobId);
        try { await fn(); toast.success('Job updated'); loadJobs(); }
        catch (e: any) { toast.error('Failed', { description: e.message }); }
        finally { setActing(null); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Media Transfer Jobs</h1>
                <p className="text-gray-500 text-sm mt-1">VHS to DVD, Audio Cassette to CD, and more</p>
            </div>

            {/* Supported Formats */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3"><Film className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Video Formats</h3></div>
                    <div className="flex flex-wrap gap-2">
                        {SUPPORTED_VIDEO_FORMATS.map(f => <span key={f} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{f}</span>)}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3"><Disc className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-900">Audio Formats</h3></div>
                    <div className="flex flex-wrap gap-2">
                        {SUPPORTED_AUDIO_FORMATS.map(f => <span key={f} className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-medium">{f}</span>)}
                    </div>
                </div>
            </div>

            {/* Workflow Steps */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {Object.values(STATUS_LABELS).map((step, i, arr) => (
                        <div key={step} className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">{step}</span>
                            {i < arr.length - 1 && <span className="text-gray-300">→</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">All Jobs ({jobs.length})</h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Jobs Yet</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Media transfer jobs submitted by customers will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {jobs.map(job => (
                            <div key={job.id} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-semibold text-gray-900">{job.customerName}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>
                                                {STATUS_LABELS[job.status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{job.customerEmail} · {job.tapeCount} tape(s) · {job.tapes?.map(t => t.format).join(', ')}</p>
                                        {job.quotedPrice && <p className="text-sm font-semibold text-blue-600 mt-1">Quoted: £{job.quotedPrice.toFixed(2)}</p>}
                                    </div>

                                    {/* Action Buttons per step */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {job.status === 'quote_requested' && (
                                            <div className="flex gap-2 items-center">
                                                <input type="number" placeholder="£ price" value={quoteInput[job.id!] || ''}
                                                    onChange={e => setQuoteInput(p => ({ ...p, [job.id!]: e.target.value }))}
                                                    className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                                                <button onClick={() => doAction(job.id!, () => sendQuote(job.id!, parseFloat(quoteInput[job.id!] || '0')))}
                                                    disabled={acting === job.id || !quoteInput[job.id!]}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                    <Send className="w-3 h-3" /> Send Quote
                                                </button>
                                            </div>
                                        )}
                                        {job.status === 'customer_confirmed' && (
                                            <button onClick={() => doAction(job.id!, () => markMediaReceived(job.id!))}
                                                disabled={acting === job.id}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                <Package className="w-3 h-3" /> Media Received
                                            </button>
                                        )}
                                        {job.status === 'media_received' && (
                                            <button onClick={() => doAction(job.id!, () => startTransfer(job.id!))}
                                                disabled={acting === job.id}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                <Play className="w-3 h-3" /> Start Transfer
                                            </button>
                                        )}
                                        {job.status === 'in_transfer' && (
                                            <button onClick={() => doAction(job.id!, () => completeTransfer(job.id!))}
                                                disabled={acting === job.id}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                <CheckCircle2 className="w-3 h-3" /> Complete Transfer
                                            </button>
                                        )}
                                        {job.status === 'invoiced' && (
                                            <div className="flex gap-2 items-center">
                                                <input type="text" placeholder="Tracking #" value={trackInput[job.id!] || ''}
                                                    onChange={e => setTrackInput(p => ({ ...p, [job.id!]: e.target.value }))}
                                                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                                                <button onClick={() => doAction(job.id!, () => markReturned(job.id!, trackInput[job.id!] || ''))}
                                                    disabled={acting === job.id || !trackInput[job.id!]}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg font-medium disabled:opacity-50">
                                                    <RotateCcw className="w-3 h-3" /> Mark Returned
                                                </button>
                                            </div>
                                        )}
                                        {job.status === 'returned' && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Complete</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
