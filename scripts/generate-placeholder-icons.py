#!/usr/bin/env python3
"""
Generate placeholder icons for ClipBridge
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a simple placeholder icon"""
    # Create image with gradient background (RGBA format for transparency support)
    img = Image.new('RGBA', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)

    # Draw a simple clipboard icon shape
    # Outer rectangle (clipboard)
    margin = size // 8
    draw.rectangle(
        [margin, margin, size - margin, size - margin],
        fill='white',
        outline='#764ba2',
        width=max(1, size // 32)
    )

    # Clip at top
    clip_width = size // 3
    clip_height = size // 10
    clip_x = (size - clip_width) // 2
    clip_y = margin - clip_height // 2
    draw.rectangle(
        [clip_x, clip_y, clip_x + clip_width, clip_y + clip_height],
        fill='#764ba2'
    )

    # Lines on clipboard
    line_margin = margin + size // 6
    line_spacing = size // 8
    line_width = max(1, size // 64)

    for i in range(3):
        y = margin + size // 4 + i * line_spacing
        draw.line(
            [line_margin, y, size - line_margin, y],
            fill='#667eea',
            width=line_width
        )

    return img

def main():
    icons_dir = 'packages/desktop/src-tauri/icons'
    os.makedirs(icons_dir, exist_ok=True)

    # Generate required sizes
    print("Generating placeholder icons...")

    # PNG icons
    sizes = [32, 128, 256, 512, 1024]
    for size in sizes:
        filename = f'{size}x{size}.png' if size != 256 else '128x128@2x.png'
        if size == 1024:
            filename = 'icon.png'

        path = os.path.join(icons_dir, filename)
        img = create_icon(size, path)
        img.save(path, 'PNG')
        print(f"  ✓ Created {filename}")

    # Windows ICO (multiple sizes in one file)
    ico_path = os.path.join(icons_dir, 'icon.ico')
    ico_sizes = [16, 32, 48, 64, 128, 256]
    ico_images = [create_icon(s, '') for s in ico_sizes]
    ico_images[0].save(
        ico_path,
        format='ICO',
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:]
    )
    print(f"  ✓ Created icon.ico")

    # macOS ICNS (create a simple PNG for now, proper ICNS requires external tool)
    icns_placeholder = os.path.join(icons_dir, 'icon.icns')
    # For now, just create a 1024x1024 PNG and rename it
    # A proper .icns would need iconutil on macOS
    with open(icns_placeholder, 'w') as f:
        f.write("# Placeholder - use 'cargo tauri icon' to generate proper ICNS\n")
    print(f"  ⚠ Created icon.icns placeholder (use 'cargo tauri icon' for proper ICNS)")

    print("\n✅ Placeholder icons generated successfully!")
    print("\nTo create custom icons:")
    print("  1. Create a 1024x1024 PNG icon")
    print("  2. Run: cd packages/desktop && cargo tauri icon path/to/icon.png")

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw
        main()
    except ImportError:
        print("Error: Pillow library not found")
        print("Install with: pip install Pillow")
        exit(1)
