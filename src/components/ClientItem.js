// src/components/ClientItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ClientItem = ({ client, onEdit }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.field}>ID: {client.id}</Text>
      <Text style={styles.field}>Proprietário: {client.nome}</Text>
      <Text style={styles.field}>Email: {client.email}</Text>
      <Text style={styles.field}>CPF: {client.documento?.cpf}</Text>
      <Text style={styles.field}>Endereço:</Text>
      <Text style={styles.subField}>- Rua: {client.endereco?.rua}</Text>
      <Text style={styles.subField}>- Número: {client.endereco?.numero}</Text>
      <Text style={styles.subField}>- Cidade: {client.endereco?.cidade}</Text>
      <Text style={styles.subField}>- Estado: {client.endereco?.estado}</Text>
      <Text style={styles.subField}>- País: {client.endereco?.pais}</Text>

      <Text style={styles.field}>Propriedades:</Text>
      {client.propriedades && client.propriedades.length > 0 ? (
        client.propriedades.map((propriedade) => (
          <View key={propriedade.id} style={styles.subItem}>
            <Text style={styles.subField}>
              - ID do proprietário: {propriedade.id}
            </Text>
            <Text style={styles.subField}>- Nome: {propriedade.nome}</Text>
            <Text style={styles.subField}>Mapas:</Text>
            {propriedade.mapas && propriedade.mapas.length > 0 ? (
              propriedade.mapas.map((mapa) => (
                <View key={mapa.id} style={styles.subItem}>
                  <Text style={styles.subField}>-- ID: {mapa.id}</Text>
                  <Text style={styles.subField}>
                    -- Descrição: {mapa.descricao}
                  </Text>
                  <Text style={styles.subField}>-- Tipo: {mapa.tipo}</Text>
                  <Text style={styles.subField}>-- Pontos:</Text>
                  {mapa.pontos && mapa.pontos.length > 0 ? (
                    mapa.pontos.map((ponto, index) => (
                      <Text key={index} style={styles.subField}>
                        --- {ponto.latitude.toFixed(6)}° S,{" "}
                        {ponto.longitude.toFixed(6)}° W
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.subField}>
                      Nenhum ponto encontrado.
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.subField}>Nenhum mapa encontrado.</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.subField}>Nenhuma propriedade</Text>
      )}

      <TouchableOpacity
        onPress={() => onEdit(client)}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  field: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4A4A4A",
  },
  subField: {
    fontSize: 14,
    marginLeft: 15,
    color: "#7D7D7D",
  },
  subItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  editButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ClientItem;
