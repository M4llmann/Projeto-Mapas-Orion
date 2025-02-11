// src/components/PropertyForm.js
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const PropertyForm = ({ propertyName, onChangeName, onSave, onCancel }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nome da Propriedade"
        placeholderTextColor="#bbb"
        value={propertyName}
        onChangeText={onChangeName}
      />
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Salvar</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fundo transparente com leve opacidade
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    height: 45, // Menor altura para o input
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    paddingLeft: 15,
    fontSize: 14, // Menor tamanho de texto
    marginBottom: 1,
    backgroundColor: "#f7f7f7", // Fundo suave para o input
    color: "#333",
    fontFamily: "Roboto",
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#3C4A62", // Cor mais sóbria e elegante para o botão
    padding: 10, // Menor padding
    borderRadius: 20,
    alignItems: "center",
    marginTop: 12, // Ajustando a margem
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#FF4C4C", // Cor de cancelamento em vermelho suave
    marginTop: 8, // Ajustando a margem
  },
  buttonText: {
    color: "white",
    fontSize: 14, // Tamanho de texto um pouco menor
    fontWeight: "500",
    letterSpacing: 0.8,
  },
});

export default PropertyForm;
