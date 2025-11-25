# 📱 Como Reportar Erros do Celular

## Métodos para Capturar o Erro

### 1. 📸 Screenshot (Mais Fácil)
- Tire uma foto da tela de erro no celular
- Envie a imagem aqui no chat
- Posso ler o texto do erro na imagem

### 2. 📋 Copiar Texto do Erro
- Se o erro aparecer em uma tela branca ou vermelha
- Toque e segure no texto do erro
- Selecione "Copiar"
- Cole aqui no chat

### 3. 💻 Ver Logs no Terminal
Quando você roda `npm start`, os erros também aparecem no terminal do computador:
- Abra o terminal onde rodou `npm start`
- Procure por mensagens em vermelho
- Copie e cole aqui

### 4. 🔍 Ver Logs do Expo
No terminal, você pode ver logs em tempo real:
- Pressione `r` no terminal do Expo para recarregar
- Pressione `m` para ver o menu
- Os erros aparecerão no terminal

### 5. 📝 Descrever o Erro
Se não conseguir capturar, descreva:
- O que você estava fazendo quando o erro apareceu?
- A tela fica branca? Vermelha? Preto?
- Aparece alguma mensagem? Qual?
- O app fecha sozinho?

## 🔧 Verificações Rápidas

### Verifique se o Expo Go está atualizado:
- **Android**: Play Store > Expo Go > Atualizar
- **iOS**: App Store > Expo Go > Atualizar

### Verifique a versão do Expo Go:
- Abra o Expo Go
- Vá em Settings/Configurações
- Veja a versão (deve ser compatível com SDK 54)

### Limpe o cache:
```bash
npm start -- --reset-cache
```

### Reinstale as dependências:
```bash
npm install --legacy-peer-deps
```

## 🚨 Erros Comuns no Celular

### Erro: "Unable to resolve module"
- **Solução**: Execute `npm install --legacy-peer-deps`

### Erro: "Network request failed"
- **Solução**: Certifique-se que celular e computador estão na mesma rede WiFi

### Erro: "Cannot read property of undefined"
- **Solução**: Pode ser problema de compatibilidade com React 19

### Tela branca/preta
- **Solução**: Limpe o cache e reinicie

### App fecha sozinho
- **Solução**: Verifique os logs no terminal do computador

