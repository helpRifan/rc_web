-- Natural pixel size of each gallery photo, so the grid can show photos uncropped (gallery brief 6.4).
-- Both are optional: without them the grid falls back to 3:2 crops.
alter table public.gallery_items
  add column width int check (width > 0),
  add column height int check (height > 0);
