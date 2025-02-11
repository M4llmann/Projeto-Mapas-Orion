// src/components/PropertyListModal.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const PropertyListModal = ({
  visible,
  onClose,
  properties,
  onSelectProperty,
  onDeleteProperty,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Suas Propriedades</Text>
          <ScrollView style={styles.scrollContainer}>
            {properties.map((property) => (
              <View key={property.id} style={styles.itemContainer}>
                <TouchableOpacity
                  style={styles.itemInfo}
                  onPress={() => onSelectProperty(property)}
                >
                  <Text style={styles.listItemText}>{property.nome}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteProperty(property.id)}
                >
                  <FontAwesome5 name="times" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  scrollContainer: {
    maxHeight: 300,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemInfo: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    paddingLeft: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#3C4A62",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PropertyListModal;
