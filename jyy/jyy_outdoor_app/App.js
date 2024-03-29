// App.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity ,ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportForm from './src/components/ReportForm';
import ReportList from './src/components/ReportList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('./assets/uws1.png')} 
      style={styles.homeContainer}
      resizeMode="cover"
    >
      <Text style={styles.title}>Here is the manage maintenance APP of UWS. If you find any problems with campus equipment, you can upload them!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ReportForm')}
      >
        <Text style={styles.buttonText}>Publish Report</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ReportList')}
      >
        <Text style={styles.buttonText}>View Reports</Text>
      </TouchableOpacity>
      </ImageBackground>
  );
}
export default function App() {
  const [reports, setReports] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // 正在编辑的报告的索引
  const [editingDescription, setEditingDescription] = useState(''); // 正在编辑的报告的描述
  const Stack = createNativeStackNavigator();
  useEffect(() => {
    const loadReports = async () => {
      const storedReports = await AsyncStorage.getItem('reports');
      if (storedReports) setReports(JSON.parse(storedReports));
    };
    loadReports();
  }, []);

  const handleAddReport = async (reportData) => {
    let updatedReports;
    if (editingIndex !== null) {
      updatedReports = reports.map((item, index) =>
        index === editingIndex ? { ...item, ...reportData } : item);
      setEditingIndex(null); 
    } else {
      updatedReports = [...reports, reportData];
    }
    setReports(updatedReports);
    await AsyncStorage.setItem('reports', JSON.stringify(updatedReports));
  };

  const onEdit = (index) => {
    setEditingIndex(index);
    setEditingDescription(reports[index].description);
  };
  // 实现保存编辑更改的函数
  const saveEdit = () => {
    const updatedReports = reports.map((report, index) => {
      if (index === editingIndex) {
        return { ...report, description: editingDescription };
      }
      return report;
    });
    setReports(updatedReports);
    setEditingIndex(null); // 重置编辑状态
    setEditingDescription(''); // 清空编辑描述
  };

  const onDelete = (index) => {
    const updatedReports = reports.filter((_, i) => i !== index);
    setReports(updatedReports);
    AsyncStorage.setItem('reports', JSON.stringify(updatedReports));
  };
  const onEditSubmit = async (index, editedDescription) => {
    const updatedReports = reports.map((report, idx) => {
      if (idx === index) {
        return { ...report, description: editedDescription };
      }
      return report;
    });

    setReports(updatedReports); // 更新报告数组状态
    await AsyncStorage.setItem('reports', JSON.stringify(updatedReports)); // 保存到AsyncStorage
  };

  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Manage Maintenance' }} />
        <Stack.Screen name="ReportForm">
          {() => <ReportForm onAddReport={handleAddReport} />}
        </Stack.Screen>
        <Stack.Screen name="ReportList">
          {() => <ReportList reports={reports} onEdit={onEdit} onDelete={onDelete} onEditSubmit={onEditSubmit} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60, 
    paddingBottom: 20, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 80, 
    paddingHorizontal: 20, 
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderRadius: 10, 
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25, 
    marginBottom: 20, 
    width: '50%', 

  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000', 
  },
  buttonContainer: {
    width: '100%', 
    alignItems: 'center',
     
  },
});
