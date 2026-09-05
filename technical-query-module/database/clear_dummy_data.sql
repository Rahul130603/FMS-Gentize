-- Removes all seeded demo technical queries (and their cascaded events,
-- comments, attachments) so the module starts clean. Lookup tables, the
-- demo users/departments and the login roster are left untouched so the
-- app keeps working. Safe to re-run.
TRUNCATE TABLE technical_queries RESTART IDENTITY CASCADE;
TRUNCATE TABLE tq_number_sequences;
