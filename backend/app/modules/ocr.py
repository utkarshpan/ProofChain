import pytesseract
import re
from PIL import Image
import io
import cv2
import numpy as np

# Set Tesseract path (update if different)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_bytes):
    """
    Preprocess image for better OCR accuracy
    """
    # Convert bytes to OpenCV image
    img = Image.open(io.BytesIO(image_bytes))
    img = np.array(img)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    
    # Apply threshold to get black and white image
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Apply dilation to connect text components
    kernel = np.ones((1, 1), np.uint8)
    processed = cv2.dilate(thresh, kernel, iterations=1)
    
    # Convert back to PIL Image
    processed_pil = Image.fromarray(processed)
    
    return processed_pil

def extract_text(image_bytes):
    """
    Extract text from image using Tesseract OCR with preprocessing
    """
    try:
        # Preprocess image for better OCR
        processed_img = preprocess_image(image_bytes)
        
        # Configure Tesseract for better number and text recognition
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-/₹Rs:'
        
        text = pytesseract.image_to_string(processed_img, config=custom_config)
        
        # Also try original image if preprocessing fails
        if len(text.strip()) < 20:
            original = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(original, config=custom_config)
        
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def extract_transaction_data(text):
    """
    Parse transaction data from OCR text for both UPI and bank transfers
    """
    data = {
        'amount': None,
        'datetime': None,
        'transaction_id': None,
        'upi_id': None,
        'account_number': None,
        'reference': None
    }
    
    # Clean text
    text = ' '.join(text.split())
    
    # AMOUNT PATTERNS
    amount_patterns = [
        # Amount with INR/Rs
        r'[₹Rs]\.?\s*([\d,]+(?:\.\d{2})?)',
        r'([\d,]+(?:\.\d{2})?)\s*(?:INR|Rs)',
        
        # Bank transfer specific
        r'Amount\s*[:\-]\s*[₹Rs]?\s*([\d,]+(?:\.\d{2})?)',
        r'Debited\s*[:\-]\s*[₹Rs]?\s*([\d,]+(?:\.\d{2})?)',
        r'Credited\s*[:\-]\s*[₹Rs]?\s*([\d,]+(?:\.\d{2})?)',
        r'Transaction Amount\s*[:\-]\s*[₹Rs]?\s*([\d,]+(?:\.\d{2})?)',
        r'Value\s*[:\-]\s*[₹Rs]?\s*([\d,]+(?:\.\d{2})?)',
        
        # Plain numbers
        r'\b([\d]{2,3}(?:,[\d]{3})*(?:\.\d{2})?)\b',
    ]
    
    for pattern in amount_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            amount_str = match.replace(',', '').strip()
            if amount_str.replace('.', '').isdigit():
                try:
                    amount_num = float(amount_str)
                    if 10 <= amount_num <= 10000000:
                        data['amount'] = amount_str
                        break
                except:
                    pass
        if data['amount']:
            break
    
    # TRANSACTION ID PATTERNS
    txn_patterns = [
        r'(?:Transaction|Ref|Reference|UTR|Txn)[\s:]*([A-Z0-9]{6,25})',
        r'(?:Ref No|Reference No)[\s:]*([A-Z0-9]{6,25})',
        r'(?:UTR|Unique Transaction)[\s:]*([A-Z0-9]{10,25})',
        r'([A-Z]{3,10}[0-9]{4,20})',
        r'([A-Z0-9]{8,30})',
    ]
    
    for pattern in txn_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            data['transaction_id'] = max(matches, key=len)
            break
    
    # UPI ID or Account detection
    upi_patterns = [
        r'([a-zA-Z0-9.-]{3,30}@[a-zA-Z]{3,})',
        r'(?:Account|A/c)[\s:]*([0-9]{9,18})',
        r'(?:Beneficiary|Payee)[\s:]*([A-Za-z\s]+)',
    ]
    
    for pattern in upi_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            data['upi_id'] = matches[0]
            break
    
    # DATETIME PATTERNS
    date_patterns = [
        r'(\d{2}[/-]\d{2}[/-]\d{4})',
        r'(\d{2}[-]\d{2}[-]\d{4})',
        r'(\d{4}[-]\d{2}[-]\d{2})',
        r'(?:Date|Dated)[\s:]*(\d{2}[/-]\d{2}[/-]\d{4})',
        r'(?:Transaction Date)[\s:]*(\d{2}[/-]\d{2}[/-]\d{4})',
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            data['datetime'] = matches[0]
            break
    
    # Time patterns
    time_patterns = [
        r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))',
        r'(\d{2}:\d{2})'
    ]
    
    for pattern in time_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches and data['datetime']:
            data['datetime'] = f"{data['datetime']} {matches[0]}"
            break
    
    return data