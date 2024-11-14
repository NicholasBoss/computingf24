
-- Account Type Creation
DROP TYPE IF EXISTS account_type CASCADE;
CREATE TYPE account_type AS ENUM
('Guest', 'Client', 'Employee', 'Admin', 'DBA');

-- Account Table Creation
DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE IF NOT EXISTS account
(
    account_id SERIAL,
    account_firstname CHARACTER VARYING NOT NULL,
    account_lastname CHARACTER VARYING NOT NULL,
    account_email CHARACTER VARYING NOT NULL,
    account_phone CHARACTER VARYING NULL,
    account_pref_phone BOOLEAN NULL DEFAULT FALSE,
    account_pref_email BOOLEAN NULL DEFAULT FALSE,
    account_password CHARACTER VARYING NULL,
    account_type account_type NOT NULL DEFAULT 'Guest'::account_type,
    account_tos BOOLEAN NULL DEFAULT FALSE,
    CONSTRAINT account_pk PRIMARY KEY (account_id)
);
