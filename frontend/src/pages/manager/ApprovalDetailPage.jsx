import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getApproval, decideApproval } from '../../api/approvalApi';
import { useBooking } from '../../hooks/useBookings';
import { useResource } from '../../hooks/useResources';
import { formatISTDateTime, formatISTTime } from '../../utils/time';
import { ArrowLeft } from 'lucide-react';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const approvalId = parseInt(id, 10);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const { data: approval, isLoading: approvalLoading } = useQuery({
    queryKey: ['approvals', approvalId],
    queryFn: () => getApproval(approvalId).then((r) => r.data),
    enabled: Number.isFinite(approvalId)
  });
  const { data: booking, isLoading: bookingLoading } = useBooking(approval?.booking_id);
  const { data: resource } = useResource(booking?.resource_id);

  const decide = useMutation({
    mutationFn: ({ decision }) => decideApproval(approvalId, { decision, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['booking', approval?.booking_id] });
      qc.invalidateQueries({ queryKey: ['audit', approval?.booking_id] });
      navigate('/manager/approvals');
    },
    onError: (err) => setError(err)
  });

  if (approvalLoading || bookingLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!approval || !booking) return null;

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 max-w-3xl mx-auto pb-12">
      <button 
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors mb-6 self-start" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back to Queue
      </button>

      <div className="card space-y-6 pt-6 pb-8 px-6 sm:px-8 bg-white/80 border border-surface-200 shadow-soft mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-100 pb-5">
          <div>
            <h2 className="text-2xl font-display font-bold text-surface-900">Request #{booking.id}</h2>
            <p className="text-surface-500 font-medium mt-1">Submitted {formatISTDateTime(approval.created_at)}</p>
          </div>
          <span className="badge bg-amber-100 text-amber-800 border bg-amber-200 mt-1 sm:mt-0 font-semibold shadow-sm">
            Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 sm:col-span-2 lg:col-span-3">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Purpose</p>
            <p className="font-semibold text-surface-900 text-lg leading-snug">{booking.purpose}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Start Time</p>
            <p className="font-semibold text-surface-900">{formatISTDateTime(booking.start_time, false)}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">End Time</p>
            <p className="font-semibold text-surface-900">{formatISTTime(booking.end_time)}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Attendees</p>
            <p className="font-semibold text-surface-900">{booking.attendees} People</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 lg:col-span-1">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Requester</p>
            <p className="font-semibold text-surface-900 text-base">{approval.user_name || `User #${booking.user_id}`}</p>
            <p className="text-primary-600 text-[10px] font-bold uppercase tracking-widest mt-1">Direct Employee</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 lg:col-span-2">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Resource</p>
            <p className="font-semibold text-surface-900 text-base">{approval.resource_name || resource?.name || `#${booking.resource_id}`}</p>
            <p className="text-surface-500 text-xs font-medium mt-1">{resource?.location || 'Location Not Available'}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-5 bg-white border border-surface-200 shadow-soft p-6 sm:p-8">
        <div>
          <h3 className="font-bold text-surface-900 text-lg">Your Decision</h3>
          <p className="text-sm text-surface-500 mt-1">Provide a required comment if rejecting.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="input-approval-comment">Decision Comment</label>
          <textarea
            id="input-approval-comment"
            className="input resize-none bg-surface-50 border border-surface-200 text-surface-900 rounded-xl focus:bg-white placeholder:text-surface-400"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a decision note for the requester..."
          />
        </div>

        <ErrorMessage error={error} />
        
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            id="btn-approve"
            className="btn-primary sm:flex-1 py-3 text-base shadow-md hover:shadow-lg transition-all"
            disabled={decide.isPending}
            onClick={() => decide.mutate({ decision: 'approved' })}
          >
            {decide.isPending ? 'Processing...' : 'Approve Request'}
          </button>
          <button
            id="btn-reject"
            className="rounded-full border border-rose-200 bg-rose-50 text-rose-600 font-semibold px-6 py-3 sm:flex-1 hover:bg-rose-100 transition-colors"
            disabled={decide.isPending || !comment.trim()}
            onClick={() => decide.mutate({ decision: 'rejected' })}
          >
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
}
