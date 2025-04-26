import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Canvas, CanvasRef, DrawingTool, PathType } from '@benjeau/react-native-draw';

// Ensure saved data structure stores PathType array
interface SavedDrawingData {
    paths: PathType[];
}

// Define brush types
type BrushType = 'dodge' | 'burn' | 'erase';

// Define colors for dodge and burn (adjust opacity as needed)
const DODGE_COLOR = 'rgba(0, 0, 255, 0.5)'; // Semi-transparent blue
const BURN_COLOR = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
const DEFAULT_BRUSH_SIZE = 10;
const DEFAULT_OPACITY = 1.0; // Default opacity, potentially make this configurable

export const useDrawingCanvas = () => {
    const drawRef = useRef<CanvasRef>(null);
    const [brushType, setBrushType] = useState<BrushType>('dodge');
    const [brushSize, setBrushSize] = useState<number>(DEFAULT_BRUSH_SIZE);
    const [color, setColor] = useState<string>(DODGE_COLOR);
    const [tool, setTool] = useState<DrawingTool>(DrawingTool.Brush);
    const [opacity, setOpacity] = useState<number>(DEFAULT_OPACITY); // Add opacity state if needed
    const [initialPaths, setInitialPaths] = useState<PathType[]>([]);

    // Handle brush type changes
    const handleSetBrushType = useCallback((type: BrushType) => {
        setBrushType(type);
        if (type === 'dodge') {
            setColor(DODGE_COLOR);
            setTool(DrawingTool.Brush);
            setOpacity(DEFAULT_OPACITY); // Ensure opacity is reset for brushes
        } else if (type === 'burn') {
            setColor(BURN_COLOR);
            setTool(DrawingTool.Brush);
            setOpacity(DEFAULT_OPACITY); // Ensure opacity is reset for brushes
        } else { // Erase
            setTool(DrawingTool.Eraser);
            // For eraser, color and opacity are typically handled by the Canvas component
            // We won't set color here, and rely on canvasProps logic below.
        }
    }, []);

    // Clear the canvas using the ref
    const clearCanvas = useCallback(() => {
        drawRef.current?.clear();
        setInitialPaths([]); // Also clear initial paths state
    }, []);

    // Get serializable drawing data using getPaths()
    const getSerializablePaths = useCallback((): SavedDrawingData => {
        const paths = drawRef.current?.getPaths() ?? [];
        // Ensure paths is always an array, even if getPaths returns undefined/null
        return { paths: Array.isArray(paths) ? paths : [] };
    }, []);

    // Function to set initial paths, called from component on load
    const loadInitialPaths = useCallback((pathsToLoad: PathType[]) => {
       // Clear canvas first to ensure a clean slate before loading new paths
       drawRef.current?.clear();
       // Set the initial paths state
       setInitialPaths(pathsToLoad);
       // Note: The <Canvas> component should react to changes in the initialPaths prop.
       // If it doesn't automatically redraw, forcing a re-render of the component using
       // the Canvas might be necessary (e.g., by changing its `key` prop).
    }, []);

    // Prepare dynamic props for the Canvas component using useMemo
    const canvasProps = useMemo(() => {
        const props: any = { // Use 'any' or a more specific type for Canvas props
            ref: drawRef,
            tool: tool,
            thickness: brushSize,
            opacity: opacity, // Pass opacity state
            initialPaths: initialPaths,
            // Add other necessary static props for Canvas here if any
        };
        // Only add the color prop if the current tool is Brush
        if (tool === DrawingTool.Brush) {
            props.color = color;
        }
        // When tool is Eraser, the absence of the 'color' prop should signal
        // the Canvas component to use its default eraser behavior.
        return props;
    }, [tool, brushSize, color, opacity, initialPaths]); // Include all relevant dependencies

    // Return the state and functions needed by the component
    return {
        // Properties needed for UI controls
        brushType,
        brushSize,
        setBrushType: handleSetBrushType,
        setBrushSize,
        // Functions for canvas actions
        clearCanvas,
        getSerializablePaths,
        loadInitialPaths,
        // Props object to be spread onto the Canvas component
        canvasProps,
        // Expose ref getter if direct access is still needed outside the hook
        getCanvasRef: () => drawRef.current,
    };
}; 