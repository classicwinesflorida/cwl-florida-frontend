// pages/api/zoho-customers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Zoho Books API configuration
const ZOHO_CLIENT_ID = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.NEXT_PUBLIC_ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com';
const ZOHO_BOOKS_URL = 'https://books.zoho.com/api/v3';

// Token storage (in production, use a database or secure storage)
let accessToken = '';
let tokenExpiry = 0;

interface ZohoCustomer {
  customer_id: string;
  customer_name: string;
  email: string;
  phone: string;
  billing_address: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface ZohoCustomersResponse {
  code: number;
  message: string;
  customers: ZohoCustomer[];
}

async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: ZOHO_REFRESH_TOKEN,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      }
    );

    const data = response.data as { access_token: string; expires_in: number };
    accessToken = data.access_token;
    // Expires in 1 hour (3600 seconds), subtract 5 minutes for buffer
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error refreshing Zoho access token:', error);
    throw new Error('Failed to get access token');
  }
}

async function fetchCustomersFromZoho(accessToken: string): Promise<ZohoCustomer[]> {
  try {
    const response = await axios.get<ZohoCustomersResponse>(
      `${ZOHO_BOOKS_URL}/contacts`,
      {
        params: {
          contact_type: 'customer',
        },
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.code === 0) {
      return response.data.customers;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error fetching customers from Zoho:', error);
    throw new Error('Failed to fetch customers');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get access token
    const token = await getAccessToken();
    
    // Fetch customers
    const customers = await fetchCustomersFromZoho(token);
    
    // Format response
    const formattedCustomers = customers.map(customer => ({
      id: customer.customer_id,
      name: customer.customer_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.billing_address
        ? `${customer.billing_address.address}, ${customer.billing_address.city}, ${customer.billing_address.state} ${customer.billing_address.zip}`
        : '',
    }));

    res.status(200).json({ customers: formattedCustomers });
  } catch (error) {
    console.error('Error in Zoho customers API:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}