#!/usr/bin/env python3
"""Create PDF from funnel screenshots"""

import os
import glob
from PIL import Image

SCREENSHOT_DIR = '/Users/yevhen/cursor-projects/ClaudeCode/finestro-funnel-screenshots'
OUTPUT_PDF = os.path.join(SCREENSHOT_DIR, 'finestro-funnel-sequence.pdf')

def create_pdf():
    # Get all PNG files sorted by name
    png_files = sorted(glob.glob(os.path.join(SCREENSHOT_DIR, '*.png')))

    if not png_files:
        print("No PNG files found!")
        return

    print(f"Found {len(png_files)} screenshots:")
    for f in png_files:
        print(f"  - {os.path.basename(f)}")

    # Convert images to RGB (PDF doesn't support RGBA)
    images = []
    for png_file in png_files:
        img = Image.open(png_file)
        if img.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            images.append(background)
        else:
            images.append(img.convert('RGB'))

    # Save as PDF
    if images:
        first_img = images[0]
        rest_imgs = images[1:] if len(images) > 1 else []

        first_img.save(
            OUTPUT_PDF,
            'PDF',
            resolution=100.0,
            save_all=True,
            append_images=rest_imgs
        )

        print(f"\n✅ PDF created: {OUTPUT_PDF}")
        print(f"   Total pages: {len(images)}")
    else:
        print("No images to create PDF from!")

if __name__ == '__main__':
    create_pdf()
