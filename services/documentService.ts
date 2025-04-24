import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import Tesseract from 'tesseract.js';

// Mock database for demo purposes
let documents = [
  {
    id: '1',
    title: 'Office Supplies Receipt',
    amount: 125.99,
    date: '2023-05-15',
    vendor: 'Office Depot',
    category: 'Office Supplies',
    notes: 'Purchased printer paper, pens, and notebooks',
    status: 'approved',
    userId: '123456',
    userName: 'John Doe',
    userType: 'employee',
    createdAt: '2023-05-15T14:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '2',
    title: 'Business Lunch',
    amount: 78.50,
    date: '2023-06-02',
    vendor: 'Bistro Restaurant',
    category: 'Meals & Entertainment',
    notes: 'Lunch with client to discuss project requirements',
    status: 'pending',
    userId: '123456',
    userName: 'John Doe',
    userType: 'employee',
    createdAt: '2023-06-02T13:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1572799454197-d3a318b87dc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1572799454197-d3a318b87dc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '3',
    title: 'Travel Expenses',
    amount: 345.75,
    date: '2023-06-10',
    vendor: 'Airline Company',
    category: 'Travel',
    notes: 'Flight tickets for business conference',
    status: 'rejected',
    userId: '123456',
    userName: 'John Doe',
    userType: 'employee',
    createdAt: '2023-06-10T09:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
  },
];

export const processReceiptWithOCR = async (imageUri: string) => {
  try {
    // In a real app, this would use a proper OCR service
    // For demo purposes, we'll use Tesseract.js
    
    // Optimize image for OCR
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // Process with Tesseract
    const { data } = await Tesseract.recognize(
      manipResult.uri,
      'eng',
      {
        logger: m => console.log(m),
      }
    );
    
    // Extract relevant information from OCR text
    const text = data.text;
    
    // Simple regex patterns to extract information
    // In a real app, this would be more sophisticated
    const totalMatch = text.match(/total:?\s*\$?(\d+\.\d{2})/i) || 
                       text.match(/amount:?\s*\$?(\d+\.\d{2})/i) ||
                       text.match(/\$\s*(\d+\.\d{2})/);
    
    const dateMatch = text.match(/date:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
                      text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    
    // Try to find vendor name (this is simplified)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const potentialVendor = lines.length > 0 ? lines[0].trim() : '';
    
    return {
      total: totalMatch ? parseFloat(totalMatch[1]) : null,
      date: dateMatch ? dateMatch[1] : null,
      vendor: potentialVendor,
      fullText: text,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt with OCR');
  }
};

export const uploadDocument = async (documentData: any) => {
  try {
    // In a real app, this would upload to a server
    // For demo purposes, we'll add to our mock database
    
    // Generate a unique ID
    const id = Date.now().toString();
    
    // Create a new document object
    const newDocument = {
      id,
      ...documentData,
      createdAt: new Date().toISOString(),
      // In a real app, these URLs would be generated after uploading to storage
      imageUrl: documentData.imageUri,
      thumbnailUrl: documentData.imageUri,
    };
    
    // Add to mock database
    documents.unshift(newDocument);
    
    return id;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
};

export const getRecentDocuments = async (limit: number) => {
  try {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll return from our mock database
    return documents.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent documents:', error);
    throw new Error('Failed to get recent documents');
  }
};

export const getDocuments = async (userId?: string, userType?: string) => {
  try {
    // In a real app, this would fetch from an API with proper filtering
    // For demo purposes, we'll filter our mock database
    
    if (userType === 'admin' || userType === 'accountant') {
      // Admins and accountants can see all documents
      return documents;
    } else if (userType === 'owner') {
      // Owners can see aggregated data but not individual employee documents
      // For demo, we'll just return all documents
      return documents;
    } else {
      // Employees can only see their own documents
      return documents.filter(doc => doc.userId === userId);
    }
  } catch (error) {
    console.error('Error getting documents:', error);
    throw new Error('Failed to get documents');
  }
};

export const getDocumentById = async (id: string) => {
  try {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll find in our mock database
    const document = documents.find(doc => doc.id === id);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    return document;
  } catch (error) {
    console.error('Error getting document by ID:', error);
    throw error;
  }
};

export const updateDocumentStatus = async (id: string, status: string) => {
  try {
    // In a real app, this would update via an API
    // For demo purposes, we'll update our mock database
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    documents[documentIndex] = {
      ...documents[documentIndex],
      status,
    };
    
    return documents[documentIndex];
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    // In a real app, this would delete via an API
    // For demo purposes, we'll update our mock database
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    documents = documents.filter(doc => doc.id !== id);
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};
