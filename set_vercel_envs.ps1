# PowerShell script to set Vercel environment variables for the bikemate-web project
# Prerequisites:
#   - Node.js installed
#   - Vercel CLI installed globally: npm i -g vercel
#   - You are logged in: vercel login

$project = "bikemate-web"
$team = "ashish-ganguly-bikemet"

function Add-Env($key, $value) {
    foreach ($target in @('production', 'preview', 'development')) {
        Write-Host "Adding $key for $target..."
        vercel env add $key $target --yes --project $project --team $team <<EOF
$value
EOF
    }
}

Add-Env "DATABASE_URL" "postgresql://postgres.nysarslxjolwywhzveph:BikemetSecure2026!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
Add-Env "JWT_SECRET" "bikemate_super_secret_jwt_key_here_change_me"
Add-Env "RAZORPAY_KEY_SECRET" "bRl7gckaRECv5wNF7Xuv5w8I"
Add-Env "SMTP_HOST" "smtp.gmail.com"
Add-Env "SMTP_PORT" "465"
Add-Env "SMTP_USER" "ashishganguly122@gmail.com"
Add-Env "SMTP_PASS" "Anandamayee@2026"
Add-Env "NEXT_PUBLIC_APP_URL" "https://bikemet.in"
Add-Env "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "AIzaSyD1F7Z6b2Yd4NJYCh1qxBkpo48rf_4E6aQ"
Add-Env "NEXT_PUBLIC_RAZORPAY_KEY_ID" "rzp_live_SSgqwuCOnwyGBM"
Add-Env "NEXT_PUBLIC_FIREBASE_API_KEY" "AIzaSyDFwpTRF0UqaO9w_h7LqHksheLJpAVCc2A"
Add-Env "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "bikemet-2def3.firebaseapp.com"
Add-Env "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "bikemet-2def3"
Add-Env "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "bikemet-2def3.firebasestorage.app"
Add-Env "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "207731626181"
Add-Env "NEXT_PUBLIC_FIREBASE_APP_ID" "1:207731626181:web:6bcd0be1e4b36572a8a0ac"

Write-Host "All variables added. Now trigger a redeploy in Vercel dashboard or via CLI:"
Write-Host "   vercel --prod --scope $team --project $project"
