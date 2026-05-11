node -e "
process.env.DATABASE_URL = 'postgresql://postgres.nysarslxjolwywhzveph:BikemetSecure2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
import('./push_schema.js');
"
