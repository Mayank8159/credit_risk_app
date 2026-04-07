# DEPLOYMENT QUICK START GUIDE
## PRISM-CREDIT AI Credit Coach Feature

**Status**: ✅ Ready for Production  
**Last Updated**: Pre-Deployment QA Audit (Complete)

---

## 🚀 DEPLOYMENT IN 3 STEPS

### Step 1: Verify Backend is Running (Render.com)

**Check if backend is online:**
```bash
curl https://credit-risk-app-t54o.onrender.com/docs
```

Expected: Swagger UI loads successfully

**If backend is down:**
```bash
# Log into Render.com dashboard
# Navigate to credit-risk-app-t54o service
# Click "Manual Deploy" to restart
# Wait 2-3 minutes for deployment
```

---

### Step 2: Build APK (Choose One Method)

#### Method A: Using EAS Build (Recommended - Cloud)

```bash
cd frontend

# Ensure Expo CLI is installed
npm install -g eas-cli

# Login to Expo account (if not already logged in)
eas login

# Build APK for Android
eas build --platform android

# Follow prompts:
# - Channel: preview
# - Credentials: Create new if needed
# - Wait for build to complete (5-15 minutes)
```

**Output:** Download APK from Expo dashboard → install on device

---

#### Method B: Local APK Build (Advanced)

```bash
cd frontend

# Install build tools (if not already):
# - Install Android SDK Build-tools 35.x
# - Install Java SDK 17+

# Build APK locally
eas build --platform android --local

# APK will be in ./dist/
```

---

### Step 3: Install & Test on Android Device

**Using ADB:**
```bash
# Connect Android phone via USB (Development Mode enabled)
adb install path/to/app-release.apk

# Or use Expo Go Launcher on phone and scan QR code
```

**Manual Testing Checklist:**
- [ ] App launches successfully
- [ ] Login screen appears
- [ ] Login with demo credentials → Dashboard loads
- [ ] Select a scenario and run risk analysis
- [ ] "PRISM Score" card appears
- [ ] **New:** Tap "Coach" tab → Credit Coach panel opens
- [ ] Type "Why is my score high?" → Assistant responds
- [ ] Adjust what-if sliders → Click "Simulate Impact"
- [ ] Results card shows score delta and recommendations

---

## 🔧 TROUBLESHOOTING

### Issue: "Failed to get coach response"

**Possible Causes:**

1. **Backend URL is wrong**
   - Open: `frontend/src/config/api.js`
   - Verify Android URL: `https://credit-risk-app-t54o.onrender.com/api/v1`
   - Test: `curl https://credit-risk-app-t54o.onrender.com/api/v1/credit-coach/chat -X POST`

2. **Backend is down**
   - Check Render.com dashboard
   - Manually redeploy if needed

3. **Network error (timeout)**
   - Check internet connection
   - Render.com might be slow on cold start (first request)

### Issue: "Invalid coordinates" or Random Crashes

- [ ] Clear app cache: Settings → Apps → PRISM CREDIT → Clear Cache
- [ ] Force close and restart app
- [ ] Reinstall APK

### Issue: What-If Simulator Shows Old Values

- [ ] This is expected while simulating (shows state before submit)
- [ ] After response loads, values update
- [ ] Try adjusting a different slider

---

## 📊 FEATURE QUICK TEST

**Test Case 1: Chat Feature**
```
1. Login → Run Analysis
2. Expected: Green "Low Risk" card OR Red "High Risk" card
3. Tap Coach tab
4. Type: "How can I improve my score?"
5. Expected: AI responds with 3-5 recommendations
6. Verify response appears within 3 seconds
```

**Test Case 2: What-If Simulator**
```
1. From Coach tab, click "What If?" sub-tab
2. Adjust Debt-to-Income from 0.3 to 0.1
3. Click "Simulate Impact"
4. Expected: Score delta shows improvement
5. Verify "Recommendations" card appears below
```

**Test Case 3: Error Handling**
```
1. Turn off WiFi/Mobile data
2. Send a message → Error message appears
3. Verify error message is helpful (not technical)
4. Turn WiFi back on
5. Send message again → Should work
```

---

## 📈 POST-DEPLOYMENT MONITORING

### Key Metrics to Watch

1. **Response Times**
   - Target: <2s (localhost) / <3s (Render)
   - If exceeding: Render server may need scaling

2. **Error Rates**
   - Target: <1% of requests
   - Log errors at: https://credit-risk-app-t54o.onrender.com/logs

3. **Backend Health**
   - Check: https://credit-risk-app-t54o.onrender.com/health (if endpoint exists)
   - Fallback: Try /docs endpoint

### What to Do If Issues Appear

**High Latency (>5s):**
- Increase Render.com plan tier
- Or implement response caching

**500 Errors:**
- Check Render.com logs
- Verify counterfactual_service is working

**CORS Errors:**
- Verify CORS middleware in `backend/src/main.py`
- Check allow_origins includes iOS/Android package

---

## 🔐 SECURITY REMINDERS

✅ **Before Deploying to Production:**

1. **Backend URL**: Uses HTTPS (https://credit-risk-app-t54o.onrender.com)
   - No hardcoded API keys exposed
   - All data passed in request body (no URL params)

2. **Frontend**: No sensitive credentials embedded
   - API URL is public (by design for mobile app)
   - auth token stored in secure storage (handled by auth service)

3. **Data**: No PII logging
   - Risk scores are non-sensitive (0-100)
   - All communication is request-response (stateless)

---

## 📝 FINAL CHECKLIST

Before marking deployment complete:

- [ ] Backend is online and responding
- [ ] APK built successfully
- [ ] App installs on Android device without errors
- [ ] Chat feature works and returns responses
- [ ] What-If simulator works and shows score deltas
- [ ] No crashes when switching tabs
- [ ] Error messages are user-friendly
- [ ] Response times are acceptable (<3s)
- [ ] Feature works on multiple devices (if available)
- [ ] QA audit report reviewed and signed off

---

## 🎉 SUCCESS INDICATORS

**You're ready to go if:**
1. ✅ App launches → Dashboard → Coach tab → Chat works
2. ✅ What-If simulator adjusts sliders and shows results
3. ✅ No console errors or crashes in 5 minutes of testing
4. ✅ Response time is <3 seconds per request

**You're done!** 🚀

---

## 📞 EMERGENCY ROLLBACK

If critical issue discovered after deployment:

```bash
# Option 1: Disable Coach Feature (Quick)
# Comment out CoachPanel in DemoDashboardScreen.js
# Redeploy frontend

# Option 2: Full Rollback (If severe)
# Render.com dashboard → Manual deploy previous version
# Or revert git commit and rebuild
```

---

**Questions?** Check QA_AUDIT_REPORT.md for detailed debug info
