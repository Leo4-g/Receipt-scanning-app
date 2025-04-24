import { Tabs } from 'expo-router';
import { Home, FileText, Camera, Receipt, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4361ee',
      tabBarInactiveTintColor: '#666',
      tabBarLabelStyle: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
      },
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#e1e1e1',
        height: 60,
        paddingBottom: 10,
        paddingTop: 10,
      },
      headerShown: true,
      headerTitleStyle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
      },
      headerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan Document',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color }) => <Camera size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-receipts"
        options={{
          title: 'Add Receipts',
          tabBarLabel: 'Receipts',
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
