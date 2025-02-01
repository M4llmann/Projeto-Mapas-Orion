// src/components/MapControls.js
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const MapControls = ({ onPropertyPress, onMapPress, onLogoutPress }) => {
  return (
    <>
      <TouchableOpacity style={styles.icon} onPress={onPropertyPress}>
        <FontAwesome5 name="home" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.icon, { top: 100 }]}
        onPress={onMapPress}
      >
        <FontAwesome5 name="map" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.icon, { top: 160 }]}
        onPress={onLogoutPress}
      >
        <FontAwesome5 name="sign-out-alt" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 30,
    zIndex: 1,
  },
});

export default MapControls;
