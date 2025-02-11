// src/components/PropertyOptions.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const PropertyOptions = ({ onCadastrar, onSelecionar }) => {
  return (
    <View style={styles.optionsContainer}>
      <TouchableOpacity style={styles.option} onPress={onCadastrar}>
        <Text style={styles.optionText}>Cadastrar Propriedade</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={onSelecionar}>
        <Text style={styles.optionText}>Selecionar Propriedade</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    position: "absolute",
    left: "5%",
    top: "10%",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  option: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 16 },
});

export default PropertyOptions;
