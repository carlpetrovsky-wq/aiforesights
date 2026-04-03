-- Inquiries table for contact form submissions
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  name varchar(200) not null,
  email varchar(320) not null,
  inquiry_type varchar(50) default 'general',
  message text not null,
  status varchar(32) default 'new',
  created_at timestamptz default now(),
  responded_at timestamptz
);

create index if not exists inquiries_email_idx on inquiries(email);
create index if not exists inquiries_status_idx on inquiries(status);
create index if not exists inquiries_created_idx on inquiries(created_at desc);
