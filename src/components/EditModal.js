// src/components/EditModal.js
import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Modal } from "react-native";

const EditModal = ({ visible, data, onChange, onSave, onCancel }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Atualizar Cadastro</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={data.nome || ""}
            onChangeText={(text) => onChange("nome", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={data.email || ""}
            onChangeText={(text) => onChange("email", text)}
          />
          <View style={styles.modalActions}>
            <Button title="Salvar" onPress={onSave} />
            <Button title="Cancelar" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#3D4C56",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#4A4A4A",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default EditModal;
