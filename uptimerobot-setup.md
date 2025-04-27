# TrialSage™ Replit Resilience Configuration

This document provides instructions for setting up UptimeRobot to keep your TrialSage deployment on Replit awake and responsive.

## Server-Side Resilience Implemented:

✅ Created server-side keep-alive mechanism (`server/keep-alive.js`)
✅ Added prewarm endpoint at `/api/prewarm`
✅ Added route for `client-portal-direct.html` for reliable client portal access
✅ Implemented auto-login functionality in direct client portal page

## Client-Side Resilience Implemented:

✅ Updated auto-login to redirect to more reliable direct client portal
✅ Added prewarm functionality to client portal pages
✅ Implemented auto-login on client-portal-direct.html
✅ Added delay during authentication redirects

## UptimeRobot Setup Instructions

To maximize TrialSage uptime on Replit, follow these steps to set up UptimeRobot:

1. **Create an UptimeRobot Account**
   - Go to https://uptimerobot.com/
   - Sign up for a free account if you don't already have one

2. **Add a New Monitor**
   - After logging in, click "Add New Monitor"
   - Configure with these settings:
     - **Monitor Type**: HTTP(s)
     - **Friendly Name**: TrialSage Replit Keep Alive
     - **URL to Monitor**: Your Replit app URL (e.g., https://your-trialsage.replit.app/)
     - **Monitoring Interval**: 5 minutes (the minimum allowed on free plan)
   - Click Save

3. **Add a Secondary Monitor for the Prewarm Endpoint**
   - Click "Add New Monitor" again
   - Configure with these settings:
     - **Monitor Type**: HTTP(s)
     - **Friendly Name**: TrialSage API Prewarm
     - **URL to Monitor**: Your Replit app URL + /api/prewarm (e.g., https://your-trialsage.replit.app/api/prewarm)
     - **Monitoring Interval**: 5 minutes
   - Click Save

4. **Verify Monitors Are Working**
   - On the UptimeRobot dashboard, both monitors should show as "Up"
   - You can check the response time to confirm they're responding

## Additional Resilience Recommendations

1. **Access Through Direct URL**
   - For most reliable access, use the direct client portal URL:
   ```
   https://your-trialsage.replit.app/client-portal-direct
   ```

2. **Browser Bookmarking**
   - Bookmark the `/client-portal-direct` URL for quick access
   - This bypasses potential issues with the standard login flow

3. **Alternative Options**
   - If UptimeRobot reaches its monitor limit (50 on free plan):
     - Consider using Cron-job.org as an alternative service
     - Or set up a simple GitHub action to ping your app

4. **Long-Term Planning**
   - These resilience measures will improve reliability but are not a permanent solution
   - Consider migrating to a production hosting platform (Vercel, Railway, etc.) in the future

By implementing these measures, TrialSage will maintain much more reliable uptime and responsiveness on the Replit platform.