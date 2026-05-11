$envVars = @{
  "NEXT_PUBLIC_APP_URL" = "https://bikemet.in"
  "DATABASE_URL" = "postgresql://postgres.nysarslxjolwywhzveph:BikemetSecure2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  "JWT_SECRET" = "bikemate_super_secret_jwt_key_here_change_me"
  "RAZORPAY_KEY_SECRET" = "bRl7gckaRECv5wNF7Xuv5w8I"
  "SMTP_HOST" = "smtp.gmail.com"
  "SMTP_PORT" = "465"
  "SMTP_USER" = "ashishganguly122@gmail.com"
  "SMTP_PASS" = "Anandamayee@2026"
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" = "AIzaSyD1F7Z6b2Yd4NJYCh1qxBkpo48rf_4E6aQ"
  "NEXT_PUBLIC_RAZORPAY_KEY_ID" = "rzp_live_SSgqwuCOnwyGBM"
}

foreach ($key in $envVars.Keys) {
  echo $envVars[$key] | npx vercel env rm $key production --scope elitespadata-1057s-projects --yes
  echo $envVars[$key] | npx vercel env add $key production --scope elitespadata-1057s-projects
}
