-- Adds the ISBN Mismatch category to an already-running database (schema.sql
-- already has it for fresh installs). Safe to re-run.
INSERT INTO tq_categories (code, label, sort_order)
VALUES ('isbn_mismatch', 'ISBN Mismatch', 0)
ON CONFLICT (code) DO NOTHING;
