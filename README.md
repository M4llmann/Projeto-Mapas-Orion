# 🗺️ Projeto Mapas Orion

Aplicação mobile desenvolvida com React Native e Expo para gerenciamento de propriedades rurais através de mapas interativos. O sistema permite cadastrar propriedades, desenhar áreas no mapa, visualizar informações e gerenciar dados de clientes.

## 📋 Índice

- [Características](#-características)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Executar](#-como-executar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

- 🔐 **Autenticação de Usuários**: Sistema completo de login e registro com Firebase Authentication
- 🗺️ **Mapas Interativos**: Visualização e interação com mapas usando React Native Maps
- 📍 **Gestão de Propriedades**: Cadastro, visualização e exclusão de propriedades rurais
- ✏️ **Desenho de Áreas**: Criação de polígonos no mapa para delimitar áreas específicas
- 📊 **Visualização de Dados**: Tela de informações com dados detalhados dos clientes
- 🔄 **Sincronização em Tempo Real**: Dados sincronizados com Firebase Firestore
- 📱 **Multiplataforma**: Funciona em iOS, Android e Web

## 🛠️ Tecnologias Utilizadas

- **React Native** (0.81.5) - Framework para desenvolvimento mobile
- **Expo** (~54.0.0) - Plataforma e ferramentas para React Native (SDK 54)
- **React** (19.1.0) - Biblioteca JavaScript para interfaces de usuário
- **Firebase** (^11.1.0) - Backend como serviço (Auth, Firestore, Storage)
- **React Navigation** (^7.x) - Navegação entre telas
- **React Native Maps** (1.20.1) - Componentes de mapas
- **NativeWind** (^4.1.23) - Tailwind CSS para React Native
- **Axios** (^1.7.9) - Cliente HTTP para requisições
- **Expo Location** (~19.0.7) - Acesso à localização do dispositivo

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Gerenciador de pacotes
- **Git** - Controle de versão
- **Expo CLI** - Instalado globalmente via npm
- **Conta no Firebase** - Para configuração do backend
- **Android Studio** (para Android) ou **Xcode** (para iOS) - Para emuladores

### Instalando o Expo CLI

```bash
npm install -g expo-cli
```

Ou usando npx (recomendado):

```bash
npx expo-cli --version
```

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/M4llmann/Projeto-Mapas-Orion.git
cd Projeto-Mapas-Orion
```

### 2. Instale as dependências

```bash
npm install --legacy-peer-deps
```

ou

```bash
yarn install
```

**Nota**: O projeto utiliza Expo SDK 54 com React 19, que pode ter conflitos de peer dependencies. Use `--legacy-peer-deps` se encontrar problemas durante a instalação.

### 3. Instale o Expo Go no seu dispositivo

- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

## ⚙️ Configuração

### Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative os seguintes serviços:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage** (opcional)

4. Obtenha as credenciais do Firebase:
   - Vá em **Configurações do Projeto** > **Configurações do app**
   - Copie as credenciais do Firebase

5. Configure as variáveis de ambiente:

   - Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

   - Edite o arquivo `.env` e preencha com suas credenciais do Firebase:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
   ```

   **⚠️ IMPORTANTE**: O arquivo `.env` não será commitado no Git. Nunca compartilhe suas credenciais!

### Configuração do Firestore

1. No Console do Firebase, vá em **Firestore Database**
2. Crie as seguintes coleções:
   - `Clientes` - Armazena dados dos clientes
   - `Propriedades` - Armazena propriedades rurais
   - `Propriedades/{propertyId}/Mapas` - Subcoleção para mapas de cada propriedade

3. Configure as regras de segurança (exemplo básico para desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Clientes/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /Propriedades/{propertyId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      match /Mapas/{mapId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## 🎮 Como Executar

### Modo Desenvolvimento

1. Inicie o servidor de desenvolvimento:

```bash
npm start
```

ou

```bash
expo start
```

2. Escaneie o QR Code:
   - **Android**: Use o app Expo Go para escanear o QR Code
   - **iOS**: Use a câmera do iPhone para escanear o QR Code

### Executar em Plataformas Específicas

#### Android

```bash
npm run android
```

ou

```bash
expo start --android
```

#### iOS (apenas macOS)

```bash
npm run ios
```

ou

```bash
expo start --ios
```

#### Web

```bash
npm run web
```

ou

```bash
expo start --web
```

### Limpar Cache (se necessário)

Se encontrar problemas, limpe o cache:

```bash
npm start -- --reset-cache
```

## 📁 Estrutura do Projeto

```
Projeto-Mapas-Orion/
├── App.js                 # Componente principal e navegação
├── firebase.js            # Configuração do Firebase
├── app.json               # Configuração do Expo
├── package.json           # Dependências do projeto
├── assets/                # Imagens e recursos estáticos
│   └── logo.png
├── src/
│   ├── screens/          # Telas da aplicação
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── MapScreen.jsx
│   │   └── InfoScreen.jsx
│   ├── components/       # Componentes reutilizáveis
│   │   ├── MapControls.js
│   │   ├── PropertyOptions.js
│   │   ├── MapOptions.js
│   │   ├── PropertyForm.js
│   │   ├── MapDrawingForm.js
│   │   ├── PropertyListModal.js
│   │   ├── ClientItem.js
│   │   ├── EditModal.js
│   │   └── StarryBackground.js
│   ├── services/         # Serviços e APIs
│   │   └── firebaseService.js
│   └── utils/            # Funções utilitárias
│       ├── Functions.js
│       ├── getPropertyCoordinates.js
│       └── regionUtils.js
└── hooks/                # Custom hooks
    └── useProperties.js
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Logout

### Gestão de Propriedades
- ✅ Cadastro de propriedades com coordenadas
- ✅ Visualização de propriedades no mapa
- ✅ Listagem de propriedades
- ✅ Exclusão de propriedades
- ✅ Seleção e navegação para propriedades

### Desenho de Mapas
- ✅ Desenho de polígonos no mapa
- ✅ Criação de mapas com descrição e tipo
- ✅ Visualização de mapas salvos
- ✅ Exclusão de mapas
- ✅ Visualização de áreas delimitadas

### Informações
- ✅ Visualização de dados do cliente
- ✅ Edição de informações
- ✅ Listagem de propriedades e mapas associados

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro ao instalar dependências

```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e reinstale
rm -rf node_modules
npm install --legacy-peer-deps
```

**Nota**: O projeto utiliza Expo SDK 54 com React 19, que pode ter conflitos de peer dependencies. Sempre use `--legacy-peer-deps` ao instalar dependências.

#### 2. Erro de conexão com Firebase

- Verifique se as credenciais do Firebase estão corretas em `firebase.js`
- Certifique-se de que os serviços estão habilitados no Console do Firebase
- Verifique as regras de segurança do Firestore

#### 3. Mapas não aparecem

- Verifique se as permissões de localização estão habilitadas
- Para Android, adicione a chave da API do Google Maps em `app.json`
- Para iOS, configure as permissões de localização

#### 4. Erro "Metro bundler"

```bash
# Limpe o cache do Metro
npm start -- --reset-cache
```

#### 5. Problemas com React Navigation

```bash
# Reinstale as dependências de navegação
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
```

### Configuração de API Key do Google Maps (Android)

1. Obtenha uma API Key no [Google Cloud Console](https://console.cloud.google.com/)
2. Adicione no `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "SUA_API_KEY_AQUI"
        }
      }
    }
  }
}
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa no navegador

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**M4llmann**

- GitHub: [@M4llmann](https://github.com/M4llmann)

## 🙏 Agradecimentos

- Expo pela plataforma incrível
- Firebase pelo backend robusto
- Comunidade React Native pelo suporte

---

**Nota**: Este é um projeto em desenvolvimento. Algumas funcionalidades podem estar em fase de implementação.
