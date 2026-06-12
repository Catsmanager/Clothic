alter table profiles
  add column if not exists daily_reminder_enabled boolean not null default true,
  add column if not exists sleeping_wardrobe_enabled boolean not null default false;
