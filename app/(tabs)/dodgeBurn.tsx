import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useImageHandler } from "@/hooks/useImageHandler";
import { useDodgeBurnSaver } from "@/hooks/useDodgeBurnSaver";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  VStack,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  Icon,
  ChevronDownIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  CloseIcon,
  ButtonIcon,
} from "@gluestack-ui/themed";
import uuid from 'react-native-uuid';

interface Exposure {
  id: string;
  grade: string;
  time: string;
}

const GRADES = ["00", "0", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "Custom"];

export default function DodgeBurnCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const { uploadImage, currentImageUri, setCurrentImageUri } = useImageHandler();
  const {
    saveSession,
    loadSession,
    listSavedSessions,
    currentNotes,
    setNotes,
  } = useDodgeBurnSaver();

  const [exposures, setExposures] = useState<Exposure[]>([
    { id: uuid.v4() as string, grade: '2', time: '' }
  ]);
  const [sessionName, setSessionName] = useState('');
  const [loadSessionName, setLoadSessionName] = useState('');

  const addExposure = () => {
    setExposures(prev => [
        ...prev,
        { id: uuid.v4() as string, grade: '2', time: '' }
    ]);
  };

  const removeExposure = (id: string) => {
    setExposures(prev => prev.filter(exp => exp.id !== id));
  };

  const updateExposure = (id: string, field: 'grade' | 'time', value: string) => {
    setExposures(prev => prev.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleSave = () => {
    if (!sessionName) {
      Alert.alert("Error", "Please enter a name to save the session.");
      return;
    }
    saveSession(
        sessionName,
        { uri: currentImageUri },
        exposures,
        currentNotes
    );
    Alert.alert("Success", `Session "${sessionName}" saved.`);
    setSessionName('');
  };

  const handleLoad = () => {
    if (!loadSessionName) {
      Alert.alert("Error", "Please select or enter the name of the session to load.");
      return;
    }
    loadSession(loadSessionName).then((session) => {
      if (session) {
        Alert.alert("Success", `Loaded session: ${loadSessionName}`);
        setCurrentImageUri(session.imageData?.uri ?? null);
        setExposures(
            session.exposures?.map(exp => ({
                id: uuid.v4() as string,
                grade: exp.grade,
                time: exp.time.toString(),
            })) ?? [{ id: uuid.v4() as string, grade: '2', time: '' }]
        );
        setNotes(session.notes ?? '');
        setLoadSessionName('');
      } else {
        Alert.alert("Error", `Session "${loadSessionName}" not found.`);
      }
    }).catch(error => {
        console.error("Error loading session:", error);
        Alert.alert("Error", "Could not load session.");
    });
  };

  const renderGradePicker = (selectedValue: string, onValueChange: (value: string) => void) => {
    return (
      <Select selectedValue={selectedValue} onValueChange={onValueChange} flex={2} minWidth={100}>
        <SelectTrigger variant="outline" size="sm">
          <SelectInput placeholder="Grade" />
          <SelectIcon as={ChevronDownIcon} mr="$3" />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {GRADES.map((grade) => (
              <SelectItem key={grade} label={grade} value={grade} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      scrollEnabled={true}
    >
      <ThemedView
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="large" style={styles.title}>
            Dodge & Burn Tool
          </ThemedText>
        </ThemedView>

        <VStack space="lg" style={styles.mainContent}>
          <View style={[styles.imagePlaceholder, { borderColor }]}>
            {currentImageUri ? (
              <Image source={{ uri: currentImageUri }} style={styles.image} resizeMode="contain" />
            ) : (
              <ThemedText>Upload an image to begin</ThemedText>
            )}
          </View>

          <HStack space="md" style={styles.controlsRow}>
            <Button onPress={uploadImage}>
              <ButtonText>Upload Image</ButtonText>
            </Button>
          </HStack>

          <VStack space="md" style={[styles.section, { borderColor: borderColor }]}>
            <ThemedText type="defaultSemiBold">Exposure Settings</ThemedText>
            <ThemedText type="defaultSemiBold">Base Exposures:</ThemedText>
            <VStack space="sm">
                {exposures.map((exposure) => (
                    <HStack key={exposure.id} space="sm" alignItems="center">
                        {renderGradePicker(exposure.grade, (value) => updateExposure(exposure.id, 'grade', value))}
                        <Input variant="outline" size="sm" style={{ flex: 1, maxWidth: 100 }}>
                            <InputField
                                keyboardType="numeric"
                                value={exposure.time}
                                onChangeText={(value) => updateExposure(exposure.id, 'time', value)}
                                placeholder="Time (s)"
                                color={textColor}
                            />
                        </Input>
                        <Button size="sm" variant="link" action="negative" onPress={() => removeExposure(exposure.id)}>
                            <ButtonIcon as={CloseIcon} />
                        </Button>
                    </HStack>
                ))}
            </VStack>
            <Button size="sm" action="primary" onPress={addExposure} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
                <ButtonText>Add Exposure</ButtonText>
            </Button>
          </VStack>

          <VStack space="md" style={[styles.section, { borderColor: borderColor }]}>
            <ThemedText type="defaultSemiBold">Notes</ThemedText>
            <Textarea size="md" isReadOnly={false} isInvalid={false} isDisabled={false} style={{ width: '100%' }} borderColor={borderColor}>
                <TextareaInput
                    placeholder="Add notes here..."
                    value={currentNotes}
                    onChangeText={setNotes}
                    multiline={true}
                    numberOfLines={4}
                    color={textColor}
                />
            </Textarea>
          </VStack>

          <VStack space="md" style={[styles.section, { borderColor: borderColor }]}>
            <ThemedText type="defaultSemiBold">Save / Load Session</ThemedText>
            <HStack space="md" alignItems="center">
              <Input variant="outline" size="md" style={{ flex: 1 }}>
                <InputField
                  placeholder="Enter name to save"
                  value={sessionName}
                  onChangeText={setSessionName}
                  color={textColor}
                />
              </Input>
              <Button onPress={handleSave}>
                <ButtonText>Save</ButtonText>
              </Button>
            </HStack>
            <HStack space="md" alignItems="center">
              <Input variant="outline" size="md" style={{ flex: 1 }}>
                <InputField
                  placeholder="Enter name to load"
                  value={loadSessionName}
                  onChangeText={setLoadSessionName}
                  color={textColor}
                />
              </Input>
              <Button onPress={handleLoad}>
                <ButtonText>Load</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 30,
  },
  content: {
    width: "100%",
    maxWidth: 1200,
    paddingHorizontal: Platform.OS === "web" ? 40 : 20,
    paddingVertical: 20,
    flex: 1,
  },
  webContent: {
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
  },
  mainContent: {
    width: "100%",
  },
  imagePlaceholder: {
    height: 300,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsRow: {
    justifyContent: 'center',
    marginBottom: 20,
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
});
