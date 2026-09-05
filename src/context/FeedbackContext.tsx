import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  InternalFeedbackItem,
  FeedbackFilters,
  FeedbackStatus,
  FeedbackType,
  FeedbackCategory,
  FeedbackTimelineEvent,
  FeedbackComment,
  FeedbackCommentReply
} from '../types/feedback';
import { INITIAL_FEEDBACK } from '../data/initialFeedback';
import { useToast } from './ToastContext';

interface FeedbackContextType {
  feedback: InternalFeedbackItem[];
  filteredFeedback: InternalFeedbackItem[];
  selectedFeedback: InternalFeedbackItem | null;
  filters: FeedbackFilters;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  metrics: {
    total: number;
    newCount: number;
    underReview: number;
    planned: number;
    inProgress: number;
    implemented: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<FeedbackFilters>>;
  updateFilter: <K extends keyof FeedbackFilters>(key: K, value: FeedbackFilters[K]) => void;
  clearFilters: () => void;
  setSelectedFeedback: (item: InternalFeedbackItem | null) => void;
  setSort: (field: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  createFeedback: (item: Partial<InternalFeedbackItem>) => string;
  updateFeedback: (id: string, updates: Partial<InternalFeedbackItem>) => void;
  changeStatus: (
    id: string,
    newStatus: FeedbackStatus,
    reviewNote?: string,
    owner?: string,
    targetDate?: string,
    user?: string
  ) => void;
  addComment: (feedbackId: string, content: string, author: string, role: string) => void;
  replyToComment: (feedbackId: string, commentId: string, content: string, author: string, role: string) => void;
  deleteComment: (feedbackId: string, commentId: string) => void;
  deleteFeedback: (id: string) => void;
  filterByMetricCard: (type: 'all' | 'new' | 'underReview' | 'planned' | 'inProgress' | 'implemented') => void;
}

const initialFilters: FeedbackFilters = {
  search: '',
  status: 'All',
  type: 'All',
  category: 'All',
  priority: 'All',
  submittedBy: 'All',
  assignedTo: 'All',
  relatedModule: 'All',
  dateRange: 'All'
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const STORAGE_KEY = 'pubvantage_internal_feedback_v3';

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  const [feedback, setFeedback] = useState<InternalFeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      // Upgrade from v2: preserve user feedback while updating sample attachment static URLs
      const prevSaved = localStorage.getItem('pubvantage_internal_feedback_v2');
      if (prevSaved) {
        const parsed = JSON.parse(prevSaved) as InternalFeedbackItem[];
        const initialMap = new Map(INITIAL_FEEDBACK.map((f) => [f.id, f]));
        const merged = parsed.map((item) => {
          const sample = initialMap.get(item.id);
          if (sample) {
            return {
              ...item,
              attachments: sample.attachments
            };
          }
          return item;
        });
        return merged;
      }
    } catch (e) {
      console.error('Failed to parse saved feedback:', e);
    }
    return INITIAL_FEEDBACK;
  });

  const [selectedFeedback, setSelectedFeedbackState] = useState<InternalFeedbackItem | null>(null);
  const [filters, setFilters] = useState<FeedbackFilters>(initialFilters);
  const [sortField, setSortField] = useState<string>('submittedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
    } catch (e) {
      console.error('Failed to save feedback to localStorage:', e);
    }
  }, [feedback]);

  // Sync selected feedback reference
  useEffect(() => {
    if (selectedFeedback) {
      const updated = feedback.find((f) => f.id === selectedFeedback.id);
      if (updated) {
        setSelectedFeedbackState(updated);
      }
    }
  }, [feedback]);

  const setSelectedFeedback = useCallback((item: InternalFeedbackItem | null) => {
    setSelectedFeedbackState(item);
  }, []);

  const updateFilter = useCallback(<K extends keyof FeedbackFilters>(key: K, value: FeedbackFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, []);

  const setSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let newCount = 0;
    let underReview = 0;
    let planned = 0;
    let inProgress = 0;
    let implemented = 0;

    feedback.forEach((item) => {
      if (item.status === 'New') newCount++;
      if (item.status === 'Under Review') underReview++;
      if (item.status === 'Planned') planned++;
      if (item.status === 'In Progress') inProgress++;
      if (item.status === 'Implemented') implemented++;
    });

    return {
      total: feedback.length,
      newCount,
      underReview,
      planned,
      inProgress,
      implemented
    };
  }, [feedback]);

  const filterByMetricCard = useCallback((type: 'all' | 'new' | 'underReview' | 'planned' | 'inProgress' | 'implemented') => {
    setFilters((prev) => {
      const reset = { ...initialFilters, search: prev.search };
      switch (type) {
        case 'new':
          return { ...reset, status: 'New' };
        case 'underReview':
          return { ...reset, status: 'Under Review' };
        case 'planned':
          return { ...reset, status: 'Planned' };
        case 'inProgress':
          return { ...reset, status: 'In Progress' };
        case 'implemented':
          return { ...reset, status: 'Implemented' };
        default:
          return reset;
      }
    });
    setPage(1);
  }, []);

  // Filtered & Sorted Feedback
  const filteredFeedback = useMemo(() => {
    return feedback
      .filter((item) => {
        // Search
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchId = item.id.toLowerCase().includes(query);
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchCategory = item.category.toLowerCase().includes(query);
          const matchModule = item.relatedModule.toLowerCase().includes(query);
          const matchSubmitter = item.submittedBy.toLowerCase().includes(query);
          const matchBook = item.relatedBook ? item.relatedBook.toLowerCase().includes(query) : false;

          if (!matchId && !matchTitle && !matchDesc && !matchCategory && !matchModule && !matchSubmitter && !matchBook) {
            return false;
          }
        }

        // Status
        if (filters.status !== 'All' && item.status !== filters.status) {
          return false;
        }

        // Type
        if (filters.type !== 'All' && item.type !== filters.type) {
          return false;
        }

        // Category
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        // Priority
        if (filters.priority !== 'All' && item.priority !== filters.priority) {
          return false;
        }

        // Submitter
        if (filters.submittedBy !== 'All' && item.submittedBy !== filters.submittedBy) {
          return false;
        }

        // Assignee / Owner
        if (filters.assignedTo !== 'All' && item.assignedTo !== filters.assignedTo && item.owner !== filters.assignedTo) {
          return false;
        }

        // Module
        if (filters.relatedModule !== 'All' && item.relatedModule !== filters.relatedModule) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof InternalFeedbackItem] ?? '';
        let valB: any = b[sortField as keyof InternalFeedbackItem] ?? '';

        if (typeof valA === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [feedback, filters, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));

  const createFeedback = useCallback((itemData: Partial<InternalFeedbackItem>): string => {
    // Generate sequential ID
    const maxNum = feedback.reduce((acc, curr) => {
      const match = curr.id.match(/FDB-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 84);

    const newId = `FDB-00${maxNum + 1}`;
    const formattedTimestamp = '2026-09-05 09:35';

    const newFeedback: InternalFeedbackItem = {
      id: newId,
      type: itemData.type || 'Suggestion',
      title: itemData.title || 'Untitled Feedback',
      description: itemData.description || '',
      category: itemData.category || 'EPUB Production',
      relatedModule: itemData.relatedModule || 'EPUB Compiler',
      relatedBook: itemData.relatedBook || undefined,
      problemCurrentExperience: itemData.problemCurrentExperience || '',
      suggestedImprovement: itemData.suggestedImprovement || '',
      expectedBenefit: itemData.expectedBenefit || '',
      whoIsAffected: itemData.whoIsAffected || 'Publishing & QA teams',
      frequency: itemData.frequency || 'Daily',
      productionImpact: itemData.productionImpact || 'Medium',
      priority: itemData.priority || 'Medium',
      suggestedSolution: itemData.suggestedSolution || '',
      attachments: itemData.attachments || [],
      submittedBy: itemData.submittedBy || 'Current User',
      submittedDate: '2026-09-05',
      team: itemData.team || 'Production Team',
      assignedTo: itemData.assignedTo || undefined,
      owner: itemData.owner || undefined,
      status: 'New',
      targetDate: itemData.targetDate || undefined,
      timeline: [
        {
          id: `ftl-${Date.now()}`,
          timestamp: formattedTimestamp,
          title: `Feedback submitted by ${itemData.submittedBy || 'Current User'}`,
          user: itemData.submittedBy || 'Current User',
          role: itemData.team || 'Production Team',
          details: 'Initial submission logged in idea portal.',
          type: 'submit'
        }
      ],
      comments: []
    };

    setFeedback((prev) => [newFeedback, ...prev]);
    addToast(`Feedback ${newId} submitted successfully.`, `Filed under "${newFeedback.category}" - ${newFeedback.title}`, 'success');
    return newId;
  }, [feedback, addToast]);

  const updateFeedback = useCallback((id: string, updates: Partial<InternalFeedbackItem>) => {
    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
    addToast('Feedback updated successfully.', `Updated details for ${id}`, 'success');
  }, [addToast]);

  const changeStatus = useCallback(
    (
      id: string,
      newStatus: FeedbackStatus,
      reviewNote?: string,
      owner?: string,
      targetDate?: string,
      user: string = 'Current User'
    ) => {
      setFeedback((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            let timelineType: FeedbackTimelineEvent['type'] = 'review';
            if (newStatus === 'Planned') timelineType = 'plan';
            if (newStatus === 'In Progress') timelineType = 'progress';
            if (newStatus === 'Implemented') timelineType = 'implemented';
            if (newStatus === 'Rejected' || newStatus === 'Duplicate') timelineType = 'reject';

            const newEvent: FeedbackTimelineEvent = {
              id: `ftl-${Date.now()}`,
              timestamp: '2026-09-05 09:35',
              title: `Status changed from ${item.status} to ${newStatus}`,
              user,
              details: reviewNote || `Moved item to ${newStatus}`,
              type: timelineType
            };

            return {
              ...item,
              status: newStatus,
              reviewer: user,
              reviewNotes: reviewNote || item.reviewNotes,
              owner: owner || item.owner,
              targetDate: targetDate || item.targetDate,
              decision:
                newStatus === 'Implemented'
                  ? 'Approved for Roadmap'
                  : newStatus === 'Rejected'
                  ? 'Rejected'
                  : newStatus === 'Duplicate'
                  ? 'Duplicate'
                  : item.decision,
              decisionDate: '2026-09-05',
              timeline: [newEvent, ...item.timeline]
            };
          }
          return item;
        })
      );
      addToast('Feedback status updated.', `${id} is now ${newStatus}`, 'success');
    },
    [addToast]
  );

  const addComment = useCallback((feedbackId: string, content: string, author: string, role: string) => {
    const newComment: FeedbackComment = {
      id: `comment-${Date.now()}`,
      author,
      role,
      createdAt: '2026-09-05 09:35',
      content,
      replies: []
    };

    const newTimelineEvent: FeedbackTimelineEvent = {
      id: `ftl-${Date.now()}`,
      timestamp: '2026-09-05 09:35',
      title: `Comment added by ${author}`,
      user: author,
      role,
      details: content.length > 80 ? `${content.substring(0, 80)}...` : content,
      type: 'comment'
    };

    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            comments: [...item.comments, newComment],
            timeline: [newTimelineEvent, ...item.timeline]
          };
        }
        return item;
      })
    );
    addToast('Comment added.', 'Discussion thread updated.', 'success');
  }, [addToast]);

  const replyToComment = useCallback((feedbackId: string, commentId: string, content: string, author: string, role: string) => {
    const newReply: FeedbackCommentReply = {
      id: `reply-${Date.now()}`,
      author,
      role,
      createdAt: '2026-09-05 09:35',
      content
    };

    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            comments: item.comments.map((c) => {
              if (c.id === commentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newReply]
                };
              }
              return c;
            })
          };
        }
        return item;
      })
    );
    addToast('Reply added.', 'Your reply has been posted.', 'success');
  }, [addToast]);

  const deleteComment = useCallback((feedbackId: string, commentId: string) => {
    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            comments: item.comments.filter((c) => c.id !== commentId)
          };
        }
        return item;
      })
    );
    addToast('Comment removed.', 'Your comment was deleted.', 'info');
  }, [addToast]);

  const deleteFeedback = useCallback((id: string) => {
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    if (selectedFeedback?.id === id) {
      setSelectedFeedbackState(null);
    }
    addToast('Feedback deleted.', `${id} has been removed.`, 'info');
  }, [selectedFeedback, addToast]);

  return (
    <FeedbackContext.Provider
      value={{
        feedback,
        filteredFeedback,
        selectedFeedback,
        filters,
        sortField,
        sortDirection,
        page,
        pageSize,
        totalPages,
        totalCount: filteredFeedback.length,
        metrics,
        setFilters,
        updateFilter,
        clearFilters,
        setSelectedFeedback,
        setSort,
        setPage,
        setPageSize,
        createFeedback,
        updateFeedback,
        changeStatus,
        addComment,
        replyToComment,
        deleteComment,
        deleteFeedback,
        filterByMetricCard
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
