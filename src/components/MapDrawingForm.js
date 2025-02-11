// src/components/MapDrawingForm.js
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const MapDrawingForm = ({
  mapType,
  mapDescription,
  onChangeType,
  onChangeDescription,
  onSave,
  onCancel,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.title}>Adicionar Novo Mapa</Text>
      <TextInput
        style={styles.input}
        placeholder="Tipo do Mapa"
        placeholderTextColor="#bbb"
        value={mapType}
        onChangeText={onChangeType}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição do Mapa"
        placeholderTextColor="#bbb"
        value={mapDescription}
        onChangeText={onChangeDescription}
      />
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Salvar Mapa</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onCancel}
      >
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
    fontFamily: "Roboto",
    letterSpacing: 0.8,
  },
  input: {
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    paddingLeft: 15,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    color: "#333",
    fontFamily: "Roboto",
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#3C4A62",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#FF4C4C",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
  },
});

export default MapDrawingForm;
