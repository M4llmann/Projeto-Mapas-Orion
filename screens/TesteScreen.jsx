import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Polyline } from "react-native-maps";

const DrawMapScreen = () => {
  const [coordinates, setCoordinates] = useState([]);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoordinates([...coordinates, { latitude, longitude }]);
  };

  const handleClearDrawing = () => {
    setCoordinates([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -24.563907,
          longitude: -54.0645,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {coordinates.length > 0 && (
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearDrawing}>
        <Text style={styles.buttonText}>Limpar Desenho</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  clearButton: {
    position: "absolute",
    bottom: 20,
    left: "30%",
    right: "30%",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default DrawMapScreen;
