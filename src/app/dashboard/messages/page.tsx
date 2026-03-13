'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Conversation {
  id: string;
  lastMessageAt: string;
  user1Id: string;
  user2Id: string;
  user1: { id: string; name: string; avatar: string | null };
  user2: { id: string; name: string; avatar: string | null };
  messages: Array<{ content: string; createdAt: string; senderId: string; isRead: boolean }>;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openConversation = async (convId: string) => {
    setSelectedConv(convId);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !session?.user) return;
    setSending(true);

    const conv = conversations.find((c) => c.id === selectedConv);
    if (!conv) return;

    const recipientId = conv.user1Id === session.user.id ? conv.user2Id : conv.user1Id;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } catch {} finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    if (!session?.user) return conv.user1;
    return conv.user1Id === session.user.id ? conv.user2 : conv.user1;
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>Messages</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-4)', minHeight: '60vh' }}>
        {/* Conversations List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-neutral-100)', fontWeight: 600 }}>
            Conversations
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '55vh' }}>
            {loading ? (
              <div style={{ padding: 'var(--space-4)' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }} />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                const lastMsg = conv.messages?.[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-4) var(--space-5)',
                      border: 'none',
                      background: selectedConv === conv.id ? 'var(--color-primary-50)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--color-neutral-50)',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div className="avatar avatar-sm avatar-placeholder" style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 14, flexShrink: 0 }}>
                      {other.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{other.name}</div>
                      {lastMsg && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg.content}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedConv ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-neutral-400)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {loadingMsgs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-lg)', width: i % 2 === 0 ? '60%' : '70%', alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start' }} />
                    ))}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div
                          style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-xl)',
                            background: isMine ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                            color: isMine ? 'white' : 'var(--color-neutral-800)',
                            fontSize: 'var(--text-sm)',
                            lineHeight: 1.6,
                          }}
                        >
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send Input */}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-neutral-100)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
