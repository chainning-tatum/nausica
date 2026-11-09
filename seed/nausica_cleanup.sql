-- Nausica: remove the test users and all of their entries.
-- Only matches users tagged 'nausica-test-seed'. Prompts are left in place on purpose:
-- the app needs a prompt for each day, and real entries may already use them.

begin;

delete from public.entries
  where user_id in (select id from auth.users where raw_app_meta_data->>'seed' = 'nausica-test-seed');
delete from auth.identities
  where user_id in (select id from auth.users where raw_app_meta_data->>'seed' = 'nausica-test-seed');
delete from auth.users where raw_app_meta_data->>'seed' = 'nausica-test-seed';

select 'done' as status;

commit;
