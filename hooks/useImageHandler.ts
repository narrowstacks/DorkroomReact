import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useImageHandler = () => {
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

  const uploadImage = async () => {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access the photo library.");
      return;
    }

    // Launch the image library
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Optional: allow editing
      aspect: [1, 1], // Optional: specify aspect ratio if editing is allowed
      quality: 1, // Optional: specify image quality
    });

    // Handle the result
    if (!pickerResult.canceled) {
      setCurrentImageUri(pickerResult.assets[0].uri);
    } else {
      // Optional: Handle cancellation if needed
      // console.log('Image picking cancelled');
    }
  };

  return { uploadImage, currentImageUri, setCurrentImageUri };
}; 