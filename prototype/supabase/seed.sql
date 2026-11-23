-- Loads the FICTIONAL sample data (サンプル). Run AFTER the 9 migrations and AFTER
-- `npm run demo:accounts`, so seeded actions are attributed to the demo employees S1001–S1010.
-- Safe to re-run: it wipes business data (never accounts) and seeds again.
select public.reset_demo_business_data();
