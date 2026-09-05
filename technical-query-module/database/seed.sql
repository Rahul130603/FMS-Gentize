-- =====================================================================
-- Sample seed data for the Technical Query Management System.
-- Produces ~2 years of realistic history so every Reports screen
-- (trend charts, resolution performance, pending aging, reopened
-- report, ISBN report, employee report) has meaningful data to show.
--
-- Safe to run repeatedly against a fresh database (run schema.sql
-- first). Not idempotent — do not run twice against the same DB
-- without truncating first.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------
INSERT INTO departments (name) VALUES
    ('Editorial'), ('Production'), ('Cover Design'), ('IT Support'),
    ('Quality Control'), ('Administration'), ('Sales & Marketing')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (employee_code, full_name, email, role, department_id, is_active) VALUES
    ('EMP-1001', 'Anita Sharma',     'anita.sharma@fms.local',     'employee', 1, true),
    ('EMP-1002', 'Ravi Kumar',       'ravi.kumar@fms.local',       'employee', 2, true),
    ('EMP-1003', 'Fatima Noor',      'fatima.noor@fms.local',      'employee', 3, true),
    ('EMP-1004', 'John D''Souza',    'john.dsouza@fms.local',      'employee', 2, true),
    ('EMP-1005', 'Priya Menon',      'priya.menon@fms.local',      'employee', 5, true),
    ('EMP-1006', 'Suresh Babu',      'suresh.babu@fms.local',      'employee', 1, true),
    ('EMP-1007', 'Neha Verma',       'neha.verma@fms.local',       'employee', 7, true),
    ('EMP-1008', 'Arjun Rao',        'arjun.rao@fms.local',        'employee', 2, true),
    ('ADM-2001', 'Vikram Malhotra',  'vikram.malhotra@fms.local',  'admin',      4, true),
    ('ADM-2002', 'Sunita Iyer',      'sunita.iyer@fms.local',      'admin',      4, true),
    ('ADM-2003', 'Karan Chopra',     'karan.chopra@fms.local',     'super_admin',4, true)
ON CONFLICT (employee_code) DO NOTHING;

-- ---------------------------------------------------------------------
-- Generate ~220 technical queries spread across the last 24 months
-- ---------------------------------------------------------------------
DO $$
DECLARE
    categories   VARCHAR[] := ARRAY['download_issue','upload_issue','missing_file','software_bug',
                                     'access_issue','server_issue','network_issue','performance_issue','other'];
    priorities   VARCHAR[] := ARRAY['low','normal','normal','high','high','urgent'];
    employees    INTEGER[] := ARRAY[1,2,3,4,5,6,7,8];   -- users.id of employees (seeded above, offset 1..8)
    admins       INTEGER[] := ARRAY[9,10];              -- Vikram, Sunita
    subjects     VARCHAR[] := ARRAY[
        'Unable to download final proof PDF',
        'Upload stuck at 42 percent',
        'Cover artwork file missing from repository',
        'Application crashes when opening large manuscript',
        'Cannot access shared drive for POD files',
        'Server timeout while generating QC report',
        'VPN drops during file transfer',
        'Dashboard loads very slowly after latest update',
        'ISBN barcode not generating correctly',
        'Duplicate files appearing after sync',
        'Login session expires too quickly',
        'Print-ready file corrupted after export',
        'Metadata mismatch between systems',
        'Notification emails not being received',
        'File allocation queue not updating in real time'
    ];
    isbns        VARCHAR[] := ARRAY['978-93-5234-101-2','978-93-5234-102-9','978-93-5234-103-6',
                                     '978-93-5234-104-3','978-93-5234-105-0', NULL, NULL];
    v_id          BIGINT;
    v_category    VARCHAR;
    v_priority    VARCHAR;
    v_status      VARCHAR;
    v_created     TIMESTAMPTZ;
    v_resolved    TIMESTAMPTZ;
    v_closed      TIMESTAMPTZ;
    v_emp         INTEGER;
    v_admin       INTEGER;
    v_emp_name    VARCHAR;
    v_emp_role    VARCHAR;
    v_dept        VARCHAR;
    v_admin_name  VARCHAR;
    v_subject     VARCHAR;
    v_isbn        VARCHAR;
    v_qnum        VARCHAR;
    v_year        INTEGER;
    v_roll        FLOAT;
    i             INTEGER;
