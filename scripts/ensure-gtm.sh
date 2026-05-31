#!/usr/bin/env bash
# Inject GTM-MLJ56LH2 into an HTML file if not already present.
# Usage: ensure-gtm.sh <file.html>

FILE="$1"
[[ "$FILE" == *.html ]] || exit 0
[ -f "$FILE" ] || exit 0
grep -q 'GTM-MLJ56LH2' "$FILE" && exit 0

export GTM_TARGET="$FILE"
python3 << 'PYEOF'
import os

file = os.environ['GTM_TARGET']
with open(file) as f:
    c = f.read()

if 'GTM-MLJ56LH2' in c:
    exit()

script = (
    "  <!-- Google Tag Manager -->\n"
    "  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n"
    "  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n"
    "  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n"
    "  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n"
    "  })(window,document,'script','dataLayer','GTM-MLJ56LH2');</script>\n"
    "  <!-- End Google Tag Manager -->"
)

noscript = (
    "<!-- Google Tag Manager (noscript) -->\n"
    "<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-MLJ56LH2\"\n"
    "height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>\n"
    "<!-- End Google Tag Manager (noscript) -->"
)

c = c.replace('<head>', '<head>\n' + script, 1)
c = c.replace('<body>', '<body>\n' + noscript, 1)

with open(file, 'w') as f:
    f.write(c)

print(f'GTM injected: {file}')
PYEOF
