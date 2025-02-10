import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ClientItem = ({ client, onEdit }) => {
  return (
    <View style={styles.item}>
      {/* Cabeçalho do Card */}
      <View style={styles.header}>
        <View>
          <Text style={styles.nome}>{client.nome}</Text>
          <Text style={styles.email}>{client.email}</Text>
        </View>
        <Text style={styles.cpf}>CPF: {client.documento?.cpf}</Text>
      </View>

      {/* Seção de Endereço */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color="#4A4A4A" />
          <Text style={styles.sectionTitle}>Endereço</Text>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            {client.endereco?.rua}, {client.endereco?.numero}
          </Text>
          <Text style={styles.addressText}>
            {client.endereco?.cidade} - {client.endereco?.estado}
          </Text>
          <Text style={styles.addressText}>{client.endereco?.pais}</Text>
        </View>
      </View>

      {/* Seção de Propriedades */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" size={20} color="#4A4A4A" />
          <Text style={styles.sectionTitle}>Propriedades</Text>
        </View>

        {client.propriedades && client.propriedades.length > 0 ? (
          client.propriedades.map((propriedade) => (
            <View key={propriedade.id} style={styles.propertyCard}>
              <Text style={styles.propertyName}>{propriedade.nome}</Text>

              {/* Mapas da Propriedade */}
              {propriedade.mapas && propriedade.mapas.length > 0 ? (
                propriedade.mapas.map((mapa) => (
                  <View key={mapa.id} style={styles.mapCard}>
                    <View style={styles.mapHeader}>
                      <Ionicons name="map-outline" size={16} color="#666" />
                      <Text style={styles.mapTitle}>{mapa.descricao}</Text>
                    </View>
                    <Text style={styles.mapType}>Tipo: {mapa.tipo}</Text>

                    {/* Pontos do Mapa */}
                    {mapa.pontos && mapa.pontos.length > 0 ? (
                      <View style={styles.pointsContainer}>
                        {mapa.pontos.map((ponto, index) => (
                          <Text key={index} style={styles.pointText}>
                            {index + 1}. {ponto.latitude.toFixed(6)}° S,{" "}
                            {ponto.longitude.toFixed(6)}° W
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.emptyText}>
                        Nenhum ponto cadastrado
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum mapa cadastrado</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma propriedade cadastrada</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onEdit(client)}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={20} color="#FFF" />
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 12,
    marginBottom: 16,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cpf: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginLeft: 8,
  },
  addressContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  propertyCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
    marginLeft: 6,
  },
  mapType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  pointsContainer: {
    marginTop: 6,
  },
  pointText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ClientItem;
