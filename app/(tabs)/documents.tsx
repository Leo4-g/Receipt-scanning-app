import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Check, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getDocuments, updateDocumentStatus } from '@/services/documentService';
import { Document } from '@/types';

export default function DocumentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, statusFilter, dateFilter, documents]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments(user?.id, user?.userType);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      // Implement date filtering logic based on your requirements
      // For example, filter by month, year, or specific date range
    }

    setFilteredDocuments(filtered);
  };

  const handleApprove = async (documentId: string) => {
    try {
      await updateDocumentStatus(documentId, 'approved');
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === documentId ? { ...doc, status: 'approved' } : doc
        )
      );
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleReject = async (documentId: string) => {
    try {
      await updateDocumentStatus(documentId, 'rejected');
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === documentId ? { ...doc, status: 'rejected' } : doc
        )
      );
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => router.push(`/document/${item.id}`)}
    >
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{item.title || 'Untitled Document'}</Text>
        <Text style={styles.documentMeta}>
          {item.vendor ? `${item.vendor} • ` : ''}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.documentAmount}>${item.amount?.toFixed(2) || '0.00'}</Text>
      </View>
      
      <View style={styles.documentActions}>
        <Text style={[styles.documentStatus, 
          item.status === 'approved' ? styles.statusApproved : 
          item.status === 'rejected' ? styles.statusRejected : 
          styles.statusPending
        ]}>
          {item.status?.toUpperCase() || 'PENDING'}
        </Text>
        
        {(user?.userType === 'accountant' || user?.userType === 'admin') && 
         item.status === 'pending' && (
          <View style={styles.approvalButtons}>
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => handleApprove(item.id)}
            >
              <Check size={16} color="#10b981" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleReject(item.id)}
            >
              <X size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>
          {user?.userType === 'accountant' ? 'Review and approve receipts' : 
           user?.userType === 'admin' ? 'Manage all company receipts' : 
           user?.userType === 'owner' ? 'View company expenses' : 
           'Your uploaded receipts'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#4361ee" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTags}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTag,
              statusFilter === (status === 'all' ? null : status) && styles.filterTagActive,
            ]}
            onPress={() => setStatusFilter(status === 'all' ? null : status)}
          >
            <Text
              style={[
                styles.filterTagText,
                statusFilter === (status === 'all' ? null : status) && styles.filterTagTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : filteredDocuments.length > 0 ? (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocumentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.documentsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No documents found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters or scan a new receipt</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterTags: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterTagActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  filterTagText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterTagTextActive: {
    color: '#fff',
  },
  documentsList: {
    padding: 20,
  },
  documentItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  documentAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  documentActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  documentStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
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
  approvalButtons: {
    flexDirection: 'row',
  },
  approveButton: {
    backgroundColor: '#e6f7ef',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});
