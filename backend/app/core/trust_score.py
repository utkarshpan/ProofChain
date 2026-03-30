def calculate_trust_score(ela_score, structural_score, ocr_score, app_name=None):
    """Calculate final trust score with different weights for banks vs UPI"""
    ela_trust = 100 - ela_score
    
    # For bank transfers, structural score is less important
    if app_name and 'Bank' in app_name:
        weights = {
            'ela': 0.6,
            'structural': 0.1,
            'ocr': 0.3
        }
    else:
        weights = {
            'ela': 0.4,
            'structural': 0.3,
            'ocr': 0.3
        }
    
    structural_trust = 100 - structural_score
    
    trust_score = (
        ela_trust * weights['ela'] +
        structural_trust * weights['structural'] +
        ocr_score * weights['ocr']
    )
    
    return round(trust_score, 1)