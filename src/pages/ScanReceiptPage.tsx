import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabase';

export default function ScanReceiptPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    date: string;
    amount: string;
    vendor: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    vendor: '',
    taxCategory: 'business',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'receipt-capture.jpg', { type: 'image/jpeg' });
            setImage(file);
            setPreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const scanReceipt = async () => {
    if (!image) return;
    
    setScanning(true);
    
    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      console.log('Extracted text:', text);
      
      // Simple parsing logic - this would need to be more sophisticated in a real app
      const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
      const amountMatch = text.match(/\$?\s*\d+\.\d{2}/);
      
      // Try to extract vendor name - this is a simplistic approach
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const potentialVendor = lines.length > 0 ? lines[0] : '';
      
      setExtractedData({
        date: dateMatch ? dateMatch[0] : '',
        amount: amountMatch ? amountMatch[0].replace('$', '').trim() : '',
        vendor: potentialVendor
      });
      
      setFormData(prev => ({
        ...prev,
        date: dateMatch ? dateMatch[0] : '',
        amount: amountMatch ? amountMatch[0].replace('$', '').trim() : '',
        vendor: potentialVendor
      }));
      
    } catch (error) {
      console.error('Error scanning receipt:', error);
      alert('Error scanning receipt. Please try again or enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      let imageUrl = '';
      
      if (image) {
        // Upload image to Supabase Storage
        const fileExt = image.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, image);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Insert receipt data into Supabase
      const { error } = await supabase
        .from('receipts')
        .insert({
          date: formData.date,
          amount: parseFloat(formData.amount) || 0,
          vendor: formData.vendor,
          tax_category: formData.taxCategory,
          notes: formData.notes,
          image_url: imageUrl,
          user_id: currentUser.id
        });
      
      if (error) throw error;
      
      navigate('/');
      
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Scan Receipt</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          {!preview && !cameraActive ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </button>
                <button
                  onClick={startCamera}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Use Camera
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-500">Upload a receipt image or take a photo</p>
            </div>
          ) : cameraActive ? (
            <div className="flex flex-col items-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full max-h-96 object-contain mb-4 rounded-lg"
              />
              <div className="flex space-x-4">
                <button
                  onClick={captureImage}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img 
                src={preview || ''} 
                alt="Receipt preview" 
                className="w-full max-h-96 object-contain mb-4 rounded-lg"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                    setExtractedData(null);
                  }}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Choose Different Image
                </button>
                {!extractedData && !scanning && (
                  <button
                    onClick={scanReceipt}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {scanning ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Scan Receipt
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {(extractedData || scanning) && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {scanning ? 'Scanning Receipt...' : 'Receipt Details'}
            </h2>
          </div>
          
          {scanning ? (
            <div className="p-6 flex justify-center">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                <p>Processing receipt image...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="MM/DD/YYYY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Vendor name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category</label>
                <select
                  name="taxCategory"
                  value={formData.taxCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="business">Business Expense</option>
                  <option value="travel">Travel</option>
                  <option value="meals">Meals & Entertainment</option>
                  <option value="office">Office Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
