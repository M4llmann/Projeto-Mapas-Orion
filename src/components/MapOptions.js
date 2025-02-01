// src/components/MapOptions.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const MapOptions = ({ onDesenhar, onSelecionar }) => {
  return (
    <View style={[styles.optionsContainer, { top: 100 }]}>
      <TouchableOpacity style={styles.option} onPress={onDesenhar}>
        <Text style={styles.optionText}>Desenhar Mapa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onSelecionar}>
        <Text style={styles.optionText}>Selecionar Mapa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    position: "absolute",
    right: 70,
    top: 100,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 16 },
});

export default MapOptions;
