import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Picker } from '@react-native-picker/picker';

export default function ManualEntryScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    vendor: '',
    taxCategory: 'business',
    notes: ''
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    if (!formData.vendor || !formData.amount) {
      return Alert.alert('Error', 'Please enter vendor an<boltArtifact id="setup-expo-for-mobile" title="Setup Expo for Mobile Development">
<boltAction type="file" filePath="src/screens/ManualEntryScreen.tsx">
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Picker } from '@react-native-picker/picker';

export default function ManualEntryScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    vendor: '',
    taxCategory: 'business',
    notes: ''
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    if (!formData.vendor || !formData.amount) {
      return Alert.alert('Error', 'Please enter vendor and amount');
    }
    
    try {
      setLoading(true);
      
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
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manual Receipt Entry</Text>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vendor</Text>
          <TextInput
            style={styles.input}
            value={formData.vendor}
            onChangeText={(value) => handleInputChange('vendor', value)}
            placeholder="Vendor name"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tax Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.taxCategory}
              onValueChange={(value) => handleInputChange('taxCategory', value)}
              style={styles.picker}
            >
              <Picker.Item label="Business Expense" value="business" />
              <Picker.Item label="Travel" value="travel" />
              <Picker.Item label="Meals & Entertainment" value="meals" />
              <Picker.Item label="Office Supplies" value="office" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Receipt'}
          </Text>
        </TouchableOpacity>
      </View>
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
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#4f46e5',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
