import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AccessDeniedModal from './components/AccessDeniedModal';
import ExportModal from './components/ExportModal';
import ExecutiveSummaryView from './views/ExecutiveSummaryView';
import FeedbackDataGrid from './views/FeedbackDataGrid';
import IsbnDeepDiveView from './views/IsbnDeepDiveView';
import BookTitleMatrixView from './views/BookTitleMatrixView';
import PositiveFeedbackView from './views/PositiveFeedbackView';
import NegativeFeedbackView from './views/NegativeFeedbackView';
import RatingAnalyticsView from './views/RatingAnalyticsView';
import ExportHubView from './views/ExportHubView';
import FeedbackSubmitView from './views/FeedbackSubmitView';

export default function App() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedIsbn, setSelectedIsbn] = useState('9781234567890');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportIsbnTarget, setExportIsbnTarget] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectIsbn = (isbn) => {
    setSelectedIsbn(isbn);
    setActiveTab('isbn');
  };

  const handleOpenExport = (isbn = '') => {
    setExportIsbnTarget(typeof isbn === 'string' ? isbn : '');
    setIsExportOpen(true);
  };

  const handleFeedbackSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header */}
      <Navbar onOpenSubmitModal={() => setIsSubmitOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenExportModal={() => handleOpenExport('')}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {/* Strict Role Guard: Only Admin Can Access this Module */}
          {!isAdmin ? (
            <AccessDeniedModal />
          ) : (
            <div key={refreshKey} className="max-w-7xl mx-auto">
              {activeTab === 'summary' && (
                <ExecutiveSummaryView
                  onSelectTab={setActiveTab}
                  onSelectIsbn={handleSelectIsbn}
                  onOpenExportModal={() => handleOpenExport('')}
                />
              )}

              {activeTab === 'grid' && (
                <FeedbackDataGrid
                  onSelectIsbn={handleSelectIsbn}
                  onOpenExportModal={() => handleOpenExport('')}
                />
              )}

              {activeTab === 'isbn' && (
                <IsbnDeepDiveView
                  initialIsbn={selectedIsbn}
                  onOpenExportModal={(isbn) => handleOpenExport(isbn)}
                />
              )}

              {activeTab === 'titles' && (
                <BookTitleMatrixView
                  onSelectIsbn={handleSelectIsbn}
                />
              )}

              {activeTab === 'positive' && (
                <PositiveFeedbackView
                  onSelectIsbn={handleSelectIsbn}
                  onOpenExportModal={() => handleOpenExport('')}
                />
              )}

              {activeTab === 'negative' && (
                <NegativeFeedbackView
                  onSelectIsbn={handleSelectIsbn}
                  onOpenExportModal={() => handleOpenExport('')}
                />
              )}

              {activeTab === 'analytics' && (
                <RatingAnalyticsView
                  onOpenExportModal={() => handleOpenExport('')}
                />
              )}

              {activeTab === 'export-hub' && (
                <ExportHubView />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        defaultIsbn={exportIsbnTarget}
      />

      {/* Customer Feedback Simulator Modal */}
      <FeedbackSubmitView
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={handleFeedbackSubmitted}
      />
    </div>
  );
}

