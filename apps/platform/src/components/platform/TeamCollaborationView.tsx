// MIKHLAFI LABS — Enterprise Team Collaboration & Interactive Workspace
// Scoped strictly to the authenticated tenant organization. Real-time channels,
// rich financial report & task attachments, and collaborative assignment board.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LocaleMode } from '../../types';
import {
  IconMessageSquare,
  IconCheckSquare,
  IconUsers,
  IconPlus,
  IconSend,
  IconPaperclip,
  IconRefresh,
  IconCheck,
  IconAlert,
  IconClock,
  IconFinance,
  IconTrash
} from '../Icons';
import { useAuth } from '../../context/AuthContext';
import {
  api,
  TeamChannel,
  TeamMessage,
  TeamTask,
  MemberRecord,
  RealDecisionItem
} from '../../api/client';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

interface TeamCollaborationViewProps {
  locale: LocaleMode;
}

export const TeamCollaborationView: React.FC<TeamCollaborationViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { user, tenant, isAuthenticated, openAuthModal } = useAuth();

  // Tab mode: 'chat' or 'tasks'
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');

  // Channels & Messages State
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  // Tasks State
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('all');

  // Team Members & Real Data for Attachments
  const [teamMembers, setTeamMembers] = useState<MemberRecord[]>([]);
  const [decisions, setDecisions] = useState<RealDecisionItem[]>([]);

  // Modals
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState<boolean>(false);
  const [newChannelNameAr, setNewChannelNameAr] = useState<string>('');
  const [newChannelNameEn, setNewChannelNameEn] = useState<string>('');
  const [newChannelDescAr, setNewChannelDescAr] = useState<string>('');
  const [isCreatingChannel, setIsCreatingChannel] = useState<boolean>(false);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskReportRef, setNewTaskReportRef] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);

  // Attachment Picker Modal inside Chat
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<'report' | 'task' | null>(null);

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Scroll messages to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Channels & Members
  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [channelsRes, membersRes, decisionsRes] = await Promise.all([
        api.getTeamChannels(),
        api.getMembers(),
        api.getDecisions().catch(() => ({ decisions: [] }))
      ]);

      const chList = Array.isArray(channelsRes.channels) ? channelsRes.channels : [];
      setChannels(chList);
      if (chList.length > 0 && !activeChannelId) {
        setActiveChannelId(chList[0].id);
      }

      setTeamMembers(Array.isArray(membersRes.members) ? membersRes.members : []);
      setDecisions(Array.isArray(decisionsRes.decisions) ? decisionsRes.decisions : []);
    } catch (err: any) {
      console.error('Failed to load team data:', err);
      showNotification(isAr ? 'تعذر جلب قنوات الفريق' : 'Failed to load team channels', 'error');
    }
  }, [isAuthenticated, isAr, activeChannelId]);

  // Load Messages for Active Channel
  const loadMessages = useCallback(async (chanId: string) => {
    if (!chanId || !isAuthenticated) return;
    setLoadingMessages(true);
    try {
      const res = await api.getTeamMessages(chanId);
      setMessages(Array.isArray(res.messages) ? res.messages : []);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [isAuthenticated]);

  // Load Tasks
  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingTasks(true);
    try {
      const res = await api.getTeamTasks();
      setTasks(Array.isArray(res.tasks) ? res.tasks : []);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadInitialData();
    loadTasks();
  }, [loadInitialData, loadTasks, tenant?.organizationId]);

  useEffect(() => {
    if (activeChannelId) {
      loadMessages(activeChannelId);
    }
  }, [activeChannelId, loadMessages]);

  // Periodic polling for new messages & tasks
  useEffect(() => {
    if (!activeChannelId || !isAuthenticated) return;
    const interval = setInterval(() => {
      loadMessages(activeChannelId);
      if (activeTab === 'tasks') {
        loadTasks();
      }
    }, 10000); // Polling every 10 seconds for seamless interactivity
    return () => clearInterval(interval);
  }, [activeChannelId, isAuthenticated, activeTab, loadMessages, loadTasks]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, attachmentPayload?: { type: string; data: any; label?: string }) => {
    if (e) e.preventDefault();
    if (!activeChannelId) return;

    let textToSend = messageInput.trim();
    if (attachmentPayload?.label && !textToSend) {
      textToSend = attachmentPayload.label;
    }

    if (!textToSend && !attachmentPayload) return;

    setSendingMessage(true);
    try {
      const res = await api.sendTeamMessage(activeChannelId, {
        content: textToSend,
        attachmentType: attachmentPayload ? attachmentPayload.type : 'none',
        attachmentData: attachmentPayload ? attachmentPayload.data : null
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setMessageInput('');
        setIsAttachModalOpen(false);
        setSelectedAttachmentType(null);
      }
    } catch (err: any) {
      showNotification(err.message || (isAr ? 'فشل إرسال الرسالة' : 'Failed to send message'), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelNameAr.trim() && !newChannelNameEn.trim()) return;
    setIsCreatingChannel(true);
    try {
      const res = await api.createTeamChannel({
        nameAr: newChannelNameAr.trim() || newChannelNameEn.trim(),
        nameEn: newChannelNameEn.trim() || newChannelNameAr.trim(),
        descriptionAr: newChannelDescAr.trim() || undefined
      });
      if (res.success && res.channel) {
        setChannels((prev) => [...prev, res.channel]);
        setActiveChannelId(res.channel.id);
        setIsNewChannelModalOpen(false);
        setNewChannelNameAr('');
        setNewChannelNameEn('');
        setNewChannelDescAr('');
        showNotification(isAr ? 'تم إنشاء القناة بنجاح' : 'Channel created successfully');
      }
    } catch (err: any) {
      showNotification(err.message || (isAr ? 'تعذر إنشاء القناة' : 'Failed to create channel'), 'error');
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      const res = await api.createTeamTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        assignedTo: newTaskAssignee || undefined,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        relatedReportRef: newTaskReportRef || undefined
      });
      if (res.success && res.task) {
        await loadTasks();
        setIsNewTaskModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskAssignee('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setNewTaskReportRef('');
        showNotification(isAr ? 'تم إنشاء وتكليف المهمة بنجاح' : 'Task created and assigned successfully');
        // If in chat, reload messages to see notification
        if (activeChannelId) loadMessages(activeChannelId);
      }
    } catch (err: any) {
      showNotification(err.message || (isAr ? 'تعذر إنشاء المهمة' : 'Failed to create task'), 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Quick Status Update for Task
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTeamTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
      );
      showNotification(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch (err: any) {
      showNotification(err.message || (isAr ? 'تعذر تحديث المهمة' : 'Failed to update task'), 'error');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTeamTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification(isAr ? 'تم حذف المهمة' : 'Task deleted');
    } catch (err: any) {
      showNotification(err.message || (isAr ? 'تعذر حذف المهمة' : 'Failed to delete task'), 'error');
    }
  };

  // Helper labels
  const roleBadgeLabel = (role: string) => {
    switch (role) {
      case 'org_owner':
        return isAr ? 'مالك المؤسسة' : 'Owner';
      case 'org_admin':
        return isAr ? 'مسؤول المؤسسة' : 'Admin';
      case 'manager':
        return isAr ? 'مدير عمليات' : 'Manager';
      case 'analyst':
        return isAr ? 'محلل أعمال' : 'Analyst';
      case 'viewer':
        return isAr ? 'مستطلع' : 'Viewer';
      default:
        return role;
    }
  };

  const priorityMeta = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: isAr ? 'عاجلة جداً' : 'Urgent', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'high':
        return { label: isAr ? 'أولوية عالية' : 'High', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'medium':
        return { label: isAr ? 'أولوية متوسطة' : 'Medium', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'low':
      default:
        return { label: isAr ? 'منخفضة' : 'Low', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const statusMeta = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: isAr ? 'معتمدة ومغلقة' : 'Approved', class: 'ml-badge--success' };
      case 'completed':
        return { label: isAr ? 'مكتملة وبانتظار الاعتماد' : 'Completed', class: 'ml-badge--accent' };
      case 'in_progress':
        return { label: isAr ? 'قيد التنفيذ' : 'In Progress', class: 'ml-badge--warning' };
      case 'pending':
      default:
        return { label: isAr ? 'بانتظار البدء' : 'Pending', class: '' };
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilterStatus !== 'all' && t.status !== taskFilterStatus) return false;
    if (taskFilterPriority !== 'all' && t.priority !== taskFilterPriority) return false;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="platform-page-container">
        <PageHeader
          locale={locale}
          title={isAr ? 'بيئة التعاون والتواصل الداخلي' : 'Team Collaboration Hub'}
          subtitle={isAr ? 'فضاء التنسيق والتواصل المعزول الخاص بمنسوبي مؤسستك' : 'Isolated collaborative operations workspace for your workforce'}
          icon={<IconMessageSquare size={20} />}
        />
        <EmptyState
          icon={<IconUsers size={36} />}
          title={isAr ? 'يرجى تسجيل الدخول' : 'Authentication Required'}
          description={
            isAr
              ? 'يجب تسجيل الدخول بحساب مؤسسي للوصول إلى قنوات الفريق والمهام.'
              : 'Sign in to access your organization’s channels, tasks, and team chat.'
          }
          action={
            <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
              <span>{isAr ? 'تسجيل الدخول المؤسسي' : 'Sign In'}</span>
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="platform-page-container">
      {/* Page Header with Tab Switcher & Quick Actions */}
      <PageHeader
        locale={locale}
        title={isAr ? 'فضاء التواصل الداخلي وإدارة المهام' : 'Team Collaboration & Task Hub'}
        subtitle={
          isAr
            ? `مساحة العمليات التفاعلية المعزولة لمؤسسة (${tenant?.orgNameAr || tenant?.orgNameEn}) لتنسيق القيود ومتابعة التكاليف والتقارير`
            : `Isolated collaborative operations space for (${tenant?.orgNameEn || tenant?.orgNameAr}) to coordinate variances and workflows`
        }
        icon={<IconMessageSquare size={20} />}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View Switcher */}
            <div style={{ display: 'inline-flex', padding: 3, background: 'var(--color-surface-hover, rgba(255,255,255,0.06))', borderRadius: 8 }}>
              <button
                onClick={() => setActiveTab('chat')}
                className={`ml-btn ml-btn--sm ${activeTab === 'chat' ? 'ml-btn--primary' : 'ml-btn--subtle'}`}
                style={{ padding: '0.35rem 0.75rem', gap: '0.4rem' }}
              >
                <IconMessageSquare size={14} />
                <span>{isAr ? 'قنوات الفريق والدردشة' : 'Team Channels & Chat'}</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`ml-btn ml-btn--sm ${activeTab === 'tasks' ? 'ml-btn--primary' : 'ml-btn--subtle'}`}
                style={{ padding: '0.35rem 0.75rem', gap: '0.4rem' }}
              >
                <IconCheckSquare size={14} />
                <span>{isAr ? `لوحة المهام (${tasks.length})` : `Tasks Board (${tasks.length})`}</span>
              </button>
            </div>

            {/* Quick Action Button */}
            {activeTab === 'chat' ? (
              <button onClick={() => setIsNewChannelModalOpen(true)} className="ml-btn ml-btn--subtle ml-btn--sm">
                <IconPlus size={13} />
                <span>{isAr ? 'قناة جديدة' : 'New Channel'}</span>
              </button>
            ) : (
              <button onClick={() => setIsNewTaskModalOpen(true)} className="ml-btn ml-btn--primary ml-btn--sm">
                <IconPlus size={13} />
                <span>{isAr ? 'تكليف مهمة جديدة' : 'New Task'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (activeChannelId) loadMessages(activeChannelId);
                loadTasks();
              }}
              className="ml-btn ml-btn--subtle ml-btn--sm"
              title={isAr ? 'تحديث البيانات' : 'Refresh'}
            >
              <IconRefresh size={13} />
            </button>
          </div>
        }
      />

      {/* Floating Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: isAr ? '24px' : 'auto',
            left: isAr ? 'auto' : '24px',
            zIndex: 9999,
            padding: '12px 20px',
            background: notification.type === 'error' ? 'var(--color-danger, #EF4444)' : 'var(--color-brand-primary, #0D9488)',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {notification.type === 'error' ? <IconAlert size={16} /> : <IconCheck size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ─── TAB 1: CHAT & CHANNELS ─── */}
      {activeTab === 'chat' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 310px) 1fr',
            gap: '1rem',
            minHeight: '680px',
            height: 'calc(100vh - 230px)',
            maxHeight: '850px'
          }}
        >
          {/* Left Column: Channels & Online Team Members */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface, #141A23)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              overflow: 'hidden'
            }}
          >
            {/* Channels Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary, #FFFFFF)' }}>
                  {isAr ? 'قنوات الفريق' : 'Team Channels'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary, #8892B0)' }}>
                  {channels.length} {isAr ? 'قنوات نشطة' : 'active channels'}
                </div>
              </div>
              <button
                onClick={() => setIsNewChannelModalOpen(true)}
                className="ml-btn ml-btn--subtle ml-btn--sm"
                style={{ padding: '4px 8px' }}
                title={isAr ? 'إضافة قناة' : 'Add Channel'}
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Channels List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {channels.map((chan) => {
                const isActive = chan.id === activeChannelId;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive
                        ? 'var(--color-brand-primary-soft, rgba(13, 148, 136, 0.16))'
                        : 'transparent',
                      color: isActive ? 'var(--color-brand-primary, #0D9488)' : 'var(--color-text-secondary, #CCD6F6)',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'start',
                      marginBottom: '4px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontSize: '1rem', opacity: 0.7 }}>#</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isAr ? chan.name_ar : chan.name_en}
                        </div>
                      </div>
                    </div>
                    {chan.message_count > 0 && (
                      <span
                        className="ml-badge"
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          background: isActive ? 'var(--color-brand-primary, #0D9488)' : 'rgba(255,255,255,0.08)',
                          color: isActive ? '#FFFFFF' : 'inherit'
                        }}
                      >
                        {chan.message_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Team Directory Snippet */}
            <div
              style={{
                borderTop: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                padding: '12px',
                background: 'rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary, #8892B0)', marginBottom: '8px' }}>
                {isAr ? `فريق العمل المسجل (${teamMembers.length})` : `Workforce Members (${teamMembers.length})`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {teamMembers.slice(0, 6).map((m) => (
                  <div key={m.membership_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--color-brand-primary, #0D9488)',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {(m.name_ar || m.name_en || m.email).substring(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--color-text-primary, #FFF)' }}>{isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar}</span>
                      {m.job_title && (
                        <span style={{ color: 'var(--color-text-tertiary, #8892B0)', fontSize: '0.72rem', marginInlineStart: '4px' }}>
                          · {m.job_title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat Feed & Composer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface, #141A23)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              overflow: 'hidden'
            }}
          >
            {/* Active Channel Header */}
            {activeChannel ? (
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', color: 'var(--color-brand-primary, #0D9488)', fontWeight: 800 }}>#</span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text-primary, #FFF)' }}>
                      {isAr ? activeChannel.name_ar : activeChannel.name_en}
                    </span>
                    {activeChannel.is_default && (
                      <span className="ml-badge ml-badge--accent" style={{ fontSize: '0.7rem' }}>
                        {isAr ? 'رسمية' : 'Default'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary, #8892B0)', marginTop: '2px' }}>
                    {isAr ? activeChannel.description_ar : activeChannel.description_en}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedAttachmentType('task');
                      setIsAttachModalOpen(true);
                    }}
                    className="ml-btn ml-btn--subtle ml-btn--sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <IconCheckSquare size={13} />
                    <span>{isAr ? 'إرفاق مهمة' : 'Attach Task'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAttachmentType('report');
                      setIsAttachModalOpen(true);
                    }}
                    className="ml-btn ml-btn--subtle ml-btn--sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <IconFinance size={13} />
                    <span>{isAr ? 'إرفاق تقرير تدقيق' : 'Attach Report'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px' }}>{isAr ? 'اختر قناة للبدء' : 'Select a channel'}</div>
            )}

            {/* Messages Feed */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
                  <span>{isAr ? 'جارِ تحميل المراسلات…' : 'Loading messages…'}</span>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-tertiary)', maxWidth: 360 }}>
                  <IconMessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                    {isAr ? 'لا توجد رسائل سابقة في هذه القناة' : 'No messages yet in this channel'}
                  </div>
                  <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                    {isAr
                      ? 'ابدأ المحادثة وشارك التوجيهات والتقارير التنفيذية مع أعضاء فريقك.'
                      : 'Start the conversation and share audit findings or task assignments.'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.user_id === user?.id;
                  const senderName = isAr
                    ? msg.sender_name_ar || msg.sender_name_en || msg.sender_email
                    : msg.sender_name_en || msg.sender_name_ar || msg.sender_email;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Sender Meta Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-tertiary, #8892B0)'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isMine ? 'var(--color-brand-primary, #0D9488)' : 'var(--color-text-primary, #FFF)' }}>
                          {senderName}
                        </span>
                        {msg.sender_role && (
                          <span className="ml-badge" style={{ fontSize: '0.65rem', padding: '0 4px' }}>
                            {roleBadgeLabel(msg.sender_role)}
                          </span>
                        )}
                        {msg.sender_department && (
                          <span style={{ opacity: 0.8 }}>· {msg.sender_department}</span>
                        )}
                        <span style={{ opacity: 0.6, marginInlineStart: '4px' }}>
                          {new Date(msg.created_at).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: isMine
                            ? 'var(--color-brand-primary, #0D9488)'
                            : 'var(--color-surface-hover, rgba(255,255,255,0.06))',
                          color: isMine ? '#FFFFFF' : 'var(--color-text-primary, #FFFFFF)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          wordBreak: 'break-word',
                          lineHeight: '1.45',
                          fontSize: '0.92rem'
                        }}
                      >
                        <div>{msg.content}</div>

                        {/* Rich Attachment Card: Task */}
                        {msg.attachment_type === 'task' && msg.attachment_data && (
                          <div
                            style={{
                              marginTop: '10px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: isMine ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              fontSize: '0.85rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                                <IconCheckSquare size={14} />
                                <span>{msg.attachment_data.title}</span>
                              </div>
                              {msg.attachment_data.priority && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: priorityMeta(msg.attachment_data.priority).bg,
                                    color: priorityMeta(msg.attachment_data.priority).color
                                  }}
                                >
                                  {priorityMeta(msg.attachment_data.priority).label}
                                </span>
                              )}
                            </div>
                            {msg.attachment_data.dueDate && (
                              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                <IconClock size={11} style={{ verticalAlign: 'middle', marginInlineEnd: 4 }} />
                                {isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'} {msg.attachment_data.dueDate}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rich Attachment Card: Financial / Audit Report */}
                        {msg.attachment_type === 'report' && msg.attachment_data && (
                          <div
                            style={{
                              marginTop: '10px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: isMine ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              fontSize: '0.85rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                                <IconFinance size={14} />
                                <span>{msg.attachment_data.title}</span>
                              </div>
                              <span className="ml-badge ml-badge--warning" style={{ fontSize: '0.7rem' }}>
                                {msg.attachment_data.riskLevel || 'AUDIT'}
                              </span>
                            </div>
                            {msg.attachment_data.impactAmount && (
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isMine ? '#A7F3D0' : 'var(--color-brand-primary, #0D9488)', marginTop: '4px' }}>
                                {isAr ? 'الأثر المالي المرصود:' : 'Financial Impact:'}{' '}
                                {Number(msg.attachment_data.impactAmount).toLocaleString()} SAR
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer Bar */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              style={{
                padding: '14px 18px',
                borderTop: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                background: 'rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(true)}
                className="ml-btn ml-btn--subtle"
                style={{ padding: '8px', borderRadius: '50%' }}
                title={isAr ? 'إرفاق مهمة أو تقرير' : 'Attach task or report'}
              >
                <IconPaperclip size={16} />
              </button>

              <input
                type="text"
                className="ml-input"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px' }}
                placeholder={
                  activeChannel
                    ? isAr
                      ? `اكتب رسالتك في #${activeChannel.name_ar}…`
                      : `Message #${activeChannel.name_en}…`
                    : isAr
                      ? 'اكتب رسالتك…'
                      : 'Type a message…'
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={sendingMessage || !activeChannelId}
              />

              <button
                type="submit"
                disabled={sendingMessage || !messageInput.trim() || !activeChannelId}
                className="ml-btn ml-btn--primary"
                style={{ padding: '10px 16px', borderRadius: '8px' }}
              >
                <IconSend size={15} />
                <span>{isAr ? 'إرسال' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TASKS BOARD ─── */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filters and Controls Bar */}
          <div
            className="ml-panel"
            style={{
              padding: '12px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {isAr ? 'الحالة:' : 'Status:'}
              </span>
              {['all', 'pending', 'in_progress', 'completed', 'approved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskFilterStatus(st)}
                  className={`ml-btn ml-btn--sm ${taskFilterStatus === st ? 'ml-btn--primary' : 'ml-btn--subtle'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  {st === 'all'
                    ? isAr
                      ? 'الكل'
                      : 'All'
                    : statusMeta(st).label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {isAr ? 'الأولوية:' : 'Priority:'}
              </span>
              <select
                className="ml-select"
                style={{ fontSize: '0.82rem', padding: '4px 10px' }}
                value={taskFilterPriority}
                onChange={(e) => setTaskFilterPriority(e.target.value)}
              >
                <option value="all">{isAr ? 'جميع الأولويات' : 'All Priorities'}</option>
                <option value="urgent">{isAr ? 'عاجلة جداً' : 'Urgent'}</option>
                <option value="high">{isAr ? 'أولوية عالية' : 'High'}</option>
                <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
              </select>
            </div>
          </div>

          {/* Tasks Grid */}
          {loadingTasks ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
              {isAr ? 'جارِ تحميل المهام…' : 'Loading tasks…'}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={<IconCheckSquare size={36} />}
              title={isAr ? 'لا توجد مهام مطابقة' : 'No tasks found'}
              description={
                isAr
                  ? 'يمكنك تكليف الموظفين بمتابعة القيود المشبوهة أو التدقيق وإرفاق التقارير.'
                  : 'Assign team members to follow up on variances, audits, or executive actions.'
              }
              action={
                <button onClick={() => setIsNewTaskModalOpen(true)} className="ml-btn ml-btn--primary ml-btn--sm">
                  <IconPlus size={13} />
                  <span>{isAr ? 'تكليف مهمة جديدة' : 'Create Task'}</span>
                </button>
              }
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                gap: '1rem'
              }}
            >
              {filteredTasks.map((t) => {
                const pMeta = priorityMeta(t.priority);
                const sMeta = statusMeta(t.status);

                return (
                  <div
                    key={t.id}
                    className="ml-panel"
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: pMeta.bg,
                            color: pMeta.color
                          }}
                        >
                          {pMeta.label}
                        </span>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className={`ml-badge ${sMeta.class}`} style={{ fontSize: '0.72rem' }}>
                            {sMeta.label}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="ml-icon-btn"
                            style={{ padding: '2px', opacity: 0.6 }}
                            title={isAr ? 'حذف المهمة' : 'Delete task'}
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary, #FFF)', marginBottom: '6px', lineHeight: 1.35 }}>
                        {t.title}
                      </h3>
                      {t.description && (
                        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary, #CCD6F6)', marginBottom: '12px', lineHeight: 1.4 }}>
                          {t.description}
                        </p>
                      )}

                      {/* Related Report Reference */}
                      {t.related_report_ref && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--color-brand-primary, #0D9488)',
                            marginBottom: '10px'
                          }}
                        >
                          <IconFinance size={12} />
                          <span>{isAr ? 'مرجع التقرير:' : 'Ref:'} {t.related_report_ref}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Status Controller */}
                    <div style={{ borderTop: '1px solid var(--color-border, rgba(255,255,255,0.06))', paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-tertiary, #8892B0)', marginBottom: '8px' }}>
                        <div>
                          {isAr ? 'المكلّف:' : 'Assignee:'}{' '}
                          <strong style={{ color: 'var(--color-text-primary, #FFF)' }}>
                            {t.assignee_name_ar || t.assignee_name_en || t.assignee_email || (isAr ? 'غير محدد' : 'Unassigned')}
                          </strong>
                        </div>
                        {t.due_date && (
                          <div>
                            <IconClock size={11} style={{ verticalAlign: 'middle', marginInlineEnd: 3 }} />
                            {t.due_date}
                          </div>
                        )}
                      </div>

                      {/* Status Change Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{isAr ? 'تغيير الحالة:' : 'Set Status:'}</span>
                        <select
                          className="ml-select"
                          style={{ fontSize: '0.78rem', padding: '3px 8px', flex: 1 }}
                          value={t.status}
                          onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                        >
                          <option value="pending">{isAr ? 'بانتظار البدء' : 'Pending'}</option>
                          <option value="in_progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                          <option value="completed">{isAr ? 'مكتملة وبانتظار الاعتماد' : 'Completed'}</option>
                          <option value="approved">{isAr ? 'معتمدة ومغلقة' : 'Approved'}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: CREATE CHANNEL ─── */}
      {isNewChannelModalOpen && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setIsNewChannelModalOpen(false)}>
          <div className="ml-modal" style={{ maxWidth: '460px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إنشاء قناة نقاش جديدة' : 'Create Team Channel'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'قناة نقاش معزولة ومحمية مخصصة لفريق عمل مؤسستك.'
                  : 'Isolated, private discussion channel for your organization’s workforce.'}
              </p>
            </div>
            <form onSubmit={handleCreateChannel}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'اسم القناة (بالعربية)' : 'Channel Name (Arabic)'}</label>
                  <input
                    type="text"
                    required
                    className="ml-input"
                    placeholder="مثال: مطابقة مشتريات الربع الثالث"
                    value={newChannelNameAr}
                    onChange={(e) => setNewChannelNameAr(e.target.value)}
                  />
                </div>
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'اسم القناة (بالإنجليزية)' : 'Channel Name (English)'}</label>
                  <input
                    type="text"
                    className="ml-input"
                    placeholder="e.g. Q3 Procurement Reconciliation"
                    value={newChannelNameEn}
                    onChange={(e) => setNewChannelNameEn(e.target.value)}
                  />
                </div>
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'وصف القناة والهدف منها' : 'Description / Topic'}</label>
                  <textarea
                    className="ml-input"
                    rows={2}
                    placeholder="وصف مختصر لموضوع النقاش في هذه القناة"
                    value={newChannelDescAr}
                    onChange={(e) => setNewChannelDescAr(e.target.value)}
                  />
                </div>
              </div>
              <div className="ml-modal__foot vc-modal-foot">
                <button type="button" onClick={() => setIsNewChannelModalOpen(false)} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={isCreatingChannel} className="ml-btn ml-btn--primary">
                  <IconCheck size={14} />
                  <span>{isCreatingChannel ? (isAr ? 'جارِ الإنشاء…' : 'Creating…') : (isAr ? 'إنشاء القناة' : 'Create Channel')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE TASK ─── */}
      {isNewTaskModalOpen && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setIsNewTaskModalOpen(false)}>
          <div className="ml-modal" style={{ maxWidth: '520px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'تكليف مهمة عمل لفريق المؤسسة' : 'Assign Team Task'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'تكليف أحد الموظفين بمراجعة قيد مالي أو تنفيذ إجراء تدقيق مع إشعار فوري.'
                  : 'Assign an employee to review an audit variance or execute an action.'}
              </p>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="ml-modal__body">
                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'عنوان المهمة' : 'Task Title'} *</label>
                  <input
                    type="text"
                    required
                    className="ml-input"
                    placeholder="مثال: مطابقة فروقات أسعار أسمنت اليمامة لشهر أغسطس"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <div className="ml-field">
                  <label className="ml-label">{isAr ? 'تفاصيل المهمة والتوجيهات' : 'Description & Notes'}</label>
                  <textarea
                    className="ml-input"
                    rows={3}
                    placeholder="أدخل التوجيهات والملاحظات المطلوبة من الموظف"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'الموظف المسؤول' : 'Assignee'}</label>
                    <select
                      className="ml-select"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                    >
                      <option value="">{isAr ? '— اختر الموظف —' : '— Select Employee —'}</option>
                      {teamMembers.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar} {m.job_title ? `(${m.job_title})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'مستوى الأولوية' : 'Priority'}</label>
                    <select
                      className="ml-select"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    >
                      <option value="urgent">{isAr ? 'عاجلة جداً' : 'Urgent'}</option>
                      <option value="high">{isAr ? 'أولوية عالية' : 'High'}</option>
                      <option value="medium">{isAr ? 'أولوية متوسطة' : 'Medium'}</option>
                      <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                    <input
                      type="date"
                      className="ml-input"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>

                  <div className="ml-field">
                    <label className="ml-label">{isAr ? 'ربط بتقرير مالي / قرار' : 'Link to Finding / Ref'}</label>
                    <select
                      className="ml-select"
                      value={newTaskReportRef}
                      onChange={(e) => setNewTaskReportRef(e.target.value)}
                    >
                      <option value="">{isAr ? '— بدون ربط تقرير —' : '— None —'}</option>
                      {decisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title.substring(0, 40)}… ({Number(d.impact_amount).toLocaleString()} SAR)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="ml-modal__foot vc-modal-foot">
                <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="ml-btn ml-btn--subtle">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={isCreatingTask} className="ml-btn ml-btn--primary">
                  <IconCheck size={14} />
                  <span>{isCreatingTask ? (isAr ? 'جارِ الحفظ…' : 'Saving…') : (isAr ? 'تأكيد التكليف' : 'Assign Task')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ATTACHMENT PICKER FOR CHAT ─── */}
      {isAttachModalOpen && (
        <div className="ml-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setIsAttachModalOpen(false)}>
          <div className="ml-modal" style={{ maxWidth: '520px' }}>
            <div className="ml-modal__head">
              <h2 className="vc-modal-title">{isAr ? 'إرفاق مهمة أو تقرير في المحادثة' : 'Attach Finding or Task to Chat'}</h2>
              <p className="vc-modal-desc">
                {isAr
                  ? 'اختر عنصراً من سجلات التدقيق أو المهام لإرفاقه مباشرة ضمن رسالة القناة.'
                  : 'Select an audit finding or assigned task to share directly into the conversation.'}
              </p>
            </div>

            <div className="ml-modal__body">
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAttachmentType('report')}
                  className={`ml-btn ${selectedAttachmentType === 'report' ? 'ml-btn--primary' : 'ml-btn--subtle'}`}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <IconFinance size={14} />
                  <span>{isAr ? 'تقارير تدقيق مالي' : 'Audit Findings'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAttachmentType('task')}
                  className={`ml-btn ${selectedAttachmentType === 'task' ? 'ml-btn--primary' : 'ml-btn--subtle'}`}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <IconCheckSquare size={14} />
                  <span>{isAr ? 'بطاقات المهام' : 'Task Cards'}</span>
                </button>
              </div>

              {/* Items List */}
              {selectedAttachmentType === 'report' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {decisions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-tertiary)' }}>
                      {isAr ? 'لا توجد تقارير مسجلة بعد' : 'No findings recorded yet'}
                    </div>
                  ) : (
                    decisions.map((d) => (
                      <div
                        key={d.id}
                        onClick={() =>
                          handleSendMessage(undefined, {
                            type: 'report',
                            label: isAr ? `مشاركة تقرير تدقيق: "${d.title}"` : `Shared Audit Finding: "${d.title}"`,
                            data: {
                              decisionId: d.id,
                              title: d.title,
                              impactAmount: d.impact_amount,
                              riskLevel: d.risk_level,
                              category: d.category
                            }
                          })
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                          background: 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary, #FFF)' }}>
                            {d.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary, #8892B0)' }}>
                            {d.category} · {Number(d.impact_amount).toLocaleString()} SAR
                          </div>
                        </div>
                        <span className="ml-badge ml-badge--warning" style={{ fontSize: '0.7rem' }}>
                          {d.risk_level}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedAttachmentType === 'task' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-tertiary)' }}>
                      {isAr ? 'لا توجد مهام مسجلة بعد' : 'No tasks recorded yet'}
                    </div>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() =>
                          handleSendMessage(undefined, {
                            type: 'task',
                            label: isAr ? `مشاركة بطاقة مهمة: "${t.title}"` : `Shared Task Card: "${t.title}"`,
                            data: {
                              taskId: t.id,
                              title: t.title,
                              priority: t.priority,
                              status: t.status,
                              dueDate: t.due_date,
                              relatedReportRef: t.related_report_ref
                            }
                          })
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                          background: 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary, #FFF)' }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary, #8892B0)' }}>
                            {t.due_date ? `${isAr ? 'الاستحقاق:' : 'Due:'} ${t.due_date}` : isAr ? 'بدون موعد محدد' : 'No due date'}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: priorityMeta(t.priority).bg,
                            color: priorityMeta(t.priority).color
                          }}
                        >
                          {priorityMeta(t.priority).label}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="ml-modal__foot vc-modal-foot">
              <button type="button" onClick={() => setIsAttachModalOpen(false)} className="ml-btn ml-btn--subtle">
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
