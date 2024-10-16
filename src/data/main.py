import os
import json
import subprocess
import re

# Define the directory to scan
root_dir = 'H:\\'

# Initialize a list to store image data
image_data = []

exiftool_path = r'C:\Users\Bob\Documents\Projects\pim-map-maker\exiftool_win64\exiftool.exe'

# Initialize a counter
file_count = 0
max_files = 100

# Folders to skip
skip_folders = {"Brania", "Films&Series", "Seagate", "Start_Here_Mac.app"}

# Function to extract EXIF data using exiftool
def extract_exif_data(file_path):
    try:
        # Run exiftool command to get the required EXIF data
        result = subprocess.run(
            [exiftool_path, '-gpslatitude', '-gpslongitude', '-datetimeoriginal', '-s3', file_path],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip().split('\n')
        
        # Debug the raw output to ensure correct extraction
        print(f"Raw output for {file_path}: {output}")
        
        # Map output to appropriate fields
        if len(output) >= 3 and all(output):
            return {
                'latitude': output[0],
                'longitude': output[1],
                'timestamp': output[2],
                'name': os.path.basename(file_path),
                'file_location': file_path
            }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    return None

# Walk through the directory
for subdir, _, files in os.walk(root_dir):
    folder_name = os.path.basename(subdir)
    
    # Check if the folder should be processed
    if not re.match(r'^\d{4}_', folder_name) or folder_name in skip_folders:
        continue
    
    if file_count >= max_files:
        break
    for file in files:
        if file_count >= max_files:
            break
        file_path = os.path.join(subdir, file)
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):  # Check for image files
            exif_data = extract_exif_data(file_path)
            if exif_data:
                image_data.append(exif_data)
                file_count += 1
        print(f"Processed {file_count} files")

# Save the collected data to data.json
with open('data.json', 'w') as json_file:
    json.dump(image_data, json_file, indent=4)

print("Data extraction complete. Results saved to data.json.")