BEGIN
    FOR i IN 1..220 LOOP
        v_created   := now() - (random() * 730 || ' days')::interval - (random() * 24 || ' hours')::interval;
        v_year      := EXTRACT(YEAR FROM v_created);
        v_category  := categories[1 + floor(random() * array_length(categories,1))::int];
        v_priority  := priorities[1 + floor(random() * array_length(priorities,1))::int];
        v_emp       := employees[1 + floor(random() * array_length(employees,1))::int];
        v_admin     := admins[1 + floor(random() * array_length(admins,1))::int];
        v_subject   := subjects[1 + floor(random() * array_length(subjects,1))::int];
        v_isbn      := isbns[1 + floor(random() * array_length(isbns,1))::int];

        SELECT full_name, role, d.name INTO v_emp_name, v_emp_role, v_dept
        FROM users u JOIN departments d ON d.id = u.department_id WHERE u.id = v_emp;

        SELECT full_name INTO v_admin_name FROM users WHERE id = v_admin;

        v_roll := random();
        IF v_roll < 0.30 THEN
            v_status := 'open';
            v_resolved := NULL; v_closed := NULL;
        ELSIF v_roll < 0.42 THEN
            v_status := 'in_review';
            v_resolved := NULL; v_closed := NULL;
        ELSIF v_roll < 0.55 THEN
            v_status := 'in_progress';
            v_resolved := NULL; v_closed := NULL;
        ELSIF v_roll < 0.80 THEN
            v_status := 'resolved';
            v_resolved := v_created + (random() * 96 || ' hours')::interval;
            v_closed := NULL;
        ELSIF v_roll < 0.94 THEN
            v_status := 'closed';
            v_resolved := v_created + (random() * 72 || ' hours')::interval;
            v_closed := v_resolved + (random() * 48 || ' hours')::interval;
        ELSE
            v_status := 'reopened';
            v_resolved := v_created + (random() * 60 || ' hours')::interval;
            v_closed := NULL;
        END IF;

        -- Year-scoped sequential query number (mirrors tq_generate_query_number)
        INSERT INTO tq_number_sequences(year, last_value) VALUES (v_year, 1)
            ON CONFLICT (year) DO UPDATE SET last_value = tq_number_sequences.last_value + 1;
        v_qnum := 'TQ-' || v_year || '-' || LPAD((SELECT last_value FROM tq_number_sequences WHERE year = v_year)::TEXT, 6, '0');

        INSERT INTO technical_queries (
            query_number, raised_by_id, raised_by_name, raised_by_role, department,
            isbn, subject, category, priority, description,
            status, assigned_to, assigned_to_name,
            resolution_notes, admin_notes, reopen_count, reopen_reason,
            created_at, updated_at, resolved_at, closed_at
        ) VALUES (
            v_qnum, v_emp, v_emp_name, v_emp_role, v_dept,
            v_isbn, v_subject, v_category, v_priority,
            v_subject || '. Reported by ' || v_emp_name || ' in ' || v_dept || '. ' ||
                'Occurs consistently when performing the related action in the FMS module. ' ||
                'Please investigate at earliest convenience.',
            v_status,
            CASE WHEN v_status = 'open' THEN NULL ELSE v_admin END,
            CASE WHEN v_status = 'open' THEN NULL ELSE v_admin_name END,
            CASE WHEN v_status IN ('resolved','closed','reopened')
                 THEN 'Issue diagnosed and fixed. Verified with the reporting employee before closing.'
                 ELSE NULL END,
            CASE WHEN v_status <> 'open' THEN 'Internal: triaged and assigned to ' || v_admin_name || '.' ELSE NULL END,
            CASE WHEN v_status = 'reopened' THEN 1 ELSE 0 END,
            CASE WHEN v_status = 'reopened' THEN 'Issue resurfaced after initial fix; same symptoms reported again.' ELSE NULL END,
            v_created, COALESCE(v_closed, v_resolved, v_created), v_resolved, v_closed
        ) RETURNING id INTO v_id;

        -- Audit trail: created
        INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, new_status, note, created_at)
        VALUES (v_id, v_emp, v_emp_name, 'created', 'open', 'Query raised by employee.', v_created);

        IF v_status <> 'open' THEN
            INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, old_status, new_status, note, created_at)
            VALUES (v_id, v_admin, v_admin_name, 'assigned', 'open', 'open', 'Assigned to ' || v_admin_name || '.', v_created + interval '2 hours');

            INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, old_status, new_status, note, created_at)
            VALUES (v_id, v_admin, v_admin_name, 'status_changed', 'open', v_status, 'Status updated to ' || v_status || '.', COALESCE(v_resolved, v_created + interval '5 hours'));
        END IF;

        IF v_resolved IS NOT NULL THEN
            INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, old_status, new_status, note, created_at)
            VALUES (v_id, v_admin, v_admin_name, 'resolved', 'in_progress', 'resolved', 'Marked resolved with resolution notes.', v_resolved);
        END IF;

        IF v_closed IS NOT NULL THEN
            INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, old_status, new_status, note, created_at)
            VALUES (v_id, v_admin, v_admin_name, 'closed', 'resolved', 'closed', 'Query closed after employee confirmation.', v_closed);
        END IF;

        IF v_status = 'reopened' THEN
            INSERT INTO technical_query_events (query_id, actor_id, actor_name, event_type, old_status, new_status, note, created_at)
            VALUES (v_id, v_emp, v_emp_name, 'reopened', 'resolved', 'reopened', 'Employee reported the issue again.', v_resolved + interval '3 days');
        END IF;

        -- A couple of comments for realism
        INSERT INTO technical_query_comments (query_id, user_id, user_name, user_role, comment, is_internal, created_at)
        VALUES
            (v_id, v_emp, v_emp_name, v_emp_role, 'Can someone please look into this soon? It is blocking my work.', false, v_created + interval '1 hour');

        IF v_status <> 'open' THEN
            INSERT INTO technical_query_comments (query_id, user_id, user_name, user_role, comment, is_internal, created_at)
            VALUES (v_id, v_admin, v_admin_name, 'admin', 'Thanks for reporting — looking into this now.', false, v_created + interval '3 hours');
        END IF;

        -- Occasional attachment metadata row (no binary file included in seed)
        IF random() < 0.4 THEN
            INSERT INTO technical_query_attachments (query_id, filename, original_name, filepath, mime_type, size_bytes, uploaded_by, uploaded_at)
            VALUES (v_id, 'seed_screenshot_' || v_id || '.png', 'screenshot.png',
                    '/uploads/technical-queries/seed_screenshot_' || v_id || '.png',
                    'image/png', 245760, v_emp, v_created + interval '5 minutes');
        END IF;
    END LOOP;
END $$;

COMMIT;
