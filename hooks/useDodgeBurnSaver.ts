import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PathType } from '@benjeau/react-native-draw'; // Import PathType

// Updated SavedDrawingData interface to match useDrawingCanvas
interface SavedDrawingData {
    paths: PathType[];
}

// Original Exposure interface from dodgeBurn.tsx (used for input)
interface Exposure {
  id: string; 
  grade: string;
  time: string; 
}

// SavedExposure interface (numeric time for storage)
interface SavedExposure {
  grade: string;
  time: number;
}

// Define the structure for a saved session in AsyncStorage
interface SavedSession {
  name: string;
  imageData: { uri: string | null } | null; 
  drawingData: SavedDrawingData | null; // Use the updated drawing data structure
  notes: string;
  exposures: SavedExposure[]; // Store numeric time
}

const SESSIONS_KEY = '@DodgeBurnSessions';

export const useDodgeBurnSaver = () => {
  // State for the list of session names (optional, could rely on AsyncStorage directly)
  // const [sessionNames, setSessionNames] = useState<string[]>([]);
  // Keep internal notes state only if it needs to be exposed independently
  const [currentNotes, setCurrentNotes] = useState<string>(''); 

  // Helper to get all sessions
  const getAllSessions = async (): Promise<SavedSession[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(SESSIONS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Failed to load sessions from storage", e);
      return [];
    }
  };

  // Helper to save all sessions
  const saveAllSessions = async (sessions: SavedSession[]) => {
    try {
      const jsonValue = JSON.stringify(sessions);
      await AsyncStorage.setItem(SESSIONS_KEY, jsonValue);
    } catch (e) {
      console.error("Failed to save sessions to storage", e);
    }
  };

  // Updated saveSession signature to accept SavedDrawingData
  const saveSession = async (
    name: string,
    imageData: { uri: string | null } | null, 
    drawingData: SavedDrawingData | null, // Accept the correct type
    exposures: Exposure[],
    notes: string 
  ) => {
    if (!name) {
      console.error("Session name cannot be empty.");
      return; // Or throw an error / show an alert
    }

    const savedExposures: SavedExposure[] = exposures
        .map(exp => ({ grade: exp.grade, time: parseFloat(exp.time || '0') })) // Ensure time is number, default 0
        .filter(exp => !isNaN(exp.time));

    const newSession: SavedSession = {
        name,
        imageData,
        drawingData, // Store the PathType[] structure directly
        notes,
        exposures: savedExposures,
    };

    try {
        const currentSessions = await getAllSessions();
        // Remove existing session with the same name before adding/updating
        const updatedSessions = currentSessions.filter(s => s.name !== name);
        updatedSessions.push(newSession);
        await saveAllSessions(updatedSessions);
        console.log(`Session "${name}" saved successfully.`);
        // Optionally update local list of names if used
        // setSessionNames(updatedSessions.map(s => s.name));
    } catch (e) {
        console.error("Error saving session:", e);
        // Handle error (e.g., show alert to user)
    }
  };

  // Load session by name
  const loadSession = async (name: string): Promise<SavedSession | null> => {
    try {
        const currentSessions = await getAllSessions();
        const session = currentSessions.find(s => s.name === name);
        if (session) {
            // Update internal notes state if it's being used/exposed
            setCurrentNotes(session.notes ?? ''); 
            // Ensure drawingData conforms to the expected structure on load
            const loadedDrawingData: SavedDrawingData | null = 
                session.drawingData && Array.isArray(session.drawingData.paths)
                ? { paths: session.drawingData.paths }
                : null;

            return { ...session, drawingData: loadedDrawingData };
        }
        return null;
    } catch (e) {
        console.error("Error loading session:", e);
        return null;
    }
  };

  // List saved session names
  const listSavedSessions = async (): Promise<string[]> => {
    try {
        const currentSessions = await getAllSessions();
        return currentSessions.map(s => s.name);
    } catch (e) {
        console.error("Error listing sessions:", e);
        return [];
    }
  };

  // Define setNotes here if it's needed by the UI component directly
  const setNotes = (notes: string) => {
    setCurrentNotes(notes); 
  };

  // // Example: Load session names on hook initialization (optional)
  // useEffect(() => {
  //   listSavedSessions().then(setSessionNames);
  // }, []);

  return {
    saveSession,
    loadSession,
    listSavedSessions,
    currentNotes, // Expose internal notes state if needed
    setNotes,     // Expose setter if needed
    // sessionNames, // Expose names list if state is kept
  };
}; 