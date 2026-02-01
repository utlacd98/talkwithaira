# 📊 Stress Test Tool

A simple stress testing tool to simulate multiple concurrent users visiting your Aira web app.

## 🚀 Quick Start

### Basic Usage

```bash
# 10 concurrent users for 30 seconds (default)
node stress-test.js

# 50 concurrent users for 60 seconds
node stress-test.js 50 60

# 100 concurrent users for 2 minutes
node stress-test.js 100 120
```

## 📝 What It Does

- Simulates multiple concurrent users visiting the site
- Each user makes repeated requests with random delays (0.5-3 seconds between requests)
- Tracks response times, status codes, and errors
- Logs everything to a timestamped file in `stress-test-logs/`
- Shows real-time progress every 5 seconds
- Generates a detailed summary report at the end

## 📊 Metrics Tracked

- **Total Requests**: Total number of HTTP requests made
- **Success Rate**: Percentage of successful requests (2xx-3xx status codes)
- **Response Times**: Min, Max, and Average response times
- **Requests/Second**: Throughput during the test
- **Status Codes**: Breakdown of all HTTP status codes received
- **Errors**: Any network errors or timeouts

## 📁 Log Files

All logs are saved to `stress-test-logs/` with timestamps:
- Example: `stress-test-2024-11-03T10-30-45-123Z.log`
- Each log file contains:
  - Individual request logs
  - Progress updates every 5 seconds
  - Final statistics summary

## 🎯 Recommended Test Scenarios

### Light Load (Baseline)
```bash
node stress-test.js 5 30
```
Good for: Initial testing, verifying basic functionality

### Medium Load
```bash
node stress-test.js 25 60
```
Good for: Typical traffic simulation

### Heavy Load
```bash
node stress-test.js 50 120
```
Good for: Peak traffic simulation

### Stress Test
```bash
node stress-test.js 100 180
```
Good for: Finding breaking points

### Extreme Stress
```bash
node stress-test.js 200 300
```
Good for: Maximum capacity testing

## 📖 Reading the Logs

### Real-time Monitoring

While the test is running, you can watch the log file in real-time:

**Windows (PowerShell):**
```powershell
Get-Content stress-test-logs\stress-test-*.log -Wait -Tail 20
```

**Mac/Linux:**
```bash
tail -f stress-test-logs/stress-test-*.log
```

### Log Format

```
[2024-11-03T10:30:45.123Z] [INFO] STARTING STRESS TEST
[2024-11-03T10:30:45.456Z] [REQUEST] User 1: 200 - 234ms
[2024-11-03T10:30:45.789Z] [REQUEST] User 2: 200 - 189ms
[2024-11-03T10:30:50.123Z] [PROGRESS] Progress: 5s | Requests: 23 | Success: 100% | Avg Response: 210ms
[2024-11-03T10:30:51.456Z] [ERROR] User 5: TIMEOUT - 30000ms
```

## 🔍 Interpreting Results

### Good Performance
- Success rate > 99%
- Average response time < 500ms
- No timeouts or errors
- Consistent response times

### Acceptable Performance
- Success rate > 95%
- Average response time < 1000ms
- Few timeouts (< 1%)
- Some variation in response times

### Poor Performance
- Success rate < 95%
- Average response time > 2000ms
- Frequent timeouts or errors
- High variation in response times

### Critical Issues
- Success rate < 90%
- Frequent 5xx errors
- Many timeouts
- Server becoming unresponsive

## 💡 Tips

1. **Start Small**: Begin with a small number of users and gradually increase
2. **Monitor Logs**: Keep an eye on the log file during the test
3. **Check Vercel Dashboard**: Monitor your Vercel deployment during tests
4. **Compare Results**: Run the same test multiple times to compare results
5. **Test Different Times**: Performance may vary based on Vercel's load

## 🛠️ Troubleshooting

### "Cannot find module" error
Make sure you're running the script with Node.js:
```bash
node stress-test.js
```

### All requests failing
- Check if the site is accessible in your browser
- Verify the URL in `stress-test.js` is correct
- Check your internet connection

### Timeouts
- This is normal under heavy load
- Reduce the number of concurrent users
- Increase the timeout in the script if needed

## 📈 Example Output

```
================================================================================
STRESS TEST RESULTS
================================================================================
Target URL: https://v0-aira-web-app.vercel.app
Concurrent Users: 50
Test Duration: 60.12s

REQUEST STATISTICS:
  Total Requests: 1,234
  Successful: 1,220 (98.87%)
  Failed: 14
  Requests/Second: 20.53

RESPONSE TIME:
  Average: 345.67ms
  Min: 123ms
  Max: 2,345ms

STATUS CODES:
  200: 1,220 (98.87%)
  500: 10 (0.81%)
  503: 4 (0.32%)

ERRORS:
  TIMEOUT: 8 (0.65%)
  ECONNRESET: 6 (0.49%)
================================================================================
```

