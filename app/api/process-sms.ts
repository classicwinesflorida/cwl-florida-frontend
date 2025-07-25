// pages/api/process-sms.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface POItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface POData {
  id: string;
  customerName: string;
  customerDetails: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  items: POItem[];
  totalAmount: number;
  date: string;
  status: 'draft' | 'ready' | 'sent';
}

// Mock product database with prices
const productDatabase: { [key: string]: number } = {
  'royal stage 1l': 25.99,
  'old monk 500ml': 15.99,
  'royal stage': 25.99,
  'old monk': 15.99,
  'bacardi 750ml': 19.99,
  'mcdowell 1l': 22.99,
  'teachers 750ml': 28.99,
  'blenders pride 750ml': 24.99,
};

function extractCustomerName(text: string): string {
  const lines = text.split('\n');
  const firstLine = lines[0].trim();
  
  // Check if first line contains customer name
  if (!firstLine.includes(':') && !firstLine.match(/\d+/)) {
    return firstLine;
  }
  
  // Look for common business names
  const businessKeywords = ['wines', 'liquor', 'spirits', 'beverages', 'total', 'abc'];
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (businessKeywords.some(keyword => lowerLine.includes(keyword))) {
      return line.trim();
    }
  }
  
  return 'Unknown Customer';
}

function parseOrderItems(text: string): POItem[] {
  const items: POItem[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip customer name line
    if (!trimmedLine.includes(':') && !trimmedLine.match(/\d+/)) {
      continue;
    }
    
    // Pattern 1: "Product: Quantity" or "Product : Quantity"
    const pattern1 = trimmedLine.match(/^(.+?)\s*:\s*(\d+)$/);
    if (pattern1) {
      const product = pattern1[1].trim();
      const quantity = parseInt(pattern1[2]);
      
      const productKey = product.toLowerCase();
      const unitPrice = productDatabase[productKey] || 0;
      
      items.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
      continue;
    }
    
    // Pattern 2: "Quantity Product"
    const pattern2 = trimmedLine.match(/^(\d+)\s+(.+)$/);
    if (pattern2) {
      const quantity = parseInt(pattern2[1]);
      const product = pattern2[2].trim();
      
      const productKey = product.toLowerCase();
      const unitPrice = productDatabase[productKey] || 0;
      
      items.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
      continue;
    }
  }
  
  return items;
}

async function processImageWithOCR(imagePath: string): Promise<string> {
  // In a real implementation, you would use OCR service like:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js
  
  // For demo purposes, return mock text
  return `Total Wines
Royal Stage 1L: 5
Old Monk 500ml: 10`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './uploads',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    
    let extractedText = '';
    
    if (files.screenshot && files.screenshot[0]) {
      // Process screenshot with OCR
      const file = files.screenshot[0];
      extractedText = await processImageWithOCR(file.filepath);
      
      // Clean up uploaded file
      fs.unlinkSync(file.filepath);
    } else if (fields.text && fields.text[0]) {
      // Use provided text
      extractedText = fields.text[0];
    } else {
      return res.status(400).json({ message: 'No text or screenshot provided' });
    }

    // Parse the extracted text
    const customerName = extractCustomerName(extractedText);
    const items = parseOrderItems(extractedText);
    
    if (items.length === 0) {
      return res.status(400).json({ message: 'No valid items found in the text' });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // Create PO data
    const poData: POData = {
      id: `PO-${Date.now()}`,
      customerName,
      customerDetails: {
        name: customerName,
        phone: '', // Can be enhanced to extract from text
        email: '',
        address: ''
      },
      items,
      totalAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    };

    res.status(200).json(poData);
  } catch (error) {
    console.error('Error processing SMS:', error);
    res.status(500).json({ message: 'Error processing SMS data' });
  }
}
