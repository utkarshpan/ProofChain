from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
import base64
import cv2
from PIL import Image
import io
import numpy as np

from app.modules.ela import error_level_analysis
from app.modules.ocr import extract_text, extract_transaction_data
from app.modules.structural import detect_app, validate_layout, load_templates
from app.core.trust_score import calculate_trust_score

router = APIRouter()

# Load templates once
templates = load_templates()

@router.post("/analyze")
async def analyze_screenshot(file: UploadFile = File(...)):
    """
    Analyze payment screenshot and return trust score
    """
    try:
        # Read file
        contents = await file.read()
        
        # Save for debugging (optional)
        file_id = str(uuid.uuid4())
        upload_dir = "app/static/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{file_id}.png")
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # 1. ELA Analysis
        heatmap, ela_score = error_level_analysis(contents)
        
        # Convert heatmap to base64 for frontend
        heatmap_bgr = cv2.cvtColor(heatmap, cv2.COLOR_GRAY2BGR)
        heatmap_pil = Image.fromarray(heatmap_bgr)
        heatmap_buffer = io.BytesIO()
        heatmap_pil.save(heatmap_buffer, format='PNG')
        heatmap_base64 = base64.b64encode(heatmap_buffer.getvalue()).decode('utf-8')
        heatmap_url = f"data:image/png;base64,{heatmap_base64}"
        
        # 2. OCR Analysis
        text = extract_text(contents)
        
        # Debug print
        print("\n" + "="*60)
        print("RAW OCR TEXT:")
        print("="*60)
        print(text)
        print("="*60)
        
        extracted_data = extract_transaction_data(text)
        
        # Debug print extracted data
        print("EXTRACTED DATA:")
        print(extracted_data)
        print("="*60)
        
        # Calculate OCR confidence
        extracted_fields = sum(1 for v in extracted_data.values() if v)
        ocr_score = (extracted_fields / 4) * 100 if extracted_fields > 0 else 50
        
        # 3. Structural Analysis
        detected_app = detect_app(contents)
        structural_score = validate_layout(contents, detected_app, templates)
        
        # 4. Generate reasons
        reasons = []
        if ela_score > 40:
            reasons.append(f"ELA anomaly detected: {ela_score:.1f}% compression inconsistency")
        if structural_score > 30:
            reasons.append(f"Structural mismatch with {detected_app} app layout")
        if not extracted_data.get('transaction_id'):
            reasons.append("Transaction ID not found or invalid format")
        if not extracted_data.get('amount'):
            reasons.append("Amount field not detected or invalid")
        if not extracted_data.get('upi_id'):
            reasons.append("UPI ID not detected or invalid format")
        
        if not reasons:
            reasons.append("No significant anomalies detected")
        
        # 5. Calculate final trust score
        trust_score = calculate_trust_score(ela_score, structural_score, ocr_score, detected_app)
        
        # 6. Prepare response
        response = {
            "trust_score": trust_score,
            "heatmap_url": heatmap_url,
            "reasons": reasons,
            "ocr_raw_text": text[:500],  # First 500 chars
            "extracted_data": {
                "amount": extracted_data.get('amount', 'Not detected'),
                "datetime": extracted_data.get('datetime', 'Not detected'),
                "transaction_id": extracted_data.get('transaction_id', 'Not detected'),
                "upi_id": extracted_data.get('upi_id', 'Not detected'),
                "detected_app": detected_app or 'Unknown'
            },
            "risk_factors": []
        }
        
        # Add risk factors
        if ela_score > 30:
            response["risk_factors"].append(f"ELA Score: {ela_score:.1f}% anomaly")
        if structural_score > 30:
            response["risk_factors"].append(f"Structural Score: {structural_score:.1f}% mismatch")
        if extracted_fields < 2:
            response["risk_factors"].append("Missing transaction data")
        
        return JSONResponse(content=response)
        
    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))