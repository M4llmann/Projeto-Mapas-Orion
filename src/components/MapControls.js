// src/components/MapControls.js
import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window"); // Para obter a largura e altura da tela

const MapControls = ({ onPropertyPress, onMapPress, onLogoutPress }) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.icon, { left: width * 0.05 }]}
        onPress={onPropertyPress}
      >
        <FontAwesome5 name="home" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.icon, { left: width * 0.2 }]}
        onPress={onMapPress}
      >
        <FontAwesome5 name="map" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.icon, { left: width * 0.85 }]}
        onPress={onLogoutPress}
      >
        <FontAwesome5 name="sign-out-alt" size={24} color="gray" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    top: height * 0.02, // Ajuste para a altura da tela
    backgroundColor: "rgb(255, 255, 255)",
    padding: 10,
    borderRadius: 30,
    zIndex: 1,
  },
});

export default MapControls;
