insert into public.site_settings (key, value) values ('recruitment', '{"open": false}'::jsonb)
on conflict (key) do nothing;
