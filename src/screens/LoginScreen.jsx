import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase";
import StarryBackground from "../components/StarryBackground"; // Ajuste o caminho conforme sua estrutura

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Telas" }],
      });
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const recoverPassword = () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu email.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Sucesso", "Email de recuperação enviado!");
      })
      .catch((error) => {
        Alert.alert(
          "Erro",
          "Não foi possível enviar o email: " + error.message
        );
      });
  };

  return (
    <View style={styles.container}>
      <StarryBackground />
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Cadastre-se aqui</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recoverPassword}>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
    zIndex: 1, // Garante que fique acima do fundo
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  formContainer: {
    marginTop: 20,
    width: "90%",
    alignItems: "center",
    paddingBottom: 20,
    zIndex: 1, // Garante que fique acima do fundo
    position: "absolute",
    bottom: 30, // Move mais para baixo
  },
  input: {
    width: "100%",
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "rgba(247, 247, 247, 0.9)",
    color: "#333",
  },
  button: {
    backgroundColor: "#3C4A62",
    paddingVertical: 12,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.8,
  },
  registerLink: {
    color: "#FFFFFF",
    marginTop: 10,
    textDecorationLine: "underline",
    fontSize: 16,
  },
  forgotPassword: {
    color: "#FF6B6B",
    marginTop: 10,
    fontSize: 16,
  },
});

export default LoginScreen;
