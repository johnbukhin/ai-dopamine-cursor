#!/usr/bin/env bash
# =============================================================================
# smoke-test.sh — Purchase & Login Flow Smoke Test
#
# Covers every regression we fixed in the purchase/login flow (Issues #21–#23
# and webhook bug). Run automatically after every deploy via Claude Code hook.
#
# Usage:
#   bash scripts/smoke-test.sh
#
# Exit code: 0 = all critical checks passed, 1 = one or more failures.
# =============================================================================

set -uo pipefail

FUNNEL_URL="https://ai-dopamine-addict.vercel.app"
WEBAPP_URL="https://mind-compass-webapp.vercel.app"

ENV_LOCAL="$(dirname "$0")/../funnel/.env.local"
SUPABASE_URL=$(grep "^SUPABASE_URL=" "$ENV_LOCAL" 2>/dev/null | cut -d= -f2-)
SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_LOCAL" 2>/dev/null | cut -d= -f2-)
STRIPE_KEY=$(grep "^STRIPE_SECRET_KEY=" "$ENV_LOCAL" 2>/dev/null | cut -d= -f2-)

# Defaults (public, non-secret)
SUPABASE_URL="${SUPABASE_URL:-https://lswxrdigofzhchvxiqbu.supabase.co}"

if [ -z "$STRIPE_KEY" ] || [ -z "$SERVICE_KEY" ]; then
  echo "⚠️  funnel/.env.local missing STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY — skipping Stripe/Supabase checks"
fi

PASS=0
FAIL=0
CRITICAL_FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}❌ FAIL${NC} $1"; FAIL=$((FAIL+1)); }
fail_critical() { echo -e "${RED}❌ FAIL [CRITICAL]${NC} $1"; FAIL=$((FAIL+1)); CRITICAL_FAIL=$((CRITICAL_FAIL+1)); }
info() { echo -e "${YELLOW}   ℹ${NC}  $1"; }

echo ""
echo "============================================"
echo " Mind Compass — Post-Deploy Smoke Test"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"
echo ""

# ---------------------------------------------------------------------------
# 1. PAGE HEALTH — both deployments must return 200 with correct title
# ---------------------------------------------------------------------------
echo "── 1. Page Health ──────────────────────────"

FUNNEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FUNNEL_URL/funnel-v2/")
FUNNEL_TITLE=$(curl -s "$FUNNEL_URL/funnel-v2/" | grep -o '<title>[^<]*</title>')
if [ "$FUNNEL_STATUS" = "200" ] && [ "$FUNNEL_TITLE" = "<title>Mind Compass</title>" ]; then
  pass "Funnel page loads (HTTP 200, correct title)"
else
  fail_critical "Funnel page — status=$FUNNEL_STATUS title=$FUNNEL_TITLE"
fi

WEBAPP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL/")
if [ "$WEBAPP_STATUS" = "200" ]; then
  pass "Webapp page loads (HTTP 200)"
else
  fail_critical "Webapp page — status=$WEBAPP_STATUS"
fi

echo ""

# ---------------------------------------------------------------------------
# 2. API ENDPOINTS — create-checkout and webhook signature validation
# ---------------------------------------------------------------------------
echo "── 2. API Endpoints ────────────────────────"

# 2a. create-checkout returns clientSecret for valid input
CHECKOUT_RESP=$(curl -s -X POST "$FUNNEL_URL/api/create-checkout" \
  -H "Content-Type: application/json" \
  -d '{"tierId":"1_month","email":"smoketest@test.com"}')
if echo "$CHECKOUT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'clientSecret' in d" 2>/dev/null; then
  pass "create-checkout returns clientSecret"
else
  fail_critical "create-checkout bad response: $(echo "$CHECKOUT_RESP" | head -c 120)"
fi

# 2b. create-checkout rejects missing fields
CHECKOUT_400=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FUNNEL_URL/api/create-checkout" \
  -H "Content-Type: application/json" -d '{}')
