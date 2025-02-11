// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;
      await setDoc(doc(db, "Clientes", user.uid), {
        id: user.uid,
        nome,
        email: user.email,
        telefone,
        documento: { cpf },
        endereco,
        Propriedades: [],
      });
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erro", `Erro ao cadastrar: ${error.message}`);
    }
  };

  const buscarEnderecoPorCEP = async (cepDigitado) => {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        if (!response.data.erro) {
          setEndereco({
            ...endereco,
            rua: response.data.logradouro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || "",
            pais: "Brasil",
          });
        } else {
          Alert.alert("Erro", "CEP não encontrado");
        }
      } catch {
        Alert.alert("Erro", "Não foi possível buscar o endereço");
      }
    } else {
      Alert.alert("Erro", "CEP deve conter 8 dígitos");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete seu Cadastro</Text>
      {[
        { label: "Nome completo", value: nome, onChange: setNome },
        {
          label: "Email",
          value: email,
          onChange: setEmail,
          keyboardType: "email-address",
        },
        {
          label: "Senha",
          value: senha,
          onChange: setSenha,
          secureTextEntry: true,
        },
        {
          label: "Telefone",
          value: telefone,
          onChange: setTelefone,
          keyboardType: "numeric",
        },
        { label: "CPF", value: cpf, onChange: setCpf, keyboardType: "numeric" },
      ].map(({ label, ...props }, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#bbb"
          {...props}
        />
      ))}
      <Text style={styles.sectionTitle}>Endereço</Text>
      <View style={styles.cepContainer}>
        <TextInput
          style={styles.cepInput}
          placeholder="CEP"
          placeholderTextColor="#bbb"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
          maxLength={9}
        />
        <TouchableOpacity
          style={styles.cepButton} // Alterei o nome do estilo para evitar conflito
          onPress={() => buscarEnderecoPorCEP(cep)}
        >
          <Text style={styles.buttonText}>Buscar CEP</Text>
        </TouchableOpacity>
      </View>

      {[
        {
          label: "Rua",
          value: endereco.rua,
          onChange: (text) => setEndereco({ ...endereco, rua: text }),
        },
        {
          label: "Número",
          value: endereco.numero,
          onChange: (text) => setEndereco({ ...endereco, numero: text }),
          keyboardType: "numeric",
        },
        {
          label: "Cidade",
          value: endereco.cidade,
          onChange: (text) => setEndereco({ ...endereco, cidade: text }),
        },
        {
          label: "Estado",
          value: endereco.estado,
          onChange: (text) => setEndereco({ ...endereco, estado: text }),
        },
        {
          label: "País",
          value: endereco.pais,
          onChange: (text) => setEndereco({ ...endereco, pais: text }),
        },
      ].map(({ label, ...props }, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#bbb"
          {...props}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
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
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
    color: "#333",
  },
  cepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Mantém espaço entre os elementos
    marginBottom: 10,

    width: "100%", // Garante que a View ocupa toda a largura
  },
  cepButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#3C4A62",
    justifyContent: "center",
    marginLeft: 10, // Adiciona um espaçamento entre o input e o botão
  },

  cepInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f7f7f7",
    color: "#333",
  },
  button: {
    backgroundColor: "#3C4A62",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "white", fontSize: 14, fontWeight: "500" },
});
