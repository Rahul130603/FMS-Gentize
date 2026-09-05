-- =====================================================================
-- Technical Query Management & Reporting System
-- Database schema (PostgreSQL 13+)
--
-- This module is designed to be dropped into an existing File
-- Management System (FMS). It assumes the host application already
-- has a `users` table (employees + admins) and a `departments` table.
-- If those do not exist yet, the minimal compatible versions below
-- are provided behind `IF NOT EXISTS` so this script is safe to run
-- standalone for development/demo purposes. When integrating into the
-- real FMS, simply skip creating `users`/`departments` (or point the
-- foreign keys at the existing tables of the same shape) and run the
-- `technical_query_*` tables only.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- fuzzy / partial text search

-- ---------------------------------------------------------------------
-- Minimal compatibility tables (skip if the host FMS already has these)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    employee_code   VARCHAR(40) UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    role            VARCHAR(30)  NOT NULL DEFAULT 'employee', -- employee | admin | super_admin
    department_id   INTEGER REFERENCES departments(id),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Lookup tables for controlled vocabularies (keeps values normalized &
-- easy to extend without touching application code / enums)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tq_categories (
    id      SERIAL PRIMARY KEY,
    code    VARCHAR(40) NOT NULL UNIQUE,
    label   VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO tq_categories (code, label, sort_order) VALUES
    ('isbn_mismatch',    'ISBN Mismatch',    1),
    ('download_issue',   'Download Issue',   2),
    ('upload_issue',     'Upload Issue',     3),
    ('missing_file',     'Missing File',     4),
    ('software_bug',     'Software Bug',     5),
    ('access_issue',     'Access Issue',     6),
    ('server_issue',     'Server Issue',     7),
    ('network_issue',    'Network Issue',    8),
    ('performance_issue','Performance Issue',9),
    ('other',            'Other',            10)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS tq_priorities (
    id      SERIAL PRIMARY KEY,
    code    VARCHAR(20) NOT NULL UNIQUE,
    label   VARCHAR(40) NOT NULL,
    rank    SMALLINT NOT NULL -- higher = more urgent, used for sorting/escalation
);

INSERT INTO tq_priorities (code, label, rank) VALUES
    ('low',    'Low',    1),
    ('normal', 'Normal', 2),
    ('high',   'High',   3),
    ('urgent', 'Urgent', 4)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS tq_statuses (
    id      SERIAL PRIMARY KEY,
    code    VARCHAR(20) NOT NULL UNIQUE,
    label   VARCHAR(40) NOT NULL,
    color   VARCHAR(20) NOT NULL,   -- semantic color token used by StatusBadge
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_terminal BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO tq_statuses (code, label, color, sort_order, is_terminal) VALUES
    ('open',        'Open',        'blue',   1, false),
    ('in_review',   'In Review',   'indigo', 2, false),
    ('in_progress', 'In Progress', 'amber',  3, false),
    ('resolved',    'Resolved',    'green',  4, false),
    ('closed',      'Closed',      'gray',   5, true),
    ('reopened',    'Reopened',    'red',    6, false),
    ('archived',    'Archived',    'slate',  7, true)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------
-- Sequence-backed, year-scoped query number generator
-- Produces: TQ-2026-000001
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tq_number_sequences (
    year            INTEGER PRIMARY KEY,
    last_value      BIGINT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION tq_generate_query_number() RETURNS VARCHAR AS $$
DECLARE
    v_year   INTEGER := EXTRACT(YEAR FROM now());
    v_next   BIGINT;
BEGIN
    INSERT INTO tq_number_sequences (year, last_value)
    VALUES (v_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_value = tq_number_sequences.last_value + 1
    RETURNING last_value INTO v_next;

    RETURN 'TQ-' || v_year || '-' || LPAD(v_next::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Core table: technical_queries
-- Every row is permanent (soft states only; no hard deletes) so the
-- table doubles as the long-term knowledge base described by the
-- Reports module.
-- ---------------------------------------------------------------------
CREATE TABLE technical_queries (
    id                  BIGSERIAL PRIMARY KEY,
    query_number        VARCHAR(20) NOT NULL UNIQUE DEFAULT tq_generate_query_number(),

    -- Raised by (denormalized snapshot so history survives org changes,
    -- e.g. an employee later transferring department or leaving)
    raised_by_id        INTEGER NOT NULL REFERENCES users(id),
    raised_by_name      VARCHAR(150) NOT NULL,
    raised_by_role      VARCHAR(30)  NOT NULL,
    department          VARCHAR(120) NOT NULL,

    -- Query content
    isbn                VARCHAR(30),
    subject             VARCHAR(200) NOT NULL,
    category            VARCHAR(40)  NOT NULL REFERENCES tq_categories(code),
    priority             VARCHAR(20)  NOT NULL REFERENCES tq_priorities(code) DEFAULT 'normal',
    description         TEXT NOT NULL,

    -- Workflow
    status              VARCHAR(20)  NOT NULL REFERENCES tq_statuses(code) DEFAULT 'open',
    assigned_to         INTEGER REFERENCES users(id),
    assigned_to_name    VARCHAR(150),

    -- Resolution
    resolution_notes    TEXT,
    admin_notes         TEXT,          -- internal-only notes, never shown to employees
    reopen_count        SMALLINT NOT NULL DEFAULT 0,
    reopen_reason       TEXT,

    -- Request-more-info workflow
    info_requested_at   TIMESTAMPTZ,
    info_requested_note TEXT,

    -- Client context captured at submission time (optional, per spec)
    ip_address          VARCHAR(64),
    browser             VARCHAR(255),

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at         TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,

    -- Full text search vector, kept in sync by trigger below
    search_vector       tsvector
);

-- Indexes tuned for the exact filters/sorts the Admin grid & Reports use
CREATE INDEX idx_tq_status            ON technical_queries (status);
CREATE INDEX idx_tq_priority          ON technical_queries (priority);
CREATE INDEX idx_tq_category          ON technical_queries (category);
CREATE INDEX idx_tq_raised_by         ON technical_queries (raised_by_id);
CREATE INDEX idx_tq_assigned_to       ON technical_queries (assigned_to);
CREATE INDEX idx_tq_department        ON technical_queries (department);
CREATE INDEX idx_tq_isbn              ON technical_queries (isbn);
CREATE INDEX idx_tq_created_at        ON technical_queries (created_at DESC);
CREATE INDEX idx_tq_updated_at        ON technical_queries (updated_at DESC);
CREATE INDEX idx_tq_status_priority   ON technical_queries (status, priority);
CREATE INDEX idx_tq_search_vector     ON technical_queries USING GIN (search_vector);
CREATE INDEX idx_tq_subject_trgm      ON technical_queries USING GIN (subject gin_trgm_ops);
CREATE INDEX idx_tq_query_number_trgm ON technical_queries USING GIN (query_number gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Audit / activity log — append-only, one row per action, never edited.
-- ---------------------------------------------------------------------
CREATE TABLE technical_query_events (
    id          BIGSERIAL PRIMARY KEY,
    query_id    BIGINT NOT NULL REFERENCES technical_queries(id) ON DELETE CASCADE,
    actor_id    INTEGER REFERENCES users(id),
    actor_name  VARCHAR(150),
    event_type  VARCHAR(40) NOT NULL,
        -- created | assigned | reassigned | priority_changed | status_changed
        -- | comment_added | note_added | info_requested | info_provided
        -- | resolved | closed | reopened | archived | attachment_added
    old_status  VARCHAR(20),
    new_status  VARCHAR(20),
    note        TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tqe_query_id    ON technical_query_events (query_id, created_at);
CREATE INDEX idx_tqe_event_type  ON technical_query_events (event_type);
CREATE INDEX idx_tqe_actor       ON technical_query_events (actor_id);

-- ---------------------------------------------------------------------
-- Comments — visible discussion thread between employee & admins
-- ---------------------------------------------------------------------
CREATE TABLE technical_query_comments (
    id          BIGSERIAL PRIMARY KEY,
    query_id    BIGINT NOT NULL REFERENCES technical_queries(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    user_name   VARCHAR(150) NOT NULL,
    user_role   VARCHAR(30) NOT NULL,
    comment     TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false, -- true = admin-only internal note
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tqc_query_id ON technical_query_comments (query_id, created_at);
CREATE INDEX idx_tqc_comment_trgm ON technical_query_comments USING GIN (comment gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Attachments
-- ---------------------------------------------------------------------
CREATE TABLE technical_query_attachments (
    id            BIGSERIAL PRIMARY KEY,
    query_id      BIGINT NOT NULL REFERENCES technical_queries(id) ON DELETE CASCADE,
    filename      VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    filepath      VARCHAR(500) NOT NULL,
    mime_type     VARCHAR(120) NOT NULL,
    size_bytes    BIGINT NOT NULL,
    uploaded_by   INTEGER REFERENCES users(id),
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tqa_query_id ON technical_query_attachments (query_id);

-- ---------------------------------------------------------------------
-- Notifications — in-app alerts. Admins are notified when a new query is
-- raised; the employee who raised it is notified when it's resolved.
-- ---------------------------------------------------------------------
CREATE TABLE technical_query_notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    query_id    BIGINT NOT NULL REFERENCES technical_queries(id) ON DELETE CASCADE,
    type        VARCHAR(40) NOT NULL, -- query_raised | query_resolved
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tqn_user_unread ON technical_query_notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_tqn_query_id    ON technical_query_notifications (query_id);

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

-- Keep updated_at fresh on every mutation
CREATE OR REPLACE FUNCTION tq_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tq_updated_at
    BEFORE UPDATE ON technical_queries
    FOR EACH ROW EXECUTE FUNCTION tq_set_updated_at();

-- Maintain full text search vector across the fields the Search Engine
-- must cover (query number, ISBN, subject, description, category,
-- resolution notes). Comments are searched separately via a join view.
CREATE OR REPLACE FUNCTION tq_set_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.query_number, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.subject, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.isbn, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.resolution_notes, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.admin_notes, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tq_search_vector
    BEFORE INSERT OR UPDATE ON technical_queries
    FOR EACH ROW EXECUTE FUNCTION tq_set_search_vector();

-- ---------------------------------------------------------------------
-- Reporting views — pre-shaped read models so report endpoints stay
-- simple, fast, and consistent between the dashboard and exports.
-- ---------------------------------------------------------------------

-- Resolution time in hours (NULL while unresolved)
CREATE OR REPLACE VIEW v_tq_with_resolution AS
SELECT
    tq.*,
    CASE WHEN tq.resolved_at IS NOT NULL
         THEN EXTRACT(EPOCH FROM (tq.resolved_at - tq.created_at)) / 3600.0
         ELSE NULL END AS resolution_hours,
    CASE WHEN tq.resolved_at IS NULL AND tq.status NOT IN ('closed','archived')
         THEN EXTRACT(EPOCH FROM (now() - tq.created_at)) / 86400.0
         ELSE NULL END AS pending_days
FROM technical_queries tq;

-- Per-employee rollups used by the Employee Report
CREATE OR REPLACE VIEW v_tq_employee_summary AS
SELECT
    raised_by_id,
    raised_by_name,
    department,
    COUNT(*)                                                   AS total_queries,
    COUNT(*) FILTER (WHERE status = 'resolved')                AS resolved_count,
    COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed','archived')) AS pending_count,
    COUNT(*) FILTER (WHERE status = 'reopened')                AS reopened_count,
    ROUND(AVG(resolution_hours)::numeric, 2)                   AS avg_resolution_hours
FROM v_tq_with_resolution
GROUP BY raised_by_id, raised_by_name, department;

-- Per-ISBN rollups used by the ISBN Report
CREATE OR REPLACE VIEW v_tq_isbn_summary AS
SELECT
    isbn,
    COUNT(*)                                     AS total_queries,
    COUNT(DISTINCT category)                     AS distinct_categories,
    COUNT(*) FILTER (WHERE status = 'reopened')   AS reopened_count,
    MAX(created_at)                               AS last_reported_at
FROM technical_queries
WHERE isbn IS NOT NULL AND isbn <> ''
GROUP BY isbn;

-- Per-admin performance used by Resolution Performance report
CREATE OR REPLACE VIEW v_tq_admin_performance AS
SELECT
    assigned_to,
    assigned_to_name,
    COUNT(*)                                                    AS assigned_count,
    COUNT(*) FILTER (WHERE status = 'resolved')                 AS resolved_count,
    COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed','archived')) AS pending_count,
    ROUND(AVG(resolution_hours)::numeric, 2)                    AS avg_resolution_hours,
    ROUND(MIN(resolution_hours)::numeric, 2)                    AS fastest_resolution_hours,
    ROUND(MAX(resolution_hours)::numeric, 2)                    AS slowest_resolution_hours
FROM v_tq_with_resolution
WHERE assigned_to IS NOT NULL
GROUP BY assigned_to, assigned_to_name;

COMMIT;