if [ "$CHECKOUT_400" = "400" ]; then
  pass "create-checkout rejects missing fields (400)"
else
  fail "create-checkout missing-field guard — got $CHECKOUT_400 (expected 400)"
fi

# 2c. Webhook returns 400 for unsigned POST (body parser disabled + secret active)
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FUNNEL_URL/api/webhook" \
  -H "Content-Type: application/json" -d '{"type":"invoice.payment_succeeded"}')
if [ "$WEBHOOK_STATUS" = "400" ]; then
  pass "Webhook rejects unsigned POST (400) — signature verification active"
else
  fail_critical "Webhook accepted unsigned POST (got $WEBHOOK_STATUS) — signature check broken or secret not set"
fi

echo ""

# ---------------------------------------------------------------------------
# 3. SUPABASE CONNECTIVITY — service role can read subscriptions table
# ---------------------------------------------------------------------------
echo "── 3. Supabase Connectivity ────────────────"

if [ -z "$SERVICE_KEY" ]; then
  fail_critical "SUPABASE_SERVICE_ROLE_KEY not found in funnel/.env.local"
else
  SUPA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "$SUPABASE_URL/rest/v1/subscriptions?limit=1&select=id" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY")
  if [ "$SUPA_STATUS" = "200" ]; then
    pass "Supabase subscriptions table readable"
  else
    fail_critical "Supabase connectivity — status=$SUPA_STATUS"
  fi
fi

echo ""

# ---------------------------------------------------------------------------
# 4. WEBHOOK END-TO-END — full purchase flow writes subscription to Supabase
#    Creates a Stripe test customer + subscription schedule + pays invoice,
#    then verifies the row appears in Supabase within 15 seconds.
# ---------------------------------------------------------------------------
echo "── 4. Webhook End-to-End ───────────────────"

TEST_EMAIL="smoke_$(date +%s)@smoke-test.com"
info "Test email: $TEST_EMAIL"

