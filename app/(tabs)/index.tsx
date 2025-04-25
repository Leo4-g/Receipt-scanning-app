import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, FileText, ChartBar as BarChart3, Plus } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getRecentDocuments } from '@/services/documentService';
import { Document } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadRecentDocuments = async () => {
      try {
        const docs = await getRecentDocuments(5);
        setRecentDocuments(docs);
      } catch (error) {
        console.error('Error loading recent documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDocuments();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigateToScanReceipt = () => {
    router.push('/(tabs)/scan');
  };

  // Add a prominent button at the top for easier access
  const AddReceiptsButton = () => (
    <TouchableOpacity 
      style={styles.prominentButton}
      onPress={navigateToScanReceipt}
    >
      <Camera size={24} color="#fff" />
      <Text style={styles.prominentButtonText}>Add New Receipt</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.userRole}>
            <Text style={styles.roleText}>{user?.userType?.toUpperCase() || 'EMPLOYEE'}</Text>
          </View>
        </View>

        {/* Add prominent button right after header */}
        <AddReceiptsButton />

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { width: screenWidth > 350 ? '30%' : '45%' }]}
              onPress={navigateToScanReceipt}
            >
              <View style={styles.actionIconContainer}>
                <Camera size={24} color="#4361ee" />
              </View>
              <Text style={styles.actionText}>Add receipts</Text>
            </TouchableOpacity>

            {(user?.userType === 'accountant' || user?.userType === 'admin' || user?.userType === 'owner') && (
              <TouchableOpacity 
                style={[styles.actionButton, { width: screenWidth > 350 ? '30%' : '45%' }]}
                onPress={() => router.push('/(tabs)/documents')}
              >
                <View style={styles.actionIconContainer}>
                  <FileText size={24} color="#4361ee" />
                </View>
                <Text style={styles.actionText}>View Documents</Text>
              </TouchableOpacity>
            )}

            {(user?.userType === 'accountant' || user?.userType === 'admin' || user?.userType === 'owner') && (
              <TouchableOpacity 
                style={[styles.actionButton, { width: screenWidth > 350 ? '30%' : '45%' }]}
                onPress={() => router.push('/(tabs)/reports')}
              >
                <View style={styles.actionIconContainer}>
                  <BarChart3 size={24} color="#4361ee" />
                </View>
                <Text style={styles.actionText}>Generate Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recentDocuments}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Documents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/documents')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading recent documents...</Text>
            </View>
          ) : recentDocuments.length > 0 ? (
            recentDocuments.map((doc) => (
              <TouchableOpacity 
                key={doc.id} 
                style={styles.documentItem}
                onPress={() => router.push(`/document/${doc.id}`)}
              >
                <Image 
                  source={{ uri: doc.thumbnailUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80' }} 
                  style={styles.documentThumbnail}
                />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.title || 'Untitled Document'}</Text>
                  <Text style={styles.documentDate}>{new Date(doc.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.documentAmount}>${doc.amount?.toFixed(2) || '0.00'}</Text>
                </View>
                <Text style={[styles.documentStatus, 
                  doc.status === 'approved' ? styles.statusApproved : 
                  doc.status === 'rejected' ? styles.statusRejected : 
                  styles.statusPending
                ]}>
                  {doc.status?.toUpperCase() || 'PENDING'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents yet</Text>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={navigateToScanReceipt}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.scanButtonText}>Add New Receipt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  userRole: {
    backgroundColor: '#e6e9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#4361ee',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  prominentButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prominentButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  actionIconContainer: {
    backgroundColor: '#f0f4ff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  recentDocuments: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#4361ee',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
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
  documentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  documentAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  documentStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});
