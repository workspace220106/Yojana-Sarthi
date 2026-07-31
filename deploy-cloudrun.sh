#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#   Yojana Sarthi – Google Cloud Run Deploy Script
#   Run this ONCE to set everything up. After that, pushing to
#   GitHub main branch will auto-deploy via Cloud Build.
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

# ── CONFIGURATION ──────────────────────────────────────────────
PROJECT_ID="yojana-sarthi"          # Change to your GCP project ID
REGION="asia-south1"                # Mumbai – closest to India
SERVICE_NAME="yojana-sarthi-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# ── COLOURS ────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Yojana Sarthi – Cloud Run Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── STEP 1: Authenticate ───────────────────────────────────────
echo -e "\n${YELLOW}[1/7] Authenticating with Google Cloud...${NC}"
gcloud auth login
gcloud config set project $PROJECT_ID

# ── STEP 2: Enable required APIs ──────────────────────────────
echo -e "\n${YELLOW}[2/7] Enabling required GCP APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

# ── STEP 3: Store secrets in Secret Manager ────────────────────
echo -e "\n${YELLOW}[3/7] Storing secrets in Google Secret Manager...${NC}"

# Load from local .env
source .env

store_secret() {
    local name=$1
    local value=$2
    echo -n "$value" | gcloud secrets create $name --data-file=- 2>/dev/null || \
    echo -n "$value" | gcloud secrets versions add $name --data-file=-
    echo "  ✅ Secret '$name' stored"
}

store_secret "GEMINI_API_KEY"         "$GEMINI_API_KEY"
store_secret "SUPABASE_URL"           "$SUPABASE_URL"
store_secret "SUPABASE_KEY"           "$SUPABASE_KEY"
store_secret "SUPABASE_SERVICE_KEY"   "$SUPABASE_SERVICE_KEY"
store_secret "CASHFREE_CLIENT_ID"     "$CASHFREE_CLIENT_ID"
store_secret "CASHFREE_CLIENT_SECRET" "$CASHFREE_CLIENT_SECRET"
# CASHFREE_ENV ('sandbox') is NOT a secret – stored as plain env var = stays at 6 secrets (FREE)

# ── STEP 4: Build Docker image ─────────────────────────────────
echo -e "\n${YELLOW}[4/7] Building Docker image (this takes ~5-10 mins first time)...${NC}"
gcloud builds submit --tag $IMAGE:latest --timeout=1800s .

# ── STEP 5: Deploy to Cloud Run ────────────────────────────────
echo -e "\n${YELLOW}[5/7] Deploying to Cloud Run ($REGION)...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --timeout 120 \
    --set-env-vars "CASHFREE_ENV=sandbox,LLM_MODEL=gemini-2.5-flash" \
    --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_KEY=SUPABASE_KEY:latest,SUPABASE_SERVICE_KEY=SUPABASE_SERVICE_KEY:latest,CASHFREE_CLIENT_ID=CASHFREE_CLIENT_ID:latest,CASHFREE_CLIENT_SECRET=CASHFREE_CLIENT_SECRET:latest"

# ── STEP 6: Grant Secret Manager access to Cloud Run ──────────
echo -e "\n${YELLOW}[6/7] Granting Secret Manager access to Cloud Run service...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# ── STEP 7: Get service URL ─────────────────────────────────────
echo -e "\n${YELLOW}[7/7] Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region $REGION \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYED SUCCESSFULLY!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🌐 Backend URL:  ${GREEN}$SERVICE_URL${NC}"
echo -e "  ❤️  Health Check: ${GREEN}$SERVICE_URL/health${NC}"
echo -e "  📊 Docs:         ${GREEN}$SERVICE_URL/docs${NC}"
echo ""
echo -e "  📝 Update your frontend .env:"
echo -e "     VITE_API_URL=$SERVICE_URL"
echo ""
echo -e "${YELLOW}  ⚡ Future deployments: just push to GitHub main branch!${NC}"
