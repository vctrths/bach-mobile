#!/bin/bash
set -e

FONT_DIR="assets/fonts"
PUBLIC_FONT_DIR="public/fonts"
BASE_URL="https://cirazbblekhhhvkacwfz.supabase.co/storage/v1/object/public/fonts"
FONTS=("Satoshi-Regular.otf" "Satoshi-Light.otf" "Satoshi-Medium.otf" "Satoshi-Bold.otf" "Satoshi-Black.otf")

mkdir -p "$FONT_DIR"
mkdir -p "$PUBLIC_FONT_DIR"

for font in "${FONTS[@]}"; do
  if [ -f "$FONT_DIR/$font" ]; then
    echo "✓ $font already exists, skipping"
  else
    echo "↓ Downloading $font..."
    curl -sL "$BASE_URL/$font" -o "$FONT_DIR/$font"
    echo "✓ $font downloaded"
  fi
  
  if [ ! -f "$PUBLIC_FONT_DIR/$font" ]; then
    cp "$FONT_DIR/$font" "$PUBLIC_FONT_DIR/$font"
    echo "✓ $font copied to public/fonts/"
  fi
done

echo "All fonts ready!"
