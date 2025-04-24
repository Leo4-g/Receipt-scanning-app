import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabase';
import { analyzeReceiptImage, extractReceiptInfo } from '../services/googleVision';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle video element loaded metadata to ensure dimensions are set
  const handleVideoMetadata = () => {
    if (videoRef.current && canvasRef.current) {
      // Set canvas size to match video dimensions
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Force a redraw of the overlay
      drawScanOverlay();
    }
  };

  // Draw scan overlay on canvas
  const drawScanOverlay = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get video dimensions
    const videoWidth = videoRef.current.videoWidth || canvas.width;
    const videoHeight = videoRef.current.videoHeight || canvas.height;
    
    // Ensure canvas matches video dimensions
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Calculate document frame (80% of the smaller dimension)
    const size = Math.min(videoWidth, videoHeight) * 0.8;
    const x = (videoWidth - size) / 2;
    const y = (videoHeight - size) / 2;
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, videoWidth, videoHeight);
    
    // Clear the document area
    ctx.clearRect(x, y, size, size);
    
    // Draw document frame
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    
    // Draw corner markers
    const markerLength = size * 0.1;
    ctx.beginPath();
    
    // Top-left corner
    ctx.moveTo(x, y + markerLength);
    ctx.lineTo(x, y);
    ctx.lineTo(x + markerLength, y);
    
    // Top-right corner
    ctx.moveTo(x + size - markerLength, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size, y + markerLength);
    
    // Bottom-right corner
    ctx.moveTo(x + size, y + size - markerLength);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x + size - markerLength, y + size);
    
    // Bottom-left corner
    ctx.moveTo(x + markerLength, y + size);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x, y + size - markerLength);
    
    ctx.stroke();
    
    // Add text guide
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Position receipt within frame', videoWidth / 2, y - 10);
  };

  // Animation loop for overlay
  useEffect(() => {
    let animationFrameId: number;
    
    if (cameraActive) {
      const animate = () => {
        drawScanOverlay();
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [cameraActive]);

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
      setCameraError(null);
      
      // First, check if camera permissions are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        throw new Error('No camera detected on this device');
      }
      
      // Request camera access with explicit constraints
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!stream) {
        throw new Error('Failed to get camera stream');
      }
      
      console.log('Camera stream obtained:', stream);
      
      // Store the stream reference
      streamRef.current = stream;
      
      // Set the stream as the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = handleVideoMetadata;
        
        // Ensure video plays
        try {
          await videoRef.current.play();
          console.log('Video playback started');
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw new Error('Could not start video playback');
        }
        
        setCameraActive(true);
      } else {
        throw new Error('Video element not available');
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError(err.message || 'Could not access camera. Please check permissions.');
      alert('Could not access camera: ' + (err.message || 'Please check permissions.'));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Calculate document frame (80% of the smaller dimension)
        const size = Math.min(video.videoWidth, video.videoHeight) * 0.8;
        const x = (video.videoWidth - size) / 2;
        const y = (video.videoHeight - size) / 2;
        
        // First draw the full frame to see what we're capturing
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Create a new canvas for the cropped image
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = size;
        croppedCanvas.height = size;
        const croppedCtx = croppedCanvas.getContext('2d');
        
        if (croppedCtx) {
          // Draw only the document area to the cropped canvas
          croppedCtx.drawImage(
            video, 
            x, y, size, size,  // Source rectangle
            0, 0, size, size   // Destination rectangle
          );
          
          // Convert to blob and create a file
          croppedCanvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'receipt-capture.jpg', { type: 'image/jpeg' });
              setImage(file);
              setPreview(croppedCanvas.toDataURL('image/jpeg'));
              stopCamera();
            }
          }, 'image/jpeg', 0.95);
        }
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
              <div className="relative w-full max-w-lg mx-auto">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-auto object-contain rounded-lg bg-black"
                  style={{ minHeight: '300px' }}
                />
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
                    <div className="text-white text-center p-4">
                      <p className="mb-2">Camera Error:</p>
                      <p>{cameraError}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={captureImage}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  disabled={!!cameraError}
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
