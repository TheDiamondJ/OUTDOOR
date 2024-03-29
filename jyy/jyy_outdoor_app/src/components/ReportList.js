import React, { useState } from 'react';
import { Modal, View, TextInput, Text, ScrollView, Image, StyleSheet, Button, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from 'react-native-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
const ReportList = ({ reports, onEdit, onDelete, onEditSubmit }) => {
  const [isEditing, setIsEditing] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  // 打开模态对话框并显示图片的函数
  const openImageModal = (uri) => {
    console.log("Open image modal with URI:", uri); // 添加日志输出
    setSelectedImage(uri);
    setModalVisible(true);
  };

  // 关闭模态对话框的函数
  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };
  return (
    <LinearGradient
      colors={['#6DD5FA', '#B8F1B0']}
      style={{ flex: 1 }}
    >
      <ScrollView>
        {reports.map((report, index) => (
          <View key={index} style={styles.report}>
            {isEditing === index ? (
              <TextInput
                value={editingText}
                onChangeText={setEditingText}
                style={styles.input}
                autoFocus={true}
              />
            ) : (
              <Text>{report.description}</Text>
            )}
            <Text style={styles.timestamp}>
              Posted on: {new Date(report.timestamp).toLocaleString()}
            </Text>
            {/* 报告图片 */}
            {report.photos && report.photos.map((photoUri, photoIndex) => (
              <TouchableOpacity key={photoIndex} onPress={() => openImageModal(photoUri)}>
                <Image source={{ uri: photoUri }} style={styles.image} />
              </TouchableOpacity>
            ))}
            <Modal
              visible={modalVisible}
              transparent={true}
              onRequestClose={closeImageModal}>
              <TouchableOpacity style={styles.centeredView} onPress={closeImageModal}>
                <View style={styles.modalView}>
                  <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeImageModal}>
                    <Text style={styles.closeButtonText}>colse</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
            <Text onPress={() => {
              report.location && Linking.openURL(`http://maps.google.com/maps?q=${report.location.latitude},${report.location.longitude}`);
            }}>Location: {report.location ? `${report.location.latitude}, ${report.location.longitude}` : 'No location'}</Text>
            <View style={styles.buttonContainer}>
              {isEditing === index ? (
                <TouchableOpacity onPress={() => {
                  onEditSubmit(index, editingText);
                  setIsEditing(null);
                }}>
                  <MaterialIcons name="save" size={24} color="black" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => {
                  setIsEditing(index);
                  setEditingText(report.description);
                }}>
                  <MaterialIcons name="edit" size={24} color="black" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onDelete(index)}>
                <MaterialIcons name="delete" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  report: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  timestamp: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginTop: 8,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});


export default ReportList;
