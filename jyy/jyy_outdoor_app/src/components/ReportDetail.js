import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const ReportDetail = () => {
  // State to hold the received notification
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    // 请求通知权限
    async function registerForNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable permissions in settings');
        return;
      }
    }

    registerForNotifications();
  }, []);
  // 调度本地通知的函数
  async function handleScheduleNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Look at that notification",
        body: "I'm so proud of myself!",
      },
      trigger: null, // 立即触发
    });
  }
  return (
    <View style={styles.container}>
      {notification && (
        <Text>{notification.request.content.title} - {notification.request.content.body}</Text>
      )}
      <Button title="Send Notification" onPress={handleScheduleNotification} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReportDetail;
