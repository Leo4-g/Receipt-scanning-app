import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Upload, FileText, X } from 'lucide-react-native';

export default function AddReceiptsScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Mock function to simulate taking a photo
  const handleTakePhoto = () => {
    // In a real app, this would use the camera API
    // For demo, we'll just set a placeholder image
    setSelectedImage('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80');
  };
  
  // Mock function to simulate uploading a photo
  const handleUploadPhoto = () => {
    // In a real app, this would use the image picker API
    // For demo, we'll just set a placeholder image
    setSelectedImage('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80');
  };
  
  const handleClearImage = () => {
    setSelectedImage(null);
  };
  
  const handleSaveReceipt = () => {
    // In a real app, this would save the receipt to the database
    // For demo, we'll just navigate back to the home screen
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Receipt</Text>
        </View>
        
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Receipt Preview</Text>
              <TouchableOpacity onPress={handleClearImage}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveReceipt}
            >
              <FileText size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Choose an option</Text>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.optionIconContainer}>
                <Camera size={32} color="#4361ee" />
              </View>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionDescription}>Use your camera to take a photo of your receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleUploadPhoto}
            >
              <View style={styles.optionIconContainer}>
                <Upload size={32} color="#4361ee" />
              </View>
              <Text style={styles.optionTitle}>Upload Photo</Text>
              <Text style={styles.optionDescription}>Select a photo from your gallery</Text>
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
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
});
