import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth"; // Importe sendPasswordResetEmail
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase"; // Supondo que você já tenha configurado o Firebase corretamente

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Telas");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const recoverPassword = () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu email.");
      return;
    }

    // Usando a função correta de sendPasswordResetEmail
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Email enviado com sucesso!");
      })
      .catch((error) => {
        alert("Erro ao enviar email: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.buttonContainer}>
        <Button title="Entrar" onPress={handleLogin} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Cadastre-se aqui."
          onPress={() => navigation.navigate("Register")}
          color="#ADc8E6"
        />
      </View>

      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Recuperar Senha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f1",
    marginTop: "40%",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    padding: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  registerLink: {
    color: "blue",
    marginTop: 16,
    textAlign: "center", // Alinhando o texto à esquerda
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default LoginScreen;
