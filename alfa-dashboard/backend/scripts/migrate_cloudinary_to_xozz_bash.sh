#!/usr/bin/env bash
# Simple bash alternative using curl and jq.
# Requires: curl, jq
# Usage: ./migrate_cloudinary_to_xozz_bash.sh table url_column id_column

set -euo pipefail

TABLE=${1:-Cars}
URL_COLUMN=${2:-image_url}
ID_COLUMN=${3:-id}

API_UPLOAD="${XOZZ_UPLOAD_ENDPOINT:-https://media.alfamotorworld.com/upload.php}"

echo "Fetching rows from DB is not implemented in pure bash; use the Node migration script for DB updates.\nThis script demonstrates downloading a URL and uploading to XOZZ."

read -p "Enter image URL to migrate: " IMGURL

TMPFILE=$(mktemp)
echo "Downloading $IMGURL to $TMPFILE"
curl -s -L "$IMGURL" -o "$TMPFILE"

echo "Uploading to XOZZ"
RESP=$(curl -s -F "file=@$TMPFILE" "$API_UPLOAD")
echo "Response: $RESP"

rm -f "$TMPFILE"

echo "Done. For full DB migration use the Node script at backend/scripts/migrate_cloudinary_to_xozz.js"
