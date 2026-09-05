-- Adds the notifications table to an already-running database (schema.sql
-- already has it for fresh installs). Safe to re-run.
CREATE TABLE IF NOT EXISTS technical_query_notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    query_id    BIGINT NOT NULL REFERENCES technical_queries(id) ON DELETE CASCADE,
    type        VARCHAR(40) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tqn_user_unread ON technical_query_notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tqn_query_id    ON technical_query_notifications (query_id);
