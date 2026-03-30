# 🔗 ProofChain - Payment Screenshot Forensics Engine

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104-green.svg)](https://fastapi.tiangolo.com)

## 🎯 Problem Statement

With 14+ billion UPI transactions annually in India, fake payment screenshots have become a major fraud vector:

- **OLX/Marketplace scams**: Buyer sends fake screenshot → seller ships → payment never arrives
- **Freelancer fraud**: Fake transfer confirmation → work delivered → no payment
- **Rental deposit fraud**: Edited screenshots as proof of payment
- **Expense reimbursement fraud**: Employees submit inflated/edited receipts

**The Gap**: No instant, automated, explainable tool exists to verify screenshot authenticity before taking action.

## 💡 Solution

**ProofChain** is a multi-layer forensic analysis engine that:

1. **Analyzes screenshots** using Error Level Analysis (ELA), OCR, and structural validation
2. **Assigns a Trust Score (0-100)** indicating likelihood of manipulation
3. **Generates heatmaps** showing suspicious regions
4. **Provides explainable reasons** for each score
5. **Creates downloadable PDF reports** for dispute resolution

**Key Differentiator**: We don't use black-box AI. Every finding is explainable and traceable.

## 🚀 Features

### Core Features
- ✅ **Image Upload** - Drag-drop or click to upload
- ✅ **Error Level Analysis (ELA)** - Detect compression artifacts from editing
- ✅ **OCR Text Extraction** - Extract amount, transaction ID, UPI ID, dates
- ✅ **Structural Validation** - Validate layout against UPI app templates
- ✅ **Trust Score Engine** - 0-100 score with risk categorization
- ✅ **Heatmap Visualization** - Visual representation of suspicious regions
- ✅ **PDF Report Generation** - Downloadable forensic reports
- ✅ **Bank Transfer Support** - Works with HDFC, Kotak, SBI, ICICI, etc.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python) |
| Image Processing | OpenCV, Pillow |
| OCR | Tesseract |
| PDF Generation | ReportLab |


[text](../../../Downloads/proofchain-report-1774889725205.pdf)