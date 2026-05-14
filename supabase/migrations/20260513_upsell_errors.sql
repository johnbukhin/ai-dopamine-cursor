-- Table for logging failed / skipped one-click upsell attempts.
-- Rows are written by api/create-upsell.js for post-hoc investigation.
create table if not exists upsell_errors (
    id                  bigint generated always as identity primary key,
    created_at          timestamptz not null default now(),
    user_email          text,
    stripe_customer_id  text,
    price_id            text,
    currency            text,
    reason              text not null,  -- 'customer_not_found' | 'no_pm' | 'stripe_error' | 'requires_action'
    raw_error           text
);

-- Service role writes; no user-facing reads needed.
alter table upsell_errors enable row level security;
