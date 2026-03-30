import cv2
import numpy as np
from PIL import Image
import io

def error_level_analysis(image_bytes, quality=90):
    """
    Perform Error Level Analysis on image
    Returns heatmap and anomaly score
    """
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Save original to memory
    orig_buffer = io.BytesIO()
    img.save(orig_buffer, format='JPEG', quality=quality)
    orig_buffer.seek(0)
    
    # Resave with compression
    resaved = Image.open(orig_buffer)
    resaved_buffer = io.BytesIO()
    resaved.save(resaved_buffer, format='JPEG', quality=quality)
    resaved_buffer.seek(0)
    
    # Convert to OpenCV format
    img_orig = np.array(img)
    img_resaved = np.array(Image.open(resaved_buffer))
    
    # Calculate difference
    diff = cv2.absdiff(img_orig, img_resaved)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_RGB2GRAY)
    
    # Normalize for heatmap
    heatmap = cv2.normalize(diff_gray, None, 0, 255, cv2.NORM_MINMAX)
    
    # Calculate anomaly score (0-100, higher = more edited)
    anomaly_score = np.mean(diff_gray) / 2.55
    
    return heatmap, anomaly_score