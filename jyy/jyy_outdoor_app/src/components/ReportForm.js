// src/components/ReportForm.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, Text, TouchableOpacity,ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { isPointInPolygon } from 'geolib';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
const ReportForm = ({ onAddReport, editingReport, setEditingDescription }) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  useEffect(() => {
    if (editingReport) {
      setDescription(editingReport.description);
    } else {
      setDescription('');
      setPhotos([]);
      setLocation(null);
      setShowMap(false);
      setSelectedLocation(null);
    }
  }, [editingReport]);

  useEffect(() => {
    console.log(photo);
  }, [photo]);

  // 定义限制区域的坐标,我设置的是uws佩斯利的坐标
  const RESTRICTED_AREA = [
    { latitude: 55.84248775834665, longitude: -4.427229994717296 },
    { latitude: 55.84502853622261, longitude: -4.428699088828313 },
    { latitude: 55.844186231881444, longitude: -4.432625366220824 },
    { latitude: 55.842283610952904, longitude: -4.432543513336828 }
  ];

  //从相机拍照照片
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    if (!result.cancelled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };
  // 从相册中选择图片
  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setPhotos(photos => [...photos, result.assets[0].uri]);
    }
  };
  //获取地理位置
  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setSelectedLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    setShowMap(true);
  };
  //选取地理位置
  const handleSelectLocation = (event) => {
    const selectedPoint = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    };

    if (isPointInPolygon(selectedPoint, RESTRICTED_AREA)) {
      setSelectedLocation(selectedPoint);

    } else {
      Alert.alert("Error", "Selected location is not in the restricted area.");
    }
  };
  //确认地图坐标
  const confirmLocation = () => {
    Alert.alert("Confirm Location", "Are you sure you want to use this location?", [
      { text: "Cancel", onPress: () => { } },
      {
        text: "OK", onPress: () => {
          setLocation(selectedLocation);
          setShowMap(false); // 用户确认后，关闭地图并保存位置

        }
      }
    ]);
  };

  // 删除照片的函数
  const handleDeletePhoto = (index) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", onPress: () => {
          setPhotos(photos => photos.filter((_, photoIndex) => photoIndex !== index));
        }
      },
    ]);
  };

  const handleSubmit = async() => {
    if (!description.trim() || photos.length === 0 || !location) {
      Alert.alert("Missing Information", "Please make sure all fields including description, photos, and location are provided.");
      return;
    }
    const timestamp = new Date().toISOString();
    const reportData = { timestamp, description, photos, location };
    onAddReport({ reportData, description, photos, location, timestamp });
    // 发送本地通知
    console.log('About to submit report and schedule a notification');

    try {
      const notificationResponse = await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Report 📝",
          body: "Your report has been successfully submitted!",
        },
        trigger: { seconds: 1 },
      });
      console.log('Notification scheduled', notificationResponse);
    } catch (error) {
      console.error('Failed to schedule notification', error);
    }
    Alert.alert("Success", "Report submitted successfully!", [
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ]);
    setDescription('');
    setPhotos([]);
    setLocation(null);
  };

  return (
    <LinearGradient
      colors={['#6DD5FA', '#B8F1B0']}
      style={{ flex: 1 }}
    >
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.iconButtonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handlePickPhoto}>
          <Ionicons name="images-outline" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleLocationPress}>
          <Ionicons name="location-outline" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>
      {showMap ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={location ? {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            } : {
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleSelectLocation}
          >
            {selectedLocation && <Marker coordinate={selectedLocation} />}
            <Polygon
              coordinates={RESTRICTED_AREA}
              fillColor="rgba(255, 0, 0, 0.5)"
              strokeColor="rgba(255, 0, 0, 0.5)"
            />
          </MapView>
          <View style={styles.buttonContainer}>
            <Button title="Confirm Location" onPress={confirmLocation} color="#1DA1F2" />
          </View>
        </View>
      ) : null}
      <Text style={styles.locationPreview}>
        Location: {selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : 'No location'}
      </Text>
      <View style={styles.photoContainer}>
        {photos.map((photoUri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.touchable} // 使用 touchable 样式
            onLongPress={() => handleDeletePhoto(index)}
          >
            <Image source={{ uri: photoUri }} style={styles.photo} />
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  iconButton: {
    marginLeft: 20,
  },
  map: {
    width: '100%',
    height: 400,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  touchable: {
    width: '32%',
    height: 120,
    marginBottom: 10,
  },
});

export default ReportForm;
