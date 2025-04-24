import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Calendar, Download, Filter, ChartBar as BarChart3, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { generateReport } from '@/services/reportService';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('monthly'); // 'monthly' or 'annual'
  const [reportPeriod, setReportPeriod] = useState('current'); // 'current', 'previous', 'custom'
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReportData = async () => {
    setLoading(true);
    try {
      const data = await generateReport(reportType, reportPeriod);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demonstration
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [1500, 1700, 1400, 1900, 2100, 1800],
      },
    ],
  };

  const categoryData = {
    labels: ['Office', 'Travel', 'Meals', 'Tech', 'Other'],
    datasets: [
      {
        data: [2500, 1800, 1200, 3000, 900],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>
            {user?.userType === 'owner' 
              ? 'View financial reports for your company' 
              : 'Generate and analyze expense reports'}
          </Text>
        </View>

        <View style={styles.reportOptions}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Report Type</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  reportType === 'monthly' && styles.optionButtonActive,
                ]}
                onPress={() => setReportType('monthly')}
              >
                <Calendar size={16} color={reportType === 'monthly' ? '#fff' : '#4361ee'} />
                <Text
                  style={[
                    styles.optionButtonText,
                    reportType === 'monthly' && styles.optionButtonTextActive,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  reportType === 'annual' && styles.optionButtonActive,
                ]}
                onPress={() => setReportType('annual')}
              >
                <BarChart3 size={16} color={reportType === 'annual' ? '#fff' : '#4361ee'} />
                <Text
                  style={[
                    styles.optionButtonText,
                    reportType === 'annual' && styles.optionButtonTextActive,
                  ]}
                >
                  Annual
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Period</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  reportPeriod === 'current' && styles.optionButtonActive,
                ]}
                onPress={() => setReportPeriod('current')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    reportPeriod === 'current' && styles.optionButtonTextActive,
                  ]}
                >
                  Current
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  reportPeriod === 'previous' && styles.optionButtonActive,
                ]}
                onPress={() => setReportPeriod('previous')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    reportPeriod === 'previous' && styles.optionButtonTextActive,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  reportPeriod === 'custom' && styles.optionButtonActive,
                ]}
                onPress={() => setReportPeriod('custom')}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    reportPeriod === 'custom' && styles.optionButtonTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateReportData}
          >
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361ee" />
            <Text style={styles.loadingText}>Generating report...</Text>
          </View>
        ) : (
          <>
            <View style={styles.reportSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Expense Overview</Text>
                <Text style={styles.sectionSubtitle}>
                  {reportType === 'monthly' ? 'Last 6 months' : 'Current year'}
                </Text>
              </View>
              
              <View style={styles.chartContainer}>
                <LineChart
                  data={monthlyData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$10,400</Text>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$1,733</Text>
                  <Text style={styles.statLabel}>Monthly Average</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.trendContainer}>
                    <Text style={styles.statValue}>+12%</Text>
                    <TrendingUp size={16} color="#10b981" />
                  </View>
                  <Text style={styles.statLabel}>vs Previous</Text>
                </View>
              </View>
            </View>

            <View style={styles.reportSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Expenses by Category</Text>
              </View>
              
              <View style={styles.chartContainer}>
                <BarChart
                  data={categoryData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  verticalLabelRotation={30}
                />
              </View>
              
              <View style={styles.categoryList}>
                {[
                  { name: 'Office Supplies', amount: 2500, percentage: 27 },
                  { name: 'Travel', amount: 1800, percentage: 19 },
                  { name: 'Meals & Entertainment', amount: 1200, percentage: 13 },
                  { name: 'Technology', amount: 3000, percentage: 32 },
                  { name: 'Other', amount: 900, percentage: 9 },
                ].map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                    </View>
                    <Text style={styles.categoryAmount}>${category.amount}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Report</Text>
            </TouchableOpacity>
          </>
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
  reportOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionRow: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4361ee',
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#4361ee',
  },
  optionButtonText: {
    color: '#4361ee',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  reportSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
    marginRight: 8,
  },
  categoryPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#4361ee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});
