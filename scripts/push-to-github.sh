#!/usr/bin/env bash
# ============================================================
#  Azzam — سكريبت رفع المشروع إلى GitHub
#  استخدم هذا السكريبت بعد إنشاء مستودع فارغ على GitHub
#  وإنشاء Personal Access Token (PAT) بصلاحيات repo
# ============================================================
set -e

# ====== الإعدادات ======
GITHUB_USER="azamntheer5-lang"
REPO_NAME="azzam"
# =======================

cd "$(dirname "$0")"

echo "🚀 رفع مشروع Azzam إلى GitHub..."
echo
echo "📌 المستودع الهدف: github.com/$GITHUB_USER/$REPO_NAME"
echo

# إذا لم يُمرّر الـ token كمتغير بيئة، اطلبه من المستخدم
if [ -z "$GH_TOKEN" ]; then
  echo "🔑 احصل على Personal Access Token من:"
  echo "   https://github.com/settings/tokens/new?scopes=repo,workflow&description=Azzam%20Push"
  echo
  read -s -p "الصق الـ token هنا: " GH_TOKEN
  echo
fi

if [ -z "$GH_TOKEN" ]; then
  echo "❌ لم يتم توفير token. خروج."
  exit 1
fi

# إنشاء المستودع عبر API (إذا لم يكن موجوداً)
echo "📦 جاري التحقق من وجود المستودع..."
STATUS=$(curl -sS -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/$GITHUB_USER/$REPO_NAME")

if [ "$STATUS" = "404" ]; then
  echo "➕ إنشاء مستودع جديد..."
  curl -sS -X POST \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"Azzam — منشئ السير الذاتية بالذكاء الاصطناعي\",\"private\":false,\"has_issues\":true,\"has_projects\":true,\"has_wiki\":true}" \
    > /dev/null
  echo "✅ تم إنشاء المستودع"
elif [ "$STATUS" = "200" ]; then
  echo "✓ المستودع موجود بالفعل"
else
  echo "⚠️ فشل التحقق من المستودع (HTTP $STATUS)"
  echo "   تأكد من صحة الـ token وصلاحياته"
  exit 1
fi

# تحديث remote URL ليشمل الـ token (مؤقتاً للرفع فقط)
echo "📤 جاري الرفع..."
git remote set-url origin "https://$GITHUB_USER:$GH_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"

# الرفع
git push -u origin main

# إزالة الـ token من الـ URL بعد الرفع (للأمان)
git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo
echo "🎉 تم الرفع بنجاح!"
echo "🔗 https://github.com/$GITHUB_USER/$REPO_NAME"
echo
echo "💡 يمكنك الآن استنساخه على أي جهاز:"
echo "   git clone https://github.com/$GITHUB_USER/$REPO_NAME.git"
