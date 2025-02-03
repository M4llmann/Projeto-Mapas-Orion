// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Certifique-se que o Firebase foi configurado
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  // Estado para CEP
  const [cep, setCep] = useState("");

  // Estado para endereço
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    pais: "",
  });

  // Função para cadastrar o usuário e armazenar os dados no Firestore
  const handleCadastro = async () => {
    if (
      !nome ||
      !email ||
      !senha ||
      !cpf ||
      !endereco.rua ||
      !endereco.cidade ||
      !endereco.estado
    ) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Criar usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;

      // Armazenar dados no Firestore
      const clienteRef = doc(db, "Clientes", user.uid);
      await setDoc(clienteRef, {
        id: user.uid,
        nome,
        email: user.email,
        telefone,
        documento: { cpf },
        endereco,
        Propriedades: [], // Inicializa como array vazio
      });

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      navigation.navigate("Login"); // Redireciona para a tela de Login (ou outra)
    } catch (error) {
      Alert.alert("Erro", `Erro ao cadastrar: ${error.message}`);
    }
  };

  // Função para buscar endereço via CEP usando a API do ViaCEP
  const buscarEnderecoPorCEP = async (cepDigitado) => {
    // Remove caracteres não numéricos
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        if (!response.data.erro) {
          // Atualiza os campos do endereço com os dados retornados
          setEndereco((prevEndereco) => ({
            ...prevEndereco,
            rua: response.data.logradouro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || "",
            pais: "Brasil", // Define um valor padrão para o país
          }));
        } else {
          Alert.alert("Erro", "CEP não encontrado");
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível buscar o endereço");
      }
    } else {
      Alert.alert("Erro", "CEP deve conter 8 dígitos");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete seu Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Endereço</Text>
      <View style={styles.cepContainer}>
        <TextInput
          style={styles.cepInput}
          placeholder="CEP"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
          maxLength={9} // Ex: 12345-678
        />

        <TouchableOpacity
          style={styles.buscarCepButton}
          onPress={() => buscarEnderecoPorCEP(cep)}
        >
          <Text style={styles.buscarCepText}>Buscar CEP</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Rua"
        value={endereco.rua}
        onChangeText={(text) => setEndereco({ ...endereco, rua: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Número"
        value={endereco.numero}
        onChangeText={(text) => setEndereco({ ...endereco, numero: text })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={endereco.cidade}
        onChangeText={(text) => setEndereco({ ...endereco, cidade: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={endereco.estado}
        onChangeText={(text) => setEndereco({ ...endereco, estado: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="País"
        value={endereco.pais}
        onChangeText={(text) => setEndereco({ ...endereco, pais: text })}
      />

      <Button title="Salvar" onPress={handleCadastro} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  cepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cepInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  buscarCepButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  buscarCepText: {
    color: "white",
    fontWeight: "bold",
  },
});
