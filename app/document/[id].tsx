import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, X, Download, CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getDocumentById, updateDocumentStatus, deleteDocument } from '@/services/documentService';
import { Document } from '@/types';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const doc = await getDocumentById(id as string);
      setDocument(doc);
    } catch (error) {
      console.error('Error loading document:', error);
      Alert.alert('Error', 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!document) return;
    
    try {
      await updateDocumentStatus(document.id, 'approved');
      setDocument({ ...document, status: 'approved' });
      Alert.alert('Success', 'Document approved successfully');
    } catch (error) {
      console.error('Error approving document:', error);
      Alert.alert('Error', 'Failed to approve document');
    }
  };

  const handleReject = async () => {
    if (!document) return;
    
    try {
      await updateDocumentStatus(document.id, 'rejected');
      setDocument({ ...document, status: 'rejected' });
      Alert.alert('Success', 'Document rejected successfully');
    } catch (error) {
      console.error('Error rejecting document:', error);
      Alert.alert('Error', 'Failed to reject document');
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(document.id);
              Alert.alert('Success', 'Document deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          }
        },
      ]
    );
  };

  const canApproveOrReject = () => {
    return (
      (user?.userType === 'accountant' || user?.userType === 'admin') && 
      document?.status === 'pending'
    );
  };

  const canEdit = () => {
    return (
      user?.id === document?.userId || 
      user?.userType === 'admin' || 
      user?.userType === 'accountant'
    );
  };

  const canDelete = () => {
    return (
      user?.id === document?.userId || 
      user?.userType === 'admin'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading document details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Document not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Details</Text>
          <View style={styles.headerRight}>
            {canEdit() && (
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push(`/edit-document/${document.id}`)}>
                <Edit3 size={20} color="#4361ee" />
              </TouchableOpacity>
            )}
            {canDelete() && (
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Trash2 size={20} color="#e63946" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, 
            document.status === 'approved' ? styles.statusApproved : 
            document.status === 'rejected' ? styles.statusRejected : 
            styles.statusPending
          ]}>
            {document.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: document.imageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }} 
            style={styles.documentImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.documentTitle}>{document.title || 'Untitled Document'}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>${document.amount?.toFixed(2) || '0.00'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{new Date(document.date || document.createdAt).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vendor:</Text>
            <Text style={styles.detailValue}>{document.vendor || 'Not specified'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{document.category || 'Uncategorized'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted by:</Text>
            <Text style={styles.detailValue}>{document.userName || 'Unknown user'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted on:</Text>
            <Text style={styles.detailValue}>{new Date(document.createdAt).toLocaleString()}</Text>
          </View>
          
          {document.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{document.notes}</Text>
            </View>
          )}
        </View>

        {canApproveOrReject() && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <X size={20} color="#fff" />
              <Text style={styles.rejectButtonText}>Reject</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statusPending: {
    backgroundColor: '#fff8e6',
    color: '#f59e0b',
  },
  statusApproved: {
    backgroundColor: '#e6f7ef',
    color: '#10b981',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  documentImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  documentTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  notesContainer: {
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: '#4361ee',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
