import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, Upload, X, Check, CreditCard as Edit3 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { processReceiptWithOCR, uploadDocument } from '@/services/documentService';

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        processImage(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        processImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const processImage = async (uri: string) => {
    setProcessing(true);
    
    try {
      // Optimize image for OCR
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Process with OCR
      const result = await processReceiptWithOCR(manipResult.uri);
      
      setOcrResult(result);
      
      // Pre-fill form with extracted data
      if (result) {
        if (result.total) setAmount(result.total.toString());
        if (result.date) setDate(result.date);
        if (result.vendor) setVendor(result.vendor);
        setTitle(`Receipt from ${result.vendor || 'Unknown'}`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Processing Error', 'Failed to process the receipt. Please try again or enter details manually.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setOcrResult(null);
    setTitle('');
    setAmount('');
    setDate('');
    setVendor('');
    setCategory('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Missing Image', 'Please scan or upload a receipt image');
      return;
    }

    if (!title || !amount) {
      Alert.alert('Missing Information', 'Please provide at least a title and amount');
      return;
    }

    setProcessing(true);

    try {
      const documentData = {
        title,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        vendor,
        category,
        notes,
        userId: user?.id,
        userType: user?.userType,
        status: user?.userType === 'admin' || user?.userType === 'accountant' ? 'approved' : 'pending',
        imageUri: image,
      };

      await uploadDocument(documentData);
      Alert.alert('Success', 'Receipt uploaded successfully');
      resetForm();
      router.push('/');
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Error', 'Failed to upload the receipt. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Receipt</Text>
          <Text style={styles.subtitle}>Take a photo or upload a receipt image</Text>
        </View>

        {!image ? (
          <View style={styles.captureContainer}>
            <View style={styles.captureBox}>
              <Camera size={48} color="#4361ee" style={styles.captureIcon} />
              <Text style={styles.captureText}>No image captured</Text>
              
              <View style={styles.captureButtons}>
                <TouchableOpacity 
                  style={[styles.captureButton, styles.primaryButton]} 
                  onPress={takePhoto}
                >
                  <Camera size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.captureButton, styles.secondaryButton]} 
                  onPress={pickImage}
                >
                  <Upload size={20} color="#4361ee" />
                  <Text style={styles.secondaryButtonText}>Upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetForm}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
            
            {processing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#4361ee" />
                <Text style={styles.processingText}>Processing receipt...</Text>
              </View>
            )}
          </View>
        )}

        {image && !processing && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Receipt Details</Text>
            {ocrResult && (
              <View style={styles.ocrResultContainer}>
                <Text style={styles.ocrResultText}>
                  OCR completed. Please verify the extracted information.
                </Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Receipt title"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Vendor</Text>
              <TextInput
                style={styles.input}
                value={vendor}
                onChangeText={setVendor}
                placeholder="Vendor name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Office Supplies, Travel, etc."
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Receipt</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  captureBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  captureIcon: {
    marginBottom: 16,
  },
  captureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 24,
  },
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#4361ee',
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4361ee',
  },
  secondaryButtonText: {
    color: '#4361ee',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4361ee',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  ocrResultContainer: {
    backgroundColor: '#e6f7ef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  ocrResultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#10b981',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});