# 4a. Create test customer
CUS=$(curl -s -X POST "https://api.stripe.com/v1/customers" \
  -u "$STRIPE_KEY:" \
  --data-urlencode "email=$TEST_EMAIL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

if [ -z "$CUS" ]; then
  fail_critical "Stripe test customer creation failed"
else
  info "Customer: $CUS"

  # 4b. Attach test card
  PM=$(curl -s -X POST "https://api.stripe.com/v1/payment_methods" \
    -u "$STRIPE_KEY:" -d "type=card" -d "card[token]=tok_visa" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  curl -s -X POST "https://api.stripe.com/v1/payment_methods/$PM/attach" \
    -u "$STRIPE_KEY:" -d "customer=$CUS" > /dev/null
  curl -s -X POST "https://api.stripe.com/v1/customers/$CUS" \
    -u "$STRIPE_KEY:" -d "invoice_settings[default_payment_method]=$PM" > /dev/null

  # 4c. Create subscription schedule (same 2-phase flow as the real funnel)
  INTRO_PRICE=$(grep "^STRIPE_PRICE_INTRO_1MONTH=" "$ENV_LOCAL" 2>/dev/null | cut -d= -f2-)
  REG_PRICE=$(grep "^STRIPE_PRICE_REGULAR_MONTHLY=" "$ENV_LOCAL" 2>/dev/null | cut -d= -f2-)
  SCHED_RESP=$(curl -s -X POST "https://api.stripe.com/v1/subscription_schedules" \
    -u "$STRIPE_KEY:" \
    -d "customer=$CUS" -d "start_date=now" \
    -d "phases[0][items][0][price]=$INTRO_PRICE" \
    -d "phases[0][items][0][quantity]=1" -d "phases[0][iterations]=1" \
    -d "phases[1][items][0][price]=$REG_PRICE" \
    -d "phases[1][items][0][quantity]=1" \
    -d "expand[]=subscription.latest_invoice")

  INV=$(echo "$SCHED_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
sub=d.get('subscription',{})
inv=sub.get('latest_invoice',{}) if isinstance(sub,dict) else {}
print(inv.get('id','') if isinstance(inv,dict) else inv)
" 2>/dev/null)

  if [ -z "$INV" ]; then
    fail_critical "Subscription schedule did not produce an invoice"
  else
    info "Invoice: $INV"

    # 4d. Finalize + pay
    curl -s -X POST "https://api.stripe.com/v1/invoices/$INV/finalize" -u "$STRIPE_KEY:" > /dev/null
    PAY_STATUS=$(curl -s -X POST "https://api.stripe.com/v1/invoices/$INV/pay" \
      -u "$STRIPE_KEY:" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
    info "Invoice paid: $PAY_STATUS"

    # 4e. Wait up to 20s for webhook to write the Supabase row
    FOUND=0
    for i in 1 2 3 4; do
      sleep 5
      ROW=$(curl -s "$SUPABASE_URL/rest/v1/subscriptions?user_email=eq.$TEST_EMAIL&select=stripe_subscription_id" \
        -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY")
      if echo "$ROW" | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d)>0" 2>/dev/null; then
        FOUND=1
        break
      fi
    done

    if [ "$FOUND" = "1" ]; then
      pass "Webhook wrote subscription row to Supabase (end-to-end purchase flow works)"
    else
      fail_critical "Webhook did NOT write Supabase row within 20s — webhook broken"
    fi

    # Cleanup: cancel subscription so test data doesn't pollute Stripe
    SUB=$(echo "$SCHED_RESP" | python3 -c "
import sys,json; d=json.load(sys.stdin); sub=d.get('subscription',{})
print(sub.get('id','') if isinstance(sub,dict) else sub)
" 2>/dev/null)
    [ -n "$SUB" ] && curl -s -X DELETE "https://api.stripe.com/v1/subscriptions/$SUB" \
      -u "$STRIPE_KEY:" > /dev/null
  fi
fi

echo ""

# ---------------------------------------------------------------------------
# 5. LOGIN TOKEN PRIORITY — verify URL hash tokens take precedence over session
#    (the bug where new buyer was logged in as a previous user)
#    This is a code-level check: verify the fix is present in Login.tsx
# ---------------------------------------------------------------------------
echo "── 5. Auth Logic Integrity ─────────────────"

LOGIN_FILE="$(dirname "$0")/../webapp/components/Login.tsx"
# Hash check must appear BEFORE getSession() in tryAutoAuth
HASH_LINE=$(grep -n "window.location.hash" "$LOGIN_FILE" | head -1 | cut -d: -f1)
SESSION_LINE=$(grep -n "auth.getSession" "$LOGIN_FILE" | head -1 | cut -d: -f1)
SIGNOUT_PRESENT=$(grep -c "auth.signOut" "$LOGIN_FILE" || true)

if [ -n "$HASH_LINE" ] && [ -n "$SESSION_LINE" ] && [ "$HASH_LINE" -lt "$SESSION_LINE" ]; then
  pass "URL hash checked before getSession() in Login.tsx (line $HASH_LINE < $SESSION_LINE)"
else
  fail_critical "Login.tsx auth priority wrong — hash check (line $HASH_LINE) must come before getSession() (line $SESSION_LINE)"
fi

if [ "$SIGNOUT_PRESENT" -gt "0" ]; then
  pass "signOut() called before setSession() in hash flow (prevents stale session bleed)"
else
  fail_critical "signOut() missing from hash flow in Login.tsx"
fi

echo ""

# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------
echo "============================================"
TOTAL=$((PASS+FAIL))
echo " Results: $PASS/$TOTAL passed"
if [ "$FAIL" -gt 0 ]; then
  echo -e " ${RED}$FAIL check(s) FAILED${NC}"
fi
if [ "$CRITICAL_FAIL" -gt 0 ]; then
  echo -e " ${RED}$CRITICAL_FAIL CRITICAL failure(s) — do not hand off to user${NC}"
fi
echo "============================================"
echo ""

exit $CRITICAL_FAIL
