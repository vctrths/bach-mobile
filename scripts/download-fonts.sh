#!/bin/bash
set -e

FONT_DIR="assets/fonts"
BASE_URL="https://cirazbblekhhhvkacwfz.supabase.co/storage/v1/object/public/fonts"
FONTS=("Satoshi-Regular.otf" "Satoshi-Light.otf" "Satoshi-Medium.otf" "Satoshi-Bold.otf" "Satoshi-Black.otf")

mkdir -p "$FONT_DIR"

for font in "${FONTS[@]}"; do
  if [ -f "$FONT_DIR/$font" ]; then
    echo "✓ $font already exists, skipping"
  else
    echo "↓ Downloading $font..."
    curl -sL "$BASE_URL/$font" -o "$FONT_DIR/$font"
    echo "✓ $font downloaded"
  fi
done

echo "All fonts ready!"
