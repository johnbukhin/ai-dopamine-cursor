#!/usr/bin/env python3
import json
import base64
import sys
import os

def save_screenshot(json_file, output_name):
    output_dir = '/Users/yevhen/cursor-projects/ClaudeCode/finestro-funnel-screenshots'
    output_path = os.path.join(output_dir, f'{output_name}.png')

    with open(json_file, 'r') as f:
        data = json.load(f)

    for item in data:
        text = item.get('text', '')
        if 'data:image' in text:
            b64 = text.split(',')[1]
            with open(output_path, 'wb') as f:
                f.write(base64.b64decode(b64))
            print(f'Saved {output_path}')
            return output_path

    print('No image found in JSON')
    return None

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        save_screenshot(sys.argv[1], sys.argv[2])
