import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { StatusBadge } from '../components/StatusBadge';
import { CampaignCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';

const STATUS_FILTERS = ['all', 'draft', 'scheduled', 'sending', 'sent'] as const;

export function CampaignsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', statusFilter, page],
    queryFn: () => campaignsApi.list({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: 10,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return (
    <div className="page">
      <header className="page-header">
        <h1>Campaigns</h1>
        <div className="header-actions">
          <span className="user-name">{user?.name}</span>
          <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
          <Link to="/campaigns/new" className="btn btn-primary">+ New Campaign</Link>
        </div>
      </header>

      {/* status filter tabs */}
      <div className="filter-tabs">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">Failed to load campaigns</div>}

      <div className="campaign-list">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CampaignCardSkeleton key={i} />)
          : data?.data.map(campaign => (
            <div key={campaign.id} className="campaign-card" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
              <div className="campaign-card-header">
                <h3 className="campaign-name">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
              </div>
              <p className="campaign-subject">{campaign.subject}</p>
              <div className="campaign-meta">
                <span>{Number(campaign.total_recipients ?? 0)} recipients</span>
                <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
              </div>
              {campaign.status === 'draft' && (
                <button
                  className="btn btn-ghost btn-sm delete-btn"
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm('Delete this campaign?')) deleteMutation.mutate(campaign.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        }
        {!isLoading && data?.data.length === 0 && (
          <div className="empty-state">
            <p>No campaigns yet.</p>
            <Link to="/campaigns/new" className="btn btn-primary">Create your first campaign</Link>
          </div>
        )}
      </div>

      {/* pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {data.meta.totalPages}</span>
          <button className="btn btn-ghost" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
