import json
import os
import numpy as np
from PIL import Image
import io
import pytesseract

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), '../templates')

def load_templates():
    """Load UPI app layout templates"""
    templates = {}
    for app in ['phonepe', 'gpay', 'paytm']:
        template_path = os.path.join(TEMPLATES_DIR, f'{app}.json')
        if os.path.exists(template_path):
            with open(template_path, 'r') as f:
                templates[app] = json.load(f)
    return templates

def detect_app(image_bytes):
    """Detect which UPI app or bank the screenshot is from"""
    img = Image.open(io.BytesIO(image_bytes))
    img_array = np.array(img)
    
    # OCR to detect keywords
    text = pytesseract.image_to_string(img).lower()
    
    # Bank detection
    bank_keywords = {
        'kotak': 'Kotak Bank',
        'hdfc': 'HDFC Bank',
        'sbi': 'State Bank of India',
        'icici': 'ICICI Bank',
        'axis': 'Axis Bank',
        'yes bank': 'Yes Bank',
        'canara': 'Canara Bank',
        'pnb': 'Punjab National Bank'
    }
    
    for keyword, bank_name in bank_keywords.items():
        if keyword in text:
            return bank_name
    
    # UPI app detection
    purple_regions = np.sum((img_array[:,:,0] > 100) & (img_array[:,:,0] < 180) &
                            (img_array[:,:,1] < 100) & (img_array[:,:,2] > 150))
    
    blue_regions = np.sum((img_array[:,:,0] < 100) & (img_array[:,:,1] > 100) & 
                          (img_array[:,:,2] > 150))
    
    if 'phonepe' in text or purple_regions > 10000:
        return 'PhonePe'
    elif 'google pay' in text or 'gpay' in text or blue_regions > 10000:
        return 'Google Pay'
    elif 'paytm' in text:
        return 'Paytm'
    else:
        return 'Bank Transfer'

def validate_layout(image_bytes, app_name, templates):
    """Validate screenshot layout"""
    # For bank transfers, return lower mismatch
    if 'Bank' in app_name:
        return 20
    
    if app_name not in templates:
        return 50
    
    img = Image.open(io.BytesIO(image_bytes))
    img_array = np.array(img)
    height, width = img_array.shape[:2]
    
    template = templates[app_name]
    mismatches = 0
    total_checks = 0
    
    if 'amount_field' in template:
        total_checks += 1
        expected_y = template['amount_field']['y'] * height / 100
        actual_y = height * 0.4
        if abs(actual_y - expected_y) > 20:
            mismatches += 1
    
    mismatch_score = (mismatches / total_checks) * 100 if total_checks > 0 else 50
    return mismatch_score