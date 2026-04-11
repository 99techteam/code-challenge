import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';

export function NewCampaignPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName]           = useState('');
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientError, setRecipientError] = useState('');

  const mutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      navigate(`/campaigns/${campaign.id}`);
    },
  });

  function addRecipient() {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRecipientError('invalid email address');
      return;
    }
    if (recipients.includes(email)) {
      setRecipientError('already added');
      return;
    }
    setRecipients(r => [...r, email]);
    setRecipientInput('');
    setRecipientError('');
  }

  function removeRecipient(email: string) {
    setRecipients(r => r.filter(e => e !== email));
  }

  function handleRecipientKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (recipients.length === 0) {
      setRecipientError('add at least one recipient');
      return;
    }
    mutation.mutate({ name, subject, body, recipients });
  }

  const apiError = (mutation.error as { response?: { data?: { error?: string; details?: { message: string }[] } } } | null)
    ?.response?.data;

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <Link to="/campaigns" className="back-link">← Campaigns</Link>
        <h1>New Campaign</h1>
      </header>

      {apiError && (
        <div className="alert alert-error">
          {apiError.error}
          {apiError.details?.map((d, i) => <div key={i} className="error-detail">{d.message}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="name">Campaign Name</label>
          <input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Welcome Series" />
        </div>

        <div className="field">
          <label htmlFor="subject">Email Subject</label>
          <input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. Welcome to our platform!" />
        </div>

        <div className="field">
          <label htmlFor="body">Email Body</label>
          <textarea id="body" value={body} onChange={e => setBody(e.target.value)} required rows={8} placeholder="Write your email content here…" />
        </div>

        <div className="field">
          <label htmlFor="recipient-input">Recipients</label>
          <div className="recipient-input-row">
            <input
              id="recipient-input"
              type="email"
              value={recipientInput}
              onChange={e => { setRecipientInput(e.target.value); setRecipientError(''); }}
              onKeyDown={handleRecipientKeyDown}
              placeholder="email@example.com"
            />
            <button type="button" className="btn btn-secondary" onClick={addRecipient}>Add</button>
          </div>
          {recipientError && <span className="field-error">{recipientError}</span>}
          <p className="field-hint">Press Enter or comma to add multiple</p>

          {recipients.length > 0 && (
            <div className="recipient-tags">
              {recipients.map(email => (
                <span key={email} className="recipient-tag">
                  {email}
                  <button type="button" onClick={() => removeRecipient(email)} aria-label={`remove ${email}`}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link to="/campaigns" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
