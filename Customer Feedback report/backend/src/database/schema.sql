-- Schema for Customer Feedback & Critic Report Module
-- Maintains permanent historical customer feedback across years.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_feedback (
    id TEXT PRIMARY KEY,
    feedback_number TEXT UNIQUE NOT NULL,
    isbn TEXT NOT NULL,
    title TEXT NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('POSITIVE', 'NEGATIVE')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    customer_name TEXT,
    customer_company TEXT,
    comment TEXT NOT NULL,
    appreciation_message TEXT,
    critic_message TEXT,
    critic_category TEXT, -- e.g. 'Cover Alignment', 'Spine Alignment', 'Color Shift', 'Page Bleed', 'Delayed Delivery', 'Binding Quality', 'Print Contrast', 'Trim Margin'
    submitted_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fast Indexing for 5-10+ years analytics queries
CREATE INDEX IF NOT EXISTS idx_feedback_isbn ON customer_feedback(isbn);
CREATE INDEX IF NOT EXISTS idx_feedback_title ON customer_feedback(title);
CREATE INDEX IF NOT EXISTS idx_feedback_type_rating ON customer_feedback(feedback_type, rating);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON customer_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_feedback_critic_category ON customer_feedback(critic_category);

