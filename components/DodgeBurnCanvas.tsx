import React, { useState, useCallback } from 'react';
import { StyleSheet, Image, View, LayoutChangeEvent } from 'react-native';
import { Box } from '@gluestack-ui/themed';
import { Canvas, CanvasRef, DrawingTool, PathType } from '@benjeau/react-native-draw';
import { ThemedText } from '@/components/ThemedText';

// Update the structure to accept canvasProps
interface DrawingHookProps {
    canvasProps: Record<string, any>; // Object containing props for the Canvas component
    brushType: 'dodge' | 'burn' | 'erase'; // Keep brushType if needed, though not currently used in this component
}

interface DodgeBurnCanvasProps {
    drawingHookProps: DrawingHookProps; // Renamed prop
    currentImageUri: string | null;
    borderColor: string;
    backgroundColor: string;
}

const DodgeBurnCanvas: React.FC<DodgeBurnCanvasProps> = ({
    drawingHookProps, // Use the renamed prop
    currentImageUri,
    borderColor,
    backgroundColor,
}) => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0 && (width !== canvasSize.width || height !== canvasSize.height)) {
             setCanvasSize({ width, height });
        }
    }, [canvasSize.width, canvasSize.height]);

    return (
        <Box style={[styles.canvasContainer, { borderColor }]}>
            {/* Image Background */} 
            {currentImageUri && (
                <Image source={{ uri: currentImageUri }} style={styles.imagePreview} />
            )}
            {!currentImageUri && (
                 <ThemedText style={styles.placeholderText}>Upload an image to start</ThemedText>
             )}
            
            {/* Drawing Canvas Overlay - Get layout to size the actual Canvas */}
            <View style={styles.drawingOverlay} onLayout={handleLayout}>
                {/* Render Canvas only when size is known */}
                {canvasSize.width > 0 && canvasSize.height > 0 && (
                    <Canvas
                        // Spread the canvasProps from the hook
                        {...drawingHookProps.canvasProps}
                        // Override with locally determined height and width
                        height={canvasSize.height}
                        width={canvasSize.width}
                        // Removed explicit props now managed by canvasProps:
                        // ref={drawingHook.drawRef}
                        // color={drawingHook.color}
                        // thickness={drawingHook.brushSize}
                        // opacity={1.0}
                        // tool={drawingHook.tool}
                        // initialPaths={drawingHook.initialPaths}
                    />
                )}
             </View>
        </Box>
    );
};

const styles = StyleSheet.create({
    canvasContainer: {
        width: '100%',
        aspectRatio: 1,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    placeholderText: {
        textAlign: 'center',
        position: 'absolute',
    },
    imagePreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    drawingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
});

export default DodgeBurnCanvas; 