import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Supondo que o Firebase já foi configurado
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    pais: "",
  });

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
      navigation.navigate("Login"); // Redireciona para outra tela
    } catch (error) {
      Alert.alert("Erro", `Erro ao cadastrar: ${error.message}`);
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
});
