import React, { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Archive,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ExternalLink,
  Clock,
  Zap,
  Check
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { googleSignIn, googleLogout, initAuth, getAccessToken } from '../services/firebaseAuth';
import { fetchRecentEmails, archiveGmailMessage, sendGmailEmail, GmailEmail } from '../services/gmailService';
import { GTDTask } from './OmnipresentInboxSection';
import { audioEngine } from '../utils/audioEngine';

interface GmailInboxSectionProps {
  onAddTasks: (tasks: GTDTask[]) => void;
}

export const GmailInboxSection: React.FC<GmailInboxSectionProps> = ({ onAddTasks }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Destructive / Mutating Operation Confirmation Modal states
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [confirmArchiveSubject, setConfirmArchiveSubject] = useState<string>('');

  // Quick Compose Modal state
  const [replyEmail, setReplyEmail] = useState<GmailEmail | null>(null);
  const [replyBody, setReplyBody] = useState<string>('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Triaging state
  const [triagingId, setTriagingId] = useState<string | null>(null);

  useEffect(() => {
    initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        loadEmails();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setCurrentUser(null);
    setAccessToken(null);
    setEmails([]);
  };

  const loadEmails = async () => {
    setIsLoadingEmails(true);
    setErrorMsg(null);
    try {
      const list = await fetchRecentEmails(8);
      setEmails(list);
    } catch (err: any) {
      console.warn('Gmail fetch notice:', err);
      setErrorMsg(err.message || 'Could not fetch emails. Please verify Google permissions.');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Convert email to GTD Next Physical Action via Gemini
  const handleTriageEmail = async (email: GmailEmail) => {
    setTriagingId(email.id);
    setErrorMsg(null);
    try {
      const dumpText = `Email Subject: ${email.subject}\nFrom: ${email.from}\nSnippet: ${email.snippet}`;
      const res = await fetch('/api/parse-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dumpText }),
      });

      const data = await res.json();
      const parsedTasks: GTDTask[] = data.tasks || [];

      if (parsedTasks.length > 0) {
        onAddTasks(parsedTasks);
        audioEngine.playTaskCompletionChime();
        setSuccessMsg(`Extracted ${parsedTasks.length} GTD Next Action(s) from "${email.subject.slice(0, 30)}..."`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to triage email: ' + err.message);
    } finally {
      setTriagingId(null);
    }
  };

  // Archive Email with Mandatory User Confirmation
  const promptArchive = (email: GmailEmail) => {
    setConfirmArchiveId(email.id);
    setConfirmArchiveSubject(email.subject);
  };

  const executeArchive = async () => {
    if (!confirmArchiveId) return;
    try {
      await archiveGmailMessage(confirmArchiveId);
      setEmails((prev) => prev.filter((e) => e.id !== confirmArchiveId));
      audioEngine.playTaskCompletionChime();
      setSuccessMsg('Email archived from inbox.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Archive failed: ' + err.message);
    } finally {
      setConfirmArchiveId(null);
      setConfirmArchiveSubject('');
    }
  };

  // Quick Reply with Mandatory User Confirmation
  const openReplyModal = (email: GmailEmail) => {
    setReplyEmail(email);
    setReplyBody(`Hi,\n\nThanks for reaching out. `);
    setConfirmSendOpen(false);
  };

  const executeSendReply = async () => {
    if (!replyEmail) return;
    setIsSending(true);
    try {
      const recipient = replyEmail.from.match(/<([^>]+)>/)?.[1] || replyEmail.from;
      const subject = replyEmail.subject.startsWith('Re:')
        ? replyEmail.subject
        : `Re: ${replyEmail.subject}`;

      await sendGmailEmail(recipient, subject, replyBody);
      audioEngine.playSprintDoneCelebration();
      setSuccessMsg(`Quick 2-minute reply sent to ${recipient}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setReplyEmail(null);
      setConfirmSendOpen(false);
    } catch (err: any) {
      setErrorMsg('Failed to send email: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
              WORKSPACE INTEGRATION
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-400" />
              Gmail Zero-Inbox Triage
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Connect your Gmail account. Read incoming inbox emails, convert ambiguous threads into concrete GTD Next Physical Actions, and archive them with permission.
          </p>
        </div>

        {/* Auth status / Sign in */}
        {currentUser ? (
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
            <div className="text-left text-xs">
              <div className="font-semibold text-white truncate max-w-[140px]">
                {currentUser.displayName || 'Google User'}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {currentUser.email}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Sign out of Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Official Google Sign-In Button */
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-xl font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Email Inbox Content */}
      <div className="mt-5">
        {!currentUser ? (
          <div className="text-center py-10 bg-slate-950 rounded-xl border border-slate-800 p-6">
            <Mail className="w-10 h-10 text-rose-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-bold text-white">Connect Gmail for Instant Zero Inbox</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Sign in with your Google account to fetch unread emails and convert them into actionable GTD tasks with one click.
            </p>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow"
            >
              Connect Gmail Account
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <span>Recent Inbox Messages ({emails.length})</span>
                <span className="text-[10px] text-slate-500 font-mono">label:INBOX</span>
              </div>

              <button
                onClick={loadEmails}
                disabled={isLoadingEmails}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>

            {isLoadingEmails ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-rose-400 mx-auto mb-2" />
                <span>Reading Gmail messages...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className="py-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="font-bold text-white block">Inbox Zero Achieved!</span>
                <span className="text-slate-500 mt-0.5 block">No pending messages found in INBOX.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-bold text-white truncate max-w-xs">{email.from}</span>
                        <span className="text-slate-500 text-[11px] truncate">{email.date}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-rose-200 truncate mb-1">
                        {email.subject}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        "{email.snippet}"
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTriageEmail(email)}
                        disabled={triagingId === email.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                        title="Analyze email with Gemini and generate GTD action"
                      >
                        {triagingId === email.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Triage to Action</span>
                      </button>

                      <button
                        onClick={() => openReplyModal(email)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
                        title="Quick 2-minute response"
                      >
                        <Send className="w-3 h-3 text-emerald-400" />
                        <span>Reply (2m)</span>
                      </button>

                      <button
                        onClick={() => promptArchive(email)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Archive message from inbox"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Modal for Destructive / Archive Operation */}
      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Confirm Archive in Gmail</h3>
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Are you sure you want to remove the <strong>INBOX</strong> label and archive this email from your Gmail account?
            </p>
            <p className="text-xs text-rose-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-4 truncate">
              "{confirmArchiveSubject}"
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmArchiveId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={executeArchive}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow"
              >
                Yes, Archive Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reply Modal with Mandatory Confirmation Before Sending */}
      {replyEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Quick 2-Minute Email Reply</h3>
              </div>
              <button
                onClick={() => setReplyEmail(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="text-xs space-y-2 mb-3">
              <div>
                <span className="text-slate-400">To: </span>
                <span className="text-white font-mono">{replyEmail.from}</span>
              </div>
              <div>
                <span className="text-slate-400">Subject: </span>
                <span className="text-white font-semibold">Re: {replyEmail.subject}</span>
              </div>
            </div>

            <textarea
              rows={4}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
              placeholder="Write concise reply..."
            />

            {/* Confirmation Step Before Actually Mutating/Sending */}
            {confirmSendOpen ? (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl">
                <p className="text-xs text-amber-300 font-semibold mb-2">
                  Confirm: Send this email to {replyEmail.from}?
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setConfirmSendOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={executeSendReply}
                    disabled={isSending}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow"
                  >
                    {isSending ? 'Sending...' : 'Confirm & Send'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setReplyEmail(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Discard
                </button>
                <button
                  onClick={() => setConfirmSendOpen(true)}
                  disabled={!replyBody.trim()}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Review &amp; Send</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
