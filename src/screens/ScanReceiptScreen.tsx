import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { createWorker } from 'tesseract.js';

export default function ScanReceiptScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    vendor: '',
    taxCategory: 'business',
    notes: ''
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResults(null);
    }
  };

  const scanReceipt = async () => {
    if (!image) return;

    try {
      setScanning(true);
      
      // Note: This is a simplified version for the example
      // In a real app, you'd need to handle the image properly for Tesseract
      Alert.alert('Scanning', 'This is a placeholder for OCR scanning. In a real app, this would process the image with Tesseract.js');
      
      // Simulate OCR result
      setTimeout(() => {
        setResults("Sample Store\nDate: 2023-05-15\nAmount: $45.99\nThank you for your purchase!");
        setScanning(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error scanning receipt:', error);
      Alert.alert('Error', 'Failed to scan receipt');
      setScanning(false);
    }
  };

  const saveReceipt = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('receipts')
        .insert({
          date: formData.date,
          amount: parseFloat(formData.amount) || 0,
          vendor: formData.vendor,
          tax_category: formData.taxCategory,
          notes: formData.notes,
          user_id: currentUser.id
        });
      
      if (error) throw error;
      
      Alert.alert('Success', 'Receipt saved successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
      
    } catch (error) {
      console.error('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Scan Receipt</Text>
      
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        
        {image && (
          <TouchableOpacity 
            style={[styles.button, scanning && styles.buttonDisabled]} 
            onPress={scanReceipt}
            disabled={scanning}
          >
            <Text style={styles.buttonText}>
              {scanning ? 'Scanning...' : 'Scan Receipt'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {scanning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}
      
      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Scan Results:</Text>
          <Text style={styles.resultsText}>{results}</Text>
          
          <TouchableOpacity style={styles.button} onPress={saveReceipt}>
            <Text style={styles.buttonText}>Save Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#4b5563',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultsText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
});
