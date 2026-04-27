CREATE TABLE IF NOT EXISTS conversations (
    id         VARCHAR(64)  PRIMARY KEY,
    title      VARCHAR(255) NOT NULL DEFAULT 'New conversation',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
