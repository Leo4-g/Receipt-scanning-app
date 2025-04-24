// Mock data for reports
const monthlyExpenseData = {
  current: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [1500, 1700, 1400, 1900, 2100, 1800],
    total: 10400,
    average: 1733,
    trend: '+12%',
  },
  previous: {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [1300, 1600, 1800, 1500, 1400, 1700],
    total: 9300,
    average: 1550,
    trend: '-5%',
  },
};

const annualExpenseData = {
  current: {
    labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4'],
    data: [4600, 5800, 6200, 5400],
    total: 22000,
    average: 5500,
    trend: '+8%',
  },
  previous: {
    labels: ['2022 Q1', '2022 Q2', '2022 Q3', '2022 Q4'],
    data: [4200, 5400, 5800, 5000],
    total: 20400,
    average: 5100,
    trend: '+3%',
  },
};

const categoryData = {
  monthly: {
    labels: ['Office', 'Travel', 'Meals', 'Tech', 'Other'],
    data: [2500, 1800, 1200, 3000, 900],
    breakdown: [
      { name: 'Office Supplies', amount: 2500, percentage: 27 },
      { name: 'Travel', amount: 1800, percentage: 19 },
      { name: 'Meals & Entertainment', amount: 1200, percentage: 13 },
      { name: 'Technology', amount: 3000, percentage: 32 },
      { name: 'Other', amount: 900, percentage: 9 },
    ],
  },
  annual: {
    labels: ['Office', 'Travel', 'Meals', 'Tech', 'Other'],
    data: [9500, 7800, 5200, 12000, 3900],
    breakdown: [
      { name: 'Office Supplies', amount: 9500, percentage: 25 },
      { name: 'Travel', amount: 7800, percentage: 20 },
      { name: 'Meals & Entertainment', amount: 5200, percentage: 14 },
      { name: 'Technology', amount: 12000, percentage: 31 },
      { name: 'Other', amount: 3900, percentage: 10 },
    ],
  },
};

export const generateReport = async (reportType: string, reportPeriod: string) => {
  try {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll return mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let expenseData;
    if (reportType === 'monthly') {
      expenseData = monthlyExpenseData[reportPeriod === 'current' ? 'current' : 'previous'];
    } else {
      expenseData = annualExpenseData[reportPeriod === 'current' ? 'current' : 'previous'];
    }
    
    const categories = categoryData[reportType];
    
    return {
      expenseData,
      categories,
      reportType,
      reportPeriod,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report');
  }
};
