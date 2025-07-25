import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const poData = req.body;
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send to external API
    // 3. Generate PDF
    // 4. Send email notification
    
    // Mock API call to external system
    const orderData = {
      orderId: poData.id,
      customer: poData.customerDetails,
      items: poData.items.map((item: any) => ({
        productName: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      totalAmount: poData.totalAmount,
      orderDate: poData.date,
      status: 'confirmed'
    };

    // Simulate API call
    console.log('Sending order data to external API:', JSON.stringify(orderData, null, 2));
    
    // Mock external API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.status(200).json({ 
      message: 'PO finalized successfully',
      orderId: poData.id,
      status: 'sent'
    });
  } catch (error) {
    console.error('Error finalizing PO:', error);
    res.status(500).json({ message: 'Error finalizing PO' });
  }
}